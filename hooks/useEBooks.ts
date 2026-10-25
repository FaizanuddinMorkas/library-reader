import { useCallback, useEffect, useMemo, useState } from "react";
import { catalogApi, type ReaderCategory } from "@/lib/api/catalogApi";
import type { EBook } from "@/types/book";

export function useEBooks() {
  const [ebooks, setEbooks] = useState<EBook[]>([]);
  const [categories, setCategories] = useState<ReaderCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const load = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const [ebookResponse, categoryResponse] = await Promise.all([
        catalogApi.ebooks({
          search: searchQuery || undefined,
          category: selectedCategory === "All" ? undefined : selectedCategory,
          limit: 100,
        }),
        catalogApi.categories(),
      ]);
      setEbooks(ebookResponse.data);
      setCategories(categoryResponse);
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error("Unable to load e-books"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = () => load(true);
  const filteredEbooks = useMemo(() => ebooks, [ebooks]);

  return {
    ebooks: filteredEbooks,
    allEbooks: ebooks,
    categories: ["All", ...categories.map((category) => category.name)],
    isLoading,
    isRefreshing,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    refresh,
  };
}
