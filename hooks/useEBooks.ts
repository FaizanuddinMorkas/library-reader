import { useMemo, useState } from "react";
import { mockEbooks, CATEGORIES } from "@/lib/mockData";

export function useEBooks() {
  const ebooks = mockEbooks;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const refresh = async () => {
    setIsRefreshing(true);
    await Promise.resolve();
    setIsRefreshing(false);
  };

  const filteredEbooks = useMemo(() => {
    return ebooks.filter((ebook) => {
      const matchesSearch =
        searchQuery === "" ||
        ebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ebook.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || ebook.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [ebooks, searchQuery, selectedCategory]);

  return {
    ebooks: filteredEbooks,
    allEbooks: ebooks,
    categories: CATEGORIES,
    isLoading: false,
    isRefreshing,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    refresh,
  };
}
