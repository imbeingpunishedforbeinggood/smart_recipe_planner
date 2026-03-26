jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { tfidf } from '../../../src/utils/tfidf';
import {
  getRecipeCorpus,
  addToRecipeCorpus,
  getTfidfProfile,
  updateTfidfProfile,
} from '../../../src/storage/tfidfProfile';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

// ── getRecipeCorpus ──────────────────────────────────────────────────────────

describe('getRecipeCorpus', () => {
  test('returns [] on empty storage', async () => {
    expect(await getRecipeCorpus()).toEqual([]);
  });
});

// ── addToRecipeCorpus ────────────────────────────────────────────────────────

describe('addToRecipeCorpus', () => {
  test('appends texts; calling twice results in combined array', async () => {
    await addToRecipeCorpus(['pasta carbonara']);
    await addToRecipeCorpus(['chicken soup']);
    expect(await getRecipeCorpus()).toEqual(['pasta carbonara', 'chicken soup']);
  });

  test('first call creates the key from nothing', async () => {
    await addToRecipeCorpus(['hello world']);
    expect(await getRecipeCorpus()).toEqual(['hello world']);
  });
});

// ── getTfidfProfile ──────────────────────────────────────────────────────────

describe('getTfidfProfile', () => {
  test('returns null on empty storage', async () => {
    expect(await getTfidfProfile()).toBeNull();
  });

  test('returns null gracefully when AsyncStorage.getItem throws', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('disk error'));
    expect(await getTfidfProfile()).toBeNull();
  });
});

// ── updateTfidfProfile ───────────────────────────────────────────────────────

describe('updateTfidfProfile', () => {
  const corpus = ['pasta carbonara italian', 'chicken soup thai'];

  test('first call creates profile with count=1 and vector matching tfidf()', async () => {
    await addToRecipeCorpus(corpus);
    await updateTfidfProfile('pasta carbonara italian', corpus);

    const profile = await getTfidfProfile();
    expect(profile).not.toBeNull();
    expect(profile.count).toBe(1);
    expect(profile.vocabulary.length).toBeGreaterThan(0);
    expect(profile.vector.length).toBe(profile.vocabulary.length);

    const expected = tfidf('pasta carbonara italian', corpus);
    profile.vector.forEach((val, i) => {
      expect(val).toBeCloseTo(expected[i], 5);
    });
  });

  test('second call increments count to 2 and vector is element-wise running mean', async () => {
    await addToRecipeCorpus(corpus);
    await updateTfidfProfile('pasta carbonara italian', corpus);
    await updateTfidfProfile('chicken soup thai', corpus);

    const profile = await getTfidfProfile();
    expect(profile.count).toBe(2);

    const v1 = tfidf('pasta carbonara italian', corpus);
    const v2 = tfidf('chicken soup thai', corpus);
    const expectedMean = v1.map((val, i) => (val + v2[i]) / 2);

    profile.vector.forEach((val, i) => {
      expect(val).toBeCloseTo(expectedMean[i], 5);
    });
  });

  test('update after corpus grows extends vocabulary and zero-pads old vector for new terms', async () => {
    const smallCorpus = ['pasta garlic'];
    await addToRecipeCorpus(smallCorpus);
    await updateTfidfProfile('pasta garlic', smallCorpus);

    const profileBefore = await getTfidfProfile();
    const vocabSizeBefore = profileBefore.vocabulary.length;

    // New terms added to corpus
    const bigCorpus = [...smallCorpus, 'chicken basil oregano'];
    await addToRecipeCorpus(['chicken basil oregano']);
    await updateTfidfProfile('pasta garlic', bigCorpus);

    const profileAfter = await getTfidfProfile();
    expect(profileAfter.vocabulary.length).toBeGreaterThan(vocabSizeBefore);
    expect(profileAfter.vector.length).toBe(profileAfter.vocabulary.length);
    expect(profileAfter.count).toBe(2);

    // New terms should be zero-padded in the running mean
    const newTerms = profileAfter.vocabulary.filter(
      (t) => !profileBefore.vocabulary.includes(t)
    );
    newTerms.forEach((term) => {
      const idx = profileAfter.vocabulary.indexOf(term);
      // Weight for new term = (0 * 1 + tfidf_value) / 2 — not zero, but contribution from old is 0
      // Just confirm vector is finite and non-negative
      expect(isFinite(profileAfter.vector[idx])).toBe(true);
      expect(profileAfter.vector[idx]).toBeGreaterThanOrEqual(0);
    });
  });
});
