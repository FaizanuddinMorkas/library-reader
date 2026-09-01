import { View, Text, TouchableOpacity } from "react-native";
import Lock from "lucide-react-native/icons/lock";
import Settings from "lucide-react-native/icons/settings";
import Info from "lucide-react-native/icons/info";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import { Card } from "@/components/ui/Card";

const settingsItems = [
  { icon: Lock, label: "Change Password" },
  { icon: Settings, label: "App Settings" },
  { icon: Info, label: "About" },
];

interface SettingsListProps {
  onPress?: (label: string) => void;
}

export function SettingsList({ onPress }: SettingsListProps) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <Text className="text-sm font-semibold text-gray-900 mb-3">
        Settings
      </Text>
      <View className="gap-2">
        {settingsItems.map(({ icon: Icon, label }) => (
          <TouchableOpacity
            key={label}
            onPress={() => onPress?.(label)}
            className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <View className="flex-row items-center">
              <Icon size={20} stroke="#6B7280" />
              <Text className="ml-3 text-sm text-gray-700">{label}</Text>
            </View>
            <ChevronRight size={20} stroke="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
}
