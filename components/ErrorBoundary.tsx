import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    // Log to console for development
    console.error("🔴 [ErrorBoundary] Caught error:", error.message);
    console.error("🔴 [ErrorBoundary] Component stack:", errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.emoji}>💥</Text>
            <Text style={styles.title}>App Crashed</Text>
            <Text style={styles.subtitle}>
              An unexpected error occurred. Details below:
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Error</Text>
              <Text style={styles.errorText}>{error?.message ?? "Unknown error"}</Text>
            </View>

            {error?.stack && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Stack Trace</Text>
                <Text style={styles.stackText}>{error.stack}</Text>
              </View>
            )}

            {errorInfo?.componentStack && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Component Stack</Text>
                <Text style={styles.stackText}>{errorInfo.componentStack}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  content: {
    padding: 24,
    paddingTop: 80,
    alignItems: "center",
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#EF4444",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F59E0B",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 15,
    color: "#F87171",
    lineHeight: 22,
  },
  stackText: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 18,
    fontFamily: "monospace",
  },
  button: {
    marginTop: 8,
    backgroundColor: "#2563EB",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
