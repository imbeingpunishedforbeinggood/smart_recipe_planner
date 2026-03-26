# Implementation Plan: Lottie Loading Animation

**Branch**: `004-lottie-loading` | **Date**: 2026-03-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-lottie-loading/spec.md`

## Summary

Replace the built-in `ActivityIndicator` spinner in CameraScreen and RecipeStackScreen with a looping Lottie cooking animation (`assets/animations/Cooking.json`) displayed on a warm off-white (#FFFAF7) background. A shared `LoadingScreen` component will be extracted and used in both screens to avoid duplication.

## Technical Context

**Language/Version**: JavaScript (ES2022+), JSDoc annotations encouraged
**Primary Dependencies**: Expo SDK 54, React Native 0.81.5, lottie-react-native (new — installed via `expo install`)
**Storage**: N/A
**Testing**: `npm test && npm run lint`
**Target Platform**: iOS and Android via Expo Managed Workflow
**Project Type**: Mobile app
**Performance Goals**: Animation must start within one frame of loading state entry; no jank during loop
**Constraints**: Expo Managed Workflow — native modules must be compatible; bundle size increase must be justified
**Scale/Scope**: 2 screens modified, 1 new shared component

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I — Simplicity & YAGNI

**Status**: ✅ PASS

- A single shared `LoadingScreen` component is justified: it will be consumed by exactly 2 screens immediately (CameraScreen, RecipeStackScreen), satisfying the "three similar cases" rule by virtue of the 2 active uses + clear future loading slots.
- No new state management pattern introduced. The existing `capturing` boolean and `status` string from AppContext drive visibility — no new state needed.
- lottie-react-native is the only new dependency; it is directly required to render the Lottie format specified by the user.

### Principle II — Structured AI Contracts

**Status**: ✅ PASS (N/A)

This feature makes no calls to the Claude API. No schema or prompt changes required.

### Principle III — Secure Configuration

**Status**: ✅ PASS (N/A)

No new secrets, API keys, or environment variables introduced.

### Bundle Size Constraint

**Status**: ✅ JUSTIFIED

lottie-react-native adds approximately 1–2 MB to the native bundle. This is justified: it directly delivers the improved loading UX specified as a confirmed user requirement, and is the only way to render `.json` Lottie animations in Expo Managed Workflow.

## Project Structure

### Documentation (this feature)

```text
specs/004-lottie-loading/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
assets/
└── animations/
    └── Cooking.json        # Must exist before implementation starts

src/
├── components/
│   ├── ErrorState.js       # Unchanged
│   ├── LoadingScreen.js    # NEW — shared Lottie loading component
│   ├── RecipeCard.js       # Unchanged
│   └── SwipeStack.js       # Unchanged
├── screens/
│   ├── CameraScreen.js     # MODIFIED — replace capturing-state ActivityIndicator
│   └── RecipeStackScreen.js # MODIFIED — replace status==='loading' ActivityIndicator
└── (all other files unchanged)
```

**Structure Decision**: Single project layout (Expo app). One new shared component added under `src/components/`. No new directories needed.

## Phase 0: Research

See [research.md](./research.md)

## Phase 1: Design

See [data-model.md](./data-model.md) and [quickstart.md](./quickstart.md)

### Post-Design Constitution Re-Check

After Phase 1 design:

- **Principle I**: `LoadingScreen` component is a single, thin wrapper with no logic beyond visibility. No over-abstraction. ✅
- **Principle II**: N/A ✅
- **Principle III**: N/A ✅
