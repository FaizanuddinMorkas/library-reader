import { API_CONFIG } from "./constants";
import { getAuthToken, setAuthToken, setRefreshToken, clearTokens } from "./auth";

/**
 * Minimal HTTP client for the LibraryOS backend API.
 * Uses fetch (built into React Native) instead of axios to reduce bundle size.
 */

interface RequestOptions extends RequestInit {
  timeout?: number;
}

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  ok: boolean;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { timeout = this.timeout, ...fetchOptions } = options;
    const token = await getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers as Record<string, string> || {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Handle 401 — token expired
        if (response.status === 401) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry with new token
            return this.request<T>(endpoint, options);
          }
          // Logout on failed refresh
          await clearTokens();
        }

        throw new ApiError(
          data?.message || `Request failed with status ${response.status}`,
          response.status,
          data
        );
      }

      return { data: data as T, status: response.status, ok: true };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) throw error;

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError("Request timed out", 408);
      }

      throw new ApiError(
        error instanceof Error ? error.message : "Network error",
        0
      );
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.token) await setAuthToken(data.token);
      if (data.refreshToken) await setRefreshToken(data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Singleton API client instance
export const api = new ApiClient(API_CONFIG.baseURL, API_CONFIG.timeout);

// ──── API Functions ────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    readerId: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  readerId: string;
  libraryId: string;
  branchId: string;
  phone?: string;
  address?: string;
}

export interface LendingRecord {
  id: string;
  readerId: string;
  readerName: string;
  bookId: string;
  bookTitle: string;
  bookBarcode: string;
  copyId: string;
  copyBarcode: string;
  branchId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  currentPage?: number;
}

export interface EBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  coverUrl?: string;
  accessType: "free" | "members-only";
  totalPages?: number;
  description?: string;
}

// Auth API
export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>("/auth/login", payload),

  me: () => api.get<UserProfile>("/auth/me"),

  refreshToken: (refreshToken: string) =>
    api.post<{ token: string }>("/auth/refresh", { refreshToken }),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }),
};

// Library API
export const libraryApi = {
  getEBooks: (params?: { category?: string; search?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "All") query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    const qs = query.toString();
    return api.get<{ ebooks: EBook[]; total: number }>(`/library/ebooks${qs ? `?${qs}` : ""}`);
  },

  getEBookById: (id: string) =>
    api.get<EBook>(`/library/ebooks/${id}`),

  getLendingRecords: (readerId: string) =>
    api.get<{ records: LendingRecord[] }>(`/library/lending?readerId=${readerId}`),

  updateReadingProgress: (lendingId: string, page: number) =>
    api.patch(`/library/lending/${lendingId}/progress`, { currentPage: page }),
};
