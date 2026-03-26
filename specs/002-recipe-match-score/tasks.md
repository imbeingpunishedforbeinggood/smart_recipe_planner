# Tasks: Recipe Match Score

**Input**: Design documents from `/specs/002-recipe-match-score/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Organization**: Tasks grouped by user story for independent implementation and testing.
**Tests**: Unit test tasks included (test files listed in plan.md project structure).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unresolved dependencies on tasks in the same phase)
- **[Story]**: User story this task belongs to (US1/US2/US3)

---

## Phase 1: Setup

**Purpose**: Create test directory scaffolding before any implementation begins.

- [x] T001 Create test directories `tests/unit/utils/` and `tests/unit/storage/` (can be empty — Jest will pick up test files automatically)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure utility modules that all user stories depend on. Both are independent files with no shared dependencies — implement in parallel.

**⚠️ CRITICAL**: T008, T009, and T011 cannot begin until T002 and T003 are complete.

- [x] T002 [P] Implement `src/utils/cosineSimilarity.js` — export `cosineSimilarity(a, b)`: compute dot product over L2 norms; return `0` when either norm is zero; throw `Error('Vector length mismatch')` when `a.length !== b.length`; no imports or side effects (see `contracts/module-contracts.md`)
- [x] T003 [P] Implement `src/utils/tfidf.js` — export `buildVocabulary(corpus)`: sorted deduplicated tokens across all documents; export `tfidf(text, corpus)`: dense TF-IDF vector indexed by `buildVocabulary(corpus)`; tokenize with `/[^a-z]+/` split, discard tokens `length < 2`; smooth IDF = `log((N+1)/(df+1)) + 1`; return empty array for empty corpus (see `contracts/tfidf-algorithm.md` for exact formula and constants)

**Checkpoint**: Two pure, testable utility modules ready. Phase 3 can begin.

---

## Phase 3: User Story 1 — Match Scores on Recipe Cards (Priority: P1) 🎯 MVP

**Goal**: A user with at least one prior right-swipe sees a "X% match" badge in warm accent color on every recipe card in the next batch.

**Independent Test**: Pre-seed `@srp/tfidf_profile` and `@srp/recipe_corpus` in AsyncStorage with fixture data; load a batch; verify each RecipeCard renders the badge with a non-null integer percentage. (See quickstart.md Scenario B.)

- [x] T004 [P] [US1] Implement `src/storage/tfidfProfile.js` — export `getRecipeCorpus(): Promise<string[]>` (returns `[]` on empty/error), `addToRecipeCorpus(texts: string[]): Promise<void>` (appends to `@srp/recipe_corpus`), and `getTfidfProfile(): Promise<{vector,vocabulary,count}|null>` (returns `null` on empty/error); follow `tagProfile.js` pattern for error handling and key naming (`@srp/recipe_corpus`, `@srp/tfidf_profile`) (see `contracts/module-contracts.md`)
- [x] T005 [P] [US1] Add `matchScore` prop to `src/components/RecipeCard.js` — prop is `number | null`, default `null`; when non-null render an absolute-positioned badge top-right of the card image with text `"{matchScore}% match"` in color `#F97316`; existing props and layout unchanged; badge must sit inside `cardClip` View so it clips to card border radius (see `contracts/module-contracts.md`)
- [x] T006 [P] [US1] Write `tests/unit/utils/cosineSimilarity.test.js` — cover: identical vectors → 1.0; orthogonal vectors → 0.0; opposite vectors → -1.0; one zero vector → 0.0; length mismatch → throws; two-element known vectors with hand-computed expected value (see quickstart.md test case table)
- [x] T007 [P] [US1] Write `tests/unit/utils/tfidf.test.js` — cover: `buildVocabulary(["a b", "b c"])` → `["a","b","c"]`; term in all docs has low IDF; term unique to one doc has high IDF; identical texts same corpus → identical vectors; empty corpus → `[]`; text with no valid tokens → zero vector; single-doc corpus IDF = `log(2/2)+1 = 1.0` for present terms (see quickstart.md test case table and `contracts/tfidf-algorithm.md`)
- [x] T008 [US1] Update `loadBatch` in `src/screens/RecipeStackScreen.js` — after `fetchBatchImages`, add: (1) `buildRecipeText(recipe)` private helper returning `"{name}. {description}. Tags: {tags.join(', ')}"`, (2) `getRecipeCorpus()` then `addToRecipeCorpus([5 recipe texts])`, (3) `getTfidfProfile()` — if null, all cards get `matchScore: null`; if profile exists, for each recipe compute `tfidf(text, corpus)`, project to `profile.vocabulary` (map each profile vocab term to its index in `buildVocabulary(corpus)`, else 0), `cosineSimilarity(projected, profile.vector)`, `matchScore = Math.max(0, Math.round(cosine * 100))`; wrap steps 2–5 in try/catch that sets all matchScores to null on any error; pass `matchScore` in each card object (see `contracts/module-contracts.md` and `research.md` Finding 6)

**Checkpoint**: RecipeCard displays "X% match" badge when pre-seeded profile exists; no badge when profile is null. User Story 1 is independently testable.

---

## Phase 4: User Story 2 — Taste Profile Updates on Right Swipe (Priority: P2)

**Goal**: Swiping right on a recipe updates the persisted taste profile so future batches reflect the new preference.

**Independent Test**: Start with no profile; swipe right on a clearly characterised recipe (e.g., tags: `italian, pasta`); swipe through the rest of the batch; verify next batch shows `@srp/tfidf_profile` `count === 1` and the Italian-style recipe scores higher than an unrelated one. (See quickstart.md Scenarios B and C.)

- [x] T009 [US2] Add `updateTfidfProfile(likedText, currentCorpus)` to `src/storage/tfidfProfile.js` — (1) `newVocab = buildVocabulary(currentCorpus)`, (2) `newVector = tfidf(likedText, currentCorpus)`, (3) if no profile: store `{vector: newVector, vocabulary: newVocab, count: 1}`; if profile exists: build `alignedOld` by mapping each term in `newVocab` to `profile.vector[profile.vocabulary.indexOf(term)]` else 0, compute element-wise running mean `(alignedOld[i]*count + newVector[i])/(count+1)`, store `{vector: newMean, vocabulary: newVocab, count: count+1}`; import `buildVocabulary` and `tfidf` from `src/utils/tfidf.js` (see `contracts/module-contracts.md` and `research.md` Finding 3)
- [x] T010 [P] [US2] Write `tests/unit/storage/tfidfProfile.test.js` — cover all four functions: `getRecipeCorpus` on empty storage → `[]`; `addToRecipeCorpus` twice → combined array; `getTfidfProfile` on empty → null; `updateTfidfProfile` first call → `count===1`, vector matches `tfidf(text,corpus)`; second call → `count===2`, vector is running mean; call after corpus grows (new terms) → vocabulary is extended, old vector zero-padded; AsyncStorage read failure in `getTfidfProfile` → returns null gracefully (see quickstart.md test case table)
- [x] T011 [US2] Update `onSwipe` handler in `src/screens/RecipeStackScreen.js` — after the existing `updateTagProfile` call, when `direction === 'right'`: call `getRecipeCorpus()` then `updateTfidfProfile(buildRecipeText(card.recipe), corpus)`; wrap in try/catch that only logs a warning on failure (never surfaces to user); `buildRecipeText` helper is already defined from T008 (see `contracts/module-contracts.md`)

**Checkpoint**: Right-swipe creates and evolves `@srp/tfidf_profile`. Both User Stories 1 and 2 are independently functional.

---

## Phase 5: User Story 3 — No Scores for New Users (Priority: P3)

**Goal**: A user with no swipe history sees recipe cards with no match score badge whatsoever.

**Independent Test**: Clear AsyncStorage; load a batch; confirm no badge renders on any card. Then swipe right once; load next batch; confirm badges now appear. (See quickstart.md Scenarios A and B.)

- [x] T012 [US3] Audit and verify the null-profile path end-to-end — confirm `loadBatch` skips scoring and passes `matchScore: null` to all cards when `getTfidfProfile()` returns null (trace T008 guard clause); confirm `RecipeCard` renders no badge when `matchScore` is null or undefined (trace T005); run quickstart.md Scenario A manually and confirm zero badges; run Scenario D (corrupt profile) and confirm no crash; no code changes expected — this is a verification task; if a gap is found, patch the relevant file

**Checkpoint**: All three user stories (P1, P2, P3) are implemented and independently verifiable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Developer-experience and observability improvements.

- [x] T013 [P] Extend the existing Debug Storage dialog in `src/screens/RecipeStackScreen.js` — add `@srp/tfidf_profile` to the `Promise.all` reads; display `tfidf_profile: count=N, vocab_size=V` in the Alert body (do not log the full vector); keep existing `tag_profile` and `seen_list` lines unchanged (see quickstart.md Debug Storage Extension section)
- [x] T014 End-to-end manual verification — run all four scenarios from `quickstart.md` (A: no history; B: first like; C: profile accumulates; D: graceful degradation); confirm match scores are visible and plausible; confirm no crashes under any scenario

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user story work (T002, T003 must complete)
- **US1 (Phase 3)**: Depends on Phase 2 — T004/T005/T006/T007 can start in parallel once T002+T003 done; T008 depends on T002+T003+T004+T005
- **US2 (Phase 4)**: Depends on Phase 3 complete (T009 extends the same `tfidfProfile.js` file as T004)
- **US3 (Phase 5)**: Depends on Phase 3 + Phase 4 complete (verifies both null-path and first-swipe transition)
- **Polish (Phase 6)**: Depends on Phase 5 complete

### User Story Dependencies

- **US1 (P1)**: Requires Foundational phase (T002, T003) — no dependency on US2 or US3
- **US2 (P2)**: Requires US1 (T004 creates the `tfidfProfile.js` file; T008 defines `buildRecipeText`)
- **US3 (P3)**: Verification of US1 + US2 integration; no new code expected

### Within Phase 3

```
T004 ─┐
T005 ─┤─→ T008   (T008 depends on T002, T003, T004, T005)
T002 ─┤
T003 ─┘
T006 (independent — tests T002)
T007 (independent — tests T003)
```

### Within Phase 4

```
T009 ─→ T010  (tests need T009 implemented)
T009 ─→ T011  (RecipeStackScreen needs updateTfidfProfile exported)
T010 and T011 can run in parallel after T009
```

---

## Parallel Execution Examples

### Phase 2 (run together)

```
Task A: "Implement cosineSimilarity in src/utils/cosineSimilarity.js"        [T002]
Task B: "Implement buildVocabulary and tfidf in src/utils/tfidf.js"           [T003]
```

### Phase 3 (run together once T002 + T003 done)

```
Task A: "Implement tfidfProfile.js read functions"                            [T004]
Task B: "Add matchScore prop and badge to RecipeCard.js"                      [T005]
Task C: "Write cosineSimilarity.test.js"                                      [T006]
Task D: "Write tfidf.test.js"                                                 [T007]
→ Then: "Update loadBatch in RecipeStackScreen.js"                            [T008]
```

### Phase 4 (run together once T009 done)

```
Task A: "Write tfidfProfile.test.js"                                          [T010]
Task B: "Update onSwipe in RecipeStackScreen.js"                              [T011]
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002, T003)
3. Complete Phase 3: User Story 1 (T004–T008)
4. **STOP and VALIDATE**: Run quickstart.md Scenario B with pre-seeded AsyncStorage fixture
5. Confirm badge renders with correct percentage before proceeding

### Incremental Delivery

1. **Setup + Foundational** → Pure utilities ready and tested (T001–T003)
2. **Add US1** → Match scores visible on cards for users with history (T004–T008) → MVP deliverable
3. **Add US2** → Profile self-builds from swipes (T009–T011) → Feature complete
4. **Verify US3** → Null path confirmed; new-user experience clean (T012)
5. **Polish** → Debug tooling + final E2E check (T013–T014)

---

## Notes

- No changes to `src/services/claudeService.js` — confirmed in plan.md
- No new npm packages — TF-IDF is implemented from scratch in pure JS
- No new secrets or `.env` changes required
- Algorithm constants (tokenizer regex, IDF formula) are version-controlled in `contracts/tfidf-algorithm.md` — any change requires clearing AsyncStorage profile keys and a migration note
- `[P]` tasks in the same phase operate on different files; they can be assigned to separate agents or worked simultaneously without conflicts
