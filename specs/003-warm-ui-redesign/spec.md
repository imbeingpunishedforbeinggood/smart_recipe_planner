# Feature Specification: Warm UI Redesign

**Feature Branch**: `003-warm-ui-redesign`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User description: "UI polish and visual redesign — warm food-focused aesthetic with orange/red primary accent color (#FF6B35), off-white background (#FFFAF7), and consistent design language across all screens."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Polished Recipe Discovery Experience (Priority: P1)

A user opens the app and experiences a visually cohesive, warm aesthetic from the moment they arrive at the camera screen through browsing recipe cards. The camera screen displays the app name, a clearly styled capture button, and the recipe card stack shows rounded cards with warm shadows, orange tag chips, and match score badges that fit the design language. Every screen feels intentionally designed, not default.

**Why this priority**: The recipe card stack and camera screen are the primary surfaces users interact with. Visual polish here delivers immediate perceived quality and sets the tone for the whole app. This is the highest-traffic user path.

**Independent Test**: Launch the app on a device; the camera screen header, capture button, and recipe card stack (with styled cards, tag chips, and badges) can all be reviewed without navigating elsewhere. Any person viewing the app should be able to confirm the warm orange palette and rounded card aesthetic without knowing the technical implementation.

**Acceptance Scenarios**:

1. **Given** the app is launched, **When** the camera screen appears, **Then** the app title is visible in the header area, the background is off-white/warm, and the capture button is clearly styled and prominent.
2. **Given** the camera screen is shown, **When** the user observes the capture button, **Then** it is circular in shape and visually distinct from a plain default button.
3. **Given** a batch of recipe cards has loaded, **When** the user views the card stack, **Then** each card has visibly rounded corners, warm drop shadow, and recipe tags displayed as pill-shaped chips in an orange accent color.
4. **Given** a match score badge is present on a card, **When** the user views the card, **Then** the badge uses warm accent colors consistent with the rest of the design and is legible.

---

### User Story 2 - Recognisable Navigation Header on Recipe Stack (Priority: P2)

A user who has taken a photo and is browsing recipe cards sees a lightweight header above the card stack that lets them navigate back to retake their photo. The header is unobtrusive — it does not compete with the recipe cards — but is clearly available and styled to match the warm palette.

**Why this priority**: Discoverability of the retake-photo action reduces dead-ends where users feel stuck. It is a secondary surface and less visually complex than the card redesign, so it comes after P1.

**Independent Test**: Navigate to the recipe stack screen; confirm a header element is visible above the card stack with a retake action styled in the app's accent palette. No interaction with recipe cards is required to test this story independently.

**Acceptance Scenarios**:

1. **Given** the recipe stack screen is displayed, **When** the user looks at the top of the screen, **Then** a subtle header area is present above the card stack.
2. **Given** the header is present, **When** the user observes it, **Then** a "Retake photo" or equivalent button/link is visible and styled using the warm accent color.
3. **Given** the user taps the retake button, **When** the action completes, **Then** the user is returned to the camera screen.

---

### User Story 3 - Immersive Recipe Detail Reading Experience (Priority: P3)

A user who taps a recipe card to open its detail view sees a full-width hero image at the top, followed by well-spaced sections for ingredients and steps. Section headers use the orange accent color. Ingredients are listed with orange bullet points and steps have orange step numbers. The layout has generous padding and a clear typographic hierarchy that makes the recipe comfortable to read and follow while cooking.

**Why this priority**: The detail screen enhances the recipe-reading experience after discovery. It builds on P1 (card aesthetic) and P2 (navigation) and is testable independently by opening any recipe detail. It is lower priority because users must first discover recipes before reading them.

**Independent Test**: Navigate to any recipe detail screen; confirm the hero image, section header accent color, ingredient list markers, step numbers, and reading padding are all present and styled correctly, without needing to interact with the card stack or camera.

**Acceptance Scenarios**:

1. **Given** a recipe detail screen is open, **When** the user views the top of the screen, **Then** a large, full-width recipe image is displayed as a hero visual.
2. **Given** the hero image is displayed, **When** the user scrolls to the ingredients section, **Then** the "Ingredients" section header is displayed in the warm accent color and each ingredient is preceded by a coloured marker in the same accent palette.
3. **Given** the ingredients section is visible, **When** the user scrolls to the steps section, **Then** the "Steps" section header uses the accent color and each step is numbered with an accented number.
4. **Given** the recipe detail is fully displayed, **When** the user reads the content, **Then** the text has comfortable reading padding on both sides and a clear size hierarchy between headings, body text, and metadata.

---

### Edge Cases

- What happens when a recipe has no image? The hero image area should display a warm-toned placeholder rather than a broken image or blank space.
- What happens when a recipe has many tags (more than 4)? Tags should wrap gracefully within the card without overflowing or obscuring other card content.
- What happens when a match score badge is absent (new user)? The card layout should remain visually balanced without the badge — no empty space or mis-alignment.
- What happens on very small screens? Text and tap targets must remain legible and usable at the smallest common screen size in the target device range.
- What happens when a step description is very long? The detail screen must not clip text; all content must be scrollable and fully readable.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The camera screen MUST display the app name or brand title in a visible header area at the top of the screen.
- **FR-002**: The camera screen capture button MUST be circular in shape and styled with the warm accent color to make it the most visually prominent interactive element.
- **FR-003**: All app screens MUST use the off-white warm background color as the base background, replacing any plain white or grey defaults.
- **FR-004**: Recipe cards MUST display with rounded corners and a warm drop shadow that lifts the card visually above the background.
- **FR-005**: Recipe tag chips on cards MUST be displayed as pill-shaped labels with the orange accent color applied to either the background or the text.
- **FR-006**: The match score badge on recipe cards MUST be styled consistently with the warm accent palette and remain legible against the card image.
- **FR-007**: The recipe stack screen MUST include a header above the card stack that contains a clearly labelled action to retake the photo.
- **FR-008**: The retake photo action in the stack screen header MUST navigate the user back to the camera screen when activated.
- **FR-009**: The recipe detail screen MUST display a full-width hero image at the top, above all recipe text content.
- **FR-010**: The "Ingredients" and "Steps" section headers on the recipe detail screen MUST be rendered in the warm accent color to provide visual separation.
- **FR-011**: Each ingredient in the recipe detail MUST be preceded by a bullet point or marker rendered in the warm accent color.
- **FR-012**: Each step in the recipe detail MUST display its step number in the warm accent color.
- **FR-013**: The recipe detail screen MUST apply consistent horizontal padding to all text content to ensure comfortable reading line lengths.
- **FR-014**: All text across all screens MUST follow a clear typographic hierarchy with visually distinct sizes for titles, section headers, body text, and metadata/captions.

### Key Entities

- **Design Palette**: The visual system — warm accent color, off-white background, shadow style, and border-radius values — applied consistently across all screens and components.
- **Recipe Card**: The primary browsable unit; displays recipe name, image, tag chips, and optionally a match score badge. Styled with rounded corners and warm shadow.
- **Recipe Detail View**: Full recipe reading surface; hero image, ingredient list with accented markers, numbered steps with accented numerals, section headers in accent color.
- **Camera Screen**: Entry point of the app; displays app title and a styled circular capture button.
- **Recipe Stack Screen Header**: Lightweight header above the card stack; contains the retake photo action styled in the accent palette.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All four primary screens (camera, recipe stack, recipe card, recipe detail) are visually consistent — an observer can confirm all share the same accent color, background tone, and rounded visual language without any technical knowledge.
- **SC-002**: The capture button on the camera screen is identifiable as the primary action by 100% of first-time users viewing the screen (obvious primary call-to-action).
- **SC-003**: Recipe tags, match score badges, and ingredient markers all use the warm accent color — verified by visual inspection across at least 5 different recipes.
- **SC-004**: The recipe detail screen requires no horizontal scrolling; all text content is readable within the screen width on devices with screens 375px wide and above.
- **SC-005**: No existing functionality is broken by the visual changes — all navigation paths, swipe gestures, and recipe loading work identically after the redesign.
- **SC-006**: The retake photo button is visible on the recipe stack screen without the user needing to scroll or tap anything first.

## Assumptions

- All four screens in scope are already functional; this feature changes their visual presentation only, not their data or navigation logic.
- The app runs on iOS and Android; the redesign should look equally polished on both platforms, with no platform-specific visual treatment required.
- The warm accent color (#FF6B35) and off-white background (#FFFAF7) are confirmed design decisions and do not require further user research or A/B testing before implementation.
- The match score badge introduced in feature 002 will be restyled but its presence/absence logic remains unchanged.
- No new screens or navigation flows are introduced by this feature — all changes are to existing screens.
- Font faces will use the system default (San Francisco on iOS, Roboto on Android) with size and weight adjustments defining the typographic hierarchy; no custom font loading is required.
- The hero image on the recipe detail screen uses the same Unsplash-sourced image already loaded for the card view — no additional image fetching is needed.
