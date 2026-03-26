# Tasks: Lottie Loading Animation

**Input**: Design documents from `/specs/004-lottie-loading/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Setup

**Purpose**: Install the animation library and confirm the animation asset is present before any implementation begins.

- [x] T001 Install lottie-react-native by running `npx expo install lottie-react-native` in the project root
- [x] T002 Confirm `assets/animations/Cooking.json` exists; if missing, stop and notify — implementation cannot proceed without the animation asset

**Checkpoint**: lottie-react-native is installed in package.json and Cooking.json is present

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the shared `LoadingScreen` component that both user stories depend on.

**⚠️ CRITICAL**: Neither user story can be implemented until this phase is complete.

- [x] T003 Create `src/components/LoadingScreen.js` — a stateless component that renders a full-screen view with `backgroundColor: '#FFFAF7'`, `flex: 1`, `alignItems: 'center'`, `justifyContent: 'center'`, containing a `LottieView` sourced from `require('../../assets/animations/Cooking.json')` with `autoPlay` and `loop` props, sized `{ width: 240, height: 240 }`

**Checkpoint**: `<LoadingScreen />` can be imported and renders the Lottie animation on a warm off-white background

---

## Phase 3: User Story 1 — Animated Loading After Photo Capture (Priority: P1) 🎯 MVP

**Goal**: Replace the in-button ActivityIndicator in CameraScreen with a full-screen LoadingScreen overlay while photo capture is in progress.

**Independent Test**: Press the capture button; the camera viewfinder should be replaced by the full-screen Lottie animation. When the app navigates to the recipe stack, the animation disappears. No ActivityIndicator is visible inside the button during capture.

### Implementation for User Story 1

- [x] T004 [US1] In `src/screens/CameraScreen.js`, add `import LoadingScreen from '../components/LoadingScreen';` at the top of the file
- [x] T005 [US1] In `src/screens/CameraScreen.js`, add `if (capturing) return <LoadingScreen />;` immediately before the existing `if (!permission)` guard (so the LoadingScreen renders as a full-screen replacement for the camera view while `capturing` is true)
- [x] T006 [US1] In `src/screens/CameraScreen.js`, remove the `{capturing ? <ActivityIndicator color={THEME.accent} /> : <View style={styles.captureInner} />}` ternary inside the capture button and replace it with `<View style={styles.captureInner} />` (the full-screen overlay now handles capture loading; the button always shows its idle state)

**Checkpoint**: After T006, User Story 1 is fully functional — capture shows a full-screen Lottie animation, the in-button spinner is gone, and the `ActivityIndicator` import is still present (still used by the permission guard at line 21)

---

## Phase 4: User Story 2 — Animated Loading Between Recipe Batches (Priority: P2)

**Goal**: Replace the ActivityIndicator + "Finding recipes…" text in RecipeStackScreen with the shared LoadingScreen component for both initial load and between-batch load.

**Independent Test**: Swipe through all recipe cards in the current batch; the between-batch loading state should show the Lottie animation on the warm off-white background, not the text spinner. The app should resume the recipe stack when the next batch is ready.

### Implementation for User Story 2

- [x] T007 [US2] In `src/screens/RecipeStackScreen.js`, add `import LoadingScreen from '../components/LoadingScreen';` at the top of the file
- [x] T008 [US2] In `src/screens/RecipeStackScreen.js`, replace the entire `if (status === 'loading') { return (<View style={styles.center}><ActivityIndicator .../><Text ...>Finding recipes…</Text></View>); }` block with `if (status === 'loading') { return <LoadingScreen />; }`
- [x] T009 [US2] In `src/screens/RecipeStackScreen.js`, remove the `ActivityIndicator` and `Text` imports if they are no longer used elsewhere in the file (verify by searching for any remaining usages before removing)
- [x] T010 [US2] In `src/screens/RecipeStackScreen.js`, remove the `styles.center` and `styles.loadingText` style rules from the StyleSheet if they are no longer referenced anywhere in the file

**Checkpoint**: Both user stories are now independently functional. No ActivityIndicator appears in either loading state. The LoadingScreen is the sole loading UI across the app's two loading flows.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validate code quality and confirm the implementation meets the spec's success criteria end-to-end.

- [x] T011 [P] Run `npm run lint` from the project root and fix any lint errors introduced by the new files or imports
- [ ] T012 Run the app and manually verify all five success criteria from the spec: (1) both loading flows show the animation, (2) animation starts within one frame of loading, (3) animation loops without pausing up to 60s, (4) background is #FFFAF7 on iOS and Android, (5) transition to recipe stack has no blank flash
- [ ] T013 [P] Follow `specs/004-lottie-loading/quickstart.md` step-by-step to confirm the full verification checklist passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (lottie-react-native must be installed) — **blocks both user stories**
- **User Story 1 (Phase 3)**: Depends on Phase 2 (LoadingScreen component must exist)
- **User Story 2 (Phase 4)**: Depends on Phase 2 (LoadingScreen component must exist) — independent of US1
- **Polish (Phase 5)**: Depends on both US1 and US2 being complete

### User Story Dependencies

- **US1 (P1)**: Unblocked after Phase 2 — no dependency on US2
- **US2 (P2)**: Unblocked after Phase 2 — no dependency on US1 (different file: RecipeStackScreen.js vs CameraScreen.js)

### Within Each User Story

- Import task (T004, T007) must come before usage tasks
- T006 (remove in-button ternary) must come after T005 (add full-screen guard)
- T009/T010 (cleanup) must come after T008 (replacement confirmed)

### Parallel Opportunities

- T004–T006 (US1 in CameraScreen) and T007–T010 (US2 in RecipeStackScreen) can run in parallel after Phase 2 — different files, no shared state
- T011 and T013 (lint + quickstart verify) can run in parallel during Polish

---

## Parallel Example: User Stories 1 & 2

```bash
# After Phase 2 completes, both stories can be worked simultaneously:
Task A: "Update CameraScreen.js for US1 (T004–T006)"
Task B: "Update RecipeStackScreen.js for US2 (T007–T010)"
# Different files — no merge conflicts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Install library, verify asset
2. Complete Phase 2: Create LoadingScreen component
3. Complete Phase 3: Update CameraScreen — **stop here and validate US1**
4. The app already delivers improved UX for the primary loading moment

### Incremental Delivery

1. Setup + Foundational → shared component ready
2. US1 → photo capture loading improved (MVP)
3. US2 → between-batch loading improved (full feature)
4. Polish → lint clean, all success criteria verified

---

## Notes

- [P] tasks operate on different files and have no shared dependencies
- The `ActivityIndicator` import in `CameraScreen.js` must NOT be removed — it is still used by the permission check guard
- The `ActivityIndicator` import in `RecipeStackScreen.js` SHOULD be removed after T008 if no other usage remains
- `assets/animations/Cooking.json` must exist before T003; the entire feature depends on this asset
- Commit after each phase checkpoint to keep changes atomic and reversible
