import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const COVER_PALETTE = [
  "#065F46",
  "#1E3A5F",
  "#7C2D12",
  "#5B21B6",
  "#0F766E",
  "#1D4ED8",
  "#B91C1C",
  "#7E22CE",
  "#064E3B",
  "#1E40AF",
  "#92400E",
  "#6B21A8",
  "#115E59",
  "#1E3A8A",
  "#9A3412",
  "#581C87",
];

export function getCoverColor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COVER_PALETTE[Math.abs(hash) % COVER_PALETTE.length];
}

interface BookCoverProps {
  title: string;
  className: string;
  fallbackColor?: string;
  coverUrl?: string;
}

export function BookCover({ title, className, fallbackColor, coverUrl }: BookCoverProps) {
  const bgColor = fallbackColor || getCoverColor(title);
  const [failedCoverUrl, setFailedCoverUrl] = useState<string | null>(null);
  const shouldShowImage = Boolean(coverUrl && failedCoverUrl !== coverUrl);

  const logImageEvent = (event: "start" | "loaded" | "failed") => {
    if (__DEV__) console.log("[BookCover]", { event, title, hasSignedUrl: Boolean(coverUrl) });
  };

  return (
    <View className={`${className} overflow-hidden items-center justify-center`} style={{ backgroundColor: bgColor }}>
      {shouldShowImage ? (
        <Image
          source={{ uri: coverUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onLoadStart={() => logImageEvent("start")}
          onLoad={() => logImageEvent("loaded")}
          onError={() => {
            logImageEvent("failed");
            setFailedCoverUrl(coverUrl ?? null);
          }}
          accessibilityLabel={`${title} cover`}
        />
      ) : null}
      <Text
        className={`px-2 text-center text-white font-bold ${shouldShowImage ? "hidden" : ""}`}
        style={{ fontSize: className.includes("w-12") || className.includes("w-16") ? 8 : 12 }}
        numberOfLines={3}
      >
        {title}
      </Text>
    </View>
  );
}
