import { View, Text } from "react-native";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | number;
}

function resolveSize(size: "sm" | "md" | "lg" | number): "sm" | "md" | "lg" {
  if (typeof size === "string") return size;
  if (size <= 32) return "sm";
  if (size <= 48) return "md";
  return "lg";
}

export function Avatar({ name, size = "md" }: AvatarProps) {
  const initials = getInitials(name);
  const resolved = resolveSize(size);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
  };

  // Wrap avatar in a gradient border for a modern look
  return (
    <View className="rounded-full p-0.5 bg-gradient-to-r from-primary-500 to-secondary-500">
      <View
        className={cn(
          "rounded-full bg-primary-100 items-center justify-center",
          sizeClasses[resolved]
        )}
      >
        <Text
          className={cn("font-semibold text-primary-700", typeof size === "string" ? textSizes[size] : "text-sm")}
        >
          {initials}
        </Text>
      </View>
    </View>
  );
}
