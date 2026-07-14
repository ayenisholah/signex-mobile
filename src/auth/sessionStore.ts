import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

export { isSessionInvalidatingCode } from "./sessionPolicy";

const REFRESH_TOKEN_KEY = "signex.auth.refresh-token.v1";
const DEVICE_ID_KEY = "signex.auth.device-id.v1";
const INSTALLATION_ID_KEY = "signex.device.installation-id.v1";

export interface StoredSession {
  readonly refreshToken: string;
  readonly deviceId: string;
}

export interface SessionStore {
  read(): Promise<StoredSession | null>;
  write(session: StoredSession): Promise<void>;
  clear(): Promise<void>;
  installationId(): Promise<string>;
}

export const secureSessionStore: SessionStore = {
  async read() {
    const [refreshToken, deviceId] = await Promise.all([
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.getItemAsync(DEVICE_ID_KEY),
    ]);
    if (refreshToken === null || deviceId === null) return null;
    return { refreshToken, deviceId };
  },
  async write(session) {
    // Write the device binding first. A refresh token is never retained without it.
    await SecureStore.setItemAsync(DEVICE_ID_KEY, session.deviceId, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (error) {
      await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
      throw error;
    }
  },
  async clear() {
    await Promise.allSettled([
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(DEVICE_ID_KEY),
    ]);
  },
  async installationId() {
    const existing = await SecureStore.getItemAsync(INSTALLATION_ID_KEY);
    if (existing !== null) return existing;
    const bytes = await Crypto.getRandomBytesAsync(32);
    const generated = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    await SecureStore.setItemAsync(INSTALLATION_ID_KEY, generated, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return generated;
  },
};
