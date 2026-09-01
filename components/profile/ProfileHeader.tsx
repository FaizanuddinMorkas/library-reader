import { View, Text } from "react-native";
import Mail from "lucide-react-native/icons/mail";
import Phone from "lucide-react-native/icons/phone";
import MapPin from "lucide-react-native/icons/map-pin";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { User } from "@/types/user";

interface ProfileHeaderProps {
  user: User | null;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <View className="items-center py-4">
        <Avatar name={user?.name ?? "U"} size={72} />
        <Text className="text-lg font-bold text-gray-900 mt-3">
          {user?.name ?? "Unknown User"}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Reader ID: {user?.readerId ?? "N/A"}
        </Text>
      </View>
      <View className="border-t border-gray-100 pt-4 mt-2">
        <Text className="text-sm font-semibold text-gray-900 mb-3">
          Personal Information
        </Text>
        <View className="gap-3">
          <View className="flex-row items-center">
            <Mail size={20} stroke="#6B7280" />
            <Text className="ml-3 text-sm text-gray-700">{user?.email}</Text>
          </View>
          <View className="flex-row items-center">
            <Phone size={20} stroke="#6B7280" />
            <Text className="ml-3 text-sm text-gray-700">+91 98765 43210</Text>
          </View>
          <View className="flex-row items-center">
            <MapPin size={20} stroke="#6B7280" />
            <Text className="ml-3 text-sm text-gray-700">
              Central Library, Mumbai
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}
