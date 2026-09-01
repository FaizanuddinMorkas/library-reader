import React from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";

interface ScreenProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function Screen({
  children,
  header,
  className,
  contentClassName,
  scroll = true,
  refreshing,
  onRefresh,
}: ScreenProps) {
  const { contentMaxWidth, screenPadding } = useResponsive();

  // Inner container that centers content on tablets/desktops and
  // applies consistent screen padding on all devices.
  const inner = (
    <View
      className="w-full self-center"
      style={{
        maxWidth: contentMaxWidth,
        paddingHorizontal: screenPadding,
      }}
    >
      {children}
    </View>
  );

  const content = (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <View className={cn("flex-1 bg-background", className)}>
        {header}
        {scroll ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
              ) : undefined
            }
            showsVerticalScrollIndicator={false}
          >
            {inner}
          </ScrollView>
        ) : (
          <View className={cn("flex-1", contentClassName)} style={{ padding: 10 }}>
            {children}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );

  return <SafeAreaView edges={["bottom"]} className="flex-1">{content}</SafeAreaView>;
}
