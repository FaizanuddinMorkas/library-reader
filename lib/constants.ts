const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "") || "https://libraryapi.ditest.in/api";

// API Configuration
export const API_CONFIG = {
  baseURL: apiBaseUrl,
  timeout: 15000,
  retryAttempts: 3,
  enableApiLogs: __DEV__,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "auth_user",
  READING_PROGRESS: "reading_progress",
  THEME: "app_theme",
  LANGUAGE: "app_language",
} as const;

// App Constants
export const APP_CONFIG = {
  name: "LibraryOS Reader",
  version: "1.0.0",
  finePerDay: 10, // ₹10 per day overdue
  maxLoanDays: 14,
  maxActiveLoans: 5,
  donationPresets: [100, 250, 500, 1000],
} as const;

// Routes
export const ROUTES = {
  AUTH_LOGIN: "/(auth)/login",
  AUTH_FORGOT_PASSWORD: "/(auth)/forgot-password",
  AUTH_RESET_PASSWORD: "/(auth)/reset-password",
  TABS_HOME: "/(tabs)",
  TABS_LIBRARY: "/(tabs)/library",
  TABS_SCAN: "/(tabs)/scan",
  TABS_DONATE: "/(tabs)/donate",
  TABS_PROFILE: "/(tabs)/profile",
  EBOOK_READER: "/ebook/",
} as const;
