import type { Book, BookCopy } from "@/types/book";
import { apiClient } from "./client";
import { normalizeBarcode } from "@/lib/validation";

export interface PaginatedBooks { data: Book[]; total: number; page: number; limit: number; }

export const booksApi = {
  list: async (params?: { search?: string; category?: string; page?: number; limit?: number }) =>
    (await apiClient.get<PaginatedBooks>("/reader/books", { params })).data,
  getById: async (id: string) => (await apiClient.get<Book>(`/reader/books/${encodeURIComponent(id)}`)).data,
  getByBarcode: async (barcode: string): Promise<Book & { matchedCopy?: BookCopy }> => {
    const normalized = normalizeBarcode(barcode);
    if (!normalized) throw new Error("Invalid barcode");
    return (await apiClient.get<Book & { matchedCopy?: BookCopy }>(
      `/reader/books/by-barcode/${encodeURIComponent(normalized)}`,
    )).data;
  },
};
