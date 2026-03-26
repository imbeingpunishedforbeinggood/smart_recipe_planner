import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@srp/seen_list';

/**
 * Returns the full array of recipe IDs the user has already seen.
 * Falls back to [] if storage is empty or unreadable.
 *
 * @returns {Promise<string[]>}
 */
export async function getSeenIds() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    console.warn('[seenList] Failed to read seen list, falling back to []');
    return [];
  }
}

/**
 * Merges newIds into the persisted seen list.
 * Deduplicates using a Set so the list never grows with duplicates.
 *
 * @param {string[]} newIds
 */
export async function addSeenIds(newIds) {
  const current = await getSeenIds();
  const updated = [...new Set([...current, ...newIds])];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
