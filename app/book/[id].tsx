import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import BookOpen from "lucide-react-native/icons/book-open";
import MapPin from "lucide-react-native/icons/map-pin";
import Tag from "lucide-react-native/icons/tag";
import Hash from "lucide-react-native/icons/hash";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { useBook } from "@/hooks/useBook";
import { formatDate } from "@/lib/utils";
import { BookCover } from "@/components/library/BookCover";
import { borrowRequestsApi } from "@/lib/api/borrowRequestsApi";

const STATUS_CONFIG = {
  available: { label: "Available", color: "#059669", bg: "#D1FAE5" },
  "low-stock": { label: "Low Stock", color: "#D97706", bg: "#FEF3C7" },
  "out-of-stock": { label: "Out of Stock", color: "#DC2626", bg: "#FEE2E2" },
};

export default function BookDetailScreen() {
  const router = useRouter();
  const { id, copyBarcode } = useLocalSearchParams<{ id: string; copyBarcode?: string }>();
  const { book, isLoading } = useBook(id);
  const [requestState, setRequestState] = useState<"idle" | "submitting" | "pending" | "error">("idle");
  const [requestMessage, setRequestMessage] = useState<string>();

  const requestBorrow = async () => {
    if (!copyBarcode) {
      router.push("/scan");
      return;
    }
    setRequestState("submitting");
    setRequestMessage(undefined);
    try {
      const request = await borrowRequestsApi.create(copyBarcode);
      setRequestState("pending");
      setRequestMessage(`Request sent. Please visit the desk within 1 hour (until ${new Date(request.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}).`);
    } catch (error) {
      setRequestState("error");
      setRequestMessage(error instanceof Error ? error.message : "Unable to send borrow request");
    }
  };

  if (isLoading) {
    return <Screen scroll={false}><View className="flex-1 items-center justify-center"><Text className="text-sm text-ink-muted">Loading book details...</Text></View></Screen>;
  }

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
          <BookCover title={book.name} className="w-28 h-40 rounded-2xl shadow-card" fallbackColor={book.coverColor} coverUrl={book.coverUrl} />

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
            title={requestState === "pending" ? "Request pending at library desk" : copyBarcode ? "Request to borrow" : "Scan copy QR to borrow"}
            onPress={() => { void requestBorrow(); }}
            className="flex-1"
            loading={requestState === "submitting"}
            disabled={requestState === "pending" || book.status === "out-of-stock"}
            variant={book.status === "out-of-stock" ? "secondary" : "primary"}
          />
        </View>
        {requestMessage ? <Text className={`text-sm mb-5 ${requestState === "error" ? "text-danger-600" : "text-success-700"}`}>{requestMessage}</Text> : null}

        {/* Quick Meta Chips */}
        <View className="flex-row flex-wrap gap-2 mb-6">
          <View className="flex-row items-center gap-1.5 bg-white border border-border rounded-full px-3 py-2">
            <Tag size={13} stroke="#8A857C" />
            <Text className="text-xs font-medium text-ink">{book.category}</Text>
          </View>
          {book.volumeNo ? (
            <View className="flex-row items-center gap-1.5 bg-white border border-border rounded-full px-3 py-2">
              <BookOpen size={13} stroke="#8A857C" />
              <Text className="text-xs font-medium text-ink">Volume {book.volumeNo}</Text>
            </View>
          ) : null}
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

        {book.volumes && book.volumes.length > 1 ? (
          <View className="rounded-[20px] bg-white border border-border p-4 mb-3">
            <Text className="text-[10px] text-ink-muted uppercase tracking-wider mb-2">Other volumes in this branch</Text>
            {book.volumes.filter((volume) => volume.id !== book.id).map((volume) => (
              <TouchableOpacity
                key={volume.id}
                onPress={() => router.push(`/book/${volume.id}` as never)}
                className="flex-row items-center justify-between border-t border-border py-3"
              >
                <View>
                  <Text className="text-sm font-semibold text-ink">Volume {volume.volumeNo ?? "—"}</Text>
                  <Text className="text-xs text-ink-muted mt-1">Shelf {volume.shelfNumber} · {volume.availableCopies} of {volume.copies} available</Text>
                </View>
                <Text className="text-xs font-bold text-ink-soft">View</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Added date */}
        <View className="rounded-[20px] bg-muted-50 p-4">
          <Text className="text-xs text-ink-soft">Added to library on {formatDate(book.createdAt)}</Text>
        </View>

      </ScrollView>
    </Screen>
  );
}
