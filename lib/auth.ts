import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "./constants";

/**
 * Token management utilities using expo-secure-store.
 * Handles storing, retrieving, and clearing auth tokens securely.
 */

export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.warn("Failed to save auth token:", error);
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  } catch {
    return null;
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
  } catch (error) {
    console.warn("Failed to save refresh token:", error);
  }
}

export async function clearTokens(): Promise<void> {
  try {
    await Promise.all([
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
