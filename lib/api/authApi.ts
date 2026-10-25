import { apiClient } from "./client";

export interface LoginPayload { email: string; password: string; }

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  libraryId?: string;
  branchId?: string;
  status: "active" | "inactive";
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (payload: LoginPayload) => (await apiClient.post<LoginResponse>("/auth/login", payload)).data,
  me: async () => (await apiClient.get<{ user: AuthUser }>("/auth/me")).data.user,
  logout: async () => {
    const { getRefreshToken } = await import("@/lib/auth");
    await apiClient.post("/auth/logout", { refreshToken: await getRefreshToken() });
  },
  forgotPassword: async (email: string) => { await apiClient.post("/auth/forgot-password", { email }); },
  resetPassword: async (token: string, password: string) => { await apiClient.post("/auth/reset-password", { token, password }); },
  changePassword: async (currentPassword: string, password: string) => {
    await apiClient.post("/auth/change-password", { currentPassword, password });
  },
};
