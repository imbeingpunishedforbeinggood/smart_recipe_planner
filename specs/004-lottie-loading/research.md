# Research: Lottie Loading Animation

**Feature**: 004-lottie-loading
**Date**: 2026-03-26

## Decision 1: Lottie Library for Expo SDK 54

**Decision**: Use `lottie-react-native` installed via `npx expo install lottie-react-native`

**Rationale**: `lottie-react-native` is the canonical library for rendering Lottie `.json` animations in React Native. The `expo install` command (rather than `npm install`) pins the version that Expo SDK 54 has validated for compatibility, ensuring no native module mismatch in Expo Managed Workflow.

**Alternatives considered**:
- `react-native-lottie` — outdated fork, not maintained
- Rendering Lottie via WebView — significant overhead, poor performance
- Converting `.json` to GIF/APNG — loses resolution independence, increases asset size

---

## Decision 2: Shared LoadingScreen Component vs. Inline Duplication

**Decision**: Extract a single shared `LoadingScreen` component at `src/components/LoadingScreen.js`

**Rationale**: The animation is identical in both loading contexts (same asset, same background color, same centered layout). Extracting it avoids duplicating the Lottie import, the style block, and the background color constant in two files. It also makes future loading states easy to adopt.

**Alternatives considered**:
- Inline in each screen — would duplicate the Lottie import, `require()` path, and styles in both CameraScreen and RecipeStackScreen
- Higher-order component/hook — overkill for a presentational-only element with no logic

---

## Decision 3: CameraScreen Loading Scope — Full-Screen vs. In-Button

**Decision**: Replace the in-button `ActivityIndicator` with a full-screen `LoadingScreen` overlay rendered when `capturing === true`

**Rationale**: The user description specifies "between taking a photo and the recipe stack appearing" with a full-screen warm background and centered animation. The current in-button spinner is a small inline indicator. The correct UX is a full-screen loading state that covers the camera viewfinder, matching the RecipeStackScreen treatment and the user's intent.

**Implementation note**: When `capturing === true`, render `<LoadingScreen />` instead of the camera UI. The existing `finally` block that sets `capturing = false` requires no changes — the navigation to RecipeStackScreen still happens after capture completes.

**Alternatives considered**:
- Keep the button indicator and add a separate overlay — two loading states in one screen; more complex and inconsistent
- Use a modal — adds navigation stack complexity for a purely visual concern

---

## Decision 4: CameraScreen Permission Spinner (Line 21)

**Decision**: Leave the permission-check spinner (`if (!permission)`) unchanged

**Rationale**: This is a one-time, sub-second check at app launch before the camera is ready. It is not the "loading" state the user specified (which is about recipe loading). Replacing it would pull in lottie-react-native before we know the camera is ready, and the user description does not mention it. Keeping it as-is follows YAGNI.

---

## Decision 5: Animation Size and Styling

**Decision**: Render the animation at a fixed `240×240` logical pixel square, centered both horizontally and vertically on the screen

**Rationale**: No explicit size was specified. 240×240 is a common safe size for full-screen centered Lottie animations on both small (iPhone SE) and large (iPad) screens — large enough to be visually prominent without overflowing smaller devices. The `LoadingScreen` component will use `flex: 1` plus `alignItems: center` + `justifyContent: center` to center regardless of device size.

**Alternatives considered**:
- Full-screen fill — most Lottie animations are not designed as full-bleed; this often distorts cooking-themed animations
- Proportional sizing via `Dimensions` — adds complexity; fixed size is the right default per YAGNI

---

## Decision 6: `autoPlay` vs. manual `play()` call

**Decision**: Use `autoPlay` and `loop` props on the `LottieView` component; no imperative play/stop needed

**Rationale**: The `LoadingScreen` component is conditionally rendered (only mounted when loading). When it mounts, `autoPlay` starts the animation immediately. When loading ends, the component unmounts, stopping the animation automatically. No ref or imperative control required.

**Alternatives considered**:
- Ref + `play()`/`reset()` — required only when the component stays mounted and visibility is toggled; not applicable here since we mount/unmount on loading state change

---

## Resolved Unknowns

| Unknown | Resolution |
|---------|------------|
| Compatible lottie-react-native version for SDK 54 | Use `expo install` — Expo resolves the compatible version automatically |
| Animation size | 240×240 logical pixels, centered |
| CameraScreen loading scope | Full-screen overlay when `capturing === true` |
| Permission spinner | Unchanged (out of scope) |
| Play control mechanism | `autoPlay` + `loop` props; mount/unmount controls lifecycle |
