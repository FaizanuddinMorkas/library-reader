import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import BookOpen from "lucide-react-native/icons/book-open";
import MapPin from "lucide-react-native/icons/map-pin";
import Tag from "lucide-react-native/icons/tag";
import Hash from "lucide-react-native/icons/hash";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import Users from "lucide-react-native/icons/users";
import Clock from "lucide-react-native/icons/clock";
import CheckCircle from "lucide-react-native/icons/circle-check-big";
import AlertCircle from "lucide-react-native/icons/circle-alert";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { mockBooks, mockLoans } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";
import { BookCover } from "@/components/library/BookCover";

const STATUS_CONFIG = {
  available: { label: "Available", color: "#059669", bg: "#D1FAE5" },
  "low-stock": { label: "Low Stock", color: "#D97706", bg: "#FEF3C7" },
  "out-of-stock": { label: "Out of Stock", color: "#DC2626", bg: "#FEE2E2" },
};

export default function BookDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = mockBooks.find((b) => b.id === id);

  if (!book) {
    return (
      <Screen scroll={false}>
        <View className="pt-10 mb-6 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 rounded-full bg-white border border-border items-center justify-center">
            <ArrowLeft size={20} stroke="#181713" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-ink ml-4">Book not found</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <BookOpen size={48} stroke="#8A857C" />
          <Text className="text-lg font-bold text-ink mt-4">Book not found</Text>
          <Text className="text-sm text-ink-muted text-center mt-2">
            This book may have been removed or the link is invalid.
          </Text>
        </View>
      </Screen>
    );
  }

  const statusInfo = STATUS_CONFIG[book.status];
  const readingTime = Math.ceil(book.totalPages / 50);

  return (
    <Screen scroll={false}>
      {/* Header */}
      <View className="pt-10 pb-4 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 rounded-full bg-white border border-border items-center justify-center">
          <ArrowLeft size={20} stroke="#181713" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-ink ml-4">Book Details</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="flex-row gap-4 mb-6">
          {/* Cover */}
          <BookCover title={book.name} className="w-28 h-40 rounded-2xl shadow-card" fallbackColor={book.coverColor} />

          {/* Title + Meta */}
          <View className="flex-1 justify-center">
            <Text className="text-lg font-black text-ink leading-tight">{book.name}</Text>
            <Text className="text-sm text-ink-soft mt-1.5">by {book.authorName}</Text>

            <View className="mt-3 self-start px-3 py-1 rounded-full" style={{ backgroundColor: statusInfo.bg }}>
              <Text className="text-xs font-bold" style={{ color: statusInfo.color }}>{statusInfo.label}</Text>
            </View>

            <View className="flex-row items-center gap-4 mt-4">
              <View className="items-center">
                <Text className="text-xl font-black text-ink">{book.availableCopies}</Text>
                <Text className="text-[10px] text-ink-soft">Available</Text>
              </View>
              <View className="w-px h-8 bg-border" />
              <View className="items-center">
                <Text className="text-xl font-black text-ink">{book.copies}</Text>
                <Text className="text-[10px] text-ink-soft">Total</Text>
              </View>
              <View className="w-px h-8 bg-border" />
              <View className="items-center">
                <Text className="text-xl font-black text-ink">{book.totalPages}</Text>
                <Text className="text-[10px] text-ink-soft">Pages</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Borrow / Reserve Actions */}
        <View className="flex-row gap-3 mb-6">
          <Button
            title={book.status === "out-of-stock" ? "Reserve Book" : "Borrow Book"}
            onPress={() => {}}
            className="flex-1"
            variant={book.status === "out-of-stock" ? "secondary" : "primary"}
          />
        </View>

        {/* Quick Meta Chips */}
        <View className="flex-row flex-wrap gap-2 mb-6">
          <View className="flex-row items-center gap-1.5 bg-white border border-border rounded-full px-3 py-2">
            <Tag size={13} stroke="#8A857C" />
            <Text className="text-xs font-medium text-ink">{book.category}</Text>
          </View>
          <View className="flex-row items-center gap-1.5 bg-white border border-border rounded-full px-3 py-2">
            <BookOpen size={13} stroke="#8A857C" />
            <Text className="text-xs font-medium text-ink">{readingTime}h read</Text>
          </View>
          <View className="flex-row items-center gap-1.5 bg-white border border-border rounded-full px-3 py-2">
            <MapPin size={13} stroke="#8A857C" />
            <Text className="text-xs font-medium text-ink">Shelf {book.shelfNumber}</Text>
          </View>
          {book.isbn && (
            <View className="flex-row items-center gap-1.5 bg-white border border-border rounded-full px-3 py-2">
              <Hash size={13} stroke="#8A857C" />
              <Text className="text-xs font-medium text-ink">ISBN {book.isbn}</Text>
            </View>
          )}
        </View>

        {/* Publisher */}
        <View className="rounded-[20px] bg-white border border-border p-4 mb-3">
          <Text className="text-[10px] text-ink-muted uppercase tracking-wider mb-1">Publisher</Text>
          <Text className="text-sm font-semibold text-ink">{book.publisher}</Text>
        </View>

        {/* Description */}
        {book.description ? (
          <View className="rounded-[20px] bg-white border border-border p-4 mb-3">
            <Text className="text-[10px] text-ink-muted uppercase tracking-wider mb-1.5">Description</Text>
            <Text className="text-sm text-ink-soft leading-5">{book.description}</Text>
          </View>
        ) : null}

        {/* Added date */}
        <View className="rounded-[20px] bg-muted-50 p-4">
          <Text className="text-xs text-ink-soft">Added to library on {formatDate(book.createdAt)}</Text>
        </View>

        {/* Lending History */}
        {(() => {
          const history = mockLoans.filter((l) => l.bookId === book.id);
          if (history.length === 0) return null;
          return (
            <View className="mt-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Users size={16} stroke="#8A857C" />
                <Text className="text-sm font-bold text-ink">Borrowing History</Text>
                <View className="ml-auto bg-primary-50 rounded-full px-2.5 py-0.5">
                  <Text className="text-xs font-bold text-primary">{history.length} times</Text>
                </View>
              </View>

              {history.map((loan) => {
                const isOverdue = loan.status === "overdue";
                const isReturned = loan.status === "returned";
                const statusIcon = isReturned ? (
                  <CheckCircle size={14} stroke="#059669" />
                ) : isOverdue ? (
                  <AlertCircle size={14} stroke="#DC2626" />
                ) : (
                  <Clock size={14} stroke="#2563EB" />
                );
                const statusLabel = isReturned ? "Returned" : isOverdue ? "Overdue" : "Active";
                const statusColor = isReturned ? "text-green-700" : isOverdue ? "text-red-600" : "text-blue-600";
                const rowBg = isOverdue ? "bg-red-50" : isReturned ? "bg-green-50" : "bg-blue-50";

                return (
                  <View key={loan.id} className={`rounded-[16px] p-3 mb-2 ${rowBg}`}>
                    <View className="flex-row items-center justify-between mb-1.5">
                      <View className="flex-row items-center gap-1.5">
                        {statusIcon}
                        <Text className={`text-xs font-bold ${statusColor}`}>{statusLabel}</Text>
                      </View>
                      <Text className="text-xs text-ink-soft">{formatDate(loan.issueDate)}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xs text-ink-soft flex-1">
                        Borrowed by {loan.readerName}
                      </Text>
                      {loan.returnDate && (
                        <Text className="text-xs text-ink-soft">
                          Returned {formatDate(loan.returnDate)}
                        </Text>
                      )}
                      {!loan.returnDate && loan.dueDate && (
                        <Text className="text-xs text-ink-soft">
                          Due {formatDate(loan.dueDate)}
                        </Text>
                      )}
                    </View>
                    {loan.fineAmount && loan.fineAmount > 0 && (
                      <View className="mt-1.5 bg-white/60 rounded-lg px-2 py-1 self-start">
                        <Text className="text-xs font-semibold text-red-600">
                          Fine: ₹{loan.fineAmount}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })()}
      </ScrollView>
    </Screen>
  );
}
