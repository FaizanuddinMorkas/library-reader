import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BookOpen from "lucide-react-native/icons/book-open";
import Search from "lucide-react-native/icons/search";
import Sparkles from "lucide-react-native/icons/sparkles";
import Plus from "lucide-react-native/icons/plus";
import { cn } from "@/lib/utils";

interface EmptyStateIllustrationProps {
  illustration?: "no-loans" | "no-books" | "no-history" | "no-results";
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const illustrations = {
  "no-loans": (
    <View className="w-28 h-28 rounded-full bg-brand-gradient-soft items-center justify-center mb-5">
      <BookOpen size={40} stroke="#EA580C" />
    </View>
  ),
  "no-books": (
    <View className="w-28 h-28 rounded-full bg-brand-gradient-soft items-center justify-center mb-5">
      <Search size={40} stroke="#EA580C" />
    </View>
  ),
  "no-history": (
    <View className="w-28 h-28 rounded-full bg-brand-gradient-soft items-center justify-center mb-5">
      <BookOpen size={40} stroke="#EA580C" />
    </View>
  ),
  "no-results": (
    <View className="w-28 h-28 rounded-full bg-brand-gradient-soft items-center justify-center mb-5">
      <Sparkles size={40} stroke="#EA580C" />
    </View>
  ),
};

export function EmptyStateIllustration({
  illustration = "no-loans",
  title,
  subtitle,
  actionLabel,
  onAction,
  className,
}: EmptyStateIllustrationProps) {
  return (
    <View className={cn("items-center px-6 py-12", className)}>
      {illustrations[illustration]}
      <Text className="text-lg font-bold text-ink text-center mb-2">{title}</Text>
      <Text className="text-sm text-ink-muted text-center mb-6 px-4">
        {subtitle}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.85}>
          <LinearGradient
            colors={["#FF7A16", "#FF5B00"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-xl px-6 py-3 flex-row items-center gap-2"
          >
            <Plus size={18} stroke="#FFFFFF" />
            <Text className="text-white font-semibold text-sm">{actionLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}
