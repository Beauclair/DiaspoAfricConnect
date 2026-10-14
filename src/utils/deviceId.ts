import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@device_id';

/**
 * Returns a stable device identifier persisted in AsyncStorage.
 * Used to dedup anonymous profile views (users who are not signed in).
 */
let cachedId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedId) return cachedId;

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedId = stored;
      return stored;
    }

    // Generate a random 32-char hex string
    const id = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');

    await AsyncStorage.setItem(STORAGE_KEY, id);
    cachedId = id;
    return id;
  } catch {
    // Fallback: return a non-persisted random ID
    const fallback = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');
    return fallback;
  }
}
