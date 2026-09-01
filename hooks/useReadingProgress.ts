import { useEffect, useCallback } from "react";
import { useReadingProgressStore } from "@/store/readingProgressStore";

export function useReadingProgress(bookId?: string) {
  const progress = useReadingProgressStore((state) => state.progress);
  const hasHydrated = useReadingProgressStore((state) => state.hasHydrated);
  const hydrate = useReadingProgressStore((state) => state.hydrate);
  const persistProgress = useReadingProgressStore((state) => state.saveProgress);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const saveProgress = useCallback(
    async (page: number, totalPages: number) => {
      if (!bookId) return;

      await persistProgress(bookId, page, totalPages);
    },
    [bookId, persistProgress]
  );

  const getBookProgress = useCallback(
    (id: string) => {
      return progress[id] || null;
    },
    [progress]
  );

  const getLastReadBook = useCallback(() => {
    const entries = Object.entries(progress);
    if (entries.length === 0) return null;

    return entries.reduce((latest, [id, data]) => {
      if (!latest || new Date(data.lastRead) > new Date(latest.lastRead)) {
        return { bookId: id, ...data };
      }
      return latest;
    }, null as { bookId: string; page: number; lastRead: string; totalPages: number } | null);
  }, [progress]);

  // Get current book's page if bookId is provided
  const currentPage = bookId ? progress[bookId]?.page ?? 1 : 1;

  return {
    currentPage,
    isLoading: !hasHydrated,
    saveProgress,
    getBookProgress,
    getLastReadBook,
    allProgress: progress,
  };
}
