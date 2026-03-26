# Quickstart: Smart Recipe Planner

**Date**: 2026-03-24
**Target**: Developer setting up the project for the first time

---

## Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli` (or use `npx expo`)
- Expo Go app installed on an iOS or Android device (or use a simulator)
- A Claude API key (from [console.anthropic.com](https://console.anthropic.com))
- An Unsplash Developer access key (from [unsplash.com/developers](https://unsplash.com/developers))

---

## 1. Install Dependencies

```bash
npm install
```

This installs all packages defined in `package.json`, including:
- `expo`, `react-native`, `react-navigation`
- `expo-camera`, `@react-native-async-storage/async-storage`
- `react-native-gesture-handler`, `react-native-reanimated`
- `@anthropic-ai/sdk`, `dotenv`, `expo-constants`

---

## 2. Configure Environment Variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env
```

Edit `.env`:

```
CLAUDE_API_KEY=sk-ant-...your-key-here...
UNSPLASH_ACCESS_KEY=...your-access-key-here...
```

> **Never commit `.env`** — it is listed in `.gitignore`.

---

## 3. Start the Development Server

```bash
npx expo start
```

- Scan the QR code with Expo Go (iOS: Camera app; Android: Expo Go app).
- Press `i` for iOS simulator or `a` for Android emulator.

---

## 4. Verify the App

1. **Camera screen** appears on launch. Grant camera permission when prompted.
2. Point the camera at any food items (or a printed photo of ingredients).
3. Tap the capture button.
4. The **recipe stack screen** loads. After a few seconds, 5 recipe cards appear, each
   with a dish image.
5. Swipe a card **right** (like) or **left** (dismiss).
6. Tap any card to open the **recipe detail screen** — verify ingredients and steps.
7. Press back to return to the stack.
8. Swipe all 5 cards — a new batch should load automatically.

---

## 5. Validate Key Behaviours

### Seen-list deduplication
After completing several batches, check AsyncStorage:
```js
// In a test or debug screen:
import AsyncStorage from '@react-native-async-storage/async-storage';
const ids = await AsyncStorage.getItem('@srp/seen_list');
console.log(JSON.parse(ids));  // should grow with each batch; no duplicates
```

### Tag preference profile
After swiping, verify the profile is updating:
```js
const profile = await AsyncStorage.getItem('@srp/tag_profile');
console.log(JSON.parse(profile));  // should show non-zero scores for swiped tags
```

### Offline error state
1. Disable Wi-Fi / mobile data.
2. Attempt to capture an ingredient photo.
3. Verify the error state component appears with a retry button (no crash).

---

## 6. Common Issues

| Problem                                | Fix                                                          |
|----------------------------------------|--------------------------------------------------------------|
| "Constants.expoConfig.extra is undefined" | Ensure `app.config.js` exports a function reading from `process.env` via `dotenv/config` |
| Camera permission denied               | Reset permissions in device Settings → Expo Go              |
| Claude returns non-JSON text           | Schema validation error — check system prompt in `claudeService.js` |
| Unsplash returns 401                   | `UNSPLASH_ACCESS_KEY` missing or incorrect in `.env`         |
| Swipe gestures not registering         | Wrap app root with `<GestureHandlerRootView>` in `AppNavigator.js` |

---

## 7. Project Entry Points

| File                         | Purpose                                           |
|------------------------------|---------------------------------------------------|
| `app.config.js`              | Expo config; secret injection                     |
| `src/navigation/AppNavigator.js` | Navigation tree; wrap with GestureHandlerRootView |
| `src/schemas/recipe.js`      | **Start here** — canonical Claude response schema |
| `src/services/claudeService.js` | Claude prompt + validation logic               |
| `src/services/unsplashService.js` | Parallel image fetch                         |
| `src/storage/seenList.js`    | Seen-recipe persistence                           |
| `src/storage/tagProfile.js`  | Preference profile persistence                    |
