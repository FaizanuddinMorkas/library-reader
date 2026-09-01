import { View, Text } from "react-native";
import { getTimeOfDay } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { User } from "@/types/user";

interface GreetingHeaderProps {
  user: User | null;
}

export function GreetingHeader({ user }: GreetingHeaderProps) {
  const timeOfDay = getTimeOfDay();
  const greeting =
    timeOfDay === "morning"
      ? "Good morning"
      : timeOfDay === "afternoon"
        ? "Good afternoon"
        : "Good evening";

  const firstName = user?.name?.split(" ")[0] ?? "Reader";

  return (
    <View className="flex-row items-center justify-between mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 p-4 rounded-xl">
      <View className="flex-1">
        <Text className="text-2xl font-bold text-gray-900">
          {greeting}, {firstName}! 👋
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Here{"'"}s a summary of your current borrowings
        </Text>
      </View>
      <Avatar
        name={user?.name ?? "U"}
        size={48}
      />
    </View>
  );
}
