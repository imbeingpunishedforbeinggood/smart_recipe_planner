# Research: Smart Recipe Planner

**Feature**: 001-recipe-swipe-stack
**Date**: 2026-03-24
**Status**: Complete — all unknowns resolved

---

## 1. Claude Vision API — Multimodal Image Input + Structured JSON Output

### Decision
Use the `@anthropic-ai/sdk` npm package. Send the captured ingredient photo as a
base64-encoded image in the `content` array of the user message alongside a text
prompt that instructs Claude to return a strict JSON object.

### Approach

```js
// claudeService.js (outline)
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Constants.expoConfig.extra.claudeApiKey });

const response = await client.messages.create({
  model: 'claude-opus-4-6',           // most capable vision model
  max_tokens: 4096,
  system: SYSTEM_PROMPT,              // defines JSON schema + validation rules
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64ImageData,     // from expo-camera captureAsync()
          },
        },
        { type: 'text', text: USER_PROMPT },
      ],
    },
  ],
});
const raw = response.content[0].text;
const parsed = JSON.parse(raw);        // then validate against schema
```

### System Prompt Strategy
The system prompt instructs Claude to:
1. Return **only** valid JSON matching the canonical recipe schema (no preamble, no markdown code fences).
2. Generate exactly 5 recipes using only ingredients visible in the photo (or plausibly on hand).
3. Exclude any recipe whose `id` appears in the provided `seenIds` array.
4. Weight suggestions toward tags with positive scores in the `tagProfile` map, and away from tags
   with negative scores.

### Rationale
- `@anthropic-ai/sdk` handles auth, retries, and response parsing cleanly in a JS environment.
- Base64 image input is the correct approach for React Native (no server relay needed).
- Structured JSON via system prompt is more reliable than tool_use for this use case because the
  entire response IS the structured data (no tool call round-trip needed).
- `claude-opus-4-6` is chosen for its superior vision and instruction-following capability,
  which matters for reliable schema adherence.

### Alternatives Considered
- **Tool use (function calling)**: Would work but adds unnecessary round-trip complexity when the
  full response should always be structured JSON. System prompt approach is simpler.
- **Direct fetch to Anthropic API**: Works but `@anthropic-ai/sdk` is the canonical client and
  handles edge cases (streaming, error types) more robustly.

---

## 2. Expo Camera — Capturing Photo as Base64

### Decision
Use `expo-camera` with `captureAsync({ base64: true })` to capture a JPEG and obtain
the base64 string directly on-device.

### Approach

```js
import { CameraView, useCameraPermissions } from 'expo-camera';

// In CameraScreen.js:
const cameraRef = useRef(null);

const takePicture = async () => {
  const photo = await cameraRef.current.takePictureAsync({
    quality: 0.7,          // compress to reduce API payload size
    base64: true,
    exif: false,
  });
  // photo.base64 is the raw base64 string (no data URI prefix)
  // photo.uri is the local file URI (for display in RecipeStackScreen)
  navigate('RecipeStack', { photoUri: photo.uri, photoBase64: photo.base64 });
};
```

### Rationale
- `quality: 0.7` balances Claude's image recognition accuracy against API payload size
  (~150–400 KB per image at this quality, well within Claude's limits).
- Passing both `uri` (for local preview display) and `base64` (for API upload) from the
  same capture avoids a second encode step.
- `expo-camera` v14+ (Expo SDK 51) uses the `CameraView` component API.

### Alternatives Considered
- **expo-image-picker**: Lets users pick from library too. Kept out of scope (v1 is camera-only
  per spec). Can be added later without changing the service layer.
- **expo-file-system readAsStringAsync**: Could read the URI as base64 after capture, but
  capturing base64 directly is one fewer async step.

---

## 3. Swipe Card Gesture — react-native-gesture-handler + react-native-reanimated

### Decision
Use `react-native-gesture-handler`'s `PanGesture` with `react-native-reanimated` shared
values to drive a spring-physics card dismiss animation. Each card is an absolute-positioned
`Animated.View` with a `GestureDetector`.

### Pattern

```js
// RecipeCard.js (outline)
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, runOnJS,
} from 'react-native-reanimated';

const translateX = useSharedValue(0);
const rotate = useSharedValue(0);

const pan = Gesture.Pan()
  .onUpdate((e) => {
    translateX.value = e.translationX;
    rotate.value = e.translationX / 20;   // subtle tilt
  })
  .onEnd((e) => {
    const SWIPE_THRESHOLD = 120;
    if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
      const direction = e.translationX > 0 ? 'right' : 'left';
      translateX.value = withSpring(
        direction === 'right' ? 500 : -500,
        {},
        () => runOnJS(onSwiped)(direction),
      );
    } else {
      translateX.value = withSpring(0);   // snap back
      rotate.value = withSpring(0);
    }
  });
```

### Stack Rendering
`SwipeStack.js` renders 5 `RecipeCard` components in reverse z-order (index 4 → 0).
The top card (index 0) receives the `PanGesture`; cards below are scale/translate-shifted
slightly to create a depth effect. When the top card is dismissed, the component array
is shifted.

### Rationale
- `react-native-reanimated` worklet animations run on the UI thread, giving 60 fps swipe
  feel on older devices.
- Both packages are included in Expo SDK 51 and require no additional native linking in
  Managed Workflow.
- SWIPE_THRESHOLD of 120 px is standard for card-stack UX (comfortable for one-handed
  thumb reach on mid-size phones).

### Alternatives Considered
- **react-native-deck-swiper**: Third-party library that adds abstraction and a dependency.
  Rejected (Principle I — build from gesture primitives since the team controls complexity).
- **Animated API (legacy)**: JS-driven, not UI-thread. Rejected for performance.

---

## 4. Unsplash API — Photo Search

### Decision
Use the Unsplash `/search/photos` REST endpoint with a `Client-ID` authorization header.
Fetch the first result for the `imageSearchQuery` field returned by Claude. All 5 fetches
run in parallel via `Promise.all`.

### Approach

```js
// unsplashService.js
const BASE = 'https://api.unsplash.com';

export async function fetchDishImage(query, accessKey) {
  const url = `${BASE}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });
  if (!res.ok) return null;   // caller falls back to placeholder
  const data = await res.json();
  return data.results[0]?.urls?.regular ?? null;
}

// In claudeService.js / RecipeStackScreen.js:
const imageUrls = await Promise.all(
  recipes.map((r) => fetchDishImage(r.imageSearchQuery, unsplashKey))
);
```

### Rate Limits
- Unsplash Demo apps: 50 requests/hour. Each batch of 5 recipes = 5 requests.
- At 50 req/hr the app can serve 10 full batches per hour — adequate for personal use.
- Production: apply for Unsplash Production status (unlimited).

### Rationale
- Unsplash free tier is sufficient for v1 personal use; no backend relay needed.
- `Promise.all` for parallel fetches satisfies SC-001 (5 s stack load) and FR-006.
- Returning `null` on failure and mapping to a placeholder in the UI satisfies the
  "missing image" edge case cleanly.

### Alternatives Considered
- **Pexels API**: Similar free tier, slightly less relevant photography. Unsplash chosen
  for image quality and food photography catalogue.
- **Hardcoded placeholder**: Would fail SC-001 on first impressions. Rejected.

---

## 5. AsyncStorage — Persistence Patterns

### Decision
Store two independent keys in AsyncStorage:
- `@srp/seen_list` → JSON array of recipe ID strings
- `@srp/tag_profile` → JSON object `{ [tagName]: number }`

Encapsulate all reads/writes in `storage/seenList.js` and `storage/tagProfile.js`.

### Approach

```js
// storage/seenList.js
import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = '@srp/seen_list';

export async function getSeenIds() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}
export async function addSeenIds(newIds) {
  const current = await getSeenIds();
  const updated = [...new Set([...current, ...newIds])];
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

// storage/tagProfile.js
const KEY = '@srp/tag_profile';

export async function getTagProfile() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
}
export async function updateTagProfile(tags, direction) {
  const profile = await getTagProfile();
  const delta = direction === 'right' ? 1 : -1;
  tags.forEach((tag) => {
    profile[tag] = (profile[tag] ?? 0) + delta;
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
}
```

### Rationale
- Separate keys → independent read/write without re-serialising unrelated data.
- `@srp/` prefix namespaces keys to avoid collisions if other packages use AsyncStorage.
- `Set` deduplication on `addSeenIds` prevents the seen list from growing with duplicates
  (harmless but wasteful otherwise).
- Encapsulating AsyncStorage in storage/ modules means the rest of the app never calls
  AsyncStorage directly, simplifying test isolation.

### Alternatives Considered
- **expo-secure-store**: Designed for secrets (small payloads, encrypted). Not appropriate
  for potentially large seen-list arrays.
- **MMKV (react-native-mmkv)**: Faster synchronous storage, but requires native module
  linking incompatible with Expo Go. Rejected until/unless EAS Build is the primary dev
  workflow.

---

## 6. Environment Variable Injection (Expo + app.config.js)

### Decision

```js
// app.config.js
import 'dotenv/config';   // requires: npm install dotenv

export default {
  name: 'Smart Recipe Planner',
  slug: 'smart-recipe-planner',
  extra: {
    claudeApiKey: process.env.CLAUDE_API_KEY,
    unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
  },
};
```

```js
// Any service file
import Constants from 'expo-constants';
const { claudeApiKey, unsplashAccessKey } = Constants.expoConfig.extra;
```

### .env.example

```
CLAUDE_API_KEY=
UNSPLASH_ACCESS_KEY=
```

### Rationale
- `dotenv` + `app.config.js` is the official Expo pattern for injecting secrets without
  hardcoding them. Keys never appear in the compiled JS bundle as string literals.
- `expo-constants` is always available in Managed Workflow; no additional dependency.
- For production (EAS Build), the same variables are set as EAS Secrets and injected
  at build time — no code change required.

---

## Summary of All Decisions

| Area                        | Decision                                          |
|-----------------------------|---------------------------------------------------|
| AI recipe generation        | Claude claude-opus-4-6 vision via @anthropic-ai/sdk |
| Structured output           | System prompt + JSON.parse + schema validation    |
| Camera capture              | expo-camera captureAsync (base64 + uri)           |
| Swipe gestures              | react-native-gesture-handler + reanimated PanGesture |
| Dish images                 | Unsplash /search/photos, Promise.all for parallel |
| On-device persistence       | AsyncStorage via storage/ module layer            |
| Environment variables       | dotenv + app.config.js extra + expo-constants     |
