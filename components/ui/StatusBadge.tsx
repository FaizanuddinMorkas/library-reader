import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "checked-out" | "returned" | "overdue" | "active" | "inactive";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    "checked-out": {
      label: "Active",
      bg: "bg-primary-100",
      text: "text-primary-700",
    },
    returned: {
      label: "Returned",
      bg: "bg-success-100",
      text: "text-success-700",
    },
    overdue: {
      label: "Overdue",
      bg: "bg-danger-100",
      text: "text-danger-700",
    },
    active: {
      label: "Active",
      bg: "bg-success-100",
      text: "text-success-700",
    },
    inactive: {
      label: "Inactive",
      bg: "bg-muted-100",
      text: "text-muted-700",
    },
  };

  const config = statusConfig[status];

  return (
    <View
      className={cn(
        "px-2 py-1 rounded-full self-start",
        config.bg
      )}
    >
      <Text className={cn("text-xs font-medium", config.text)}>
        {config.label}
      </Text>
    </View>
  );
}
