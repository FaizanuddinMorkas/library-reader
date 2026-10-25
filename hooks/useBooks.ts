import { useCallback, useEffect, useMemo, useState } from "react";
import { booksApi } from "@/lib/api/booksApi";
import { catalogApi } from "@/lib/api/catalogApi";
import type { Book } from "@/types/book";

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [categories, setCategories] = useState(["All"]);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [response, categoryResponse] = await Promise.all([
        booksApi.list({
          search: searchQuery || undefined,
          category: selectedCategory === "All" ? undefined : selectedCategory,
          limit: 100,
        }),
        catalogApi.categories(),
      ]);
      setBooks(response.data);
      setCategories(["All", ...categoryResponse.map((category) => category.name)]);
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error("Unable to load books"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleCategories = useMemo(
    () => categories.slice(1).sort(),
    [categories],
  );

  return {
    books,
    categories: ["All", ...visibleCategories],
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    isRefreshing,
    error,
    refresh: () => load(true),
  };
}
