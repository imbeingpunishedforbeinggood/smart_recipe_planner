# Quickstart: Lottie Loading Animation

**Feature**: 004-lottie-loading
**Date**: 2026-03-26

## Prerequisites

- `assets/animations/Cooking.json` must exist in the project root before implementation starts
- Expo SDK 54, React Native 0.81.5 (already in place)

## Step 1: Install lottie-react-native

```bash
npx expo install lottie-react-native
```

This pins the Expo-compatible version automatically. No manual version selection needed.

## Step 2: Create the shared LoadingScreen component

**File**: `src/components/LoadingScreen.js`

The component renders a full-screen centered Lottie animation on the warm off-white background. It accepts no props — mount it when loading, unmount it when done.

Key props on `LottieView`:
- `source={require('../../assets/animations/Cooking.json')}`
- `autoPlay`
- `loop`
- `style={{ width: 240, height: 240 }}`

Background: `{ flex: 1, backgroundColor: '#FFFAF7', alignItems: 'center', justifyContent: 'center' }`

## Step 3: Update CameraScreen.js

**What changes**: When `capturing === true`, render `<LoadingScreen />` as a full-screen overlay instead of the in-button `ActivityIndicator`.

**Pattern** (conditional render at top of return):
```
if (capturing) return <LoadingScreen />;
```

This replaces the existing `{capturing ? <ActivityIndicator .../> : <View .../>}` inside the capture button. The button will render its default non-loading state when `capturing` is false.

No changes to `handleCapture`, `setCapturing`, or navigation logic.

## Step 4: Update RecipeStackScreen.js

**What changes**: Replace the `if (status === 'loading')` return block's `ActivityIndicator` and loading text with `<LoadingScreen />`.

**Before** (approximate):
```js
if (status === 'loading') {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#333" />
      <Text style={styles.loadingText}>Finding recipes…</Text>
    </View>
  );
}
```

**After**:
```js
if (status === 'loading') {
  return <LoadingScreen />;
}
```

The `styles.center` and `styles.loadingText` style rules can be removed if no longer used elsewhere in the file.

## Step 5: Verify

Run the app and test:
1. **Photo capture flow**: Press capture → full-screen cooking animation appears on #FFFAF7 background → recipe stack appears when done
2. **Between-batch flow**: Swipe through all recipes → full-screen cooking animation → next batch appears
3. **Animation loops**: Confirm no pause or restart visible during a sustained loading wait
4. **No spinner remnants**: Confirm no `ActivityIndicator` is visible in any replaced loading state
