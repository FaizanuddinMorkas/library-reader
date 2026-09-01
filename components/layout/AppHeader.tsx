import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import Bell from "lucide-react-native/icons/bell";
import BookOpen from "lucide-react-native/icons/book-open";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  right,
}: AppHeaderProps) {
  return (
    <SafeAreaView edges={["top"]} className="bg-background">
      <View className="flex-row items-center py-3 h-16">
        {showBack ? (
          <TouchableOpacity
            onPress={onBack}
            className="mr-2 w-10 h-10 rounded-full bg-white border border-border items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={21} stroke="#181713" />
          </TouchableOpacity>
        ) : (
          <View className="mr-3 w-10 h-10 rounded-2xl bg-primary items-center justify-center shadow-glow">
            <BookOpen size={20} stroke="#FFFFFF" />
          </View>
        )}

        <View className="flex-1">
          <Text
            className={cn(
              "text-ink font-bold",
              subtitle ? "text-lg" : "text-xl"
            )}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text className="text-ink-muted text-xs mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {right ? <View className="ml-2">{right}</View> : !showBack ? (
          <View className="w-10 h-10 rounded-full bg-white border border-border items-center justify-center">
            <Bell size={19} stroke="#57534E" />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
