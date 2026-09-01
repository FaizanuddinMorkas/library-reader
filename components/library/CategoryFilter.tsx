import { View, Text, TouchableOpacity } from "react-native";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <View className="mb-4">
      <View className="flex-row gap-2">
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => onSelect(category)}
            className={`px-4 py-2 rounded-full ${
              selected === category
                ? "bg-primary-600"
                : "bg-white border border-gray-200"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selected === category ? "text-white" : "text-gray-600"
              }`}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
