import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Lock from "lucide-react-native/icons/lock";
import ArrowLeft from "lucide-react-native/icons/arrow-left";

export default function ResetPasswordScreen() {
  const router = useRouter();
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
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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

    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);

    Alert.alert("Success", "Your password has been reset successfully", [
      { text: "OK", onPress: () => router.replace("/(auth)/login") },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
