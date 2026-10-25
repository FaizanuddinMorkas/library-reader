import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { KeyboardAwareScreen } from "@/components/ui/KeyboardAwareScreen";
import Lock from "lucide-react-native/icons/lock";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import { authApi } from "@/lib/api/authApi";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;
    if (!token || Array.isArray(token)) {
      Alert.alert("Error", "This reset link is invalid or expired.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      Alert.alert("Success", "Your password has been reset successfully", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch {
      Alert.alert("Error", "This reset link is invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScreen>
      <View className="flex-1 px-6 py-12">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-8"
        >
          <ArrowLeft size={20} stroke="#374151" />
          <Text className="text-gray-700 ml-2">Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-gray-900">
          Reset Password
        </Text>
        <Text className="text-sm text-gray-500 mt-2">
          Enter your new password below.
        </Text>

        <View className="mt-8">
          <Input
            label="New Password"
            placeholder="Enter new password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            leftIcon={<Lock size={20} stroke="#9CA3AF" />}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={errors.confirmPassword}
            leftIcon={<Lock size={20} stroke="#9CA3AF" />}
          />

          <Button
            title="Reset Password"
            onPress={handleReset}
            loading={loading}
            size="lg"
          />
        </View>
      </View>
    </KeyboardAwareScreen>
  );
}
