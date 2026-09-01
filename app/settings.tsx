// Settings now live inline on the Profile screen. This file remains as a
// no-op stub so deep-links to /settings don't break.
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";

export default function SettingsRedirect() {
  const router = useRouter();
  if (typeof window !== "undefined") router.replace("/(tabs)/profile");
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <Text className="text-sm text-ink-muted">Redirecting…</Text>
      </View>
    </Screen>
  );
}
