import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildVocabulary, tfidf } from '../utils/tfidf';

const CORPUS_KEY = '@srp/recipe_corpus';
const PROFILE_KEY = '@srp/tfidf_profile';

/**
 * Returns all recipe texts seen so far (used as IDF corpus).
 * Falls back to [] if storage is empty or unreadable.
 *
 * @returns {Promise<string[]>}
 */
export async function getRecipeCorpus() {
  try {
    const raw = await AsyncStorage.getItem(CORPUS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    console.warn('[tfidfProfile] Failed to read recipe corpus, falling back to []');
    return [];
  }
}

/**
 * Appends new recipe texts to the stored corpus.
 *
 * @param {string[]} texts
 * @returns {Promise<void>}
 */
export async function addToRecipeCorpus(texts) {
  const current = await getRecipeCorpus();
  await AsyncStorage.setItem(CORPUS_KEY, JSON.stringify([...current, ...texts]));
}

/**
 * Returns the stored TF-IDF taste profile, or null if no recipes have been liked.
 * Falls back to null on any read or parse error.
 *
 * @returns {Promise<{vector: number[], vocabulary: string[], count: number}|null>}
 */
export async function getTfidfProfile() {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    console.warn('[tfidfProfile] Failed to read TF-IDF profile, falling back to null');
    return null;
  }
}

/**
 * Updates the TF-IDF taste profile with a newly liked recipe.
 * On first call: creates the profile with count=1.
 * On subsequent calls: aligns the old vector to the new vocabulary (zero-padding
 * for new terms) and updates the element-wise running mean.
 *
 * @param {string} likedText      - Text of the liked recipe (from buildRecipeText)
 * @param {string[]} currentCorpus - Current full corpus (from getRecipeCorpus)
 * @returns {Promise<void>}
 */
export async function updateTfidfProfile(likedText, currentCorpus) {
  const newVocab = buildVocabulary(currentCorpus);
  const newVector = tfidf(likedText, currentCorpus);

  const existing = await getTfidfProfile();

  let updatedVector;
  if (existing === null) {
    updatedVector = newVector;
  } else {
    const { vector: oldVector, vocabulary: oldVocab, count } = existing;
    // Align old vector to new vocabulary, zero-padding for new terms
    const alignedOld = newVocab.map((term) => {
      const idx = oldVocab.indexOf(term);
      return idx !== -1 ? oldVector[idx] : 0;
    });
    // Element-wise running mean
    updatedVector = alignedOld.map((old, i) => (old * count + newVector[i]) / (count + 1));
  }

  const count = existing === null ? 1 : existing.count + 1;
  await AsyncStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({ vector: updatedVector, vocabulary: newVocab, count }),
  );
}
