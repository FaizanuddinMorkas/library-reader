import { TouchableOpacity, View, Text } from "react-native";
import type { Book } from "@/types/book";
import { BookCover } from "@/components/library/BookCover";

interface BookCardProps {
  book: Book;
  onPress?: () => void;
}

export function BookCard({ book, onPress }: BookCardProps) {
  const availabilityColor =
    book.availableCopies === 0
      ? "bg-red-100"
      : book.availableCopies === 1
      ? "bg-amber-100"
      : "bg-green-100";

  const availabilityText =
    book.availableCopies === 0
      ? "Out of stock"
      : book.availableCopies === 1
      ? "Last copy"
      : `${book.availableCopies} available`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      className="rounded-2xl bg-white border border-border p-3"
    >
      <BookCover title={book.name} className="w-full aspect-[3/4] rounded-xl mb-3" fallbackColor={book.coverColor} />

      {/* Title */}
      <Text className="text-sm font-bold text-ink" numberOfLines={2}>
        {book.name}
      </Text>

      {/* Author */}
      <Text className="text-[11px] text-ink-soft mt-1" numberOfLines={1}>
        {book.authorName}
      </Text>

      {/* Availability badge */}
      <View className={`self-start mt-2 px-2 py-0.5 rounded-full ${availabilityColor}`}>
        <Text className={`text-[10px] font-bold ${book.availableCopies === 0 ? "text-red-600" : "text-green-700"}`}>
          {availabilityText}
        </Text>
      </View>

      {/* Shelf location */}
      <Text className="text-[10px] text-ink-muted mt-2">Shelf: {book.shelfNumber}</Text>
    </TouchableOpacity>
  );
}
