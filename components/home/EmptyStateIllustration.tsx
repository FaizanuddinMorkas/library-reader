import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import BookOpen from "lucide-react-native/icons/book-open";
import Search from "lucide-react-native/icons/search";
import Sparkles from "lucide-react-native/icons/sparkles";
import ArrowRight from "lucide-react-native/icons/arrow-right";
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
    <View className="w-20 h-20 rounded-full bg-primary-50 items-center justify-center mb-4">
      <BookOpen size={32} stroke="#EA580C" />
    </View>
  ),
  "no-books": (
    <View className="w-20 h-20 rounded-full bg-primary-50 items-center justify-center mb-4">
      <Search size={32} stroke="#EA580C" />
    </View>
  ),
  "no-history": (
    <View className="w-20 h-20 rounded-full bg-primary-50 items-center justify-center mb-4">
      <BookOpen size={32} stroke="#EA580C" />
    </View>
  ),
  "no-results": (
    <View className="w-20 h-20 rounded-full bg-primary-50 items-center justify-center mb-4">
      <Sparkles size={32} stroke="#EA580C" />
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
    <View className={cn("items-center px-6 py-8", className)}>
      {illustrations[illustration]}
      <Text className="text-base font-semibold text-ink text-center mb-1">{title}</Text>
      <Text className="text-sm text-ink-muted text-center mb-5 px-2">
        {subtitle}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.7}
          className="flex-row items-center gap-1.5"
        >
          <Text className="text-sm font-semibold text-primary-600">{actionLabel}</Text>
          <ArrowRight size={16} stroke="#EA580C" />
        </TouchableOpacity>
      )}
    </View>
  );
}
