import { Platform } from "react-native";

// API Configuration
export const API_CONFIG = {
  // Use the same backend as the web frontend
  baseURL: Platform.select({
    android: "http://10.0.2.2:4000/api",   // Android emulator localhost
    ios: "http://localhost:4000/api",       // iOS simulator localhost
    web: "http://localhost:4000/api",       // Web browser
    default: "http://localhost:4000/api",
  }),
  timeout: 15000,
  retryAttempts: 3,
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
  categories: [
    "All",
    "Self-Help",
    "Finance",
    "Psychology",
    "History",
    "Fiction",
    "Science",
    "Technology",
  ],
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
