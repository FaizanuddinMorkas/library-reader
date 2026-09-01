import { useState } from "react";
import { mockLoans } from "@/lib/mockData";

export function useLending() {
  const loans = mockLoans;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    await Promise.resolve();
    setIsRefreshing(false);
  };

  const activeLoans = loans.filter((l) => l.status === "checked-out");
  const overdueLoans = loans.filter((l) => l.status === "overdue");
  const returnedLoans = loans.filter((l) => l.status === "returned");

  return {
    loans,
    activeLoans,
    overdueLoans,
    returnedLoans,
    isLoading: false,
    isRefreshing,
    refresh,
  };
}
