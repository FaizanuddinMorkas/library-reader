import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Pdf, { type PdfError, type PdfRef } from "react-native-pdf";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import { catalogApi } from "@/lib/api/catalogApi";
import { API_CONFIG } from "@/lib/constants";
import { getAuthToken } from "@/lib/auth";
import type { EBook } from "@/types/book";
import { useReadingProgress } from "@/hooks/useReadingProgress";

function resolvePdfUrl(pdfUrl: string) {
  if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl;

  const apiUrl = new URL(API_CONFIG.baseURL);
  if (pdfUrl.startsWith("/api/")) return `${apiUrl.origin}${pdfUrl}`;
  return `${API_CONFIG.baseURL.replace(/\/+$/, "")}/${pdfUrl.replace(/^\/+/, "")}`;
}

export default function EBookReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const pdfRef = useRef<PdfRef>(null);
  const loadedRef = useRef(false);
  const refreshedAuthRef = useRef(false);
  const [ebookRequest, setEbookRequest] = useState<{
    id: string;
    ebook: EBook | null;
    accessToken: string | null;
  } | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [pdfErrorState, setPdfErrorState] = useState<{ id: string; message: string } | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentPage: savedPage, isLoading: isProgressLoading, saveProgress } = useReadingProgress(id);
  const currentEbookRequest = ebookRequest?.id === id ? ebookRequest : null;
  const ebook = currentEbookRequest?.ebook ?? null;
  const accessToken = currentEbookRequest?.accessToken ?? null;
  const isEbookLoading = currentEbookRequest === null;
  const pdfError = pdfErrorState?.id === id ? pdfErrorState.message : null;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void Promise.all([catalogApi.ebook(id), getAuthToken()])
      .then(([book, token]) => {
        if (cancelled) return;
        setEbookRequest({ id, ebook: book, accessToken: token });
        if (!token) setPdfErrorState({ id, message: "Sign in to read this e-book." });
      })
      .catch(() => {
        if (cancelled) return;
        setEbookRequest({ id, ebook: null, accessToken: null });
        setPdfErrorState({ id, message: "This e-book could not be loaded. Check your connection and try again." });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const pdfUrl = ebook?.pdfUrl ? resolvePdfUrl(ebook.pdfUrl) : null;
  const requestHeaders: Record<string, string> = {};
  if (pdfUrl && accessToken && new URL(pdfUrl).origin === new URL(API_CONFIG.baseURL).origin) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  useEffect(() => {
    if (!loadedRef.current || isProgressLoading) return;
    const page = Math.max(1, Math.min(savedPage, pageCount || savedPage));
    pdfRef.current?.setPage(page);
    setCurrentPage(page);
  }, [isProgressLoading, pageCount, savedPage]);

  const handlePageChanged = useCallback((page: number, total: number) => {
    if (!loadedRef.current) return;
    setCurrentPage(page);
    setPageCount(total);
    void saveProgress(page, total);
  }, [saveProgress]);

  const handlePdfError = useCallback(async (error: PdfError) => {
    setIsPdfLoading(false);
    if (error.status === 401 && !refreshedAuthRef.current && id) {
      refreshedAuthRef.current = true;
      try {
        await catalogApi.ebook(id);
        const refreshedToken = await getAuthToken();
        if (refreshedToken) {
          setEbookRequest((current) => current?.id === id
            ? { ...current, accessToken: refreshedToken }
            : current);
          setPdfErrorState(null);
          setIsPdfLoading(true);
          return;
        }
      } catch {
        // The API client clears expired credentials if token refresh fails.
      }
    }
    setPdfErrorState(id ? { id, message: "This e-book could not be opened. Please try again." } : null);
  }, [id]);

  const retryPdf = useCallback(() => {
    loadedRef.current = false;
    refreshedAuthRef.current = false;
    setPdfErrorState(null);
    setIsPdfLoading(true);
    setCurrentPage(Math.max(1, savedPage));
  }, [savedPage]);

  if (isEbookLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <ActivityIndicator color="#FF6B0A" />
        <Text className="text-base font-bold text-ink mt-4">Loading e-book...</Text>
      </SafeAreaView>
    );
  }

  if (!ebook) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-xl font-black text-ink">E-book not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="h-12 px-6 rounded-2xl bg-primary items-center justify-center mt-5"><Text className="text-white font-bold">Go back</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  const totalPages = pageCount || ebook.totalPages || 0;
  const progress = totalPages ? Math.min(100, Math.floor((currentPage / totalPages) * 100)) : 0;

  return (
    <SafeAreaView className="flex-1 bg-[#F1EEE7]">
      <View className="h-16 px-4 flex-row items-center bg-white">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full items-center justify-center bg-[#F1EEE7]" accessibilityLabel="Close reader"><ArrowLeft size={21} stroke="#181713" /></TouchableOpacity>
        <View className="ml-3 flex-1"><Text className="text-sm font-black text-ink" numberOfLines={1}>{ebook.title}</Text><Text className="text-[11px] mt-0.5 text-ink-muted" numberOfLines={1}>{ebook.author}</Text></View>
      </View>

      <View className="flex-1 p-2">
        {pdfUrl && accessToken && !pdfError && !isProgressLoading ? (
          <Pdf
            ref={pdfRef}
            source={{ uri: pdfUrl, headers: requestHeaders, cache: false }}
            page={Math.max(1, Math.min(currentPage, pageCount || currentPage))}
            style={{ flex: 1, backgroundColor: "#F1EEE7" }}
            fitPolicy={0}
            enableDoubleTapZoom
            onLoadProgress={() => setIsPdfLoading(true)}
            onLoadComplete={(pages) => {
              loadedRef.current = true;
              setPageCount(pages);
              setIsPdfLoading(false);
              const page = Math.max(1, Math.min(savedPage, pages));
              setCurrentPage(page);
              pdfRef.current?.setPage(page);
              void saveProgress(page, pages);
            }}
            onPageChanged={handlePageChanged}
            onError={(error) => { void handlePdfError(error); }}
          />
        ) : (
          <View className="flex-1 items-center justify-center rounded-2xl bg-white px-6">
            {pdfError ? <Text className="text-center text-base font-semibold text-ink-muted">{pdfError}</Text> : <ActivityIndicator color="#FF6B0A" />}
            {pdfError && <TouchableOpacity onPress={retryPdf} className="h-11 px-5 rounded-xl bg-primary items-center justify-center mt-5"><Text className="text-white font-bold">Try again</Text></TouchableOpacity>}
          </View>
        )}
        {isPdfLoading && !pdfError && <View pointerEvents="none" className="absolute inset-0 items-center justify-center"><View className="rounded-xl bg-white/95 px-5 py-3 flex-row items-center shadow-card"><ActivityIndicator color="#FF6B0A" /><Text className="ml-3 text-sm font-semibold text-ink">Loading PDF...</Text></View></View>}
      </View>

      <View className="rounded-t-[30px] px-5 pt-4 pb-3 bg-white">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-semibold text-ink-muted">{progress}% complete</Text>
          <Text className="text-xs font-semibold text-ink-muted">{currentPage}{totalPages ? ` / ${totalPages}` : ""}</Text>
        </View>
        <View className="h-1.5 rounded-full overflow-hidden bg-[#F1EEE7]"><View className="h-full bg-primary" style={{ width: `${progress}%` }} /></View>
        <View className="flex-row items-center justify-between mt-4">
          <TouchableOpacity onPress={() => pdfRef.current?.setPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1 || isPdfLoading} className="w-11 h-11 rounded-full items-center justify-center bg-[#F1EEE7]"><ChevronLeft size={21} stroke={currentPage <= 1 ? "#7A746A" : "#181713"} /></TouchableOpacity>
          <Text className="text-xs font-semibold text-ink-muted">Swipe to turn pages</Text>
          <TouchableOpacity onPress={() => pdfRef.current?.setPage(totalPages ? Math.min(totalPages, currentPage + 1) : currentPage + 1)} disabled={Boolean(totalPages && currentPage >= totalPages) || isPdfLoading} className="w-11 h-11 rounded-full bg-primary items-center justify-center"><ChevronRight size={21} stroke="#FFFFFF" /></TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
