import { lazy, Suspense } from "react";
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from "react-native";
import { cn } from "@/lib/utils";

const Gradient = lazy(() =>
  import("expo-linear-gradient").then((module) => ({ default: module.LinearGradient }))
);

function LazyGradient({ colors, start, end, style, children }: any) {
  return (
    <Suspense fallback={null}>
      <Gradient colors={colors} start={start} end={end} style={style}>
        {children}
      </Gradient>
    </Suspense>
  );
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gradient";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  className?: string;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  style,
  className,
  textStyle,
}: ButtonProps) {
  const isGradient = variant === "gradient";
  const baseStyles = cn(
    "flex-row items-center justify-center rounded-xl",
    variant === "primary" && "bg-primary-600",
    variant === "secondary" && "bg-secondary-600",
    variant === "ghost" && "bg-transparent",
    variant === "danger" && "bg-danger",
    size === "sm" && "px-4 py-2",
    size === "md" && "px-6 py-3",
    size === "lg" && "px-8 py-4",
    (disabled || loading) && "opacity-50"
  );

  const textStyles = cn(
    "font-semibold text-center",
    variant === "primary" && "text-white",
    variant === "secondary" && "text-white",
    variant === "gradient" && "text-white",
    variant === "ghost" && "text-primary-600",
    variant === "danger" && "text-white",
    size === "sm" && "text-sm",
    size === "md" && "text-base",
    size === "lg" && "text-lg"
  );

  const gradientColors = ["#FF7A16", "#FF5B00"] as const;

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "danger" || variant === "gradient" ? "white" : "#EA580C"}
          size="small"
        />
      ) : (
        <Text className={textStyles} style={textStyle}>
          {title}
        </Text>
      )}
    </>
  );

  if (isGradient) {
    return (
      <LazyGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[{ borderRadius: 12 }, style]}
      >
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || loading}
          className={cn(
            "flex-row items-center justify-center rounded-xl",
            size === "sm" && "px-4 py-2",
            size === "md" && "px-6 py-3",
            size === "lg" && "px-8 py-4",
            (disabled || loading) && "opacity-50",
            className
          )}
        >
          {buttonContent}
        </TouchableOpacity>
      </LazyGradient>
    );
  }

  return (
    <TouchableOpacity
      className={cn(baseStyles, className)}
      onPress={onPress}
      disabled={disabled || loading}
      style={style}
    >
      {buttonContent}
    </TouchableOpacity>
  );
}
