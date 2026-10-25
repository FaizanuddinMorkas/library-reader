import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { lendingApi } from "@/lib/api/lendingApi";
import type { LendingRecord } from "@/types/reader";

export function useLending() {
  const [loans, setLoans] = useState<LendingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [active, history] = await Promise.all([
        lendingApi.list({ tab: "active", limit: 100 }),
        lendingApi.list({ tab: "history", limit: 100 }),
      ]);
      setLoans([...active.data, ...history.data]);
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error("Unable to load loans"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  const activeLoans = loans.filter((loan) => loan.status === "checked-out");
  const overdueLoans = loans.filter((loan) => loan.status === "overdue");
  const returnedLoans = loans.filter((loan) => loan.status === "returned");

  return {
    loans,
    activeLoans,
    overdueLoans,
    returnedLoans,
    isLoading,
    isRefreshing,
    error,
    refresh: () => load(true),
  };
}
