import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import Bell from "lucide-react-native/icons/bell";
import Search from "lucide-react-native/icons/search";
import Sparkles from "lucide-react-native/icons/sparkles";
import { useAuthStore } from "@/store/authStore";
import { useLending } from "@/hooks/useLending";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { calculateDaysUntilDue, getTimeOfDay } from "@/lib/utils";
import { SmartAlert } from "@/components/home/SmartAlert";
import { LoanCard } from "@/components/home/LoanCard";
import { EmptyStateIllustration } from "@/components/home/EmptyStateIllustration";
import { CATEGORIES, mockBooks } from "@/lib/mockData";
import { BookCover } from "@/components/library/BookCover";

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { activeLoans, overdueLoans, isLoading, isRefreshing, refresh } =
    useLending();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const greeting = `Good ${getTimeOfDay()}`;
  const dueSoonCount = activeLoans.filter((loan) => {
    const daysUntilDue = calculateDaysUntilDue(loan.dueDate);
    return daysUntilDue <= 3 && daysUntilDue > 0;
  }).length;

  // Find loans due within 3 days (used by both alerts and currently borrowed)
  const dueSoonLoans = activeLoans.filter((loan) => {
    const daysUntilDue = calculateDaysUntilDue(loan.dueDate);
    return daysUntilDue <= 3 && daysUntilDue >= 0;
  });

  if (isLoading) {
    return (
      <Screen>
        <View className="gap-4 pt-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </View>
      </Screen>
    );
  }

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(alertId));
  };

  return (
    <Screen refreshing={isRefreshing} onRefresh={refresh}>
      <View className="pt-10 mb-5 flex-row items-center justify-between">
        <View>
          <Text className="text-xs font-semibold tracking-[2px] text-primary-700 uppercase">{greeting}</Text>
          <Text className="text-2xl font-black text-ink mt-1">Hi, {user?.name?.split(" ")[0] ?? "Reader"}!</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/notifications")}
          className="w-11 h-11 rounded-full bg-white border border-border items-center justify-center"
          accessibilityLabel="Notifications"
        >
          <Bell size={20} stroke="#181713" />
          <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
        </TouchableOpacity>
      </View>

      <View className="rounded-[30px] bg-peach px-5 pt-5 pb-6 mb-5 overflow-hidden">
        <View className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-butter/70" />
        <View className="flex-row items-center mb-3">
          <View className="w-11 h-11 rounded-2xl bg-primary items-center justify-center"><Sparkles size={22} stroke="#FFFFFF" /></View>
          <View className="ml-3.5 flex-1">
            <Text className="text-lg font-black text-ink">Find your next book</Text>
            <Text className="text-[11px] font-medium text-ink-soft mt-0.5">Search our physical collection</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/(tabs)/library", params: { focus: "search" } })}
          className="h-14 rounded-2xl bg-white shadow-soft flex-row items-center px-4"
          accessibilityLabel="Search the library"
        >
          <Search size={20} stroke="#8A857C" />
          <Text className="text-[15px] font-medium text-ink-muted ml-3.5">Title, author, ISBN or category...</Text>
        </TouchableOpacity>
      </View>

      {/* Smart Alerts */}
      {overdueLoans.length > 0 && !dismissedAlerts.has("overdue") && (
        <SmartAlert
          type="overdue"
          title={`${overdueLoans.length} overdue book${overdueLoans.length > 1 ? "s" : ""}`}
          message="Please return them as soon as possible to avoid fines."
          actionLabel="View Overdue"
          onAction={() => router.push("/(tabs)/my-library")}
          onDismiss={() => handleDismissAlert("overdue")}
        />
      )}

      {dueSoonCount > 0 && !dismissedAlerts.has("due-soon") && (
        <SmartAlert
          type="due-soon"
          title={`${dueSoonCount} book${dueSoonCount > 1 ? "s" : ""} due soon`}
          message="Due within the next 3 days. Plan your returns."
          actionLabel="View Due Soon"
          onAction={() => router.push("/(tabs)/my-library")}
          onDismiss={() => handleDismissAlert("due-soon")}
        />
      )}

      <SectionTitle title="Browse by category" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 20 }}>
        {CATEGORIES.slice(1, 7).map((category, index) => (
          <TouchableOpacity
            key={category}
            onPress={() => router.push({ pathname: "/(tabs)/library", params: { category } })}
            className="px-4 py-3 rounded-2xl border border-border"
            style={{ backgroundColor: ["#EEF4C8", "#EEE2F5", "#FFE6D4", "#DDF3F7"][index % 4] }}
          ><Text className="text-xs font-bold text-ink-soft">{category}</Text></TouchableOpacity>
        ))}
      </ScrollView>

      <SectionTitle title="Currently borrowed" actionLabel="View all" onAction={() => router.push("/(tabs)/my-library")} />

      {activeLoans.length === 0 ? (
        <EmptyStateIllustration
          illustration="no-loans"
          title="No active loans"
          subtitle="You don't have any books checked out at the moment."
          actionLabel="Browse Library"
          onAction={() => router.push("/(tabs)/library")}
        />
      ) : (
        <View className="gap-3">
          {activeLoans.slice(0, 3).map((loan) => {
            const book = mockBooks.find((b) => b.id === loan.bookId);
            return (
              <LoanCard
                key={loan.id}
                loan={{
                  ...loan,
                  author: book?.authorName ?? "Unknown Author",
                  totalPages: book?.totalPages,
                  coverColor: book?.coverColor,
                }}
                onPress={() => router.push(`/loan/${loan.id}`)}
              />
            );
          })}
        </View>
      )}

      <View className="mt-7">
        <SectionTitle title="Recently added" actionLabel="See all" onAction={() => router.push("/(tabs)/library")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 12 }}>
          {mockBooks.slice(0, 4).map((book, index) => (
            <TouchableOpacity
              key={book.id}
              style={{ width: 130 }}
              onPress={() => router.push(`/book/${book.id}`)}
              className="rounded-2xl bg-white border border-border p-3"
            >
              <BookCover title={book.name} className="w-full aspect-[3/4] rounded-xl mb-3" fallbackColor={book.coverColor} />
              <Text className="text-sm font-bold text-ink" numberOfLines={2}>{book.name}</Text>
              <Text className="text-[11px] text-ink-soft mt-1" numberOfLines={1}>{book.authorName}</Text>
              <View className={`self-start mt-2 px-2 py-0.5 rounded-full ${book.availableCopies > 0 ? "bg-green-100" : "bg-red-100"}`}>
                <Text className={`text-[10px] font-bold ${book.availableCopies > 0 ? "text-green-700" : "text-red-600"}`}>
                  {book.availableCopies > 0 ? `${book.availableCopies} avail` : "None avail"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}
