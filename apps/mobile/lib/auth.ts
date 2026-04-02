import * as SecureStore from "expo-secure-store";
import type { TokenCache } from "@clerk/clerk-expo";

/**
 * Clerk token cache implementation using expo-secure-store.
 * Stores auth tokens securely on device (Keychain on iOS, EncryptedSharedPreferences on Android).
 */
export const tokenCache: TokenCache = {
  async getToken(key: string): Promise<string | undefined | null> {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item;
    } catch {
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },

  async saveToken(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail — token won't persist across restarts but app still works
    }
  },

  async clearToken(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Silently fail
    }
  },
};
