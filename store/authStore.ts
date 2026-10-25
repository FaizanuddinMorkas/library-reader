import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { User, UserRole } from "@/types/user";
import { authApi } from "@/lib/api/authApi";
import {
  AUTH_SESSION_KEY,
  clearTokens,
  setAuthExpiredHandler,
  setStoredAuthSession,
  type StoredAuthSession,
} from "@/lib/auth";
import { STORAGE_KEYS } from "@/lib/constants";

const LEGACY_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const isNative = Platform.OS === "ios" || Platform.OS === "android";
const USER_ROLES: UserRole[] = ["super_admin", "library_admin", "branch_admin", "reader"];

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setHasHydrated: (value: boolean) => void;
}

function mapAuthUser(authUser: Awaited<ReturnType<typeof authApi.login>>["user"]): User {
  if (!USER_ROLES.includes(authUser.role as UserRole)) {
    throw new Error("This account cannot access the Reader app");
  }
  if (authUser.status !== "active") {
    throw new Error("This account is inactive");
  }

  return {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    role: authUser.role as UserRole,
    libraryId: authUser.libraryId,
    branchId: authUser.branchId,
    createdAt: new Date().toISOString(),
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  hasHydrated: false,

  setHasHydrated: (value) => set({ hasHydrated: value }),

  login: async (email, password) => {
    const response = await authApi.login({ email: email.trim(), password });
    const user = mapAuthUser(response.user);

    if (isNative) {
      const session: StoredAuthSession = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user,
        savedAt: Date.now(),
      };
      await setStoredAuthSession(session);
    }

    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      if (isNative) await authApi.logout();
    } finally {
      if (isNative) await clearTokens();
      set({ user: null, isAuthenticated: false });
    }
  },

  refreshUser: async () => {
    if (!isNative) return;
    const user = await authApi.me();
    set({ user: mapAuthUser(user), isAuthenticated: true });
  },
}));

setAuthExpiredHandler(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

export async function hydrateAuthStore(): Promise<void> {
  try {
    if (!isNative) {
      useAuthStore.setState({ hasHydrated: true });
      return;
    }

    const rawSession = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
    if (rawSession) {
      const session = JSON.parse(rawSession) as StoredAuthSession;
      const isValid = Boolean(session.accessToken && session.user && session.savedAt);
      const isExpired = Date.now() - session.savedAt > LEGACY_SESSION_MAX_AGE_MS;
      if (isValid && !isExpired) {
        useAuthStore.setState({ user: session.user, isAuthenticated: true, hasHydrated: true });
        return;
      }
      await clearTokens();
      useAuthStore.setState({ hasHydrated: true });
      return;
    }

    const legacyAccessToken = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    const legacyUserJson = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
    const legacyRefreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    if (legacyAccessToken && legacyUserJson) {
      const user = JSON.parse(legacyUserJson) as User;
      await setStoredAuthSession({
        accessToken: legacyAccessToken,
        refreshToken: legacyRefreshToken,
        user,
        savedAt: Date.now(),
      });
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
      ]);
      useAuthStore.setState({ user, isAuthenticated: true, hasHydrated: true });
      return;
    }

    await clearTokens();
    useAuthStore.setState({ hasHydrated: true });
  } catch (error) {
    console.warn("Failed to hydrate auth store:", error);
    useAuthStore.setState({ user: null, isAuthenticated: false, hasHydrated: true });
  }
}
