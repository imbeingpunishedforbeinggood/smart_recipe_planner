---

description: "Task list for Smart Recipe Planner — 001-recipe-swipe-stack"
---

# Tasks: Smart Recipe Planner

**Input**: Design documents from `/specs/001-recipe-swipe-stack/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths included in every description

## Path Conventions

- Single Expo project: `src/` at repository root; screens in `src/screens/`, etc.
- See `plan.md` → Project Structure for the full tree.

---

## Phase 1: Setup

**Purpose**: Expo project initialization and environment configuration.

- [x] T001 Initialize Expo managed-workflow project with all required packages: `expo-camera`, `@react-native-async-storage/async-storage`, `react-native-gesture-handler`, `react-native-reanimated`, `@react-navigation/native`, `@react-navigation/native-stack`, `@anthropic-ai/sdk`, `dotenv`, `expo-constants`
- [x] T002 [P] Create `.env.example` at repository root listing `CLAUDE_API_KEY=` and `UNSPLASH_ACCESS_KEY=` (no values)
- [x] T003 [P] Configure `app.config.js` — import `dotenv/config`, export default with `name`, `slug`, and `extra: { claudeApiKey: process.env.CLAUDE_API_KEY, unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY }`
- [x] T004 [P] Add `.env` to `.gitignore`; create empty directory stubs: `src/navigation/`, `src/screens/`, `src/components/`, `src/services/`, `src/storage/`, `src/schemas/`, `src/context/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can start.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.
`src/schemas/recipe.js` (T005) is the hardest blocker — it must exist before any
service code is written (Constitution Principle II).

- [x] T005 Create `src/schemas/recipe.js` — export `RECIPE_SCHEMA` object documenting all required fields and a `validateRecipeResponse(parsed)` function that throws `RecipeSchemaError(message)` if: root key is not `"recipes"`, array length ≠ 5, or any recipe is missing required fields (`id`, `name`, `description`, `tags`, `estimatedTime`, `servings`, `ingredients`, `steps`, `imageSearchQuery`). See `contracts/claude-recipe-schema.md` for field constraints.
- [x] T006 [P] Create `src/storage/seenList.js` — export `getSeenIds()` (reads `@srp/seen_list` from AsyncStorage, returns parsed array or `[]`) and `addSeenIds(newIds)` (merges with Set dedup, writes back). See `data-model.md` → SeenList.
- [x] T007 [P] Create `src/storage/tagProfile.js` — export `getTagProfile()` (reads `@srp/tag_profile`, returns parsed object or `{}`) and `updateTagProfile(tags, direction)` (increments each tag by +1 for `'right'`, -1 for `'left'`, writes back). See `data-model.md` → TagPreferenceProfile.
- [x] T008 [P] Create `src/components/ErrorState.js` — accept `message` (string) and `onRetry` (function) props; render a centred error message and a "Try Again" button that calls `onRetry`.
- [x] T009 [P] Create `src/context/AppContext.js` — define `AppContext` and `AppProvider` component with initial state: `{ photoUri: null, photoBase64: null, currentBatch: null, status: 'idle', errorMessage: null, tagProfile: {} }` plus `setters` for each field. See `data-model.md` → Context Shape.
- [x] T010 [P] Create `App.js` at repository root — wrap `<AppProvider>` around `<AppNavigator>`; this is the Expo entry point.
- [x] T011 [P] Create `src/navigation/AppNavigator.js` — wrap with `<GestureHandlerRootView style={{ flex: 1 }}>`, create `NativeStackNavigator` with three routes: `Camera` (initial, `CameraScreen`), `RecipeStack` (`RecipeStackScreen`), `RecipeDetail` (`RecipeDetailScreen`).

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 — Photograph Ingredients & Receive Recipe Stack (Priority: P1) 🎯 MVP

**Goal**: User captures ingredient photo → sees a fully loaded stack of 5 recipe cards,
each with name, description, tags, and dish image.

**Independent Test**: Launch app, grant camera permission, photograph any food items,
confirm 5 recipe cards with images appear on the recipe stack screen within 5 seconds.

### Implementation for User Story 1

- [x] T012 [P] [US1] Implement `src/services/claudeService.js` — export `fetchRecipes(photoBase64, seenIds, tagProfile)`: builds system prompt per `contracts/claude-recipe-schema.md` (injecting `seenIds` and `tagProfile`), calls `client.messages.create` with base64 image content using `claude-sonnet-4-6`, parses JSON response, calls `validateRecipeResponse()` from `src/schemas/recipe.js`, returns `Recipe[]`. Load `claudeApiKey` from `Constants.expoConfig.extra`.
- [x] T013 [P] [US1] Implement `src/services/unsplashService.js` — export `fetchDishImage(query, accessKey)` (GET `/search/photos?query=...&per_page=1&orientation=landscape`, return `results[0].urls.regular` or `null`) and `fetchBatchImages(recipes, accessKey)` (runs `fetchDishImage` for all 5 via `Promise.allSettled`, returns array of URL-or-null). See `contracts/unsplash-search.md`.
- [x] T014 [P] [US1] Implement `src/screens/CameraScreen.js` — use `useCameraPermissions()` hook to request permission; render `<CameraView>` with a capture button; on press call `takePictureAsync({ quality: 0.7, base64: true, exif: false })`; navigate to `RecipeStack` passing `{ photoUri, photoBase64 }` as route params.
- [x] T015 [P] [US1] Implement `src/components/RecipeCard.js` — accept props `recipe` (Recipe), `imageUrl` (string|null), `onSwiped` (function), `onTap` (function), `index` (number for z-order offset); render card with recipe name, description, tag chips, and dish image (or a placeholder if `imageUrl` is null). No gesture logic yet — that is added in US2.
- [x] T016 [US1] Implement `src/components/SwipeStack.js` — accept `cards` (RecipeCard[]), `onSwipe(recipeId, direction)`, and `onBatchComplete` props; render cards in reverse z-order (index 4 → 0, top card at front) using absolute positioning with slight scale/translate offset for depth effect; no swipe gesture yet — wired in US2.
- [x] T017 [US1] Implement `src/screens/RecipeStackScreen.js` — on mount: read `photoBase64` from route params; call `claudeService.fetchRecipes(photoBase64, [], {})` then `unsplashService.fetchBatchImages(recipes, unsplashKey)`; build `RecipeBatch`; store batch in `AppContext`; set `status` accordingly; render `<SwipeStack>` when `status === 'showing'` or `<ErrorState>` when `status === 'error'`; wire `onBatchComplete` to re-fetch using same `photoBase64`.

**Checkpoint**: At this point US1 is fully functional — camera → recipe stack with images.

---

## Phase 4: User Story 2 — Swipe to Like or Dismiss (Priority: P1)

**Goal**: Cards animate off-screen on swipe; stack advances; all swiped recipes are
recorded in the seen list; auto-fetch triggers when the batch is exhausted.

**Independent Test**: Display the recipe stack, swipe all 5 cards (mix of left and right),
confirm each card exits in the correct direction, the stack advances without errors, and
`AsyncStorage.getItem('@srp/seen_list')` contains all 5 recipe IDs after the batch.

### Implementation for User Story 2

- [x] T018 [P] [US2] Add `PanGesture` + spring dismiss animation to `src/components/RecipeCard.js` — use `useSharedValue`, `useAnimatedStyle` from `react-native-reanimated` and `Gesture.Pan()` from `react-native-gesture-handler`; on release: if `|translationX| > 120` animate card off-screen (`withSpring(±500)`) then call `onSwiped(direction)` via `runOnJS`; otherwise snap back to centre.
- [x] T019 [US2] Update `src/components/SwipeStack.js` — connect `onSwiped` from the front `RecipeCard` to advance `currentIndex` state; when `currentIndex` reaches 5 call `onBatchComplete`; pass correct `index` prop to each card for z-order.
- [x] T020 [US2] Update `src/screens/RecipeStackScreen.js` — immediately after a new batch is stored in `AppContext`, call `addSeenIds(batch.cards.map(c => c.recipe.id))` from `src/storage/seenList.js` (records all 5 IDs before any swiping begins).

**Checkpoint**: US1 and US2 both fully functional — swipe gestures work, seen list persists.

---

## Phase 5: User Story 3 — View Full Recipe Detail (Priority: P2)

**Goal**: Tapping a card navigates to the detail screen showing the full recipe.
Back navigation returns to the stack without losing position.

**Independent Test**: With a recipe stack visible, tap (without swiping) the front card;
verify the detail screen shows the correct recipe name, at least 2 ingredients, at least 2
steps, an estimated time, and a serving count; press back and confirm the stack is unchanged.

### Implementation for User Story 3

- [x] T021 [US3] Implement `src/screens/RecipeDetailScreen.js` — read `recipeIndex` from `route.params`; look up `AppContext.currentBatch.cards[recipeIndex].recipe`; render: dish image at the top of the screen (sourced from `AppContext.currentBatch.cards[recipeIndex].imageUrl`, with a placeholder if null), recipe name (heading), ingredients as a bulleted list (`item` + `quantity`), preparation steps as a numbered list, `estimatedTime`, and `servings`. Include a back button (or rely on native stack header). The full Recipe object is NEVER passed through navigation params — only `recipeIndex`.
- [x] T022 [US3] Add `onTap` handler to `src/components/RecipeCard.js` — add a `Pressable` wrapper that calls `onTap()` on press, distinct from the swipe gesture (use gesture exclusivity or a press-only zone so a swipe does not fire `onTap`).
- [x] T023 [US3] Wire `onTap` in `src/screens/RecipeStackScreen.js` — pass `onTap={() => navigation.navigate('RecipeDetail', { recipeIndex: index })}` to each `RecipeCard` via `SwipeStack`; confirm `RecipeDetail` is already registered in `src/navigation/AppNavigator.js` (T011).

**Checkpoint**: US1, US2, and US3 all independently functional.

---

## Phase 6: User Story 4 — Personalized Recommendations Over Time (Priority: P2)

**Goal**: Swipe direction updates the tag preference profile; the profile persists across
sessions; future Claude requests use the profile to personalise suggestions.

**Independent Test**: Swipe right 5+ times on recipes sharing a common tag, close and reopen
the app, photograph the same ingredients; confirm (1) `AsyncStorage.getItem('@srp/tag_profile')`
shows positive scores for the liked tag, and (2) the new batch contains a higher proportion of
that tag than the first-ever batch.

### Implementation for User Story 4

- [x] T024 [P] [US4] Update `src/context/AppContext.js` — in `AppProvider`: on mount, load tag profile from `src/storage/tagProfile.js` `getTagProfile()` and set it as initial `tagProfile` state; add `updateTagProfile(tags, direction)` action that calls `storage/tagProfile.updateTagProfile(tags, direction)` then refreshes `tagProfile` state from storage.
- [x] T025 [P] [US4] Update `src/services/claudeService.js` — confirm `buildSystemPrompt(seenIds, tagProfile)` serialises `tagProfile` as `JSON.stringify(tagProfile)` and `seenIds` as a JSON array into the system prompt at the `{TAG_PROFILE}` and `{SEEN_IDS}` placeholders defined in `contracts/claude-recipe-schema.md`; update if placeholders are missing.
- [x] T026 [US4] Update `src/screens/RecipeStackScreen.js` — (a) on each swipe, call `AppContext.updateTagProfile(recipe.tags, direction)` where `recipe` is the card being swiped; (b) when fetching a new batch, pass `AppContext.tagProfile` and the current `seenIds` (from `storage/seenList.getSeenIds()`) to `claudeService.fetchRecipes()` instead of the empty defaults used in T017.

**Checkpoint**: All four user stories independently functional and end-to-end personalization active.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Attribution requirement and final smoke test.

- [x] T027 [P] Add Unsplash attribution to `src/components/RecipeCard.js` — display `"Photo by Unsplash"` (or `photo.user.name` if available from the API response) as a small caption below the dish image. Required by Unsplash API guidelines; see `contracts/unsplash-search.md`.
- [x] T028 Run manual smoke test per `quickstart.md` steps 4–5 — verify complete end-to-end flow: camera → 5-card stack with images → swipe all 5 → auto-fetch next batch → tap card → detail screen (ingredients + steps visible) → back to stack; confirm `@srp/seen_list` grows and `@srp/tag_profile` reflects swipe history in AsyncStorage.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — **BLOCKS all user stories**
  - T005 (schema) is the hardest blocker within Phase 2; T006–T011 can follow in parallel
- **User Stories (Phase 3+)**: All depend on Foundational completion
  - US1 (Phase 3) and US2 (Phase 4) are both P1 — implement sequentially (US2 builds on US1)
  - US3 and US4 are both P2 — can begin after US2 is complete; can proceed in parallel if staffed
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational — no dependency on other stories
- **US2 (P1)**: Starts after US1 (adds gesture layer to US1 components)
- **US3 (P2)**: Starts after Foundational — no dependency on US2 (can parallelise with US2 if staffed)
- **US4 (P2)**: Starts after US1 (needs claudeService and RecipeStackScreen to exist)

### Within Each User Story

- T012, T013, T014, T015 (US1 implementation): all parallel — different files
- T018 (US2): parallel with itself as a RecipeCard update
- T021 (US3): no dependencies within US3 — implement first, then T022 and T023
- T024, T025 (US4): parallel — different files

### Parallel Opportunities

All tasks marked `[P]` within a phase can run simultaneously:

```bash
# Phase 1 parallel group (after T001 completes):
T002  # .env.example
T003  # app.config.js
T004  # .gitignore + directory stubs

# Phase 2 parallel group (after T005 schema is done):
T006  # seenList.js
T007  # tagProfile.js
T008  # ErrorState.js
T009  # AppContext.js
T010  # App.js
T011  # AppNavigator.js

# Phase 3 parallel group:
T012  # claudeService.js
T013  # unsplashService.js
T014  # CameraScreen.js
T015  # RecipeCard.js (display only)
# → then T016 and T017 sequentially
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 — camera + recipe stack
4. **STOP and VALIDATE**: 5 cards load with images
5. Complete Phase 4: US2 — swipe gestures + seen list
6. **STOP and VALIDATE**: All 5 cards swipeable; next batch auto-fetches; seen list persists
7. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → shell app runs
2. US1 → camera captures photo and shows recipe stack (MVP!)
3. US2 → swipe gestures work; seen list active
4. US3 → full recipe detail accessible by tap
5. US4 → personalization active; profile persists across sessions
6. Polish → attribution + smoke test

---

## Notes

- `[P]` tasks touch different files — safe to work on simultaneously
- `[Story]` label maps every implementation task to its user story for traceability
- T005 (`src/schemas/recipe.js`) is a hard blocker per Constitution Principle II — no service code before the schema exists
- `RecipeDetailScreen.js` reads from `AppContext` via `recipeIndex` param — never pass full Recipe objects through navigation params (see `plan.md`)
- Unsplash attribution (T027) is a legal requirement per `contracts/unsplash-search.md` — do not skip
- Commit after each phase checkpoint at minimum
