import Constants from 'expo-constants';

const BASE_URL = 'https://api.unsplash.com';

function getAccessKey() {
  const key = Constants.expoConfig?.extra?.unsplashAccessKey;
  if (!key) {
    throw new Error('UNSPLASH_ACCESS_KEY is not set in app.config.js extra');
  }
  return key;
}

/**
 * Fetches a single dish image URL from Unsplash for the given search query.
 * Returns null on any failure so the caller can render a placeholder.
 *
 * @param {string} query - From recipe.imageSearchQuery
 * @returns {Promise<string|null>}
 */
export async function fetchDishImage(query) {
  try {
    const accessKey = getAccessKey();
    const url =
      `${BASE_URL}/search/photos` +
      `?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.results?.[0]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetches dish images for all recipes in a batch simultaneously.
 * Uses Promise.allSettled so one failure never blocks the rest.
 *
 * @param {Array<{ imageSearchQuery: string }>} recipes
 * @returns {Promise<(string|null)[]>} Same order as input; null where fetch failed
 */
export async function fetchBatchImages(recipes) {
  const results = await Promise.allSettled(
    recipes.map((r) => fetchDishImage(r.imageSearchQuery))
  );
  return results.map((r) => (r.status === 'fulfilled' ? r.value : null));
}
