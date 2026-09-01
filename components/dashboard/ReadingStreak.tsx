import { View, Text } from "react-native";
import Flame from "lucide-react-native/icons/flame";
import { Card } from "@/components/ui/Card";

interface ReadingStreakProps {
  days?: number;
}

export function ReadingStreak({ days = 3 }: ReadingStreakProps) {
  return (
    <Card variant="accent" style={{ marginBottom: 16 }}>
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
          <Flame size={24} stroke="#2563EB" />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-sm font-semibold text-gray-900">
            {days}-day reading streak!
          </Text>
          <Text className="text-xs text-gray-500">
            Keep it going — read something today.
          </Text>
          <View className="flex-row gap-1.5 mt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <View
                key={i}
                className={`w-6 h-6 rounded-full items-center justify-center ${
                  i < days ? "bg-primary-500" : "bg-gray-200"
                }`}
              >
                <Text className={`text-[10px] font-bold ${i < days ? "text-white" : "text-gray-400"}`}>
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Card>
  );
}
