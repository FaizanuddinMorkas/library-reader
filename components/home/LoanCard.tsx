import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import Clock from "lucide-react-native/icons/clock";
import AlertCircle from "lucide-react-native/icons/circle-alert";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, calculateDaysUntilDue, cn } from "@/lib/utils";
import { BookCover } from "@/components/library/BookCover";

interface LoanCardProps {
  loan: {
    id: string;
    bookId: string;
    bookTitle: string;
    author?: string;
    dueDate: string;
    status: "checked-out" | "returned" | "overdue" | "active" | "inactive";
    currentPage?: number;
    totalPages?: number;
    coverColor?: string;
  };
  onPress: () => void;
}

export function LoanCard({ loan, onPress }: LoanCardProps) {
  const daysUntilDue = calculateDaysUntilDue(loan.dueDate);
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;
  const progress = loan.currentPage && loan.totalPages
    ? Math.min(loan.currentPage / loan.totalPages, 1)
    : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card className="relative overflow-hidden">
        <View className="flex-row items-start">
          <View className="w-16 h-20 rounded-xl relative overflow-hidden">
            <BookCover title={loan.bookTitle} className="w-full h-full" fallbackColor={loan.coverColor} />
            {isOverdue && (
              <View className="absolute top-1 right-1">
                <View className="w-5 h-5 rounded-full bg-danger/90 items-center justify-center">
                  <AlertCircle size={10} stroke="#FFFFFF" />
                </View>
              </View>
            )}
          </View>

          <View className="ml-3 flex-1 min-w-0">
            <Text className="text-base font-semibold text-ink" numberOfLines={2}>
              {loan.bookTitle}
            </Text>
            <Text className="text-sm text-ink-muted mt-0.5" numberOfLines={1}>
              {loan.author}
            </Text>

            {/* Progress Bar */}
            {progress > 0 && (
              <View className="mt-3">
                <View className="flex-row justify-between text-xs font-medium mb-1">
                  <Text className="text-ink-muted">Progress</Text>
                  <Text className="text-primary-600">
                    {Math.ceil(progress * 100)}%
                  </Text>
                </View>
                <View className="h-1.5 bg-muted-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${progress * 100}%` }}
                  />
                </View>
                <Text className="text-xs text-ink-muted mt-1">
                  Page {loan.currentPage} of {loan.totalPages}
                </Text>
              </View>
            )}

            {/* Due Date & Status */}
            <View className="flex-row items-center gap-3 mt-3">
              <StatusBadge status={loan.status} />
              <View className={cn(
                "flex-row items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                isOverdue
                  ? "bg-danger-50 text-danger-700"
                  : isDueSoon
                    ? "bg-warning-50 text-warning-700"
                    : "bg-success-50 text-success-700"
              )}>
                <Clock size={10} stroke="currentColor" />
                <Text>
                  {isOverdue
                    ? `${Math.abs(daysUntilDue)} days overdue`
                    : isDueSoon
                      ? `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`
                      : `Due ${formatDate(loan.dueDate)}`}
                </Text>
              </View>
            </View>
          </View>

          <ChevronRight size={20} stroke="#94A3B8" className="ml-2" />
        </View>
      </Card>
    </TouchableOpacity>
  );
}
