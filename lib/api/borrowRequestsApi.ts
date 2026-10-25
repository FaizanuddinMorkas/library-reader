import type { BorrowRequest } from "@/types/reader";
import { apiClient } from "./client";

export const borrowRequestsApi = {
  list: async () => (await apiClient.get<BorrowRequest[]>("/reader/borrow-requests")).data,
  create: async (copyBarcode: string) => (await apiClient.post<BorrowRequest>("/reader/borrow-requests", { copyBarcode })).data,
  cancel: async (id: string) => (await apiClient.patch<BorrowRequest>(`/reader/borrow-requests/${encodeURIComponent(id)}/cancel`)).data,
};
