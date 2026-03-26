# Implementation Plan: Recipe Match Score

**Branch**: `002-recipe-match-score` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-recipe-match-score/spec.md`

## Summary

Add a match percentage badge to each recipe card that expresses how closely the recipe aligns with the user's taste preferences. On right-swipe, compute a local TF-IDF vector for the liked recipe and update a persisted taste profile (element-wise running mean of all liked vectors, stored alongside a vocabulary index). When a new batch of 5 recipes loads, compute TF-IDF vectors for each recipe against the stored corpus, project them into the profile's vocabulary space, compute cosine similarity on-device, and display the result as "X% match" on each card. New users see no badge. The entire feature is offline-capable — no external API calls are made.

## Technical Context

**Language/Version**: JavaScript (ES2022+), JSDoc annotations
**Primary Dependencies**: `@react-native-async-storage/async-storage 2.2.0` (existing), React Native Reanimated ~4.1.1 (existing) — no new packages
**Storage**: AsyncStorage — two new keys: `@srp/recipe_corpus` (`string[]`, all seen recipe texts) and `@srp/tfidf_profile` (`{ vector: number[], vocabulary: string[], count: number }`)
**Testing**: Jest (existing project test runner)
**Target Platform**: iOS and Android via Expo Managed Workflow (Expo SDK ~54)
**Project Type**: Mobile application (client-side only, no backend)
**Performance Goals**: TF-IDF scoring for a batch of 5 recipes completes synchronously in < 100ms; no async calls required for match score computation
**Constraints**: Fully offline — no external API calls for this feature; no new npm packages; no new secrets; vocabulary alignment handled incrementally in `tfidfProfile.js` when profile is updated
**Scale/Scope**: 2 new utility/storage modules, 2 modified existing files; `claudeService.js` is not touched

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

### Principle I — Simplicity & YAGNI

**Status: PASS**

- `src/utils/tfidf.js` — two exported pure functions (`tfidf`, `buildVocabulary`); no dependencies; bounded mathematical operations meaningfully testable in isolation.
- `src/utils/cosineSimilarity.js` — unchanged from original design.
- `src/storage/tfidfProfile.js` — mirrors the established `tagProfile.js` / `seenList.js` pattern; four exported functions covering corpus and profile read/write. No new pattern introduced.
- No new state management, navigation changes, context shape changes, or npm packages.

### Principle II — Structured AI Contracts

**Status: PASS**

TF-IDF is a local algorithm. This feature makes no new calls to any external API (Claude or otherwise). The existing recipe generation call to Claude is unaffected and already covered by the existing contract. `claudeService.js` is not modified.

### Principle III — Secure Configuration

**Status: PASS**

No new secrets. The feature is fully local. `.env.example` and `app.config.js` require no changes.

## Project Structure

### Documentation (this feature)

```text
specs/002-recipe-match-score/
├── spec.md
├── plan.md                  ← this file
├── research.md              ← Phase 0 output
├── data-model.md            ← Phase 1 output
├── quickstart.md            ← Phase 1 output
├── contracts/
│   ├── tfidf-algorithm.md   ← Phase 1 output — algorithm constants and behaviour contract
│   └── module-contracts.md  ← Phase 1 output — function signatures
└── checklists/
    └── requirements.md
```

### Source Code

```text
src/
├── components/
│   └── RecipeCard.js           ← MODIFY: add matchScore prop + badge overlay
├── screens/
│   └── RecipeStackScreen.js    ← MODIFY: score batch on load, update profile on right-swipe
├── services/
│   └── claudeService.js        (unchanged)
├── storage/
│   ├── seenList.js             (unchanged)
│   ├── tagProfile.js           (unchanged)
│   └── tfidfProfile.js         ← NEW: corpus + profile get/update
└── utils/
    ├── cosineSimilarity.js     ← NEW: cosineSimilarity(a, b)
    └── tfidf.js                ← NEW: tfidf(text, corpus), buildVocabulary(corpus)

tests/
└── unit/
    ├── utils/cosineSimilarity.test.js    ← NEW
    ├── utils/tfidf.test.js               ← NEW
    └── storage/tfidfProfile.test.js      ← NEW
```

**Structure Decision**: Single-project mobile app (Option 1). No structural changes to navigation, context, or screen hierarchy. The feature is entirely additive — existing screens and components gain new optional props/behaviour; no existing interfaces are broken.

## Complexity Tracking

> No unjustified Principle I violations. Section left blank.
