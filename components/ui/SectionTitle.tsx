import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function SectionTitle({ title, action, actionLabel, onAction, className }: SectionTitleProps) {
  return (
    <View
      className={cn(
        "flex-row items-center justify-between mb-3 mt-2",
        className
      )}
    >
      <Text className="text-base font-bold text-ink">{title}</Text>
      {action ?? (actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} accessibilityRole="button">
          <Text className="text-xs font-bold text-primary-700">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null)}
    </View>
  );
}
