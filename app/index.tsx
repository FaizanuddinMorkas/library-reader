import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuthStore } from "@/store/authStore";

export function getInitialRoute(hasHydrated: boolean, isAuthenticated: boolean) {
  if (!hasHydrated) return null;
  return isAuthenticated ? "/(tabs)" : "/login";
}

export default function IndexRoute() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const route = getInitialRoute(hasHydrated, isAuthenticated);

  if (!route) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-glow">
          <Text className="text-3xl font-black text-white">L</Text>
        </View>
        <Text className="mt-5 text-2xl font-black text-ink">LibraryOS</Text>
        <ActivityIndicator className="mt-6" color="#FF6B0A" />
        <Text className="mt-3 text-sm text-ink-muted">Preparing your library…</Text>
      </View>
    );
  }

  return <Redirect href={route} />;
}
