import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_CONFIG } from "@/lib/constants";
import { clearTokens, getAuthToken, getRefreshToken, notifyAuthExpired, setAuthToken } from "@/lib/auth";
import { toApiError } from "./apiErrors";

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const SENSITIVE_KEYS = /password|token|authorization|cookie|secret/i;

function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (typeof value === "string") {
    return value.replace(/([?&](?:token|access_token|refresh_token)=)[^&\s]+/gi, "$1[REDACTED]");
  }
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      SENSITIVE_KEYS.test(key) ? "[REDACTED]" : redactSensitive(entry),
    ]),
  );
}

function logApiRequest(config: InternalAxiosRequestConfig) {
  if (!API_CONFIG.enableApiLogs) return;
  console.log("[API request]", {
    method: config.method?.toUpperCase(),
    url: `${config.baseURL ?? ""}${config.url ?? ""}`,
    params: redactSensitive(config.params ?? null),
    request: redactSensitive(config.data ?? null),
  });
}

function logApiResponse(response: { config: InternalAxiosRequestConfig; status: number; data: unknown }) {
  if (!API_CONFIG.enableApiLogs) return;
  console.log("[API response]", {
    method: response.config.method?.toUpperCase(),
    url: `${response.config.baseURL ?? ""}${response.config.url ?? ""}`,
    status: response.status,
    response: redactSensitive(response.data),
  });
}

function logApiError(error: AxiosError) {
  if (!API_CONFIG.enableApiLogs) return;
  const config = error.config;
  console.log("[API response error]", {
    method: config?.method?.toUpperCase(),
    url: `${config?.baseURL ?? ""}${config?.url ?? ""}`,
    status: error.response?.status ?? null,
    response: redactSensitive(error.response?.data ?? null),
    error: error.message,
  });
}

export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  logApiRequest(config);
  return config;
});

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await clearTokens();
    notifyAuthExpired();
    return null;
  }

  try {
    if (API_CONFIG.enableApiLogs) {
      console.log("[API request]", {
        method: "POST",
        url: `${API_CONFIG.baseURL}/auth/refresh`,
        request: { refreshToken: "[REDACTED]" },
      });
    }
    const response = await axios.post<{ accessToken: string }>(
      `${API_CONFIG.baseURL}/auth/refresh`,
      { refreshToken },
      { timeout: API_CONFIG.timeout },
    );
    logApiResponse(response);
    await setAuthToken(response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    if (axios.isAxiosError(error)) logApiError(error);
    await clearTokens();
    notifyAuthExpired();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => {
    logApiResponse(response);
    return response;
  },
  async (error: AxiosError) => {
    logApiError(error);
    const config = error.config as RetryableConfig | undefined;
    if (error.response?.status !== 401 || !config) {
      return Promise.reject(toApiError(error));
    }
    if (config._retry) {
      await clearTokens();
      notifyAuthExpired();
      return Promise.reject(toApiError(error));
    }

    config._retry = true;
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const token = await refreshPromise;
    if (!token) return Promise.reject(toApiError(error));

    config.headers.Authorization = `Bearer ${token}`;
    return apiClient(config);
  },
);
