import { View, Text } from "react-native";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <View className="mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 p-4 rounded-xl">
      <Text className="text-2xl font-bold text-gray-900">{title}</Text>
      {description && (
        <Text className="text-sm text-gray-500 mt-1">{description}</Text>
      )}
    </View>
  );
}
