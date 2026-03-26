# Feature Specification: Smart Recipe Planner

**Feature Branch**: `001-recipe-swipe-stack`
**Created**: 2026-03-24
**Status**: Draft
**Input**: User description: "Smart Recipe Planner — a client-side Expo React Native app where
users photograph their available ingredients and receive a swipeable stack of 5 AI-generated
recipe suggestions..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Photograph Ingredients & Receive Recipe Stack (Priority: P1)

A user who wants to cook something opens the app, takes a photo of their available ingredients
(fridge contents, pantry shelves, or countertop), and is immediately presented with a swipeable
stack of 5 recipe suggestions tailored to what they have on hand.

**Why this priority**: This is the core value proposition of the entire app. Without ingredient
capture and recipe generation, nothing else is reachable. It is the mandatory entry point every
session begins with.

**Independent Test**: Launch the app, take a photo of ingredients, and confirm a stack of 5
recipe cards — each with a title, short description, tags, and a dish image — is displayed on
the recipe stack screen.

**Acceptance Scenarios**:

1. **Given** the camera screen is open, **When** the user captures an ingredient photo, **Then**
   the app navigates to the recipe stack screen and displays 5 recipe cards.
2. **Given** the recipe stack is loading, **When** the batch is ready, **Then** each card shows a
   recipe name, short description, tags, and a dish image.
3. **Given** all 5 cards have been swiped, **When** the last card leaves the screen, **Then** a
   new batch of 5 recipes is automatically fetched and presented using the same ingredient photo,
   without any manual action from the user.
4. **Given** a network failure occurs during recipe fetching, **When** the request fails, **Then**
   the app displays a clear error message and a retry button.

---

### User Story 2 - Swipe to Like or Dismiss Recipes (Priority: P1)

With the recipe stack on screen, the user swipes right on recipes they want to keep in mind and
left on recipes they want to skip. This swipe interaction is the primary gesture for discovering
and filtering recipes.

**Why this priority**: The swipe mechanic is the core UX gesture of the app. It must work reliably
before the detail screen or personalization can deliver any value.

**Independent Test**: Display a stack of recipe cards, swipe right on two and left on three. Verify
each card animates off-screen in the correct direction, the stack advances correctly, and no swiped
recipe appears again in any subsequent batch in the same session.

**Acceptance Scenarios**:

1. **Given** a recipe stack is displayed, **When** the user swipes right on the front card, **Then**
   the card animates off-screen to the right and the next card moves to the front.
2. **Given** a recipe stack is displayed, **When** the user swipes left on the front card, **Then**
   the card animates off-screen to the left and the next card moves to the front.
3. **Given** a recipe has been swiped in any direction, **When** any future batch is generated
   (same session or a later session), **Then** that recipe is never included again.

---

### User Story 3 - View Full Recipe Detail (Priority: P2)

After seeing a recipe card they want to cook, the user taps it to open the full recipe detail
screen, which shows the complete ingredient list and numbered preparation steps.

**Why this priority**: The swipe stack drives discovery; the detail screen delivers the actual
cooking value. Users need it to act on a recipe they like.

**Independent Test**: Tap any card in the recipe stack and verify the detail screen displays the
recipe name, a full ingredients list, numbered preparation steps, estimated cook time, and serving
count.

**Acceptance Scenarios**:

1. **Given** a recipe stack is visible, **When** the user taps a card without swiping, **Then** the
   app navigates to the recipe detail screen for that recipe.
2. **Given** the recipe detail screen is open, **Then** it displays: recipe name, full ingredients
   list, step-by-step numbered instructions, estimated total time, and number of servings.
3. **Given** the recipe detail screen is open, **When** the user navigates back, **Then** the app
   returns to the recipe stack with the same cards in the same positions.

---

### User Story 4 - Personalized Recommendations Over Time (Priority: P2)

As the user swipes through recipes across multiple sessions, their swipe patterns build a taste
profile that is automatically applied to future recipe suggestions — liked tags surface more
often, disliked tags surface less.

**Why this priority**: Personalization is what makes the app grow more valuable over time and
distinguishes it from a generic recipe randomizer.

**Independent Test**: Perform 10 or more swipes consistently liking recipes tagged with one
category (e.g., "vegetarian") and disliking another (e.g., "spicy"). Close and reopen the app,
photograph the same ingredients, and verify the new batch contains a higher proportion of the
liked category and a lower proportion of the disliked one.

**Acceptance Scenarios**:

1. **Given** a user has repeatedly swiped right on recipes sharing a specific tag, **When** a new
   batch is requested, **Then** the suggested recipes include that tag more frequently than the
   user's very first batch.
2. **Given** a user has repeatedly swiped left on recipes sharing a specific tag, **When** a new
   batch is requested, **Then** that tag appears less frequently than in the user's first batch.
3. **Given** the user closes and reopens the app, **When** they capture an ingredient photo, **Then**
   their accumulated preference profile is applied to the new batch (not reset to neutral).
4. **Given** a brand-new install with no swipe history, **When** the first batch is requested,
   **Then** the app works correctly with neutral preferences and no errors.

---

### Edge Cases

- What if the ingredient photo is too dark, blurry, or contains no recognizable food items? The
  system returns best-effort suggestions; if the AI cannot identify any ingredients, the user sees
  a descriptive error and is prompted to retake the photo.
- What if a dish image cannot be retrieved for one or more recipe cards? The affected card(s)
  display a tasteful placeholder image; the remaining cards show their images normally and the
  stack is still presented.
- What if the network is unavailable when the next batch auto-fetches? The app displays a clear
  error state with a retry button; no partial or stale data is shown.
- What if all recipes the AI generates are already in the seen list? The system retries the
  request (up to 3 attempts), explicitly instructing the AI to exclude seen recipes. After 3
  failed attempts, a user-facing error is displayed.
- What if the on-device preference profile data is corrupted or unreadable? The app falls back to
  neutral preferences and continues normally without crashing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to capture a photo of their available ingredients using the device
  camera from within the app.
- **FR-002**: System MUST send the ingredient photo to the AI service and receive exactly 5 recipe
  suggestions per request.
- **FR-003**: Each recipe suggestion MUST include: name, short description, tags, estimated cook
  time, serving count, ingredients list, preparation steps, and an image search query.
- **FR-004**: System MUST display recipe suggestions as a swipeable card stack with one card
  visible at the front at a time.
- **FR-005**: Each recipe card MUST display: recipe name, short description, tags, and a dish image
  sourced from an image search service using the AI-provided search query.
- **FR-006**: Dish images for all 5 recipes in a batch MUST be fetched simultaneously so the full
  stack is ready to display at once.
- **FR-007**: Users MUST be able to swipe a card right to "like" it or left to "dismiss" it.
- **FR-008**: System MUST automatically fetch a new batch of 5 recipes when all cards in the
  current batch have been swiped, using the same ingredient photo.
- **FR-009**: System MUST maintain a persistent seen-recipes list and MUST NOT include any
  previously seen recipe in any future batch.
- **FR-010**: Tapping a recipe card MUST navigate the user to the full recipe detail screen for
  that recipe.
- **FR-011**: Recipe detail screen MUST display: recipe name, complete ingredients list, numbered
  preparation steps, estimated total time, and number of servings.
- **FR-012**: Users MUST be able to navigate back from the recipe detail screen to the recipe stack
  without losing their current position in the stack.
- **FR-013**: System MUST record each swipe gesture and update the score for every tag on the
  swiped recipe (right swipe increments each tag score; left swipe decrements each tag score).
- **FR-014**: Tag preference scores MUST be persisted on-device and survive app restarts.
- **FR-015**: System MUST include the current tag preference profile in every AI recipe request to
  influence the suggestions returned.
- **FR-016**: All external service credentials MUST be loaded from app configuration environment
  variables and MUST NOT be hardcoded anywhere in the application.
- **FR-017**: System MUST display a clear error state with a retry action whenever any external
  service request fails; silent failures are not permitted.

### Key Entities

- **Recipe**: Unique identifier (derived from name), name, short description, tags (list of
  strings), estimated cook time, serving count, ingredients list, preparation steps (ordered list),
  image search query.
- **RecipeCard**: A recipe paired with its resolved dish image URL, used for display in the
  swipeable stack.
- **TagPreferenceProfile**: A persistent on-device map of tag name → numeric weight score.
  Positive values indicate affinity; negative values indicate aversion; absent/zero is neutral.
  Updated after every swipe.
- **SeenList**: A persistent on-device set of recipe identifiers the user has already been shown.
  Consulted before every batch request to ensure uniqueness.
- **RecipeBatch**: A set of exactly 5 RecipeCard objects presented together as a swipeable stack.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see a complete recipe stack (all 5 cards with images loaded) within 5 seconds
  of confirming their ingredient photo on a standard mobile data connection.
- **SC-002**: Zero duplicate recipes are shown to a user across any number of sessions (0% repeat
  rate).
- **SC-003**: A new batch of recipes is presented automatically after all 5 cards are swiped, with
  no user-initiated action required.
- **SC-004**: Users can reach the full recipe detail screen (with ingredients and steps) in 2 taps
  or fewer from the camera screen.
- **SC-005**: After 10 or more directed swipes (consistently favouring or avoiding a specific tag),
  the proportion of recipes matching the liked tag in the next batch increases by at least 20%
  compared to the user's neutral first batch.
- **SC-006**: The preference profile and seen list are retained correctly after the app is closed
  and reopened — 100% persistence across sessions.
- **SC-007**: Every external service failure results in a visible error message with a retry option
  presented to the user — 0% silent failures.

## Assumptions

- Users are cooking at home and want recipe suggestions based on ingredients they already have.
- A live internet connection is required for AI recipe generation and image retrieval; fully
  offline use is out of scope.
- The camera screen is the app's home screen and the mandatory starting point for every session.
- Recipe uniqueness is determined by recipe name. Two recipes with identical names are treated as
  the same recipe for seen-list purposes.
- The seen list and preference profile are stored on the current device only; there is no
  cross-device sync, cloud backup, or user account system.
- A new batch is always generated from the most recently captured ingredient photo. To use
  different ingredients, the user must retake the photo.
- The AI service is expected to return well-structured, machine-readable recipe data. Malformed
  or schema-invalid responses are treated as errors and trigger the retry/error flow.
- Dish images from the image search service are decorative. They are expected to be visually
  relevant to the dish name but are not guaranteed to be exact matches.
- All required external service credentials are supplied by the developer via environment
  configuration before the app is run; the app will not launch without them.
