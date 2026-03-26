# Data Model: Lottie Loading Animation

**Feature**: 004-lottie-loading
**Date**: 2026-03-26

## Overview

This feature introduces no new data entities and requires no changes to AsyncStorage, AppContext state, or the recipe schema. It is a purely presentational change.

## Existing State Used (Unchanged)

### `capturing` — CameraScreen local state

| Field | Type | Values | Meaning |
|-------|------|--------|---------|
| `capturing` | boolean | `true` / `false` | `true` while a photo is being captured and processed; controls LoadingScreen visibility in CameraScreen |

**Source**: `useState(false)` in CameraScreen.js — no change to state shape or ownership.

### `status` — AppContext global state

| Field | Type | Values | Meaning |
|-------|------|--------|---------|
| `status` | string | `'idle'` / `'loading'` / `'showing'` / `'error'` | `'loading'` while recipe batch is being fetched; controls LoadingScreen visibility in RecipeStackScreen |

**Source**: `AppContext.js` — no change to state shape or ownership.

## New UI Entity: LoadingScreen Component

This component is not a data entity — it is a stateless presentational component. Documented here for completeness.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| *(none)* | — | — | Component accepts no props; all styling and animation source are fixed internally |

**Renders**: A full-screen view with background color `#FFFAF7`, containing a centered `LottieView` sourced from `assets/animations/Cooking.json`, with `autoPlay` and `loop` enabled.

## State Transition Impact

No state transitions change. The only change is which UI is rendered at existing transition points:

```
CameraScreen:
  capturing = false  →  camera viewfinder UI (unchanged)
  capturing = true   →  LoadingScreen (was: in-button ActivityIndicator)

RecipeStackScreen:
  status = 'loading' →  LoadingScreen (was: centered ActivityIndicator + text)
  status = 'showing' →  SwipeStack (unchanged)
  status = 'error'   →  ErrorState (unchanged)
```
