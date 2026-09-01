import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import Book from "lucide-react-native/icons/book";
import DollarSign from "lucide-react-native/icons/dollar-sign";
import Clock from "lucide-react-native/icons/clock";
import Calendar from "lucide-react-native/icons/calendar";
import AlertCircle from "lucide-react-native/icons/circle-alert";
import CheckCircle from "lucide-react-native/icons/circle-check";
import CreditCard from "lucide-react-native/icons/credit-card";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { mockLoans, mockBooks } from "@/lib/mockData";
import { calculateDaysUntilDue, formatDate } from "@/lib/utils";
import { BookCover } from "@/components/library/BookCover";

// Mock fine payment history
interface FinePayment {
  id: string;
  loanId: string;
  amount: number;
  paidAt: string;
  status: "paid" | "waived" | "pending";
  note?: string;
}

const mockFineHistory: FinePayment[] = [
  {
    id: "fine_001",
    loanId: "loan_002",
    amount: 50,
    paidAt: "",
    status: "pending",
    note: "Overdue 14 days at ₹5/day",
  },
];

export default function FineDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const loan = mockLoans.find((l) => l.id === id);

  if (!loan) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-bold text-ink">Loan not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 px-6 py-3 bg-primary rounded-2xl"
          >
            <Text className="text-white font-bold">Go back</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  const isOverdue = loan.status === "overdue";
  const book = mockBooks.find((b) => b.id === loan.bookId);
  const daysUntilDue = calculateDaysUntilDue(loan.dueDate);
  const overdueDays = Math.abs(daysUntilDue);
  const fineRatePerDay = 5;
  const calculatedFine = overdueDays * fineRatePerDay;

  const fineHistory = mockFineHistory.filter((f) => f.loanId === id);

  const totalFine = loan.fineAmount ?? 0;
  const paidAmount = fineHistory
    .filter((f) => f.status === "paid" || f.status === "waived")
    .reduce((sum, f) => sum + f.amount, 0);
  const pendingAmount = totalFine - paidAmount;

  const header = (
    <View className="pt-10 pb-4 flex-row items-center w-full">
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-11 h-11 rounded-full bg-white border border-border items-center justify-center"
      >
        <ArrowLeft size={20} stroke="#181713" />
      </TouchableOpacity>
      <Text className="text-xl font-black text-ink ml-3">Fine details</Text>
    </View>
  );

  return (
    <Screen header={header}>
      {/* Loan summary */}
        <View className="flex-row gap-3 mb-4">
          <BookCover title={loan.bookTitle} className="w-[60px] h-[88px] rounded-[12px]" fallbackColor={book?.coverColor} />
          <View className="flex-1 justify-between py-1">
            <View>
              <Text
                className="text-sm font-black text-ink leading-tight"
                numberOfLines={2}
              >
                {loan.bookTitle}
              </Text>
              {book && (
                <Text className="text-xs text-ink-soft mt-0.5">
                  {book.authorName}
                </Text>
              )}
              <Text className="text-xs text-ink-soft">
                Loan #{loan.id}
              </Text>
            </View>
            {isOverdue && (
              <View className="self-start rounded-full px-2.5 py-1 bg-red-50 border border-red-200">
                <Text className="text-xs font-bold text-red-600">
                  {overdueDays} days overdue
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Fine summary card */}
        <View className="rounded-[20px] bg-red-50 border border-red-100 p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center">
              <DollarSign size={20} stroke="#DC2626" />
            </View>
            <View className="ml-3">
              <Text className="text-xs text-red-600">Total fine</Text>
              <Text className="text-3xl font-black text-red-700">
                ₹{totalFine}
              </Text>
            </View>
          </View>

          {pendingAmount > 0 ? (
            <View className="bg-white/70 rounded-xl p-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5">
                  <AlertCircle size={14} stroke="#DC2626" />
                  <Text className="text-xs font-semibold text-red-700">
                    Amount pending
                  </Text>
                </View>
                <Text className="text-lg font-black text-red-700">
                  ₹{pendingAmount}
                </Text>
              </View>
            </View>
          ) : (
            <View className="bg-green-100 rounded-xl p-3">
              <View className="flex-row items-center gap-1.5">
                <CheckCircle size={14} stroke="#059669" />
                <Text className="text-xs font-semibold text-green-700">
                  Fully paid
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Fine breakdown */}
        <View className="rounded-[20px] bg-white border border-border p-4 mb-4">
          <Text className="text-sm font-bold text-ink mb-4">Fine breakdown</Text>

          <View className="flex-row items-center py-3 border-b border-border">
            <Clock size={16} stroke="#8A857C" />
            <Text className="text-sm text-ink-soft ml-3 flex-1">
              Overdue days
            </Text>
            <Text className="text-sm font-semibold text-ink">
              {overdueDays} days
            </Text>
          </View>

          <View className="flex-row items-center py-3 border-b border-border">
            <DollarSign size={16} stroke="#8A857C" />
            <Text className="text-sm text-ink-soft ml-3 flex-1">
              Rate per day
            </Text>
            <Text className="text-sm font-semibold text-ink">₹{fineRatePerDay}/day</Text>
          </View>

          <View className="flex-row items-center py-3">
            <AlertCircle size={16} stroke="#DC2626" />
            <Text className="text-sm text-ink-soft ml-3 flex-1">
              Total fine
            </Text>
            <Text className="text-sm font-bold text-red-700">
              ₹{calculatedFine}
            </Text>
          </View>
        </View>

        {/* Payment history */}
        <View className="rounded-[20px] bg-white border border-border p-4 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-bold text-ink">Payment history</Text>
            {fineHistory.length > 0 && (
              <View className="bg-primary-50 rounded-full px-2.5 py-0.5">
                <Text className="text-xs font-bold text-primary">
                  {fineHistory.length} {fineHistory.length === 1 ? "entry" : "entries"}
                </Text>
              </View>
            )}
          </View>

          {fineHistory.length === 0 ? (
            <View className="items-center py-6">
              <View className="w-12 h-12 rounded-full bg-muted-50 items-center justify-center mb-2">
                <CreditCard size={20} stroke="#8A857C" />
              </View>
              <Text className="text-sm text-ink-soft">No payment history yet</Text>
            </View>
          ) : (
            fineHistory.map((payment) => (
              <View
                key={payment.id}
                className="flex-row items-center py-3 border-b border-border last:border-0"
              >
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                    payment.status === "paid" || payment.status === "waived"
                      ? "bg-green-100"
                      : "bg-red-50"
                  }`}
                >
                  {payment.status === "paid" || payment.status === "waived" ? (
                    <CheckCircle size={14} stroke="#059669" />
                  ) : (
                    <Clock size={14} stroke="#DC2626" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-ink capitalize">
                    {payment.status}
                  </Text>
                  {payment.note && (
                    <Text className="text-xs text-ink-soft mt-0.5">
                      {payment.note}
                    </Text>
                  )}
                  <Text className="text-xs text-ink-soft">
                    {payment.paidAt ? formatDate(payment.paidAt) : "Pending"}
                  </Text>
                </View>
                <Text
                  className={`text-sm font-bold ${
                    payment.status === "paid" || payment.status === "waived"
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  ₹{payment.amount}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Pay Now */}
        {pendingAmount > 0 && (
          <View className="mt-2 mb-4">
            <Button
              variant="danger"
              size="lg"
              title="Pay Now"
              onPress={() => {}}
              className="w-full"
            />
            <Text className="text-xs text-center text-ink-soft mt-2">
              Secure payment via Cash / UPI / Card
            </Text>
          </View>
        )}
    </Screen>
  );
}
