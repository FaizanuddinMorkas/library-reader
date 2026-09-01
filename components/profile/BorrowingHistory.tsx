import { View, Text } from "react-native";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { LendingRecord } from "@/types/reader";

interface BorrowingHistoryProps {
  records: LendingRecord[];
}

export function BorrowingHistory({ records }: BorrowingHistoryProps) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <Text className="text-sm font-semibold text-gray-900 mb-3">
        Borrowing History
      </Text>
      {records.length === 0 ? (
        <EmptyState
          title="No History Yet"
          description="Your borrowing history will appear here."
        />
      ) : (
        <View className="gap-3">
          {records.slice(0, 5).map((record) => (
            <View
              key={record.id}
              className="flex-row items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">
                  {record.bookTitle}
                </Text>
                <Text className="text-xs text-gray-500">
                  {formatDate(record.issueDate)} -{" "}
                  {record.returnDate
                    ? formatDate(record.returnDate)
                    : "Not returned"}
                </Text>
              </View>
              <StatusBadge status={record.status} />
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}
