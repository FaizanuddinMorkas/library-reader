import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Flame from "lucide-react-native/icons/flame";
import BookOpen from "lucide-react-native/icons/book-open";

interface StreakCardProps {
  currentStreak: number;
  targetStreak: number;
  onOpenBook?: () => void;
}

export function StreakCard({ currentStreak, targetStreak = 7, onOpenBook }: StreakCardProps) {
  const progress = Math.min(currentStreak / targetStreak, 1);
  const progressPercent = Math.round(progress * 100);

  return (
    <LinearGradient
      colors={["#EFF6FF", "#FDF2FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-3xl p-5 relative"
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center">
            <Flame size={18} stroke="#EA580C" />
          </View>
          <Text className="text-sm font-bold text-ink">
            {currentStreak} day streak!
          </Text>
        </View>
        <View className="w-16 h-16 rounded-full bg-white/50 items-center justify-center relative">
          <Text className="text-2xl font-extrabold text-primary-600">
            {currentStreak}/{targetStreak}
          </Text>
        </View>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between text-xs font-medium mb-1">
          <Text className="text-ink-muted">Progress</Text>
          <Text className="text-primary-600">{progressPercent}%</Text>
        </View>
        <View className="h-2 bg-primary-100 rounded-full overflow-hidden">
          <View
            className="h-full bg-brand-gradient rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>

      <Text className="text-sm text-ink-muted mb-4">
        Read 20 min today to keep your streak alive
      </Text>

      {onOpenBook && (
        <TouchableOpacity
          onPress={onOpenBook}
          activeOpacity={0.85}
          className="w-full"
        >
          <LinearGradient
            colors={["#FF7A16", "#FF5B00"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-xl py-3 items-center"
          >
            <View className="flex-row items-center gap-2">
              <BookOpen size={18} stroke="#FFFFFF" />
              <Text className="text-white font-semibold text-sm">
                Continue Reading
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}
