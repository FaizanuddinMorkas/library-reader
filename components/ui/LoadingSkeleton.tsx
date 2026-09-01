import { View, Animated, Easing, ViewStyle } from "react-native";
import { useEffect, useState } from "react";

interface LoadingSkeletonProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  fullWidth?: boolean;
}

export function LoadingSkeleton({
  width,
  height = 20,
  borderRadius = 8,
  fullWidth = true,
}: LoadingSkeletonProps) {
  const [opacity] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const style: Animated.WithAnimatedObject<ViewStyle> = {
    height,
    borderRadius,
    backgroundColor: "#E5E7EB",
    opacity,
    ...(fullWidth ? { alignSelf: "stretch" as const } : { width: width ?? 100 }),
  };

  return <Animated.View style={style} />;
}

export function CardSkeleton() {
  return (
    <View className="rounded-2xl border border-gray-200 bg-white p-4">
      <LoadingSkeleton height={120} borderRadius={12} />
      <View className="mt-3">
        <LoadingSkeleton height={16} fullWidth={false} width={240} />
        <View className="mt-2">
          <LoadingSkeleton height={12} fullWidth={false} width={180} />
        </View>
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className="flex-row items-center gap-3">
          <LoadingSkeleton width={60} height={60} borderRadius={12} fullWidth={false} />
          <View className="flex-1">
            <LoadingSkeleton height={16} fullWidth={false} width={210} />
            <View className="mt-2">
              <LoadingSkeleton height={12} fullWidth={false} width={150} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
