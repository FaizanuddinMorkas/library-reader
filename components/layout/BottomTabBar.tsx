import React from "react";
import { View, TouchableOpacity, Text, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import Home from "lucide-react-native/icons/house";
import BookOpen from "lucide-react-native/icons/book-open";
import Sparkles from "lucide-react-native/icons/sparkles";
import LibraryBig from "lucide-react-native/icons/library-big";
import User from "lucide-react-native/icons/user";
import { useThemeContext } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

interface TabDef {
  name: string;
  label: string;
  icon: React.ComponentType<{ size: number; stroke: string }>;
  center?: boolean;
}

const TABS: TabDef[] = [
  { name: "index", label: "Home", icon: Home },
  { name: "library", label: "Library", icon: BookOpen },
  { name: "quick", label: "Quick", icon: Sparkles, center: true },
  { name: "my-library", label: "My Library", icon: LibraryBig },
  { name: "profile", label: "Profile", icon: User },
];

function BarSurface({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  const barTint = isDark ? "rgba(26,23,20,0.72)" : "rgba(255,253,245,0.72)";
  const blurTint: "dark" | "light" = isDark ? "dark" : "light";

  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={28}
        tint={blurTint}
        className="flex-row items-center justify-between mx-3 mb-2 px-2 py-1.5 rounded-[26px] border border-white/30 shadow-card"
        style={{ backgroundColor: barTint }}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View
      className="flex-row items-center justify-between mx-3 mb-2 px-2 py-1.5 bg-background rounded-[26px]"
      style={{ elevation: 12, shadowColor: "#3F2B19", shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } }}
    >
      {children}
    </View>
  );
}

export function BottomTabBar({
  state,
  navigation,
  onQuickPress,
}: {
  state: { index: number; routes: { name: string }[] };
  navigation: { navigate: (name: string) => void };
  onQuickPress: () => void;
}) {
  const activeRoute = state.routes[state.index]?.name;
  const { isDark } = useThemeContext();

  return (
    <SafeAreaView
      edges={["bottom"]}
      className="bg-transparent"
      style={{
        position: "absolute",
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: "transparent",
      }}
    >
      <BarSurface isDark={isDark}>
        {TABS.map((tab) => {
          const isFocused = activeRoute === tab.name;

          if (tab.center) {
            return (
              <TouchableOpacity
                key={tab.name}
                onPress={onQuickPress}
                className="items-center justify-center"
                style={{ marginTop: -24 }}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Open quick actions"
              >
                <View className="w-14 h-14 rounded-full bg-primary items-center justify-center shadow-glow border-4 border-white/40">
                  <tab.icon size={24} stroke="#FFFFFF" />
                </View>
                <Text className="text-[10px] mt-1 text-primary-700 font-semibold">Quick</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => navigation.navigate(tab.name)}
              className="flex-1 items-center py-1"
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tab.label}
            >
              <View
                className={cn(
                  "w-11 h-11 rounded-2xl items-center justify-center",
                  isFocused ? "bg-primary-50" : "bg-transparent"
                )}
              >
                <tab.icon
                  size={21}
                  stroke={isFocused ? "#EA580C" : "#8A857C"}
                />
              </View>
              <Text
                className={cn(
                  "text-[10px] mt-0.5",
                  isFocused
                    ? "text-primary-600 font-semibold"
                    : "text-ink-muted font-medium"
                )}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BarSurface>
    </SafeAreaView>
  );
}
