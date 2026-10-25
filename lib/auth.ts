import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "./constants";
import type { User } from "@/types/user";

export const AUTH_SESSION_KEY = "auth_session";

export interface StoredAuthSession {
  accessToken: string;
  refreshToken: string | null;
  user: User;
  savedAt: number;
}

export async function getStoredAuthSession(): Promise<StoredAuthSession | null> {
  try {
    const rawSession = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
    if (!rawSession) return null;

    const session = JSON.parse(rawSession) as StoredAuthSession;
    if (!session.accessToken || !session.user || !session.savedAt) return null;
    return session;
  } catch {
    return null;
  }
}

export async function setStoredAuthSession(session: StoredAuthSession): Promise<void> {
  await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function getAuthToken(): Promise<string | null> {
  const session = await getStoredAuthSession();
  if (session?.accessToken) return session.accessToken;

  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  const session = await getStoredAuthSession();
  if (session) {
    await setStoredAuthSession({ ...session, accessToken: token });
    return;
  }

  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.warn("Failed to save auth token:", error);
  }
}

export async function getRefreshToken(): Promise<string | null> {
  const session = await getStoredAuthSession();
  if (session?.refreshToken) return session.refreshToken;

  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  } catch {
    return null;
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  const session = await getStoredAuthSession();
  if (session) {
    await setStoredAuthSession({ ...session, refreshToken: token });
    return;
  }

  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
  } catch (error) {
    console.warn("Failed to save refresh token:", error);
  }
}

let authExpiredHandler: (() => void) | null = null;

export function setAuthExpiredHandler(handler: () => void): void {
  authExpiredHandler = handler;
}

export function notifyAuthExpired(): void {
  authExpiredHandler?.();
}

export async function clearTokens(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(AUTH_SESSION_KEY),
      SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
    ]);
  } catch (error) {
    console.warn("Failed to clear tokens:", error);
  }
}

export async function hasValidToken(): Promise<boolean> {
  const token = await getAuthToken();
  return token !== null && token.length > 0;
}
