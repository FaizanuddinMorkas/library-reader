import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "@/components/ui/Card";
import { BookCover } from "@/components/library/BookCover";
import { formatDate } from "@/lib/utils";
import { LendingRecord } from "@/types/reader";

interface ActiveLoanCardProps {
  loan: LendingRecord;
  onPress?: () => void;
}

export function ActiveLoanCard({ loan, onPress }: ActiveLoanCardProps) {
  const [renderedAt] = useState(Date.now);
  const daysUntilDue = Math.ceil(
    (new Date(loan.dueDate).getTime() - renderedAt) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={{ width: 200, marginRight: 12 }}>
        <BookCover title={loan.bookTitle} className="w-full h-24 rounded-lg mb-3" fallbackColor="#9CA3AF" />
        <Text className="text-sm font-semibold text-gray-900" numberOfLines={2}>
          {loan.bookTitle}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          Due: {formatDate(loan.dueDate)}
        </Text>
        <View className="mt-2">
          {isOverdue ? (
            <Text className="text-xs font-medium text-red-600">
              Overdue by {Math.abs(daysUntilDue)} days
            </Text>
          ) : isDueSoon ? (
            <Text className="text-xs font-medium text-amber-600">
              Due in {daysUntilDue} days
            </Text>
          ) : (
            <Text className="text-xs font-medium text-green-600">
              {daysUntilDue} days remaining
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
