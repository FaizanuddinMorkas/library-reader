import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { hydrateAuthStore } from "@/store/authStore";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync().catch((error) => {
  if (__DEV__) console.warn("Unable to keep splash screen visible:", error);
});

export default function RootLayout() {
  // Hydrate auth store from SecureStore on mount (non-blocking)
  useEffect(() => {
    hydrateAuthStore();
  }, []);

  useEffect(() => {
    SplashScreen.hideAsync().catch((error) => {
      if (__DEV__) console.warn("Unable to hide splash screen:", error);
    });
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              navigationBarColor: "transparent",
              navigationBarTranslucent: true,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="ebook/[id]" />
            <Stack.Screen name="book/[id]" />
            <Stack.Screen name="scan" options={{ presentation: "fullScreenModal" }} />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="borrowing-history" />
            <Stack.Screen name="reader-card" />
            <Stack.Screen name="settings" />
          </Stack>
          <StatusBar style="dark" />
        </GestureHandlerRootView>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
