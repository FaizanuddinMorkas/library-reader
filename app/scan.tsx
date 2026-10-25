import { useCallback, useState } from "react";
import { Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView } from "react-native";
import { CameraView, type BarcodeScanningResult, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import BookOpen from "lucide-react-native/icons/book-open";
import Flashlight from "lucide-react-native/icons/flashlight";
import Keyboard from "lucide-react-native/icons/keyboard";
import RotateCcw from "lucide-react-native/icons/rotate-ccw";
import X from "lucide-react-native/icons/x";
import { SafeAreaView } from "react-native-safe-area-context";
import { booksApi } from "@/lib/api/booksApi";
import type { Book } from "@/types/book";
import { BookCover } from "@/components/library/BookCover";
import { normalizeBarcode } from "@/lib/validation";

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isFocused, setIsFocused] = useState(false);
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<Book | null>(null);
  const [unknownCode, setUnknownCode] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  const lookUpCode = async (rawCode: string) => {
    if (scanned) return;
    const code = normalizeBarcode(rawCode);
    if (!code) {
      setUnknownCode(rawCode.trim() || "invalid code");
      setScanned(true);
      return;
    }
    setScanned(true);
    setIsLookingUp(true);
    try {
      const book = await booksApi.getByBarcode(code);
      router.replace({
        pathname: "/book/[id]",
        params: { id: book.id, copyBarcode: book.matchedCopy?.barcode ?? code, copyId: book.matchedCopy?.id ?? "" },
      });
    } catch {
      setResult(null);
      setUnknownCode(code);
    } finally {
      setIsLookingUp(false);
    }
  };

  const onBarcodeScanned = ({ data }: BarcodeScanningResult) => { void lookUpCode(data); };
  const reset = () => {
    setScanned(false);
    setResult(null);
    setUnknownCode(null);
    setManualCode("");
    setIsLookingUp(false);
  };

  if (!permission) return <View className="flex-1 bg-ink" />;

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-background px-6 items-center justify-center">
        <View className="w-24 h-24 rounded-[32px] bg-peach items-center justify-center"><BookOpen size={42} stroke="#EA580C" /></View>
        <Text className="text-2xl font-black text-ink text-center mt-6">Scan books in seconds</Text>
        <Text className="text-sm leading-6 text-ink-muted text-center mt-3">Allow camera access to scan LibraryOS QR labels and book barcodes.</Text>
        <TouchableOpacity onPress={requestPermission} className="h-14 rounded-2xl bg-primary px-8 items-center justify-center mt-7"><Text className="text-white font-bold">Allow camera access</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} className="mt-5"><Text className="text-sm font-semibold text-ink-soft">Not now</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-ink">
      {isFocused && (
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39"] }}
          onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
        />
      )}
      <SafeAreaView className="absolute inset-0" pointerEvents="box-none">
        <View className="flex-row items-center justify-between px-5 pt-2">
          <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 rounded-full bg-black/45 items-center justify-center" accessibilityLabel="Close scanner"><ArrowLeft size={22} stroke="#FFFFFF" /></TouchableOpacity>
          <Text className="text-base font-bold text-white">Scan a library book</Text>
          <TouchableOpacity onPress={() => setTorch((value) => !value)} className={`w-11 h-11 rounded-full items-center justify-center ${torch ? "bg-primary" : "bg-black/45"}`} accessibilityLabel="Toggle flashlight"><Flashlight size={21} stroke="#FFFFFF" /></TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center px-10">
          <View className="w-full aspect-square rounded-[36px] border-2 border-white/80 relative">
            <View className="absolute left-5 right-5 top-1/2 h-0.5 bg-primary shadow-glow" />
          </View>
          <Text className="text-sm text-white/80 text-center mt-5">Place the QR code or barcode inside the frame</Text>
        </View>

        <View className="items-center pb-7">
          <TouchableOpacity onPress={() => setManualOpen(true)} className="h-12 px-5 rounded-full bg-white/95 flex-row items-center justify-center"><Keyboard size={18} stroke="#181713" /><Text className="ml-2 text-sm font-bold text-ink">Enter code manually</Text></TouchableOpacity>
        </View>
      </SafeAreaView>

      <Modal visible={scanned} transparent animationType="slide" onRequestClose={reset}>
        <View className="flex-1 justify-end bg-black/35">
          <View className="rounded-t-[32px] bg-background p-5 pb-10">
            <View className="w-12 h-1 rounded-full bg-border self-center mb-5" />
            {isLookingUp ? (
              <View className="items-center py-10"><Text className="text-sm font-semibold text-ink-muted">Looking up book...</Text></View>
            ) : result ? (
              <>
                <View className="flex-row items-start">
                  <BookCover title={result.name} className="w-16 h-20 rounded-2xl" fallbackColor={result.coverColor} coverUrl={result.coverUrl} />
                  <View className="ml-4 flex-1"><Text className="text-xl font-black text-ink">{result.name}</Text><Text className="text-sm text-ink-muted mt-1">{result.authorName}</Text><View className={`self-start mt-3 px-3 py-1 rounded-full ${result.availableCopies ? "bg-success-50" : "bg-danger-50"}`}><Text className={`text-[10px] font-bold ${result.availableCopies ? "text-success-700" : "text-danger-600"}`}>{result.availableCopies ? `${result.availableCopies} AVAILABLE` : "CURRENTLY UNAVAILABLE"}</Text></View></View>
                </View>
                <View className="rounded-2xl bg-white border border-border p-4 mt-5 flex-row justify-between"><View><Text className="text-[10px] text-ink-muted">SHELF</Text><Text className="text-sm font-bold text-ink mt-1">{result.shelfNumber}</Text></View><View><Text className="text-[10px] text-ink-muted">BARCODE</Text><Text className="text-sm font-bold text-ink mt-1">{result.barcode}</Text></View></View>
              </>
            ) : (
              <View className="items-center py-2"><View className="w-20 h-20 rounded-[28px] bg-peach items-center justify-center"><X size={34} stroke="#EA580C" /></View><Text className="text-xl font-black text-ink mt-5">Book not found</Text><Text className="text-sm text-ink-muted text-center mt-2">No library book matches “{unknownCode}”. Try another book or copy barcode.</Text></View>
            )}
            <TouchableOpacity onPress={reset} className="h-14 rounded-2xl bg-primary flex-row items-center justify-center mt-6"><RotateCcw size={18} stroke="#FFFFFF" /><Text className="text-white font-bold ml-2">Scan another book</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={manualOpen} transparent animationType="fade" onRequestClose={() => setManualOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            keyboardDismissMode="none"
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 bg-black/45 justify-center px-6 py-6">
              <View className="w-full rounded-[28px] bg-background p-5">
                <Text className="text-xl font-black text-ink">Enter a library code</Text>
                <Text className="text-sm text-ink-muted mt-1">Use a book or copy barcode.</Text>
                <TextInput maxLength={120} autoFocus value={manualCode} onChangeText={setManualCode} autoCapitalize="characters" placeholder="BK-001-001" placeholderTextColor="#8A857C" className="h-14 rounded-2xl bg-white border border-border px-4 text-base text-ink mt-5" />
                <View className="flex-row gap-3 mt-4"><TouchableOpacity onPress={() => setManualOpen(false)} className="flex-1 h-12 rounded-2xl border border-border items-center justify-center"><Text className="font-bold text-ink-soft">Cancel</Text></TouchableOpacity><TouchableOpacity disabled={!manualCode.trim()} onPress={() => { setManualOpen(false); void lookUpCode(manualCode); }} className="flex-1 h-12 rounded-2xl bg-primary items-center justify-center"><Text className="font-bold text-white">Look up</Text></TouchableOpacity></View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
