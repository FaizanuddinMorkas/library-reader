import { useState, lazy, Suspense } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Mail from "lucide-react-native/icons/mail";
import Lock from "lucide-react-native/icons/lock";
import Eye from "lucide-react-native/icons/eye";
import EyeOff from "lucide-react-native/icons/eye-off";
import BookOpen from "lucide-react-native/icons/book-open";

// Lazy-load LinearGradient so the native module doesn't block startup
const LinearGradient = lazy(() =>
  import("expo-linear-gradient").then((m) => ({ default: m.LinearGradient }))
);

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, backgroundColor: "#FFF3BE" }} />
      }
    >
      <LinearGradient
        colors={["#FFF3BE", "#FFE6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1"
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior="padding"
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 justify-center px-6 py-12">
              {/* Logo */}
              <View className="items-center mb-10">
                <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-5 shadow-glow">
                  <BookOpen size={36} stroke="#FFFFFF" />
                </View>
                <Text className="text-3xl font-black text-ink">
                  LibraryOS
                </Text>
                <Text className="text-ink-soft text-sm mt-1">
                  Your digital library companion
                </Text>
              </View>

              {/* Card */}
              <View className="bg-surface rounded-3xl shadow-card p-6 w-full max-w-md mx-auto">
                <View className="mb-6">
                  <Text className="text-2xl font-black text-ink mb-1">
                    Welcome back
                  </Text>
                  <Text className="text-sm text-ink-muted">
                    Sign in to access your library
                  </Text>
                </View>

                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  leftIcon={<Mail size={20} stroke="#8A857C" />}
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  error={errors.password}
                  leftIcon={<Lock size={20} stroke="#8A857C" />}
                  rightIcon={
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="p-1"
                    >
                      {showPassword ? (
                        <EyeOff size={20} stroke="#8A857C" />
                      ) : (
                        <Eye size={20} stroke="#8A857C" />
                      )}
                    </TouchableOpacity>
                  }
                />

                <TouchableOpacity
                  onPress={() => router.push("/(auth)/forgot-password")}
                  className="self-end mt-2 mb-6"
                >
                  <Text className="text-sm text-primary-600 font-medium">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  size="lg"
                  variant="gradient"
                  className="w-full"
                />
              </View>

              {/* Demo hint */}
              <View className="mt-8 items-center">
                <Text className="text-ink-muted text-xs text-center px-4">
                  Demo: Use any email and password (min 6 chars)
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Suspense>
  );
}
