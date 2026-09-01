import { useState, useEffect, useCallback } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark" | "system";

const THEME_KEY = "app_theme";

/**
 * Hook to manage app theme (light/dark/system).
 * Persists user preference to AsyncStorage.
 */
export function useAppTheme() {
  const systemTheme = useRNColorScheme();
  const [userTheme, setUserTheme] = useState<Theme>("system");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored && (stored === "light" || stored === "dark" || stored === "system")) {
        setUserTheme(stored);
      }
    } catch (error) {
      console.warn("Failed to load theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = useCallback(async (theme: Theme) => {
    setUserTheme(theme);
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.warn("Failed to save theme:", error);
    }
  }, []);

  // Resolve effective theme
  const resolvedTheme: "light" | "dark" =
    userTheme === "system"
      ? systemTheme === "dark"
        ? "dark"
        : "light"
      : userTheme;

  const isDark = resolvedTheme === "dark";

  return {
    userTheme,
    resolvedTheme,
    isDark,
    isLoading,
    setTheme,
  };
}
