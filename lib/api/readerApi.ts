import type { Reader } from "@/types/reader";
import { apiClient } from "./client";

export interface ReaderProfile extends Reader { id: string; branchName: string; libraryName: string; }

export const readerApi = {
  me: async () => (await apiClient.get("/reader/me")).data,
  profile: async () => (await apiClient.get<ReaderProfile>("/reader/profile")).data,
  cardUrl: () => `${apiClient.defaults.baseURL}/reader/card`,
};
