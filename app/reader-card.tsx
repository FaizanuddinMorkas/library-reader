import { View, Text, TouchableOpacity, Share } from "react-native";
import { useRouter } from "expo-router";
import Share2 from "lucide-react-native/icons/share-2";
import Download from "lucide-react-native/icons/download";
import BookOpen from "lucide-react-native/icons/book-open";
import { AppHeader } from "@/components/layout/AppHeader";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";

const QR_PATTERN = [
  "11101110111",
  "10101010101",
  "11101110111",
  "00010100000",
  "11011101101",
  "00100111010",
  "11101010111",
  "10111100101",
  "11101011111",
];

export default function ReaderCardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("") ?? "LR";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My LibraryOS Reader Card\nID: ${user?.readerId ?? "READ-2024-001"}\nName: ${user?.name ?? "Library Reader"}`,
      });
    } catch {}
  };

  return (
    <Screen scroll={false}>
      <AppHeader
        title="Library Card"
        subtitle="Your digital membership card"
        showBack
        onBack={handleBack}
      />

      <View className="flex-1 items-center justify-center px-6">
        {/* Card */}
        <View className="w-full rounded-[32px] bg-ink p-6 mb-8 shadow-card">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center">
              <BookOpen size={20} stroke="#FFFFFF" />
            </View>
            <View className="ml-3">
              <Text className="text-sm font-bold text-white">LibraryOS</Text>
              <Text className="text-[10px] text-white/60">Reader Card</Text>
            </View>
          </View>

          {/* QR Code */}
          <View className="flex-row items-center mb-6">
            <View className="w-28 h-24 bg-white p-1.5 rounded-xl mr-5">
              {QR_PATTERN.map((row, rowIndex) => (
                <View key={rowIndex} className="flex-1 flex-row">
                  {row.split("").map((cell, colIndex) => (
                    <View
                      key={`${rowIndex}-${colIndex}`}
                      className="flex-1"
                      style={{
                        backgroundColor: cell === "1" ? "#181713" : "#FFFFFF",
                      }}
                    />
                  ))}
                </View>
              ))}
            </View>
            <View className="flex-1">
              <Text className="text-[10px] text-white/50 uppercase tracking-wider">
                Reader ID
              </Text>
              <Text className="text-lg font-black text-white mt-1">
                {user?.readerId ?? "READ-2024-001"}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="h-px bg-white/20 mb-5" />

          {/* Member Info */}
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-2xl bg-primary items-center justify-center">
              <Text className="text-sm font-black text-white">{initials}</Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-bold text-white">
                {user?.name ?? "Library Reader"}
              </Text>
              <Text className="text-xs text-white/60 mt-0.5">
                Central Library · Mumbai
              </Text>
            </View>
          </View>

          {/* Barcode */}
          <View className="mt-5 bg-white/10 rounded-xl p-3">
            <Text className="text-center text-white/80 text-xs tracking-[4px] font-mono">
              {user?.readerId?.replace(/-/g, " ") ?? "READ 2024 001"}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 w-full">
          <TouchableOpacity
            onPress={handleShare}
            className="flex-1 h-14 rounded-2xl bg-primary items-center justify-center flex-row"
            activeOpacity={0.8}
          >
            <Share2 size={18} stroke="#FFFFFF" />
            <Text className="text-sm font-bold text-white ml-2">Share Card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 h-14 rounded-2xl bg-white border border-border items-center justify-center flex-row"
            activeOpacity={0.8}
          >
            <Download size={18} stroke="#57534E" />
            <Text className="text-sm font-bold text-ink ml-2">Download PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}
