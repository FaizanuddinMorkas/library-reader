import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Book from "lucide-react-native/icons/book";
import Search from "lucide-react-native/icons/search";
import SlidersHorizontal from "lucide-react-native/icons/sliders-horizontal";
import { AppHeader } from "@/components/layout/AppHeader";
import { Screen } from "@/components/ui/Screen";
import { Chip } from "@/components/ui/Chip";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { BookCard } from "@/components/library/BookCard";
import { CATEGORIES, mockBooks } from "@/lib/mockData";

export default function LibraryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ focus?: string; category?: string }>();
  const searchRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const [isRefreshing] = useState(false);

  useEffect(() => {
    if (params.category) setSelectedCategory(params.category);
    if (params.focus === "search") setTimeout(() => searchRef.current?.focus(), 150);
  }, [params.category, params.focus]);

  // Filter books by search and category
  const filteredBooks = mockBooks.filter((book) => {
    const matchesSearch =
      !searchQuery ||
      book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.isbn && book.isbn.includes(searchQuery));
    const matchesCategory =
      !selectedCategory || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <Screen scroll={false}>
        <AppHeader title="Catalog" subtitle="Loading..." />
        <View className="flex-row flex-wrap gap-3 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={{ width: "47%" }}>
              <CardSkeleton />
            </View>
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader
        title="Catalog"
        subtitle={`${mockBooks.length} books in collection`}
      />

      <View className="mb-4 h-14 rounded-2xl bg-white border border-border flex-row items-center px-4">
        <Search size={20} stroke="#8A857C" />
        <TextInput
          ref={searchRef}
          placeholder="Title, author or ISBN..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8A857C"
          className="flex-1 ml-3 text-base text-ink"
        />
        <View className="w-9 h-9 rounded-xl bg-primary-50 items-center justify-center">
          <SlidersHorizontal size={17} stroke="#EA580C" />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-5"
        contentContainerStyle={{ gap: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        <Chip
          label="All"
          active={!selectedCategory}
          onPress={() => setSelectedCategory(null)}
        />
        {CATEGORIES.slice(1).map((category) => (
          <Chip
            key={category}
            label={category}
            active={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
          />
        ))}
      </ScrollView>

      {filteredBooks.length === 0 ? (
        <View className="items-center py-16">
          <Book size={38} stroke="#EA580C" />
          <Text className="text-lg font-bold text-ink mt-4">No books found</Text>
          <Text className="text-sm text-ink-muted mt-1">
            Try another title, author, or category.
          </Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {filteredBooks.map((book) => (
            <View key={book.id} style={{ width: "48%" }}>
              <BookCard book={book} onPress={() => router.push(`/book/${book.id}`)} />
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
