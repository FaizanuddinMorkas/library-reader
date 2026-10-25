import { apiClient } from "./client";
import type { ReaderRegistrationValues, ReaderType } from "../readerRegistration";

export interface ReaderRegistrationBranch {
  branchId: string;
  branchName: string;
  city?: string;
  libraryId: string;
  libraryName: string;
}

export interface ReaderRegistrationResponse {
  registrationId: string;
  status: "pending";
  message: string;
}

export const readerRegistrationApi = {
  getBranches: async () => (await apiClient.get<ReaderRegistrationBranch[]>("/auth/reader-registration/branches")).data,
  register: async (payload: ReaderRegistrationValues) =>
    (await apiClient.post<ReaderRegistrationResponse>("/auth/register-reader", payload)).data,
};

export type { ReaderType };
