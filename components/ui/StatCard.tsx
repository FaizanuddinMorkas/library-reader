import React from "react";
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tint?: "primary" | "danger" | "warning" | "muted";
  className?: string;
}

const tints = {
  primary: "bg-primary-50",
  danger: "bg-danger-50",
  warning: "bg-amber-50",
  muted: "bg-muted-50",
};

export function StatCard({
  label,
  value,
  icon,
  tint = "primary",
  className,
}: StatCardProps) {
  return (
    <View
      className={cn(
        "flex-1 rounded-2xl bg-surface p-4 shadow-soft border border-border/60",
        className
      )}
    >
      <View
        className={cn(
          "w-10 h-10 rounded-xl items-center justify-center mb-3",
          tints[tint]
        )}
      >
        {icon}
      </View>
      <Text className="text-2xl font-extrabold text-ink">{value}</Text>
      <Text className="text-xs font-medium text-ink-muted mt-0.5">{label}</Text>
    </View>
  );
}
