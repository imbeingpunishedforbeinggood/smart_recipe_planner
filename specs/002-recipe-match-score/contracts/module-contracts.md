# Contract: New & Modified Module Interfaces

**Version**: 2.0.0
**Date**: 2026-03-25
**Branch**: `002-recipe-match-score`

---

## `src/utils/cosineSimilarity.js`

New file. Pure utility — no imports, no side effects, no async.

### `cosineSimilarity(a, b)`

```
cosineSimilarity(a: number[], b: number[]): number
```

| | |
|---|---|
| **Parameters** | `a`, `b` — two equal-length arrays of finite numbers |
| **Returns** | Cosine similarity in `[-1, 1]` |
| **Throws** | `Error('Vector length mismatch')` if `a.length !== b.length` |
| **Edge case** | If either vector's norm is zero, returns `0` (avoid division by zero) |
| **Pure** | Yes — same inputs always produce same output; no globals or I/O |

**Caller responsibility**: Convert to display percentage as `Math.max(0, Math.round(result * 100))`.

---

## `src/utils/tfidf.js`

New file. Pure utilities — no imports, no side effects, no async.

### `buildVocabulary(corpus)`

```
buildVocabulary(corpus: string[]): string[]
```

| | |
|---|---|
| **Parameters** | `corpus` — array of recipe text strings |
| **Returns** | Sorted array of unique tokens across all documents |
| **Edge case** | Empty corpus returns `[]` |
| **Pure** | Yes |

### `tfidf(text, corpus)`

```
tfidf(text: string, corpus: string[]): number[]
```

| | |
|---|---|
| **Parameters** | `text` — recipe text to vectorize; `corpus` — all recipe texts seen so far (defines vocabulary and IDF weights) |
| **Returns** | Dense TF-IDF vector, length = `buildVocabulary(corpus).length`, indexed by that vocabulary |
| **Edge case** | Empty corpus → returns `[]`; text with no valid tokens → returns zero vector |
| **Pure** | Yes |
| **Algorithm** | See `contracts/tfidf-algorithm.md` for tokenization rules, IDF formula, and constants |

---

## `src/storage/tfidfProfile.js`

New file. Manages both the recipe corpus and the taste profile vector. Follows the established `tagProfile.js` / `seenList.js` module pattern.

### `getRecipeCorpus()`

```
getRecipeCorpus(): Promise<string[]>
```

| | |
|---|---|
| **Returns** | Array of all seen recipe texts, or `[]` if none stored |
| **On error** | Returns `[]` (logs warning); never throws |
| **Storage key** | `@srp/recipe_corpus` |

### `addToRecipeCorpus(texts)`

```
addToRecipeCorpus(texts: string[]): Promise<void>
```

| | |
|---|---|
| **Parameters** | `texts` — recipe text strings from the current batch |
| **Effect** | Appends to stored corpus; creates key if absent |
| **Storage key** | `@srp/recipe_corpus` |

### `getTfidfProfile()`

```
getTfidfProfile(): Promise<{ vector: number[], vocabulary: string[], count: number } | null>
```

| | |
|---|---|
| **Returns** | Stored profile, or `null` if no recipes have been liked yet |
| **On error** | Returns `null` (logs warning); never throws |
| **Storage key** | `@srp/tfidf_profile` |

### `updateTfidfProfile(likedText, currentCorpus)`

```
updateTfidfProfile(likedText: string, currentCorpus: string[]): Promise<void>
```

| | |
|---|---|
| **Parameters** | `likedText` — recipe text for the newly liked recipe; `currentCorpus` — current full corpus (from `getRecipeCorpus()`) |
| **Effect** | Computes TF-IDF vector for `likedText`, aligns it to the current vocabulary, updates running mean, stores result |
| **First call** | Creates `{ vector, vocabulary, count: 1 }` |
| **Subsequent calls** | Aligns old vector to new vocabulary (zero-pads for new terms), updates element-wise running mean, increments count |
| **Storage key** | `@srp/tfidf_profile` |

---

## `src/components/RecipeCard.js` (prop addition)

### New prop: `matchScore`

```
matchScore: number | null   (optional, default: null)
```

| Value | Rendered output |
|---|---|
| `null` / `undefined` | No badge rendered (new-user state, or scoring failure) |
| `0`–`100` | Badge reading `"{matchScore}% match"` in warm accent color (`#F97316`), positioned absolute top-right of the card image |

No existing props are changed. `RecipeCard` is backwards-compatible — omitting `matchScore` is equivalent to passing `null`.

---

## `src/screens/RecipeStackScreen.js` (behaviour additions)

### `loadBatch` changes

After fetching recipes and images, additionally:

1. Calls `getRecipeCorpus()` — load current corpus
2. Calls `addToRecipeCorpus(5 recipe texts)` — record these recipes as seen
3. Calls `getTfidfProfile()` — if `null`, skips steps 4–5
4. For each recipe (synchronous loop): `tfidf(text, corpus)` → project to profile vocabulary → `cosineSimilarity` → `matchScore`
5. Attaches `matchScore` (integer 0–100 or `null`) to each card object

If any error is thrown in steps 1–5, all cards receive `matchScore = null` (single `try/catch`).

### `onSwipe` changes

On `direction === 'right'`, additionally:

1. Calls `getRecipeCorpus()` — load current corpus
2. Calls `updateTfidfProfile(buildRecipeText(card.recipe), corpus)` — failure is silent (logged, not surfaced to user)

### `buildRecipeText(recipe)` (new private helper)

```
buildRecipeText(recipe: Recipe): string
```

Returns `"{recipe.name}. {recipe.description}. Tags: {recipe.tags.join(', ')}"`.
Not exported — internal to `RecipeStackScreen.js`.

---

## `src/services/claudeService.js`

**Unchanged.** No additions or modifications in this feature.
