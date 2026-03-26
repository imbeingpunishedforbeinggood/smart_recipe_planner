# Tasks: Warm UI Redesign

**Input**: Design documents from `/specs/003-warm-ui-redesign/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, contracts/ ✓, quickstart.md ✓

**Organization**: Tasks grouped by user story for independent implementation and testing.
**Tests**: No unit tests — this feature is pure visual/style changes, verified manually per quickstart.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unresolved dependencies on tasks in the same phase)
- **[Story]**: User story this task belongs to (US1/US2/US3)

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: Create the shared design token module that ALL user story tasks import. No story work can begin until this is complete.

**⚠️ CRITICAL**: T002, T003, T004, T005 cannot begin until T001 is complete.

- [x] T001 Create `src/constants/theme.js` — export a frozen `THEME` object with all design tokens from `contracts/design-tokens.md`: `accent: '#FF6B35'`, `accentBg: 'rgba(255,107,53,0.12)'`, `background: '#FFFAF7'`, `cardBg: '#FFFFFF'`, `textPrimary: '#1A1A1A'`, `textSecondary: '#555555'`, `textMuted: '#888888'`, `border: '#E8E0D8'`; `cardShadow` object with `shadowColor: '#C4714A'`, `shadowOffset: { width: 0, height: 4 }`, `shadowOpacity: 0.18`, `shadowRadius: 8`, `elevation: 6`; `radius` object with `card: 18`, `chip: 12`, `button: 36`, `badge: 10`; `type` object with `screenTitle: { fontSize: 28, fontWeight: '700' }`, `cardTitle: { fontSize: 20, fontWeight: '700' }`, `detailTitle: { fontSize: 24, fontWeight: '700' }`, `sectionHeader: { fontSize: 18, fontWeight: '700' }`, `body: { fontSize: 15 }`, `meta: { fontSize: 13 }`, `tag: { fontSize: 12, fontWeight: '600' }`

**Checkpoint**: `THEME` constants available for import. Phase 2 can begin.

---

## Phase 2: User Story 1 — Polished Recipe Discovery Experience (Priority: P1) 🎯 MVP

**Goal**: Camera screen shows app title header and styled orange capture button; recipe cards have warm shadows, orange border, and orange tag chips.

**Independent Test**: Launch the app — the camera screen title and orange capture button are visible before any recipe is loaded. Load a recipe batch and confirm cards have orange tag chips, a warm-toned shadow, and the match score badge (if present) uses `#FF6B35`.

- [x] T002 [P] [US1] Update `src/components/RecipeCard.js` — import `THEME` from `'../constants/theme'`; change `borderColor` from `'#d8d8d8'` to `THEME.border`; replace all four shadow properties (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`) and `elevation` with the values from `THEME.cardShadow`; change tag chip `backgroundColor` from `'#f0f0f0'` to `THEME.accentBg`; change `tagText` color from `'#444'` to `THEME.accent` and add `fontWeight: '600'`; change match score badge `matchBadgeText` color from `'#F97316'` to `THEME.accent` (see `contracts/design-tokens.md` RecipeCard section)
- [x] T003 [P] [US1] Update `src/screens/CameraScreen.js` — import `THEME` from `'../constants/theme'`; change overlay layout from `justifyContent: 'flex-end'` to `justifyContent: 'space-between'` and add `paddingTop: 60`; add an app title `<Text>` as the first child of the overlay with text `"Snap & Cook"`, `color: '#fff'`, `fontSize: 28`, `fontWeight: '700'`, `textAlign: 'center'`, `paddingHorizontal: 24`; change `captureButton` `borderColor` from `'#fff'` to `THEME.accent`; change `captureInner` `backgroundColor` from `'#fff'` to `THEME.accent`; change `ActivityIndicator` `color` from `"#fff"` to `THEME.accent` (see `contracts/design-tokens.md` CameraScreen section)

**Checkpoint**: Camera screen shows "Snap & Cook" title and orange capture button. Recipe cards show orange tag chips and warm shadow. User Story 1 is independently testable via quickstart.md Scenarios A and C.

---

## Phase 3: User Story 2 — Recipe Stack Navigation Header (Priority: P2)

**Goal**: A subtle "← Retake photo" header appears above the card stack, styled in the accent color, and navigates back to the camera screen when tapped.

**Independent Test**: Navigate to the recipe stack screen — the retake header is visible above the cards without any interaction. Tap it and confirm the camera screen opens.

- [x] T004 [US2] Update `src/screens/RecipeStackScreen.js` — import `THEME` from `'../constants/theme'`; change container `backgroundColor` from `'#f4f4f4'` to `THEME.background`; add a `retakeHeader` `View` as the first child of the container `View` (before the `Button` debug element) with `paddingHorizontal: 16`, `paddingTop: 12`, `paddingBottom: 4`; inside it add a `Pressable` that calls `navigation.navigate('Camera')` on press, containing a `Text` with `"← Retake photo"`, `color: THEME.accent`, `fontSize: 14`, `fontWeight: '600'` (see `contracts/design-tokens.md` RecipeStackScreen section)

**Checkpoint**: "← Retake photo" link appears above the card stack in orange. Tapping it returns to the camera. User Story 2 is independently testable via quickstart.md Scenario B.

---

## Phase 4: User Story 3 — Immersive Recipe Detail (Priority: P3)

**Goal**: Recipe detail screen shows a taller full-width hero image, orange section headers, orange ingredient bullets, orange step numbers, warm background, and wider reading padding.

**Independent Test**: Tap any recipe card to open detail view — the hero image is 300px tall and full-bleed, "Ingredients" and "Steps" headers are orange, each ingredient has an orange bullet, each step number is orange, and the background is warm off-white.

- [x] T005 [US3] Update `src/screens/RecipeDetailScreen.js` — import `THEME` from `'../constants/theme'`; change `scroll` `backgroundColor` from `'#fafafa'` to `THEME.background`; change `fallback` `backgroundColor` to `THEME.background`; change `image` height from `260` to `300`; change `imagePlaceholder` `backgroundColor` from `'#e9e9e9'` to `'#F5EDE5'`; change `section` `paddingHorizontal` from `20` to `24`; change `sectionHeader` `color` from `'#111'` to `THEME.accent` and `fontWeight` from `'600'` to `'700'`; change `bullet` `color` from `'#888'` to `THEME.accent`; change `stepNumber` `color` from `'#888'` to `THEME.accent`; change tag chip `backgroundColor` from `'#f0f0f0'` to `THEME.accentBg` and `tagText` color from `'#444'` to `THEME.accent` with `fontWeight: '600'` (see `contracts/design-tokens.md` RecipeDetailScreen section)

**Checkpoint**: Recipe detail shows warm aesthetic with orange accents. All three user stories are independently functional.

---

## Phase 5: Polish & Visual Verification

**Purpose**: End-to-end visual verification across all four quickstart scenarios.

- [x] T006 Run quickstart.md Scenarios A–E — confirm: (A) camera title "Snap & Cook" and orange capture button visible; (B) recipe stack shows `#FFFAF7` background and "← Retake photo" link in orange; (C) recipe cards show orange tag chips, warm shadow, orange badge text; (D) recipe detail shows 300px hero image, orange section headers, orange bullets and step numbers, 24px horizontal padding; (E) no leftover grey or blue accents on any screen — only `#FF6B35` as accent color throughout; patch any gap found

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately; BLOCKS all user story work
- **US1 (Phase 2)**: T002 and T003 are independent [P] tasks; both depend only on T001
- **US2 (Phase 3)**: T004 depends only on T001; can start as soon as T001 is done
- **US3 (Phase 4)**: T005 depends only on T001; can start as soon as T001 is done
- **Polish (Phase 5)**: Depends on T002–T005 all complete

### User Story Dependencies

- **US1 (P1)**: Requires T001 only — independent of US2 and US3
- **US2 (P2)**: Requires T001 only — independent of US1 and US3
- **US3 (P3)**: Requires T001 only — independent of US1 and US2

### Within Phase 2

```
T001 ─→ T002  (RecipeCard — independent of T003)
T001 ─→ T003  (CameraScreen — independent of T002)
T002 and T003 can run in parallel
```

---

## Parallel Execution Example

### Once T001 is done (run all three together)

```
Task A: "Update RecipeCard tag chips, shadow, and badge color"      [T002]
Task B: "Update CameraScreen title overlay and capture button"      [T003]
Task C: "Update RecipeStackScreen background and retake header"     [T004]
Task D: "Update RecipeDetailScreen hero image and accent colors"    [T005]
```

All four touch different files — T002–T005 can run simultaneously after T001.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (T001)
2. Complete Phase 2: User Story 1 (T002, T003)
3. **STOP and VALIDATE**: Run quickstart.md Scenarios A and C — confirm orange capture button and orange card tags before continuing
4. The app already looks dramatically improved with just US1

### Incremental Delivery

1. **Foundation** → `THEME` constants ready (T001)
2. **Add US1** → Camera + RecipeCard polished (T002, T003) → MVP deliverable
3. **Add US2** → Stack screen header (T004) → Feature complete for discovery flow
4. **Add US3** → Detail screen immersive (T005) → Full feature complete
5. **Polish** → Visual audit (T006)

---

## Notes

- No new npm packages — all changes are to `StyleSheet` values and JSX structure
- No logic changes — swipe gestures, navigation structure, and data flow are unchanged
- No unit tests generated — visual/style changes are verified manually per quickstart.md
- `THEME` is a frozen object (`Object.freeze`) so it cannot be accidentally mutated at runtime
- All four story tasks (T002–T005) are independent and can be implemented in any order after T001
