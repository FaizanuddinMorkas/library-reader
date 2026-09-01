import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import X from "lucide-react-native/icons/x";
import AlertCircle from "lucide-react-native/icons/circle-alert";
import Clock from "lucide-react-native/icons/clock";
import AlertTriangle from "lucide-react-native/icons/triangle-alert";
import { cn } from "@/lib/utils";

interface SmartAlertProps {
  type: "overdue" | "due-soon" | "info";
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
}

const typeConfig = {
  overdue: {
    bg: "bg-danger-50",
    border: "border-l-4 border-danger",
    icon: AlertTriangle,
    iconColor: "#EF4444",
    titleColor: "text-danger-700",
    messageColor: "text-danger-600",
  },
  "due-soon": {
    bg: "bg-warning-50",
    border: "border-l-4 border-warning",
    icon: Clock,
    iconColor: "#F59E0B",
    titleColor: "text-warning-700",
    messageColor: "text-warning-600",
  },
  info: {
    bg: "bg-primary-50",
    border: "border-l-4 border-primary",
    icon: AlertCircle,
    iconColor: "#EA580C",
    titleColor: "text-primary-700",
    messageColor: "text-primary-600",
  },
};

export function SmartAlert({
  type,
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
}: SmartAlertProps) {
  const [visible, setVisible] = useState(true);
  const [slideAnim] = useState(() => new Animated.Value(0));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
    return () => animation.stop();
  }, [fadeAnim, slideAnim]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      onDismiss();
    });
  };

  if (!visible) return null;

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [-300, 0] }) }],
      }}
    >
      <View className={cn("rounded-r-xl p-4 mb-4 flex-row items-start gap-3", config.bg, config.border)}>
        <Icon size={20} stroke={config.iconColor} className="mt-0.5 flex-shrink-0" />
        <View className="flex-1 min-w-0">
          <Text className={cn("font-semibold text-sm", config.titleColor)}>{title}</Text>
          <Text className={cn("text-sm mt-0.5", config.messageColor)}>{message}</Text>
          {actionLabel && onAction && (
            <TouchableOpacity
              onPress={onAction}
              className="mt-3"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold text-primary-600">{actionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={handleDismiss} className="flex-shrink-0 ml-2 -mt-1">
          <X size={18} stroke="#94A3B8" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
