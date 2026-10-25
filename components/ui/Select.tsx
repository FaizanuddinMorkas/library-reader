import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronDown } from "lucide-react-native";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  placeholder: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function Select({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
  error,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <View className="mb-4">
      <Text className="mb-1 text-sm font-medium text-ink">{label}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={selectedOption?.label ?? placeholder}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={`flex-row items-center justify-between rounded-xl border bg-white px-4 py-3 ${error ? "border-danger" : "border-border"} ${disabled ? "opacity-50" : ""}`}
      >
        <Text className={selectedOption ? "text-base text-ink" : "text-base text-ink-muted"}>
          {selectedOption?.label ?? placeholder}
        </Text>
        <ChevronDown size={18} stroke="#8A857C" />
      </TouchableOpacity>
      {error ? <Text className="mt-1 text-xs text-danger">{error}</Text> : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close options"
          onPress={() => setOpen(false)}
          className="flex-1 justify-end bg-black/40 px-4 pb-6"
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="max-h-[70%] rounded-3xl bg-surface p-5"
          >
            <Text className="mb-4 text-lg font-bold text-ink">{label}</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map((option) => {
                const selected = option.value === value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`mb-2 rounded-xl border px-4 py-3 ${selected ? "border-primary-600 bg-primary-50" : "border-border bg-white"}`}
                  >
                    <Text className={selected ? "font-semibold text-primary-700" : "text-ink"}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
