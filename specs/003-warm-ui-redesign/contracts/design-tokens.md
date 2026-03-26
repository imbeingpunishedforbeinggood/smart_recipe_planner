# Contract: Design Token System

**Version**: 1.0.0
**Date**: 2026-03-25
**Implemented in**: `src/constants/theme.js`

All visual style values for the warm redesign are defined here. Implementation MUST use these exact values. Any change to a value here constitutes a breaking change to the visual contract.

---

## Palette

| Token | Value | Usage |
|---|---|---|
| `THEME.accent` | `#FF6B35` | Primary CTA, section headers, tag text, bullet points, step numbers, capture button |
| `THEME.accentBg` | `rgba(255,107,53,0.12)` | Tag chip background (warm tint, not full opacity) |
| `THEME.background` | `#FFFAF7` | All screen backgrounds |
| `THEME.cardBg` | `#FFFFFF` | Recipe card surface |
| `THEME.textPrimary` | `#1A1A1A` | Recipe names, high-emphasis headings |
| `THEME.textSecondary` | `#555555` | Descriptions, body copy |
| `THEME.textMuted` | `#888888` | Meta information, captions, attribution |
| `THEME.border` | `#E8E0D8` | Card borders — warm off-white, not cool grey |

---

## Typography

| Token | Size | Weight | Usage |
|---|---|---|---|
| `THEME.type.screenTitle` | 28 | 700 | App title on camera screen (white on camera) |
| `THEME.type.cardTitle` | 20 | 700 | Recipe card name |
| `THEME.type.detailTitle` | 24 | 700 | Recipe name on detail screen |
| `THEME.type.sectionHeader` | 18 | 700 | Ingredients / Steps / Instructions headers |
| `THEME.type.body` | 15 | 400 | Description, ingredient, step text |
| `THEME.type.meta` | 13 | 400 | Time, servings, attribution |
| `THEME.type.tag` | 12 | 600 | Tag chip labels |

---

## Elevation (card shadows)

| Token | Platform | Values |
|---|---|---|
| `THEME.cardShadow` | iOS | `shadowColor: '#C4714A'`, `shadowOffset: { width: 0, height: 4 }`, `shadowOpacity: 0.18`, `shadowRadius: 8` |
| `THEME.cardShadow` | Android | `elevation: 6` |

**Note**: The shadow color is a warm orange-brown (`#C4714A`) rather than pure black — this produces a warmer, food-focused glow that reads as premium without being harsh.

---

## Shape

| Token | Value | Usage |
|---|---|---|
| `THEME.radius.card` | `18` | Recipe card border radius |
| `THEME.radius.chip` | `12` | Tag chip border radius |
| `THEME.radius.button` | `36` | Capture button (circular — half of 72px width) |
| `THEME.radius.badge` | `10` | Match score badge |

---

## Per-Screen Specifications

### CameraScreen

- Background: `#000` (camera fills screen — background only visible during load)
- `overlay` layout: `justifyContent: 'space-between'`, `paddingTop: 60` (safe area) + `paddingBottom: 52`
- App title text: `THEME.type.screenTitle`, white, centered, `paddingHorizontal: 24`
- Subtitle/hint text: `#FFFAF7` at 85% opacity, `fontSize: 16`
- Capture button outer ring: `borderColor: THEME.accent` (changed from white)
- Capture button inner circle: `backgroundColor: THEME.accent` (changed from white)
- Capture button active spinner: `color: THEME.accent`

### RecipeStackScreen

- Container background: `THEME.background` (changed from `#f4f4f4`)
- Retake header: `paddingHorizontal: 16`, `paddingTop: 12`, `paddingBottom: 4`
- Retake button text: `THEME.accent`, `fontSize: 14`, `fontWeight: '600'`
- Retake button: prefixed with `←` arrow character

### RecipeCard

- Card background: `THEME.cardBg`
- Border color: `THEME.border` (changed from `#d8d8d8`)
- Shadow: `THEME.cardShadow` (changed from `shadowColor: '#000'`)
- Tag chip background: `THEME.accentBg` (changed from `#f0f0f0`)
- Tag chip text color: `THEME.accent` (changed from `#444`)
- Tag chip font weight: `'600'` (changed from default)
- Match score badge text: `THEME.accent` (changed from `#F97316`)

### RecipeDetailScreen

- Scroll background: `THEME.background` (changed from `#fafafa`)
- Hero image height: `300` (changed from `260`)
- Image placeholder background: warm tint `#F5EDE5` (changed from `#e9e9e9`)
- Section header color: `THEME.accent` (changed from `#111`)
- Section header weight: `700` (changed from `600`)
- Bullet color: `THEME.accent` (changed from `#888`)
- Step number color: `THEME.accent` (changed from `#888`)
- Tag chip: same as RecipeCard (accentBg + accent text)
- Horizontal padding: `24` (changed from `20`)

---

## What Is NOT Changed

- Navigation structure (no headerShown changes)
- RecipeDetailScreen navigation header (system-managed)
- CameraScreen permission-denied state (low-traffic; not in scope)
- Any non-visual logic, props, or callbacks
- SwipeStack layout and animation values
