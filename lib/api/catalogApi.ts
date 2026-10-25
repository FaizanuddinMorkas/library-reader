import type { EBook } from "@/types/book";
import { apiClient } from "./client";
import type { PaginatedBooks } from "./booksApi";

export interface ReaderCategory {
  id: string;
  name: string;
  description: string;
  scope: "global" | "library" | "branch";
  status: "active" | "inactive";
}

export interface PaginatedEBooks {
  data: EBook[];
  total: number;
  page: number;
  limit: number;
}

export const catalogApi = {
  categories: async () => (await apiClient.get<ReaderCategory[]>("/reader/categories")).data,
  ebooks: async (params?: { search?: string; category?: string; page?: number; limit?: number }) =>
    (await apiClient.get<PaginatedEBooks>("/reader/ebooks", { params })).data,
  ebook: async (id: string) => (await apiClient.get<EBook>(`/reader/ebooks/${encodeURIComponent(id)}`)).data,
};

export type ReaderBooksResponse = PaginatedBooks;
