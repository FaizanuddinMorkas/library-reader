import { View, Text } from "react-native";
import { Card } from "@/components/ui/Card";

interface Stat {
  label: string;
  value: number;
  icon: React.ComponentType<{ size: number; stroke: string }>;
  color: string;
  bg: string;
}

interface LoanStatsGridProps {
  stats: Stat[];
}

export function LoanStatsGrid({ stats }: LoanStatsGridProps) {
  return (
    <View className="flex-row flex-wrap gap-3 mb-6">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <Card key={label} style={{ width: "47%", marginBottom: 0 }}>
          <View className="flex-row items-center gap-3">
            <View className={`w-10 h-10 rounded-xl items-center justify-center ${bg}`}>
              <Icon size={20} stroke={color} />
            </View>
            <View>
              <Text className="text-xs text-gray-500">{label}</Text>
              <Text className={`text-xl font-bold ${color}`}>{value}</Text>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}
