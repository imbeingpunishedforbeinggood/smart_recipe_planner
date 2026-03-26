# Feature Specification: Lottie Loading Animation

**Feature Branch**: `004-lottie-loading`
**Created**: 2026-03-26
**Status**: Draft
**Input**: User description: "Replace the loading spinner with a Lottie animation — when the app is waiting for recipes to load (between taking a photo and the recipe stack appearing, and between batches), display a Lottie animation from assets/animations/Cooking.json instead of the current ActivityIndicator spinner. Install lottie-react-native via expo install. The animation should loop continuously while loading and stop when the recipe stack is ready to display. The loading screen should have the warm off-white background (#FFFAF7) from the existing theme and the animation should be centered on screen. The current ActivityIndicator in CameraScreen.js and any loading state in RecipeStackScreen.js should be replaced with this animation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Animated Loading After Photo Capture (Priority: P1)

After the user takes a photo of their ingredients, the app begins processing. Instead of a plain spinner, the user sees a themed cooking animation on a warm off-white background while they wait for recipes to appear.

**Why this priority**: This is the primary loading moment in the app — every user experiences it every time they use the core feature. Replacing the generic spinner with a branded, on-theme animation reinforces the app's identity and reduces perceived wait time.

**Independent Test**: Can be fully tested by taking a photo and observing the loading screen — delivers the improved waiting experience for the most common user journey.

**Acceptance Scenarios**:

1. **Given** the user has just taken a photo of ingredients, **When** the app begins processing the image, **Then** a looping cooking animation appears centered on a warm off-white background screen
2. **Given** the cooking animation is playing, **When** recipe results become available, **Then** the animation stops and the recipe stack appears immediately
3. **Given** the app is displaying the cooking animation, **When** loading is still in progress, **Then** the animation loops continuously without pausing or restarting visibly

---

### User Story 2 - Animated Loading Between Recipe Batches (Priority: P2)

When the user has swiped through the current batch of recipes and the app loads additional recipes, the same cooking animation is shown, providing a consistent experience throughout the session.

**Why this priority**: Consistency in the loading experience matters for polish and trust. Users who see different loading indicators within the same session may perceive the app as unfinished.

**Independent Test**: Can be tested by exhausting an initial batch of recipes and observing the between-batch loading state.

**Acceptance Scenarios**:

1. **Given** the user has reached the end of the current recipe batch, **When** the app loads the next batch, **Then** the same cooking animation is shown on the warm off-white background
2. **Given** the cooking animation is playing between batches, **When** the next batch of recipes is ready, **Then** the animation stops and the recipe stack resumes

---

### Edge Cases

- What happens when the animation file is missing or fails to load? The app should fall back gracefully rather than crashing, showing a minimal loading indicator.
- What happens if results return almost instantly (under 200ms)? The animation should still display briefly rather than flashing.
- What happens if the user navigates away while the loading animation is displayed? The animation stops and no stale loading state is shown on return.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST display a cooking-themed animation on the loading screen whenever it is processing a photo and waiting for recipes to appear
- **FR-002**: The app MUST display the same cooking-themed animation whenever it is loading additional recipe batches between swipes
- **FR-003**: The loading animation MUST loop continuously for the entire duration of the loading state
- **FR-004**: The loading animation MUST stop and recipe content MUST appear as soon as results are ready
- **FR-005**: The loading screen MUST use the warm off-white background color (#FFFAF7) consistent with the existing app theme
- **FR-006**: The loading animation MUST be centered on the loading screen
- **FR-007**: The cooking animation asset (Cooking.json) MUST be the animation displayed during all loading states covered by this feature
- **FR-008**: The previously used generic spinner MUST be removed from all loading states replaced by this feature

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of loading states in the photo-to-recipe and between-batch flows display the cooking animation rather than a generic spinner
- **SC-002**: The loading animation begins playing within one frame of entering the loading state — no visible blank or spinner moment before animation starts
- **SC-003**: The animation loops without any visible pause or restart artifact for loading durations up to 60 seconds
- **SC-004**: The loading screen background color matches the app's warm off-white theme (#FFFAF7) as verified visually on both iOS and Android
- **SC-005**: When recipes are ready, the transition from loading animation to recipe stack completes with no flash of blank content

## Assumptions

- The cooking animation asset (`Cooking.json`) already exists in the project assets and is valid — no animation creation is required as part of this feature
- The warm off-white background color (#FFFAF7) is already defined in the app's theme and does not need to be introduced new
- The two loading states in scope are: (1) post-photo-capture loading in the camera flow, and (2) between-batch loading in the recipe stack flow — no other spinners are in scope for this feature
- The animation displays at a visually balanced fixed size (not full-screen fill); exact dimensions to be determined during implementation based on the animation's aspect ratio
- No text label or progress indicator is required alongside the animation
- The app targets both iOS and Android; the animation must render correctly on both platforms
