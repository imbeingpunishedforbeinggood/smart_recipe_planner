# Data Model: Recipe Match Score

**Branch**: `002-recipe-match-score` | **Date**: 2026-03-25

---

## Entities

### 1. TfidfProfile

Represents the user's aggregated taste preference as a TF-IDF vector in a stored vocabulary space.

**Storage**: AsyncStorage key `@srp/tfidf_profile`
**Module**: `src/storage/tfidfProfile.js`

| Field | Type | Description |
|---|---|---|
| `vector` | `number[]` | Element-wise running mean of all liked recipe TF-IDF vectors, aligned to `vocabulary` |
| `vocabulary` | `string[]` | Sorted token list defining the index space of `vector`; stored to enable alignment of future vectors |
| `count` | `number` | Total number of liked recipes that have contributed to the mean |

**Lifecycle**:
- Created on first right-swipe after app install
- Updated (running mean + vocabulary expansion) on every subsequent right-swipe
- Read once per batch load to compute match scores
- Persists indefinitely; reset to `null` only if the user clears app data

**Null state**: The key is absent from AsyncStorage when the user has no swipe history. `getTfidfProfile()` returns `null` in this case.

**Invariants**:
- `vector.length === vocabulary.length` always
- `vocabulary` is sorted lexicographically and contains no duplicates
- `count >= 1` whenever a profile exists
- All elements of `vector` are finite numbers

---

### 2. RecipeCorpus

The full list of recipe texts the user has been shown. Used to compute IDF values when vectorizing new recipes.

**Storage**: AsyncStorage key `@srp/recipe_corpus`
**Module**: `src/storage/tfidfProfile.js`

| Field | Type | Description |
|---|---|---|
| *(array of strings)* | `string[]` | One entry per recipe text in format `"{name}. {description}. Tags: {tags}"` |

**Lifecycle**:
- Created (empty) on first batch load
- 5 new texts appended on every batch load, before match scores are computed
- Never removed from (append-only); reset to `[]` only if user clears app data

**Size estimate**: ~150 chars/recipe × 1000 recipes (heavy user) ≈ 150 KB — well within AsyncStorage limits.

---

### 3. RecipeCard (extended)

Extends the existing in-memory card shape used by `RecipeStackScreen` and `SwipeStack`.

**Lives in**: `currentBatch.cards[]` (AppContext state, populated by `RecipeStackScreen.loadBatch`)

| Field | Type | Description | Source |
|---|---|---|---|
| `recipe` | `Recipe` | Full recipe object (existing) | Claude API |
| `imageUrl` | `string \| null` | Dish photo URL (existing) | Unsplash API |
| `matchScore` | `number \| null` | Match percentage 0–100, or `null` if no taste profile | Computed on-device |

**`matchScore` values**:
- `null` — user has no swipe history, or scoring threw an error (graceful degradation)
- `0`–`100` — whole-number percentage; badge rendered in warm accent color

---

### 4. AsyncStorage Key Registry (updated)

| Key | Module | Shape | Notes |
|---|---|---|---|
| `@srp/seen_list` | `storage/seenList.js` | `string[]` | Recipe ID deduplication (existing) |
| `@srp/tag_profile` | `storage/tagProfile.js` | `Record<string, number>` | Tag weight scores (existing) |
| `@srp/recipe_corpus` | `storage/tfidfProfile.js` | `string[]` | **NEW** — all seen recipe texts for IDF computation |
| `@srp/tfidf_profile` | `storage/tfidfProfile.js` | `{ vector: number[], vocabulary: string[], count: number } \| null` | **NEW** — taste profile vector |

---

## State Transitions

### TfidfProfile + RecipeCorpus lifecycle

```
loadBatch() called
   │
   ├─ addToRecipeCorpus([...5 texts])   ← corpus grows every batch
   │
   └─ getTfidfProfile() → null (no likes yet)?
        └─ matchScore = null for all 5 cards

───

Right-swipe on a recipe
   │
   ├─ getRecipeCorpus() → currentCorpus
   │
   └─ updateTfidfProfile(likedText, currentCorpus)
        │
        ├─ no profile yet:
        │    vocabulary = buildVocabulary(currentCorpus)
        │    vector     = tfidf(likedText, currentCorpus)
        │    store { vector, vocabulary, count: 1 }
        │
        └─ profile exists:
             newVocabulary  = buildVocabulary(currentCorpus)
             newVector      = tfidf(likedText, currentCorpus)
             alignedOld     = zero-pad profile.vector to newVocabulary
             newMean        = running mean(alignedOld, newVector, profile.count)
             store { vector: newMean, vocabulary: newVocabulary, count: count+1 }
```

### matchScore per card (per batch load)

```
getTfidfProfile() → profile

if profile is null:
  matchScore = null for all 5 cards

else:
  for each recipe in batch (synchronous):
    liveVector  = tfidf(recipeText, currentCorpus)
    liveVocab   = buildVocabulary(currentCorpus)
    projected   = project liveVector onto profile.vocabulary
    cosine      = cosineSimilarity(projected, profile.vector)
    matchScore  = Math.max(0, Math.round(cosine * 100))
```

---

## Validation Rules

### TfidfProfile (checked in `updateTfidfProfile`)

- `likedText` must be a non-empty string
- `currentCorpus` must be a non-empty array (at minimum, the liked recipe should be in it)
- After update: `vector.length === vocabulary.length` — enforced by construction
- After update: `count >= 1` — enforced by construction

### RecipeCard.matchScore (computed in `RecipeStackScreen`)

- Clamped to `[0, 100]` via `Math.max(0, Math.round(cosine * 100))`
- `null` on any error in the scoring path (never surfaces error to user)

### Algorithm versioning

If `tfidf-algorithm.md` contract version bumps (tokenizer or IDF formula change):
- Stored `@srp/tfidf_profile` and `@srp/recipe_corpus` are incompatible with the new algorithm
- Both keys must be cleared; users will lose their taste profile and see no scores until they swipe right again
