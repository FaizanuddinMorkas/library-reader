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
import Mail from "lucide-react-native/icons/mail";
import ArrowLeft from "lucide-react-native/icons/arrow-left";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <View className="flex-1 bg-background px-6 py-12 justify-center">
        <View className="items-center">
          <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
            <Mail size={32} stroke="#10B981" />
          </View>
          <Text className="text-xl font-bold text-gray-900 text-center">
            Check Your Email
          </Text>
          <Text className="text-sm text-gray-500 mt-2 text-center">
            We{"'"}ve sent a password reset link to {email}
          </Text>
          <Button
            title="Back to Login"
            onPress={() => router.back()}
            variant="secondary"
            style={{ marginTop: 24 }}
          />
        </View>
      </View>
    );
  }

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
            Forgot Password
          </Text>
          <Text className="text-sm text-gray-500 mt-2">
            Enter your email address and we{"'"}ll send you a link to reset your
            password.
          </Text>

          <View className="mt-8">
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} stroke="#9CA3AF" />}
            />

            <Button
              title="Send Reset Link"
              onPress={handleSend}
              loading={loading}
              size="lg"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
