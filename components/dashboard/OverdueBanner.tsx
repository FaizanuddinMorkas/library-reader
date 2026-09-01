import { View, Text } from "react-native";
import AlertCircle from "lucide-react-native/icons/circle-alert";
import { Card } from "@/components/ui/Card";

interface OverdueBannerProps {
  count: number;
}

export function OverdueBanner({ count }: OverdueBannerProps) {
  if (count === 0) return null;

  return (
    <Card variant="accent" style={{ marginBottom: 16, backgroundColor: "#FEF2F2" }}>
      <View className="flex-row items-center">
        <AlertCircle size={24} stroke="#EF4444" />
        <View className="ml-3 flex-1">
          <Text className="text-sm font-semibold text-red-700">
            {count} overdue book{count > 1 ? "s" : ""}
          </Text>
          <Text className="text-xs text-red-600">
            Please return them as soon as possible
          </Text>
        </View>
      </View>
    </Card>
  );
}
