import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { cn } from "@/lib/utils";

interface AuthBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthBackground({ children, className }: AuthBackgroundProps) {
  return (
    <View className={cn("flex-1", className)}>
      <View className="absolute inset-0 bg-background" />
      {children}
    </View>
  );
}

export function AuthCardAccent() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      className="h-20 overflow-hidden bg-primary-50"
    >
      <Svg
        width="100%"
        height="80"
        viewBox="0 0 360 80"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
      >
        <Path
          d="M-28 84C52 84 32 46 112 42c78-4 37-43 145-48"
          fill="none"
          stroke="#FDBA74"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <Path
          d="M-28 84C52 84 32 46 112 42c78-4 37-43 145-48"
          fill="none"
          stroke="#FF6B0A"
          strokeWidth="4"
          strokeLinecap="round"
          opacity={0.4}
        />
      </Svg>
    </View>
  );
}
