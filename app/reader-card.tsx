import { View, Text, TouchableOpacity, Share } from "react-native";
import { useRouter } from "expo-router";
import Share2 from "lucide-react-native/icons/share-2";
import Download from "lucide-react-native/icons/download";
import { AppHeader } from "@/components/layout/AppHeader";
import { Screen } from "@/components/ui/Screen";
import { LibraryCard } from "@/components/profile/LibraryCard";
import { useAuthStore } from "@/store/authStore";
import { useReaderProfile } from "@/hooks/useReaderProfile";

export default function ReaderCardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { profile } = useReaderProfile();

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
        message: `My LibraryOS Reader Card\nID: ${profile?.readerId ?? "—"}\nName: ${profile?.fullName ?? user?.name ?? "Library Reader"}`,
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
        <View className="w-full mb-8">
          <LibraryCard
            readerId={profile?.readerId ?? "—"}
            readerName={profile?.fullName ?? user?.name ?? "Library Reader"}
            memberSince={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
            branchName={profile?.branchName ?? "—"}
            libraryName={profile?.libraryName ?? "—"}
          />
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
