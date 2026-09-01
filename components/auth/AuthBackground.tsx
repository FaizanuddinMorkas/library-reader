import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "@/lib/utils";

interface AuthBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthBackground({ children, className }: AuthBackgroundProps) {
  return (
    <View className={cn("flex-1", className)}>
      <LinearGradient
        colors={["#FFF3BE", "#FFE6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      >
        <View style={StyleSheet.absoluteFill} className="bg-white/5" />
      </LinearGradient>
      {children}
    </View>
  );
}
