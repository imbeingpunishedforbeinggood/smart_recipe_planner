# Quickstart: Warm UI Redesign

**Branch**: `003-warm-ui-redesign` | **Date**: 2026-03-25

A visual verification guide for the warm redesign. No code changes to logic — verification is done by inspection.

---

## Files Created

```
src/constants/theme.js
```

## Files Modified

```
src/screens/CameraScreen.js
src/screens/RecipeStackScreen.js
src/screens/RecipeDetailScreen.js
src/components/RecipeCard.js
```

---

## Implementation Order

1. **`src/constants/theme.js`** — define all tokens; used by everything else
2. **`src/components/RecipeCard.js`** — update tag chips, border, shadow, badge color
3. **`src/screens/RecipeDetailScreen.js`** — hero image, accent headers/bullets/numbers, warm background
4. **`src/screens/RecipeStackScreen.js`** — warm background, retake header
5. **`src/screens/CameraScreen.js`** — app title, orange capture button

---

## Visual Verification Scenarios

### Scenario A: Camera Screen

1. Launch the app fresh.
2. **Expected**:
   - App title visible at top of camera view (white text on camera feed).
   - Capture button is circular with orange ring and orange inner fill.
   - Background during permission loading is dark; no visible off-white background.

### Scenario B: Recipe Stack Screen

1. Take a photo to navigate to the recipe stack.
2. **Expected**:
   - Background behind the card stack is warm off-white (`#FFFAF7`), not grey.
   - A "← Retake photo" link in orange appears above the card stack.
   - Tapping it returns to the Camera screen.

### Scenario C: Recipe Cards

1. Wait for a batch of 5 recipe cards to load.
2. **Expected**:
   - Each card has a warm-tinted orange shadow (not hard grey).
   - Tag chips show orange text on a light orange background — not grey pills.
   - Card border is a warm off-white tone, not cool grey.
   - If a match score badge is present, it uses `#FF6B35` for the percentage text.

### Scenario D: Recipe Detail Screen

1. Tap a recipe card to open its detail view.
2. **Expected**:
   - A full-width hero image fills the top of the screen (300px tall, edge-to-edge).
   - "Ingredients" header is in orange, not black.
   - Each ingredient has an orange `•` bullet.
   - "Instructions" or "Steps" header is in orange.
   - Each step number is in orange.
   - Horizontal reading padding is comfortable (24px each side).
   - Background is warm off-white, not grey-white.

### Scenario E: Consistency check

1. Navigate through all screens in sequence: Camera → Stack → Card detail → Back → Stack.
2. **Expected**: Orange `#FF6B35` is the only accent color used throughout; no leftover grey or blue accents.

---

## Design Token Reference

| What you see | Token | Hex |
|---|---|---|
| Accent (buttons, headers, bullets) | `THEME.accent` | `#FF6B35` |
| Tag chip background | `THEME.accentBg` | `rgba(255,107,53,0.12)` |
| All screen backgrounds | `THEME.background` | `#FFFAF7` |
| Card surface | `THEME.cardBg` | `#FFFFFF` |
| Card border | `THEME.border` | `#E8E0D8` |

---

## What Is Not Tested Here

- Match score badge logic (unchanged from feature 002)
- Swipe gesture behaviour (unchanged)
- Recipe fetch and image load (unchanged)
- Camera permissions flow (not restyled in this feature)
