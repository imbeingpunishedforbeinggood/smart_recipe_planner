# Feature Specification: Recipe Match Score

**Feature Branch**: `002-recipe-match-score`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User description: "Recipe match score using embeddings and cosine similarity — each recipe card displays a match score percentage showing how closely the recipe matches the user's taste profile."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Personalized Match Scores on Recipe Cards (Priority: P1)

A returning user who has liked several recipes opens the app and browses a new batch of recipe cards. Each card prominently displays a match percentage (e.g., "94% match") in a warm accent color, helping the user instantly identify recipes aligned with their taste preferences without needing to read every description.

**Why this priority**: This is the core user-facing value of the feature — it makes the swipe experience smarter and more personalized. Without this, nothing else matters.

**Independent Test**: Can be fully tested by pre-seeding a taste profile, loading a batch of 5 recipe cards, and verifying each card shows a match percentage in the correct visual style.

**Acceptance Scenarios**:

1. **Given** the user has previously swiped right on at least one recipe, **When** a new batch of 5 recipe cards loads, **Then** each card displays a match percentage between 0% and 100% in a warm accent color
2. **Given** a user with a strong preference for Italian cuisine, **When** an Italian pasta recipe card appears, **Then** the match percentage is noticeably higher than for an unrelated cuisine recipe
3. **Given** the app has just launched and recipes are loading, **When** the batch finishes loading, **Then** match scores are visible on all cards before the user begins swiping

---

### User Story 2 - Taste Profile Updates on Right Swipe (Priority: P2)

A user swipes right on a recipe they enjoy. The app silently captures that preference and updates their taste profile so that future recipe batches score more accurately.

**Why this priority**: Without profile updates, match scores never improve and the feature becomes stale. This is the feedback loop that makes scores valuable over time.

**Independent Test**: Can be tested by swiping right on a clearly characterized recipe (e.g., heavily tagged "spicy"), then verifying that subsequent batches show higher scores for similarly characterized recipes.

**Acceptance Scenarios**:

1. **Given** a user swipes right on a recipe, **When** the next batch of recipe cards loads, **Then** the match scores reflect the newly updated taste preference
2. **Given** a user has swiped right on 10 recipes all belonging to one cuisine type, **When** a recipe from that cuisine appears, **Then** it scores markedly higher than recipes from unrelated cuisine types
3. **Given** the app is closed and reopened after a right swipe, **When** a new batch loads, **Then** match scores still reflect the previously liked recipe (taste profile is persisted)

---

### User Story 3 - No Scores for New Users (Priority: P3)

A brand-new user opens the app for the first time. Recipe cards appear clean, without any match score label, since there is no preference history to compare against. The experience is uncluttered during onboarding.

**Why this priority**: A graceful no-score state prevents confusing labels from appearing for users who have no history, and it sets an honest expectation that scores emerge as you engage.

**Independent Test**: Can be tested by clearing all stored preference data, loading a fresh batch of recipe cards, and confirming no match score label appears on any card.

**Acceptance Scenarios**:

1. **Given** a user has no swipe history (first session or cleared data), **When** recipe cards load, **Then** no match score label is displayed on any card
2. **Given** a new user swipes right on their very first recipe, **When** the next batch of cards loads, **Then** match scores now appear on all cards
3. **Given** a user's stored preference data is cleared, **When** the app restarts and loads cards, **Then** no match scores appear (clean slate)

---

### Edge Cases

- What happens when the preference scoring service is temporarily unavailable during a batch load? Cards load and are displayed without match scores — the app does not crash or block.
- What happens if a recipe in the batch has no description or tags, only a name? A score is still computed using whatever text is available; if there is no text at all, no score is shown for that individual card.
- What happens when a user has liked only one recipe? Match scores are still computed and displayed using that single data point.
- How does the system handle a batch where all 5 recipes score below 20%? All low scores are displayed accurately — no artificial inflation or rounding.
- What if the user rapidly swipes right on many recipes in quick succession? Each swipe enqueues a preference update; eventual consistency is acceptable — scores reflect the latest successfully persisted profile.
- What if stored taste profile data becomes corrupted? The system falls back to the no-history state (no scores shown) rather than crashing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a match percentage on each recipe card when the user has at least one prior liked recipe
- **FR-002**: Match percentage MUST be visually distinct using a warm accent color and labeled clearly (e.g., "94% match")
- **FR-003**: System MUST NOT display any match score label on recipe cards when the user has no swipe history
- **FR-004**: System MUST compute match scores for all recipes in a batch before the cards are presented to the user
- **FR-005**: System MUST compute scores for all recipes in a batch concurrently rather than sequentially
- **FR-006**: System MUST update the user's taste profile when they swipe right on a recipe
- **FR-007**: User taste profile MUST be persisted across app sessions
- **FR-008**: Liked recipe data used to build the taste profile MUST be persisted across app sessions
- **FR-009**: System MUST handle preference scoring service unavailability gracefully — recipe cards load without match scores rather than blocking the UI or crashing
- **FR-010**: Match scores MUST be derived from the semantic content of a recipe (name, description, and category tags combined)
- **FR-011**: Taste profile MUST be updated by incorporating the new liked recipe cumulatively — older likes are not discarded

### Key Entities

- **Taste Profile**: The user's aggregated preference vector, computed as the element-wise mean of all liked Recipe Profile vectors; updated each time the user likes a recipe by recomputing this average; persisted between sessions
- **Recipe Profile**: A fixed-length numerical vector representing a recipe's semantic characteristics, generated from the recipe's name, description, and tags via an external embedding service (the only network call in the scoring pipeline)
- **Match Score**: A percentage (0–100%) expressing how similar a recipe is to the user's current Taste Profile; computed entirely on-device by measuring the angle between the two vectors (no network call required); displayed on the recipe card
- **Liked Recipe**: A recipe the user has swiped right on; its Recipe Profile vector is stored and factored into the next Taste Profile average

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Recipe cards display match scores within 2 seconds of a new batch being requested for users with an existing taste profile
- **SC-002**: After a user swipes right on a recipe, the next batch shows measurably different scores for similar recipes compared to before the swipe
- **SC-003**: Taste profile and liked-recipe data survive an app restart with 100% fidelity — no data loss
- **SC-004**: Zero match score labels appear on cards for users with no swipe history (0 false positives in new-user state)
- **SC-005**: Total scoring time for a batch of 5 recipes is no greater than 120% of the time required to score a single recipe (concurrent processing verified)
- **SC-006**: No app crashes or UI freezes occur when the preference scoring service is unavailable; cards always load normally

## Assumptions

- The recipe swipe card stack UI already exists and swipe-right events are already detectable by the app
- A "batch" of recipes means approximately 5 cards loaded at once; this is the baseline for performance targets
- Match scores are displayed on the card face in the swipe stack, not only in a recipe detail view
- The warm accent color will align with the existing design system; an orange/amber tone is acceptable if no accent color is defined
- Taste profile data is stored per-device and is not synced to a server or shared across devices
- Generating a recipe's semantic profile requires an active internet connection; offline use gracefully degrades to no scores
- Match scores are displayed as whole-number percentages (e.g., "94% match", not "94.3% match")
- Updating the taste profile is an additive/averaging operation — all past likes contribute equally
- Scores computed at batch-load time remain static for that session's batch; scores do not recalculate mid-swipe
- The preference scoring infrastructure (external service) is already accessible via an existing service layer in the app
