import { View, ViewStyle } from "react-native";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
  variant?: "default" | "accent" | "elevated";
}

export function Card({ children, style, className, variant = "default" }: CardProps) {
  const containerStyles = cn(
    "rounded-3xl p-4",
    variant === "default" && "bg-surface border border-border/60 shadow-soft",
    variant === "accent" && "bg-brand-gradient-soft",
    variant === "elevated" && "bg-surface shadow-card"
  );

  return (
    <View className={cn(containerStyles, className)} style={style}>
      {children}
    </View>
  );
}
