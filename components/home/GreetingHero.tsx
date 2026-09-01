import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BookOpen from "lucide-react-native/icons/book-open";
import Scan from "lucide-react-native/icons/scan";
import Target from "lucide-react-native/icons/target";

interface GreetingHeroProps {
  greeting: string;
  name: string;
  subtitle: string;
  onBrowsePress: () => void;
  onScanPress: () => void;
  onGoalPress?: () => void;
}

export function GreetingHero({
  greeting,
  name,
  subtitle,
  onBrowsePress,
  onScanPress,
  onGoalPress,
}: GreetingHeroProps) {
  const actions = [
    { label: "Browse Library", icon: BookOpen, onPress: onBrowsePress },
    { label: "Scan Book", icon: Scan, onPress: onScanPress },
    { label: "Reading Goal", icon: Target, onPress: onGoalPress },
  ].filter((a) => a.onPress);

  return (
    <LinearGradient
      colors={["#FF7A16", "#FF5B00"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-3xl p-6 shadow-glow"
    >
      <View className="mb-4">
        <Text className="text-xl font-bold text-white">
          {greeting}, {name}!
        </Text>
        <Text className="text-white/80 text-sm mt-1">{subtitle}</Text>
      </View>

      <View className="flex-row gap-2">
        {actions.map((action, i) => (
          <TouchableOpacity
            key={action.label}
            onPress={action.onPress}
            activeOpacity={0.8}
            className="flex-1 flex-row items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/20"
          >
            <action.icon size={16} stroke="#FFFFFF" />
            <Text className="text-white text-sm font-semibold">
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
}
