# Quickstart: Recipe Match Score

**Branch**: `002-recipe-match-score` | **Date**: 2026-03-25

A developer guide for building and manually verifying the match score feature.

---

## Prerequisites

- Existing project setup complete (Expo, `CLAUDE_API_KEY` in `.env`)
- App running via `npx expo start` + Expo Go
- No additional API keys or packages required — this feature is fully local

---

## Files to Create

```
src/utils/cosineSimilarity.js
src/utils/tfidf.js
src/storage/tfidfProfile.js
```

## Files to Modify

```
src/components/RecipeCard.js      (add matchScore prop + badge)
src/screens/RecipeStackScreen.js  (score batch on load, update profile on right-swipe)
```

`src/services/claudeService.js` is **not modified**.

---

## Implementation Order

Work in this order to keep the app functional at every step:

1. **`cosineSimilarity.js`** — pure function, no dependencies; write unit tests first
2. **`tfidf.js`** — pure functions (`buildVocabulary`, `tfidf`); write unit tests alongside; verify against the algorithm contract in `contracts/tfidf-algorithm.md`
3. **`tfidfProfile.js`** — storage module; write unit tests alongside; test vocabulary alignment with mock AsyncStorage
4. **`RecipeCard.js`** — add `matchScore` prop and badge; test locally with a hardcoded `matchScore={72}` prop to confirm rendering before wiring
5. **`RecipeStackScreen.js`** — wire everything together; test end-to-end

---

## Manual Testing Scenarios

### Scenario A: New user — no scores shown

1. Clear AsyncStorage: in the Debug Storage dialog, confirm `@srp/tfidf_profile` and `@srp/recipe_corpus` are absent.
2. Load a batch of recipes.
3. **Expected**: No "% match" badge on any card.

### Scenario B: First like — scores appear on next batch

1. Start from Scenario A (no profile).
2. Swipe right on one recipe.
3. Swipe through the remaining cards to trigger `onBatchComplete`.
4. **Expected**: New batch loads with a "% match" badge on every card.
5. Open Debug Storage and confirm `@srp/tfidf_profile` is set with `count === 1` and `vocabulary` is a non-empty array.

### Scenario C: Profile reflects taste preferences

1. Swipe right on 5 Italian recipes across multiple batches (all with tags like `italian`, `pasta`, `carbonara`).
2. Load a new batch that contains an Italian recipe and an unrelated recipe (e.g., Thai stir-fry).
3. **Expected**: The Italian recipe scores noticeably higher than the Thai recipe.

### Scenario D: Graceful degradation (corrupt profile)

1. Manually set `@srp/tfidf_profile` to invalid JSON via the debug console.
2. Restart and load a batch.
3. **Expected**: Cards load normally with no match score badges; no crash.

---

## Running Unit Tests

```bash
npm test -- tests/unit/utils/cosineSimilarity.test.js
npm test -- tests/unit/utils/tfidf.test.js
npm test -- tests/unit/storage/tfidfProfile.test.js
```

### Key test cases for `cosineSimilarity`

| Input | Expected output |
|---|---|
| Identical vectors | `1.0` |
| Opposite vectors | `-1.0` |
| Orthogonal vectors | `0.0` |
| One zero vector | `0.0` (edge case) |
| Different-length vectors | Throws `Error('Vector length mismatch')` |

### Key test cases for `tfidf`

| Input | Expected behaviour |
|---|---|
| Single-document corpus (the text itself) | IDF = `log(2/2) + 1 = 1.0` for all present terms; vector is non-zero |
| Term appears in all corpus docs | IDF is low (close to 1.0); term is down-weighted |
| Term unique to one doc in large corpus | IDF is high; term is up-weighted |
| Empty corpus | Returns `[]` |
| Text with no valid tokens | Returns zero vector |
| Two identical texts, same corpus | Returns identical vectors |
| `buildVocabulary(["a b", "b c"])` | `["a", "b", "c"]` (sorted, deduplicated) |

### Key test cases for `tfidfProfile`

| Scenario | Expected |
|---|---|
| `getTfidfProfile()` on empty storage | `null` |
| `getRecipeCorpus()` on empty storage | `[]` |
| `addToRecipeCorpus(["text1", "text2"])` twice | Corpus has 4 entries |
| `updateTfidfProfile(text, corpus)` on empty profile | Stores `{ vector, vocabulary, count: 1 }` |
| `updateTfidfProfile` called twice | `count === 2`; vector is running mean |
| Update after corpus grows (new terms) | New vocabulary is longer; old vector zero-padded for new terms |
| AsyncStorage read failure in `getTfidfProfile` | Returns `null` gracefully |

---

## Debug Storage Extension

The existing Debug Storage dialog shows `tag_profile` and `seen_list`. Add `tfidf_profile` during development:

```javascript
const tfidfRaw = await AsyncStorage.getItem('@srp/tfidf_profile');
const profile = JSON.parse(tfidfRaw ?? 'null');
// In the Alert body:
`tfidf_profile: count=${profile?.count ?? 'none'}, vocab_size=${profile?.vocabulary?.length ?? 0}`
```

This lets you confirm the profile is being written and the vocabulary is growing, without logging the full vector.
