import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import BookOpen from "lucide-react-native/icons/book-open";
import Calendar from "lucide-react-native/icons/calendar";
import { AppHeader } from "@/components/layout/AppHeader";
import { Screen } from "@/components/ui/Screen";
import { mockBorrowingHistory, mockBooks, mockLoans } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";
import type { LendingRecord } from "@/types/reader";
import { BookCover } from "@/components/library/BookCover";

type FilterType = "all" | "returned" | "overdue" | "active";

const STATUS_CONFIG: Record<
  LendingRecord["status"],
  { label: string; color: string; bg: string }
> = {
  returned: { label: "Returned", color: "#059669", bg: "#D1FAE5" },
  overdue: { label: "Overdue", color: "#DC2626", bg: "#FEE2E2" },
  "checked-out": { label: "Active", color: "#2563EB", bg: "#DBEAFE" },
};

export default function BorrowingHistoryScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>("all");

  const allRecords: LendingRecord[] = [...mockBorrowingHistory, ...mockLoans];
  const filtered =
    filter === "all"
      ? allRecords
      : allRecords.filter((r) => r.status === (filter === "active" ? "checked-out" : filter));

  const stats = {
    total: allRecords.length,
    returned: allRecords.filter((r) => r.status === "returned").length,
    active: allRecords.filter((r) => r.status === "checked-out").length,
    overdue: allRecords.filter((r) => r.status === "overdue").length,
  };

  return (
    <Screen scroll={false}>
      <AppHeader
        title="Borrowing History"
        subtitle={`${stats.total} books borrowed`}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View className="flex-row gap-3 mb-5">
          {[
            { label: "Total", value: stats.total, color: "#FFF3BE" },
            { label: "Returned", value: stats.returned, color: "#D1FAE5" },
            { label: "Active", value: stats.active, color: "#DBEAFE" },
            { label: "Overdue", value: stats.overdue, color: "#FEE2E2" },
          ].map(({ label, value, color }) => (
            <View
              key={label}
              className="flex-1 rounded-2xl p-3 items-center"
              style={{ backgroundColor: color }}
            >
              <Text className="text-xl font-black text-ink">{value}</Text>
              <Text className="text-[10px] text-ink-soft mt-0.5">{label}</Text>
            </View>
          ))}
        </View>

        {/* Filter Chips */}
        <View className="flex-row gap-2 mb-5">
          {(["all", "returned", "active", "overdue"] as FilterType[]).map((f) => {
            const isActive = filter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                className={`px-4 py-2 rounded-full ${
                  isActive
                    ? "bg-primary"
                    : "bg-white border border-border"
                }`}
              >
                <Text
                  className={`text-xs font-bold capitalize ${
                    isActive ? "text-white" : "text-ink-soft"
                  }`}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Records List */}
        <View className="gap-3">
          {filtered.length === 0 ? (
            <View className="items-center py-16">
              <BookOpen size={38} stroke="#EA580C" />
              <Text className="text-lg font-bold text-ink mt-4">
                No records found
              </Text>
              <Text className="text-sm text-ink-muted mt-1">
                Try a different filter
              </Text>
            </View>
          ) : (
            filtered.map((record, index) => {
              const statusInfo = STATUS_CONFIG[record.status];
              const book = mockBooks.find((item) => item.id === record.bookId);
              return (
                <TouchableOpacity
                  key={record.id}
                  className="rounded-[24px] bg-white border border-border p-4 flex-row items-center"
                  activeOpacity={0.7}
                >
                  <BookCover title={record.bookTitle} className="w-12 h-16 rounded-2xl shrink-0" fallbackColor={book?.coverColor ?? statusInfo.bg} />
                  <View className="ml-3 flex-1">
                    <Text
                      className="text-sm font-bold text-ink"
                      numberOfLines={1}
                    >
                      {record.bookTitle}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Calendar size={12} stroke="#8A857C" />
                      <Text className="text-[11px] text-ink-muted ml-1">
                        {formatDate(record.issueDate)} →{" "}
                        {record.returnDate
                          ? formatDate(record.returnDate)
                          : formatDate(record.dueDate)}
                      </Text>
                    </View>
                    {record.fineAmount ? (
                      <Text className="text-[10px] font-bold text-danger-600 mt-1">
                        Fine: ₹{record.fineAmount}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: statusInfo.bg }}
                  >
                    <Text
                      className="text-[10px] font-bold"
                      style={{ color: statusInfo.color }}
                    >
                      {statusInfo.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
