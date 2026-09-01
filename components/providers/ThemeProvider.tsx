import React, { createContext, useContext } from "react";
import { useAppTheme } from "@/hooks/useTheme";

type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  isDark: boolean;
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  resolvedTheme: "light",
});

export function useThemeContext() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDark, resolvedTheme } = useAppTheme();

  return (
    <ThemeContext.Provider value={{ isDark, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
