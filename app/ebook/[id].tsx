import { useState } from "react";
import { Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import Bookmark from "lucide-react-native/icons/bookmark";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import Minus from "lucide-react-native/icons/minus";
import Moon from "lucide-react-native/icons/moon";
import Plus from "lucide-react-native/icons/plus";
import Sun from "lucide-react-native/icons/sun";
import { mockEbooks } from "@/lib/mockData";
import { useReadingProgress } from "@/hooks/useReadingProgress";

type ReaderTheme = "light" | "sepia" | "dark";

const PAGE_COPY = [
  "Small choices become remarkable results when they are repeated with care. A habit is not a finish line; it is a direction you choose each day.",
  "The most useful changes begin with identity. Decide who you want to become, then let every small action cast a vote for that person.",
  "Environment often shapes behavior more reliably than motivation. Make the good choice visible, simple, and satisfying enough to repeat.",
];

const THEMES: Record<ReaderTheme, { page: string; text: string; muted: string; shell: string }> = {
  light: { page: "#FFFFFF", text: "#181713", muted: "#7A746A", shell: "#F1EEE7" },
  sepia: { page: "#F7EBCF", text: "#33291F", muted: "#7A6653", shell: "#D9C9A8" },
  dark: { page: "#25231F", text: "#F7F1E8", muted: "#B7AEA2", shell: "#12110F" },
};

export default function EBookReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const ebook = mockEbooks.find((item) => item.id === id);
  const totalPages = ebook?.totalPages ?? 300;
  const { currentPage: savedPage, isLoading, saveProgress } = useReadingProgress(id);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [theme, setTheme] = useState<ReaderTheme>("sepia");
  const [bookmarked, setBookmarked] = useState(false);

  const currentPage = selectedPage ?? (isLoading ? 1 : Math.min(savedPage, totalPages));

  const goToPage = (page: number) => {
    const next = Math.max(1, Math.min(totalPages, page));
    setSelectedPage(next);
    void saveProgress(next, totalPages);
  };

  if (!ebook) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-xl font-black text-ink">Book not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="h-12 px-6 rounded-2xl bg-primary items-center justify-center mt-5"><Text className="text-white font-bold">Go back</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  const palette = THEMES[theme];
  const progress = Math.min(100, Math.ceil((currentPage / totalPages) * 100));
  const pageWidth = Math.min(width - 32, 560);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.shell }}>
      <View className="h-16 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: palette.page }} accessibilityLabel="Close reader"><ArrowLeft size={21} stroke={palette.text} /></TouchableOpacity>
        <View className="ml-3 flex-1"><Text className="text-sm font-black" style={{ color: palette.text }} numberOfLines={1}>{ebook.title}</Text><Text className="text-[11px] mt-0.5" style={{ color: palette.muted }}>{ebook.author}</Text></View>
        <TouchableOpacity onPress={() => setBookmarked((value) => !value)} className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: palette.page }} accessibilityLabel="Toggle bookmark"><Bookmark size={20} stroke={bookmarked ? "#FF6B0A" : palette.text} fill={bookmarked ? "#FF6B0A" : "transparent"} /></TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center px-4 py-3 overflow-hidden">
        <View
          className="rounded-[24px] shadow-card px-7 py-8 justify-between"
          style={{
            width: pageWidth,
            height: Math.min(pageWidth * 1.38, 650),
            backgroundColor: palette.page,
            transform: [{ scale }],
          }}
        >
          <View>
            <Text className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: "#EA580C" }}>Chapter {Math.ceil(currentPage / 24)}</Text>
            <Text className="text-2xl font-black mt-4 leading-8" style={{ color: palette.text }}>Small changes, meaningful progress</Text>
            <View className="w-12 h-1 rounded-full bg-primary mt-5 mb-6" />
            <Text className="text-base leading-8" style={{ color: palette.text }}>{PAGE_COPY[currentPage % PAGE_COPY.length]}</Text>
            <Text className="text-base leading-8 mt-5" style={{ color: palette.text }}>{PAGE_COPY[(currentPage + 1) % PAGE_COPY.length]}</Text>
          </View>
          <Text className="text-xs text-center" style={{ color: palette.muted }}>{currentPage}</Text>
        </View>
      </View>

      <View className="rounded-t-[30px] px-5 pt-4 pb-3" style={{ backgroundColor: palette.page }}>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-semibold" style={{ color: palette.muted }}>{progress}% complete</Text>
          <Text className="text-xs font-semibold" style={{ color: palette.muted }}>{currentPage} / {totalPages}</Text>
        </View>
        <View className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: palette.shell }}><View className="h-full bg-primary" style={{ width: `${progress}%` }} /></View>
        <View className="flex-row items-center justify-between mt-4">
          <TouchableOpacity onPress={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="w-11 h-11 rounded-full items-center justify-center" style={{ backgroundColor: palette.shell }}><ChevronLeft size={21} stroke={currentPage === 1 ? palette.muted : palette.text} /></TouchableOpacity>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => setScale((value) => Math.max(0.8, value - 0.1))} className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: palette.shell }}><Minus size={17} stroke={palette.text} /></TouchableOpacity>
            <TouchableOpacity onPress={() => setTheme(theme === "light" ? "sepia" : theme === "sepia" ? "dark" : "light")} className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: palette.shell }}>{theme === "dark" ? <Moon size={17} stroke={palette.text} /> : <Sun size={17} stroke={palette.text} />}</TouchableOpacity>
            <TouchableOpacity onPress={() => setScale((value) => Math.min(1.15, value + 0.1))} className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: palette.shell }}><Plus size={17} stroke={palette.text} /></TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="w-11 h-11 rounded-full bg-primary items-center justify-center"><ChevronRight size={21} stroke="#FFFFFF" /></TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
