# Research: Warm UI Redesign

**Branch**: `003-warm-ui-redesign` | **Date**: 2026-03-25

All findings are based on reading the existing codebase — no external research needed. This is a pure style update with no new technology decisions.

---

## Finding 1: Shared Design Token File

**Decision**: Create `src/constants/theme.js` exporting a frozen `THEME` object with all palette values, shadow presets, and border-radius constants.

**Rationale**: Four files (CameraScreen, RecipeStackScreen, RecipeDetailScreen, RecipeCard) all consume the accent color and/or background color. Repeating the hex string in each file would make a future palette change require 4+ edits. Per Constitution Principle I, this crosses the three-consumer threshold for a shared utility.

**Alternatives considered**: Inline the values in each component → rejected (four identical colour strings to maintain); CSS-in-JS theme provider → rejected (overkill for a mobile app with static theming needs, violates YAGNI).

---

## Finding 2: Camera Screen — App Title Placement

**Decision**: Render the app title as a `Text` element inside the existing `overlay` View, above the existing hint text. The overlay sits atop the camera live view, so the title floats over the camera feed in the top-centre area. A `SafeAreaView` wrapper (or top padding) ensures the title clears the device notch/status bar.

**Rationale**: The camera view is `flex: 1` and covers the full screen. The overlay already uses `justifyContent: 'flex-end'` to push content to the bottom. For the title, the `overlay` layout can be changed to use a `SpaceBetween` approach (title at top, capture controls at bottom) — matching the Airbnb/Tasty aesthetic where the screen identity is clear even on camera.

**App name**: "Snap & Cook" — inferred from the recipe-photo workflow. This can be any short, appetizing name; exact text is an implementation choice, not a spec requirement.

**Alternatives considered**: Render outside CameraView (in the outer container) → rejected because the camera already fills the container; add a React Navigation header → rejected because headerShown: false is intentional for full-bleed camera UX.

---

## Finding 3: Camera Capture Button — Warm Accent

**Decision**: The outer ring of the capture button changes from `borderColor: '#fff'` to the warm accent `#FF6B35`. The inner circle changes from `backgroundColor: '#fff'` to `#FF6B35`. On `capturing`, show the spinner in `#FF6B35`.

**Rationale**: The capture button is the primary CTA. Using the accent color establishes orange as "action" from the very first screen. The circular shape (borderRadius 36 on a 72×72 element) already exists — no geometry changes needed.

---

## Finding 4: RecipeStackScreen — Retake Photo Header

**Decision**: Add a lightweight `View` header between the outer container and the `SwipeStack`, containing a `Pressable` "← Retake photo" element. Tapping it calls `navigation.navigate('Camera')`.

**Navigation mechanics**: The stack is `Camera → RecipeStack`. `navigation.navigate('Camera')` returns to the existing Camera screen instance (React Navigation reuses it) rather than pushing a new one. This avoids a stale photo being displayed on the re-opened Camera screen since CameraScreen re-initialises its ref on mount.

**Rationale**: The existing `RecipeStackScreen` already receives `navigation` as a prop. No new navigation setup needed. The header should be visually subtle — small font, accent-colored text — so it doesn't compete with the recipe cards.

---

## Finding 5: RecipeDetailScreen — Hero Image

**Decision**: Increase the hero image height from `260` to `300` and remove the `paddingHorizontal` from the image container so it bleeds edge-to-edge. The image already uses `width: '100%'` and `resizeMode: "cover"` so it will fill correctly.

**Rationale**: At 300px with full bleed, the hero image creates a strong visual entry point. The existing `ScrollView` already scrolls, so the taller image doesn't clip content.

---

## Finding 6: RecipeDetailScreen — Navigation Header

**Decision**: Leave the React Navigation header (`headerShown: true`) in place for RecipeDetail. Its `title: 'Recipe'` default title will be styled to match the warm palette in `AppNavigator.js` via `screenOptions` (optional polish). No structural change to the back-navigation UX.

**Rationale**: The system header provides free back-navigation. Replacing it with a custom header adds complexity without user value.

---

## Finding 7: Tag Chip Colour

**Decision**: RecipeCard tag chips change from `backgroundColor: '#f0f0f0'` / `color: '#444'` to `backgroundColor: 'rgba(255,107,53,0.12)'` (10% orange tint) with `color: '#FF6B35'` text. RecipeDetailScreen tags get the same treatment.

**Rationale**: A fully opaque orange pill on a white card would be visually aggressive. A 12% tint creates a warm, food-forward feel without overwhelming. The text color at `#FF6B35` directly provides the accent while remaining WCAG AA compliant against the tinted background.

**Alternatives considered**: Solid `#FF6B35` pill with white text → rejected (too heavy on small chips, competes with the badge); grey chips unchanged → rejected (violates the warm theme goal).

---

## Finding 8: Match Score Badge — Theme Alignment

**Decision**: The badge background changes from `rgba(0,0,0,0.55)` to `rgba(0,0,0,0.50)` (no meaningful change). The badge text color updates from `#F97316` (Tailwind orange-500) to `#FF6B35` (the confirmed accent) to be in sync with the design system. Update via the shared `THEME` constant.

**Rationale**: `#F97316` and `#FF6B35` are very similar but the spec specifies `#FF6B35` as the single source of truth. Centralising via `THEME.accent` means both values are replaced in one place.

---

## Finding 9: Typography Hierarchy (no new fonts)

**Decision**: Use system fonts with the following size/weight hierarchy across all screens:

| Role | Size | Weight | Color |
|---|---|---|---|
| Screen title (camera) | 28 | 700 | white |
| Card/detail recipe name | 20–24 | 700 | #1A1A1A |
| Section headers | 18 | 700 | #FF6B35 |
| Body text | 15 | 400 | #444 |
| Meta / captions | 13 | 400 | #888 |
| Tag chip text | 12 | 600 | #FF6B35 |

**Rationale**: No custom fonts needed — the system defaults (SF Pro / Roboto) are clean and well-suited to a recipe app. Weight and size variation alone creates clear hierarchy.
