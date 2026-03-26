# Data Model: Smart Recipe Planner

**Feature**: 001-recipe-swipe-stack
**Date**: 2026-03-24

---

## Entities

### Recipe

The canonical unit of AI-generated content. Returned by Claude as part of a batch.

| Field              | Type             | Constraints                                        |
|--------------------|------------------|----------------------------------------------------|
| `id`               | string           | Kebab-case slug derived from name; unique within app lifetime |
| `name`             | string           | Non-empty; max 80 chars                            |
| `description`      | string           | 1–3 sentences; non-empty                          |
| `tags`             | string[]         | Min 1 tag; each tag lowercase, max 30 chars        |
| `estimatedTime`    | string           | Human-readable, e.g. "25 minutes", "1 hour"       |
| `servings`         | number           | Integer ≥ 1                                        |
| `ingredients`      | Ingredient[]     | Min 1 item                                         |
| `steps`            | string[]         | Ordered; min 1 step; each step non-empty           |
| `imageSearchQuery` | string           | 2–5 words; optimised for photo search              |

**Ingredient** (nested):

| Field      | Type   | Constraints               |
|------------|--------|---------------------------|
| `item`     | string | Non-empty                 |
| `quantity` | string | Non-empty, e.g. "2 cups"  |

**ID derivation rule**: `id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')`
Example: "Spicy Thai Basil Chicken" → `"spicy-thai-basil-chicken"`

---

### RecipeCard

A Recipe paired with its resolved dish image URL. Used exclusively for rendering in the
swipe stack. Never persisted — reconstructed each session.

| Field      | Type           | Constraints                                           |
|------------|----------------|-------------------------------------------------------|
| `recipe`   | Recipe         | Required; full Recipe object                          |
| `imageUrl` | string \| null | HTTPS URL from Unsplash, or null if fetch failed      |

---

### RecipeBatch

An ordered set of exactly 5 RecipeCards, rendered as the swipe stack.

| Field   | Type         | Constraints              |
|---------|--------------|--------------------------|
| `cards` | RecipeCard[] | Length exactly 5         |
| `index` | number       | Current top card (0–4); 0 = front |

---

### TagPreferenceProfile

Persisted on-device. Maps tag strings to cumulative swipe-weight scores.

| Field  | Type   | Constraints                                       |
|--------|--------|---------------------------------------------------|
| key    | string | Tag name (same casing as Recipe.tags)             |
| value  | number | Integer; positive = liked, negative = disliked, 0/absent = neutral |

**Storage key**: `@srp/tag_profile` (AsyncStorage)
**Initial state**: `{}` (empty object — neutral for all tags)

**Update rule**:
- Right swipe on a recipe: for each tag in recipe.tags → `profile[tag] += 1`
- Left swipe on a recipe: for each tag in recipe.tags → `profile[tag] -= 1`

**Serialisation**: JSON string written to AsyncStorage after every swipe.

---

### SeenList

Persisted on-device. Tracks every recipe ID ever shown to prevent duplicates.

| Field | Type     | Constraints                       |
|-------|----------|-----------------------------------|
| ids   | string[] | Unique recipe IDs (kebab slugs)   |

**Storage key**: `@srp/seen_list` (AsyncStorage)
**Initial state**: `[]`

**Update rule**: All 5 recipe IDs from a freshly fetched batch are appended to the list
immediately when the batch is first displayed (before any swiping), preventing re-fetch
of the same recipes even if the user force-quits mid-batch.

**Deduplication**: The `addSeenIds` function uses a `Set` merge to prevent duplicate entries.

---

## State Transitions

### RecipeStackScreen state machine

```
IDLE
  │ (user confirms photo on CameraScreen)
  ▼
LOADING_BATCH
  │ (Claude responds + Unsplash images fetched)          (network error)
  ▼                                                            ▼
SHOWING_BATCH ──────── (swipe card) ──► [index advances]   ERROR_STATE
  │ (last card swiped, index === 5)                            │ (user taps retry)
  ▼                                                            │
LOADING_BATCH ◄─────────────────────────────────────────────-─┘
```

### TagPreferenceProfile update (per swipe)

```
current profile (object)
  + recipe.tags
  + swipe direction
  ──────────────────► updated profile (object) → written to AsyncStorage
```

---

## Context Shape (AppContext)

In-session React Context — not persisted.

```js
{
  photoUri: string | null,          // URI of the current ingredient photo (display)
  photoBase64: string | null,       // base64 data of current photo (sent to Claude)
  currentBatch: RecipeBatch | null, // active swipe stack
  status: 'idle' | 'loading' | 'showing' | 'error',
  errorMessage: string | null,
  tagProfile: object,               // loaded from AsyncStorage on app start; kept in sync
}
```

---

## Validation Rules Summary

| Entity             | Where validated              | On failure              |
|--------------------|------------------------------|-------------------------|
| Recipe (Claude response) | `schemas/recipe.js` validator called in `claudeService.js` | Throw typed `RecipeSchemaError`; treat as fetch error → retry logic |
| TagPreferenceProfile | `storage/tagProfile.js` `getTagProfile()` | Fall back to `{}` on parse error; log warning |
| SeenList           | `storage/seenList.js` `getSeenIds()` | Fall back to `[]` on parse error; log warning |
| Unsplash image URL | `unsplashService.js` response check | Return `null`; RecipeCard renders placeholder |
