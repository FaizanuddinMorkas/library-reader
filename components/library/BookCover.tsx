import { useState } from "react";
import { Image, Text, View } from "react-native";
import BookOpen from "lucide-react-native/icons/book-open";
import { mockEbooks } from "@/lib/mockData";

interface BookCoverProps {
  title: string;
  className: string;
  fallbackColor?: string;
}

export function BookCover({ title, className, fallbackColor = "#F59E0B" }: BookCoverProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const ebook = mockEbooks.find((item) => item.title === title);

  return (
    <View className={`${className} overflow-hidden items-center justify-center`} style={{ backgroundColor: fallbackColor }}>
      {ebook && !imageFailed ? (
        <Image
          source={typeof ebook.coverUrl === "string" ? { uri: ebook.coverUrl } : ebook.coverUrl}
          className="w-full h-full"
          resizeMode="cover"
          accessibilityLabel={`${title} cover`}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <>
          <BookOpen size={28} stroke="#FFFFFF" />
          <Text className="mt-1 px-1 text-center text-[10px] font-bold text-white" numberOfLines={2}>
            {title}
          </Text>
        </>
      )}
    </View>
  );
}
