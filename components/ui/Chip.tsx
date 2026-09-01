import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function Chip({ label, active = false, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={cn(
        "px-4 py-2 rounded-full border",
        active
          ? "bg-primary border-primary"
          : "bg-surface border-border"
      )}
    >
      <Text
        className={cn(
          "text-sm font-semibold",
          active ? "text-white" : "text-ink-soft"
        )}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
