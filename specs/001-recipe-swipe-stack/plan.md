# Implementation Plan: Smart Recipe Planner

**Branch**: `001-recipe-swipe-stack` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-recipe-swipe-stack/spec.md`

## Summary

Smart Recipe Planner is a client-side Expo React Native app where users photograph available
ingredients and receive a swipeable stack of 5 AI-generated recipe suggestions. The technical
approach uses Claude's vision API with a JSON-mode prompt to analyse ingredient photos and return
structured recipe data; Unsplash's photo search API fetches dish images in parallel for all 5 cards;
AsyncStorage persists the tag preference profile and seen-recipes list across sessions; and React
Navigation manages the 3-screen flow: Camera → Recipe Stack → Recipe Detail.

## Technical Context

**Language/Version**: JavaScript (ES2022+), Expo SDK 51, React Native 0.74
**Primary Dependencies**: expo-camera, @react-native-async-storage/async-storage,
  react-native-gesture-handler, react-native-reanimated, @react-navigation/native,
  @react-navigation/native-stack, @anthropic-ai/sdk
**Storage**: AsyncStorage — TagPreferenceProfile (JSON map), SeenList (JSON array of IDs)
**Testing**: Jest + React Native Testing Library
**Target Platform**: iOS and Android via Expo Managed Workflow; development via Expo Go
**Project Type**: mobile-app (client-side only, no backend server)
**Performance Goals**: Full recipe stack (5 cards + images) displayed within 5 s on standard
  mobile data; image fetches for all 5 cards run in parallel
**Constraints**: No backend; API keys from app.config.js extra backed by .env; offline
  conditions surface error state + retry; bundle size increases justified against user value
**Scale/Scope**: Single-user device app; 3 screens; ~15 source files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Simplicity & YAGNI ✅

- Single Expo project; no monorepo, no additional sub-packages.
- React Context for in-session state; no Redux, Zustand, or other state library.
- Direct fetch/SDK calls from service files; no repository-pattern indirection.
- No feature flags, adapters, or backwards-compatibility shims.

**Gate: PASS**

### II. Structured AI Contracts ✅

- Claude response schema defined in `src/schemas/recipe.js` and documented in
  `contracts/claude-recipe-schema.md` **before** any service code is written.
- `claudeService.js` validates every Claude response at runtime against that schema;
  malformed responses throw a typed error.
- Prompt templates live in `claudeService.js` alongside the schema they target
  (version-controlled together).

**Gate: PASS — schema file creation is the first implementation task (blocker for all others)**

### III. Secure Configuration ✅

- Claude API key: `CLAUDE_API_KEY` in `.env` → exposed via `app.config.js` extra as
  `Constants.expoConfig.extra.claudeApiKey`.
- Unsplash access key: `UNSPLASH_ACCESS_KEY` in `.env` → `Constants.expoConfig.extra.unsplashAccessKey`.
- `.env` is gitignored; `.env.example` lists both variable names without values.

**Gate: PASS**

## Project Structure

### Documentation (this feature)

```text
specs/001-recipe-swipe-stack/
├── plan.md                         # This file
├── research.md                     # Phase 0 output
├── data-model.md                   # Phase 1 output
├── quickstart.md                   # Phase 1 output
├── contracts/
│   ├── claude-recipe-schema.md     # Claude JSON response contract (Principle II)
│   └── unsplash-search.md          # Unsplash API usage contract
└── tasks.md                        # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
app.config.js              # Expo config — reads .env and injects into app.extra
.env                       # Local secrets (gitignored)
.env.example               # Variable names without values (committed)

src/
├── navigation/
│   └── AppNavigator.js              # React Navigation native stack (3 screens)
├── screens/
│   ├── CameraScreen.js              # Camera capture UI; navigates to RecipeStackScreen
│   ├── RecipeStackScreen.js         # Swipeable card stack; auto-fetch on batch exhaustion
│   └── RecipeDetailScreen.js        # Full recipe: ingredients + numbered steps
│                                    #   receives `recipeIndex` nav param; reads the
│                                    #   full Recipe object from AppContext — the Recipe
│                                    #   object is NEVER passed through navigation params
├── components/
│   ├── RecipeCard.js                # Single swipeable card with gesture + spring animation
│   ├── SwipeStack.js                # Renders ordered stack of RecipeCards
│   └── ErrorState.js                # Reusable error message + retry button
├── services/
│   ├── claudeService.js             # Claude API calls; prompt builder; schema validation
│   └── unsplashService.js           # Unsplash photo search; parallel batch fetch helper
├── storage/
│   ├── seenList.js                  # AsyncStorage R/W for seen recipe ID set
│   └── tagProfile.js                # AsyncStorage R/W for tag preference weight map
├── schemas/
│   └── recipe.js                    # Canonical recipe JSON schema + runtime validator
└── context/
    └── AppContext.js                 # React Context: batch state, photo URI, preference profile
```

**Structure Decision**: Single Expo project (no monorepo, no backend). External API calls are made
from service files; storage operations are isolated in the storage/ layer; the schema in schemas/
enforces Principle II and is the authoritative contract for Claude responses.

## Complexity Tracking

> No constitution violations detected — complexity tracking not required.
