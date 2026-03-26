# smart_recipe_planner Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-26

## Active Technologies
- JavaScript (ES2022+), JSDoc annotations + `@anthropic-ai/sdk ^0.39.0` (messages + raw REST), `@react-native-async-storage/async-storage 2.2.0`, React Native Reanimated ~4.1.1 (002-recipe-match-score)
- AsyncStorage — new key `@srp/embedding_profile` (`{ vector: number[], count: number }`) (002-recipe-match-score)
- JavaScript (ES2022+) + React Native 0.81.5, Expo SDK 54, React Navigation (native stack) — all existing; no new packages (003-warm-ui-redesign)
- N/A — no storage changes (003-warm-ui-redesign)
- JavaScript (ES2022+), JSDoc annotations encouraged + Expo SDK 54, React Native 0.81.5, lottie-react-native (new — installed via `expo install`) (004-lottie-loading)

- JavaScript (ES2022+), Expo SDK 51, React Native 0.74 + expo-camera, @react-native-async-storage/async-storage, (001-recipe-swipe-stack)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

JavaScript (ES2022+), Expo SDK 51, React Native 0.74: Follow standard conventions

## Recent Changes
- 004-lottie-loading: Added JavaScript (ES2022+), JSDoc annotations encouraged + Expo SDK 54, React Native 0.81.5, lottie-react-native (new — installed via `expo install`)
- 003-warm-ui-redesign: Added JavaScript (ES2022+) + React Native 0.81.5, Expo SDK 54, React Navigation (native stack) — all existing; no new packages
- 002-recipe-match-score: Added JavaScript (ES2022+), JSDoc annotations + `@anthropic-ai/sdk ^0.39.0` (messages + raw REST), `@react-native-async-storage/async-storage 2.2.0`, React Native Reanimated ~4.1.1


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
