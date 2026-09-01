import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { User } from "@/types/user";
import { mockUser } from "@/lib/mockUser";

// Single key for all auth data — one SecureStore read instead of two
const SESSION_KEY = "auth_session";
// Legacy keys to clean up during migration
const LEGACY_TOKEN_KEY = "auth_token";
const LEGACY_USER_KEY = "auth_user";

/** Sessions expire after 24 hours */
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const HYDRATION_TIMEOUT_MS = 3000;
let hydrationPromise: Promise<void> | null = null;

interface StoredSession {
  token: string;
  user: User;
  /** Timestamp (ms) when the session was saved */
  savedAt: number;
}

const isNative = Platform.OS === "ios" || Platform.OS === "android";

// On web, we don't have SecureStore, so mark as hydrated immediately
const initialHasHydrated = !isNative;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  hasHydrated: initialHasHydrated,

  setHasHydrated: (value: boolean) => set({ hasHydrated: value }),

  login: async (email: string, _password: string) => {
    // Mock login - always succeeds with mockUser
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (isNative) {
      const session: StoredSession = {
        token: "mock_token_" + Date.now(),
        user: mockUser,
        savedAt: Date.now(),
      };
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    }

    set({ user: mockUser, isAuthenticated: true });
  },

  logout: async () => {
    if (isNative) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    }
    set({ user: null, isAuthenticated: false });
  },
}));

/**
 * Hydrate auth store from SecureStore on app startup.
 * Called once from the root layout useEffect. A slow native storage call must
 * not prevent the app from reaching its login route.
 */
export async function hydrateAuthStore() {
  if (hydrationPromise) return hydrationPromise;

  let didTimeout = false;

  hydrationPromise = (async () => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      await Promise.race([
        restoreSession(() => didTimeout),
        new Promise<void>((resolve) =>
          (timeoutId = setTimeout(() => {
            didTimeout = true;
            resolve();
          }, HYDRATION_TIMEOUT_MS))
        ),
      ]);
    } catch (error) {
      if (__DEV__) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Auth hydration failed: ${message}`);
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      useAuthStore.setState({ hasHydrated: true });
      hydrationPromise = null;
    }
  })();

  return hydrationPromise;
}

async function restoreSession(isTimedOut: () => boolean) {
  if (!isNative) return;

  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (isTimedOut()) return;

  if (!raw) {
    const migratedSession = await migrateFromLegacyKeys(isTimedOut);
    if (migratedSession && !isTimedOut()) {
      useAuthStore.setState({ user: migratedSession.user, isAuthenticated: true });
    }
    return;
  }

  const session: StoredSession = JSON.parse(raw);

  if (Date.now() - session.savedAt > SESSION_MAX_AGE_MS) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return;
  }

  useAuthStore.setState({ user: session.user, isAuthenticated: true });
}

/**
 * Migrate from the old two-key format (auth_token + auth_user)
 * to the new single-blob format (auth_session).
 * Only reads/writes if the legacy keys exist and the new key doesn't.
 */
async function migrateFromLegacyKeys(
  isTimedOut: () => boolean
): Promise<StoredSession | null> {
  try {
    const token = await SecureStore.getItemAsync(LEGACY_TOKEN_KEY);
    if (!token || isTimedOut()) return null;

    const userStr = await SecureStore.getItemAsync(LEGACY_USER_KEY);
    if (userStr && !isTimedOut()) {
      const session: StoredSession = {
        token,
        user: JSON.parse(userStr) as User,
        savedAt: Date.now(), // Treat migrated sessions as fresh
      };
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
      await SecureStore.deleteItemAsync(LEGACY_TOKEN_KEY);
      await SecureStore.deleteItemAsync(LEGACY_USER_KEY);
      return session;
    }

    await SecureStore.deleteItemAsync(LEGACY_TOKEN_KEY);
    await SecureStore.deleteItemAsync(LEGACY_USER_KEY);
  } catch {
    return null;
  }

  return null;
}
