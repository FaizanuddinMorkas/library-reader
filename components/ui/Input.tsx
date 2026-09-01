import { View, Text, TextInput, TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  ...props
}: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-ink mb-1">
          {label}
        </Text>
      )}
      <View
        className={cn(
          "flex-row items-center bg-surface border rounded-xl px-4 py-3",
          error ? "border-danger" : "border-border"
        )}
      >
        {leftIcon && <View className="mr-3 text-ink-muted">{leftIcon}</View>}
        <TextInput
          className="flex-1 text-base text-ink"
          placeholderTextColor="#94A3B8"
          {...props}
        />
        {rightIcon && <View className="ml-3">{rightIcon}</View>}
      </View>
      {error && (
        <Text className="text-xs text-danger mt-1">{error}</Text>
      )}
    </View>
  );
}
