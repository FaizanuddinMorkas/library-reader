import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { KeyboardAwareScreen } from "@/components/ui/KeyboardAwareScreen";
import { BookOpen, Mail, Lock } from "lucide-react-native";
import { isValidEmail, MIN_PASSWORD_LENGTH } from "@/lib/validation";
import { AuthBackground, AuthCardAccent } from "@/components/auth/AuthBackground";

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isTabletLayout = width >= 980;
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Invalid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
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
    <AuthBackground>
      <KeyboardAwareScreen
        scrollContentStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <View
          className={
            isTabletLayout
              ? "w-full flex-row items-center justify-center gap-6 px-8 py-8"
              : "w-full max-w-md self-center px-5 py-8"
          }
        >
          {isTabletLayout ? (
            <View className="w-56">
              <Text className="text-6xl font-black leading-[1.08] text-ink">
                LOGIN{"\n"}AND{"\n"}SIGN UP
              </Text>
            </View>
          ) : null}
          <View
            className={`overflow-hidden rounded-3xl border border-border bg-surface shadow-card ${isTabletLayout ? "w-80" : "w-full"}`}
          >
            <AuthCardAccent />
            <View className="p-6">
              <View className="mb-5 items-center">
                <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-primary-600">
                  <BookOpen size={24} stroke="#FFFFFF" />
                </View>
                <Text className="mb-1 text-xs font-bold uppercase tracking-widest text-primary-700">
                  Library Reader
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-center text-2xl font-bold text-ink"
                >
                  Welcome back
                </Text>
                <Text className="mt-1 text-center text-sm text-ink-muted">
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
                leftIcon={<Mail size={20} stroke="#9CA3AF" />}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={errors.password}
                leftIcon={<Lock size={20} stroke="#9CA3AF" />}
              />

              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot-password")}
                className="mb-4 self-end"
              >
                <Text className="text-sm font-medium text-primary-600">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                size="md"
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Create an account"
                onPress={() => router.push("/(auth)/register")}
                className="mt-5 items-center py-2"
              >
                <Text className="text-sm text-gray-500">
                  Don’t have an account?{" "}
                  <Text className="font-bold text-primary-600">
                    Create an account
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {isTabletLayout ? (
            <View className="min-h-[36rem] w-80 overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
              <AuthCardAccent />
              <View className="flex-1 justify-between p-6">
                <View>
                  <Text className="mb-3 text-2xl font-black text-ink">
                    Create an account
                  </Text>
                  <Text className="text-sm leading-6 text-ink-soft">
                    Join your library to borrow books, track reading, and
                    access available e-books.
                  </Text>
                </View>
                <Button
                  title="Sign up"
                  onPress={() => router.push("/(auth)/register")}
                  size="md"
                />
              </View>
            </View>
          ) : null}
        </View>
      </KeyboardAwareScreen>
    </AuthBackground>
  );
}
