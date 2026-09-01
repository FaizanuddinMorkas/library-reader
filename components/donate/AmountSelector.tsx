import { View, Text, TouchableOpacity } from "react-native";

interface AmountSelectorProps {
  presets: number[];
  selected: number | null;
  onSelect: (amount: number) => void;
}

export function AmountSelector({ presets, selected, onSelect }: AmountSelectorProps) {
  return (
    <View className="mb-6">
      <Text className="text-sm font-semibold text-gray-900 mb-3">
        Select Amount
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {presets.map((amount) => (
          <TouchableOpacity
            key={amount}
            onPress={() => onSelect(amount)}
            className={`flex-1 min-w-[45%] p-4 rounded-xl border items-center ${
              selected === amount
                ? "bg-primary-50 border-primary-300"
                : "bg-white border-gray-200"
            }`}
          >
            <Text
              className={`text-lg font-bold ${
                selected === amount ? "text-primary-700" : "text-gray-900"
              }`}
            >
              ₹{amount.toLocaleString("en-IN")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
