import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@srp/tag_profile';

/**
 * Returns the tag preference weight map.
 * Falls back to {} if storage is empty or unreadable.
 *
 * @returns {Promise<Record<string, number>>}
 */
export async function getTagProfile() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    console.warn('[tagProfile] Failed to read tag profile, falling back to {}');
    return {};
  }
}

/**
 * Increments or decrements each tag's score based on swipe direction,
 * then persists the updated profile.
 *
 * @param {string[]} tags    - Tags from the swiped recipe
 * @param {'right'|'left'} direction
 */
export async function updateTagProfile(tags, direction) {
  const profile = await getTagProfile();
  const delta = direction === 'right' ? 1 : -1;
  tags.forEach((tag) => {
    profile[tag] = (profile[tag] ?? 0) + delta;
  });
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}
