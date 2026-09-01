import { View, Text, TouchableOpacity } from "react-native";
import Lock from "lucide-react-native/icons/lock";
import { EBook } from "@/types/book";
import { BookCover } from "@/components/library/BookCover";

interface EbookCardProps {
  ebook: EBook;
  onPress?: () => void;
  index?: number;
}

const PASTELS = ["#EEF4C8", "#EEE2F5", "#FFE6D4", "#DDF3F7", "#FFF3BE"];

export function EbookCard({ ebook, onPress, index = 0 }: EbookCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`${ebook.title} by ${ebook.author}`}
    >
      <View className="overflow-hidden rounded-3xl bg-white border border-border shadow-soft">
        <View className="w-full aspect-[2/3]">
          <BookCover title={ebook.title} className="w-full h-full" fallbackColor={PASTELS[index % PASTELS.length]} />
          <View className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/90 flex-row items-center">
            {ebook.accessType === "members-only" && <Lock size={10} stroke="#57534E" />}
            <Text className="text-[10px] font-bold text-ink-soft ml-1">
              {ebook.accessType === "free" ? "FREE" : "MEMBERS"}
            </Text>
          </View>
        </View>
        <View className="p-3.5 min-h-[82px]">
          <Text className="text-sm font-bold text-ink" numberOfLines={2}>{ebook.title}</Text>
          <Text className="text-xs text-ink-muted mt-1" numberOfLines={1}>{ebook.author}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
