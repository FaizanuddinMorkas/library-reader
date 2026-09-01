import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Text className="text-6xl mb-4">🔍</Text>
      <Text className="text-2xl font-bold text-gray-900">Page Not Found</Text>
      <Text className="text-sm text-gray-500 mt-2 text-center">
        The page you{"'"}re looking for doesn{"'"}t exist.
      </Text>
      <Button
        title="Go Home"
        onPress={() => router.replace("/")}
        style={{ marginTop: 24 }}
      />
    </View>
  );
}
