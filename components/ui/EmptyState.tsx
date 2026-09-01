import { View, Text } from "react-native";
import BookOpen from "lucide-react-native/icons/book-open";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-12 px-6">
      <View className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 items-center justify-center mb-4">
        {icon || <BookOpen size={32} color="#9CA3AF" />}
      </View>
      <Text className="text-lg font-semibold text-gray-900 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-sm text-gray-500 text-center mt-2">
          {description}
        </Text>
      )}
    </View>
  );
}
