import type { PropsWithChildren, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

type KeyboardAwareScreenProps = PropsWithChildren<{
  header?: ReactNode;
  footer?: ReactNode;
  safeAreaEdges?: Edge[];
  scrollContentStyle?: StyleProp<ViewStyle>;
  scrollStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  scrollProps?: Omit<
    ScrollViewProps,
    | "children"
    | "contentContainerStyle"
    | "keyboardShouldPersistTaps"
    | "automaticallyAdjustKeyboardInsets"
  >;
}>;

export function KeyboardAwareScreen({
  children,
  header,
  footer,
  safeAreaEdges = ["top", "left", "right"],
  scrollContentStyle,
  scrollStyle,
  style,
  scrollProps,
}: KeyboardAwareScreenProps) {
  return (
    <SafeAreaView edges={safeAreaEdges} style={[styles.flex, style]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <View style={styles.flex}>
          {header}
          <ScrollView
            automaticallyAdjustKeyboardInsets
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            {...scrollProps}
            contentContainerStyle={[styles.content, scrollContentStyle]}
            style={scrollStyle}
          >
            {children}
          </ScrollView>
          {footer}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
});
