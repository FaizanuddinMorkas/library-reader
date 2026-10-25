import { useCallback, useEffect, useState } from "react";
import { lendingApi, type ReaderLoanProgress } from "@/lib/api/lendingApi";
import type { BookReadingHistory, LendingRecord } from "@/types/reader";

export function useLoan(id?: string) {
  const [loan, setLoan] = useState<LendingRecord | null>(null);
  const [loadedLoanId, setLoadedLoanId] = useState<string | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [readingHistory, setReadingHistory] = useState<BookReadingHistory | null>(null);
  const [historyError, setHistoryError] = useState<Error | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [isLoadingMoreHistory, setIsLoadingMoreHistory] = useState(false);

  const saveProgress = useCallback(async (progress: ReaderLoanProgress) => {
    if (!id) throw new Error("Loan not found");
    const updated = await lendingApi.updateProgress(id, progress);
    setLoan((current) => current ? {
      ...current,
      currentLendingPagesReadCount: updated.currentLendingPagesReadCount,
    } : updated);
    try {
      const refreshedHistory = await lendingApi.getBookReadingHistory(updated.bookId);
      setReadingHistory((current) => current ? {
        ...refreshedHistory,
        data: [...refreshedHistory.data, ...current.data.filter((entry) => !refreshedHistory.data.some((fresh) => fresh.id === entry.id))],
      } : refreshedHistory);
      setHistoryError(null);
    } catch (cause) {
      setHistoryError(cause instanceof Error ? cause : new Error("Unable to refresh reading history"));
    }
    return updated;
  }, [id]);

  const loadMoreHistory = useCallback(async () => {
    if (!loan || !readingHistory || isLoadingMoreHistory || readingHistory.data.length >= readingHistory.total) return;
    setIsLoadingMoreHistory(true);
    try {
      const nextPage = historyPage + 1;
      const next = await lendingApi.getBookReadingHistory(loan.bookId, { page: nextPage, limit: readingHistory.limit });
      setHistoryPage(nextPage);
      setReadingHistory((current) => current ? {
        ...next,
        data: [...current.data, ...next.data.filter((entry) => !current.data.some((loaded) => loaded.id === entry.id))],
      } : next);
      setHistoryError(null);
    } catch (cause) {
      setHistoryError(cause instanceof Error ? cause : new Error("Unable to load more reading history"));
    } finally {
      setIsLoadingMoreHistory(false);
    }
  }, [historyPage, isLoadingMoreHistory, loan, readingHistory]);

  useEffect(() => {
    let active = true;
    if (!id) return;

    void lendingApi.getById(id)
      .then(async (record) => {
        if (!active) return;
        setError(null);
        setReadingHistory(null);
        setHistoryError(null);
        setHistoryPage(1);
        setLoan(record);
        try {
          const history = await lendingApi.getBookReadingHistory(record.bookId);
          if (active) {
            setReadingHistory(history);
            setHistoryPage(1);
          }
        } catch (cause) {
          if (active) setHistoryError(cause instanceof Error ? cause : new Error("Unable to load reading history"));
        }
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause : new Error("Unable to load loan"));
      })
      .finally(() => {
        if (active) setLoadedLoanId(id);
      });

    return () => { active = false; };
  }, [id]);

  const isLoading = Boolean(id && loadedLoanId !== id);
  const currentLoan = loan?.id === id ? loan : null;
  return { loan: currentLoan, book: currentLoan?.book ?? null, readingHistory, historyError, isLoadingMoreHistory, loadMoreHistory, isLoading, error, saveProgress };
}
