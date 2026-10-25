import type { BookReadingHistory, LendingRecord, ReadingProgressEntry } from "@/types/reader";
import { apiClient } from "./client";

export interface PaginatedLoans { data: LendingRecord[]; total: number; page: number; limit: number; }
export interface LoanSummary {
  activeLoanCount: number;
  overdueLoanCount: number;
  totalBorrowed: number;
  activeLoans: LendingRecord[];
  recentLoans: LendingRecord[];
}

export type ReaderLoanProgress =
  | { pagesReadFrom: number; pagesReadTo: number }
  | { pagesReadCount: number };

export interface ReaderLoanProgressResult extends LendingRecord {
  readingProgressEntry: ReadingProgressEntry;
  currentLendingPagesReadCount: number;
}

export const lendingApi = {
  list: async (params?: { tab?: "active" | "history"; page?: number; limit?: number }) =>
    (await apiClient.get<PaginatedLoans>("/reader/loans", { params })).data,
  getById: async (id: string) => (await apiClient.get<LendingRecord>(`/reader/loans/${encodeURIComponent(id)}`)).data,
  updateProgress: async (id: string, progress: ReaderLoanProgress) =>
    (await apiClient.post<ReaderLoanProgressResult>(`/reader/loans/${encodeURIComponent(id)}/reading-progress`, progress)).data,
  getBookReadingHistory: async (bookId: string, params?: { page?: number; limit?: number }) =>
    (await apiClient.get<BookReadingHistory>(`/reader/books/${encodeURIComponent(bookId)}/reading-history`, { params })).data,
  summary: async () => (await apiClient.get<LoanSummary>("/reader/loans/summary")).data,
};
