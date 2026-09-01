import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "muted";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const containerStyles = cn(
    "px-2 py-1 rounded-full self-start",
    variant === "default" && "bg-gray-100",
    variant === "primary" && "bg-primary-100",
    variant === "success" && "bg-green-100",
    variant === "warning" && "bg-amber-100",
    variant === "danger" && "bg-red-100",
    variant === "muted" && "bg-gray-50"
  );

  const textStyles = cn(
    "text-xs font-medium",
    variant === "default" && "text-gray-700",
    variant === "primary" && "text-primary-700",
    variant === "success" && "text-green-700",
    variant === "warning" && "text-amber-700",
    variant === "danger" && "text-red-700",
    variant === "muted" && "text-gray-500"
  );

  return (
    <View className={containerStyles}>
      <Text className={textStyles}>{children}</Text>
    </View>
  );
}
