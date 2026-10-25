import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import CircleAlert from "lucide-react-native/icons/circle-alert";
import BookOpen from "lucide-react-native/icons/book-open";
import History from "lucide-react-native/icons/history";
import { AppHeader } from "@/components/layout/AppHeader";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { LoanCard } from "@/components/home/LoanCard";
import { useLending } from "@/hooks/useLending";
import { formatDate } from "@/lib/utils";
import { BookCover } from "@/components/library/BookCover";

export default function MyLibraryScreen() {
  const router = useRouter();
  const { activeLoans, overdueLoans, returnedLoans, isRefreshing, error, refresh } = useLending();
  const loans = [...overdueLoans, ...activeLoans];

  // Calculate total fines from overdue loans
  const totalFines = overdueLoans.reduce((sum, loan) => sum + (loan.fineAmount ?? 0), 0);

  return (
    <Screen refreshing={isRefreshing} onRefresh={refresh}>
      <AppHeader title="My Library" subtitle="Your loans and borrowing history" />

      {error && (
        <View className="rounded-2xl bg-red-50 border border-red-100 p-4 mb-5">
          <Text className="text-sm font-bold text-red-700">Unable to refresh your loans.</Text>
        </View>
      )}

      <View className="flex-row gap-3 mb-6">
        {[
          { label: "On loan", value: loans.length, color: "#EEF4C8", icon: BookOpen },
          { label: "Overdue", value: overdueLoans.length, color: "#FFE6D4", icon: CircleAlert },
          { label: "Completed", value: returnedLoans.length, color: "#EEE2F5", icon: History },
        ].map(({ label, value, color, icon: Icon }) => (
          <View key={label} className="flex-1 rounded-3xl p-3.5" style={{ backgroundColor: color }}>
            <Icon size={18} stroke="#57534E" />
            <Text className="text-2xl font-black text-ink mt-3">{value}</Text>
            <Text className="text-[11px] text-ink-soft mt-0.5">{label}</Text>
          </View>
        ))}
      </View>

      {totalFines > 0 && (
        <View className="rounded-2xl bg-red-50 border border-red-100 p-4 mb-5">
          <Text className="text-sm font-bold text-red-700">Outstanding fines: ₹{totalFines}</Text>
        </View>
      )}

      <SectionTitle title="Current loans" />
      <TouchableOpacity onPress={() => router.push("/borrow-requests")} className="rounded-2xl bg-peach border border-orange-100 p-4 mb-6">
        <Text className="text-sm font-bold text-ink">Walk-in borrow requests</Text>
        <Text className="text-xs text-ink-soft mt-1">View or cancel your one-hour copy holds.</Text>
      </TouchableOpacity>
      <View className="gap-3 mb-7">
        {loans.length === 0 ? (
          <View className="rounded-2xl bg-white border border-border p-6 items-center">
            <BookOpen size={32} stroke="#8A857C" />
            <Text className="text-sm font-medium text-ink-muted mt-3">No active loans</Text>
          </View>
        ) : (
          loans.map((loan) => {
            return (
              <LoanCard
                key={loan.id}
                loan={{
                  ...loan,
                  author: loan.book?.authorName ?? "Library collection",
                  totalPages: loan.book?.totalPages,
                  coverUrl: loan.book?.coverUrl,
                }}
                onPress={() => router.push(`/loan/${loan.id}`)}
              />
            );
          })
        )}
      </View>

      <SectionTitle title="Borrowing history" actionLabel="View all" onAction={() => router.push("/borrowing-history")} />
      <View className="gap-3">
        {returnedLoans.length === 0 ? (
          <View className="rounded-2xl bg-white border border-border p-6 items-center">
            <History size={32} stroke="#8A857C" />
            <Text className="text-sm font-medium text-ink-muted mt-3">No borrowing history yet</Text>
          </View>
        ) : (
          returnedLoans.slice(0, 5).map((record) => {
            return (
              <TouchableOpacity
                key={record.id}
                onPress={() => router.push(`/loan/${record.id}`)}
                className="rounded-2xl bg-white border border-border p-3 flex-row items-center"
                activeOpacity={0.7}
              >
                <BookCover
                  title={record.bookTitle}
                  className="w-12 h-16 rounded-xl shrink-0"
                  coverUrl={record.book?.coverUrl}
                />
                <View className="ml-3 flex-1 min-w-0">
                  <Text className="text-sm font-bold text-ink" numberOfLines={1}>
                    {record.bookTitle}
                  </Text>
                  <Text className="text-xs text-ink-muted mt-1">
                    Returned {record.returnDate ? formatDate(record.returnDate) : "—"}
                  </Text>
                </View>
                <View className="px-2.5 py-1 rounded-full bg-success-50">
                  <Text className="text-[10px] font-bold text-success-700">RETURNED</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </Screen>
  );
}
