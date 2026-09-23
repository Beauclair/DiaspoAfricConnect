# DiaspoAfricConnect — Modern UI Overhaul Plan

## Current State Assessment

Your app has a solid functional foundation but uses a **2020-era mobile UI** style:
- Flat solid-color headers (green banner at top)
- Basic `StyleSheet` with no design tokens or spacing system
- Simple cards with uniform shadows
- Standard system fonts with no type scale
- Basic tab bar with no visual personality
- No animations, transitions, or micro-interactions
- No dark mode support
- TouchableOpacity everywhere (no haptic/ripple feedback)

## What Modern Apps Look Like (2025-2026)

Think Airbnb, Uber, Cash App, Revolut, Duolingo — here's the pattern:

| Dimension | Old Pattern (your app) | Modern Standard |
|---|---|---|
| **Header** | Solid green banner | Gradient or translucent blur header, large title that collapses on scroll |
| **Tab bar** | Plain icons + labels | Pill-shaped active indicator, animated icon transitions, floating tab bar |
| **Cards** | Uniform white boxes, subtle shadow | Varied card sizes, larger corner radii (16-20px), subtle borders instead of shadows, skeleton loading |
| **Typography** | One weight, basic sizes | Type scale with display/headline/body/caption, variable font weights, letter spacing |
| **Color** | Single green everywhere | Dynamic color palette, tinted surfaces, semantic tokens (surface1/2/3) |
| **Spacing** | Magic numbers (12, 16, 20) | 4px/8px grid system with named tokens (xs/sm/md/lg/xl) |
| **Interactions** | Instant state changes | Spring animations, shared element transitions, skeleton loaders, haptic feedback |
| **Empty states** | Plain text | Illustrated empty states with CTA |
| **FAB** | Basic button | Animated FAB with icon, scale-on-press |
| **Search** | Bordered input | Expansive search with recent/trending, animated focus state |
| **Dark mode** | None | Full dark theme with proper surface hierarchy |

---

## Implementation Plan (Phased)

### Phase 1 — Design System Foundation (no visual change yet)

Create a proper design system that all screens reference. This is the backbone.

**Files to create:**
- `src/theme/tokens.ts` — spacing scale, border radii, shadows, elevation
- `src/theme/colors.ts` — light + dark palettes with semantic tokens (surface, onSurface, surfaceVariant, etc.)
- `src/theme/typography.ts` — type scale (displayLarge → labelSmall) with fontSize, lineHeight, fontWeight, letterSpacing
- `src/theme/ThemeContext.tsx` — React context for light/dark mode with `useTheme()` hook
- `src/theme/index.ts` — barrel export

**Color palette upgrade (light mode):**
```
primary: '#1B6B2E' (slightly brighter green)
primaryContainer: '#D4EDDA'
secondary: '#E8A817'
secondaryContainer: '#FFF3CD'
surface: '#FFFFFF'
surfaceVariant: '#F5F5F5'
surfaceDim: '#ECECEC'
background: '#FAFBFC'
onSurface: '#1A1A1A'
onSurfaceVariant: '#6B7280'
outline: '#E5E7EB'
outlineVariant: '#F3F4F6'
error: '#DC2626'
```

**Spacing scale:** `xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32`

**Border radii:** `sm: 8, md: 12, lg: 16, xl: 20, full: 9999`

### Phase 2 — Core Component Redesign

Rebuild shared components with modern patterns:

1. **`Button.tsx`** — Add icon support, size variants (sm/md/lg), tonal variant, rounded pill shape, press scale animation via Reanimated
2. **`Card.tsx`** — Switch from shadow-based to border-based elevation, add outlined/filled/elevated variants, press-in animation
3. **`Input.tsx`** — Animated floating label, focus ring animation, filled variant (tinted background), icon prefix/suffix
4. **`SearchBar.tsx`** — Larger touch target, animated expand-on-focus, voice icon, tinted background when focused
5. **`CategoryChip.tsx`** — Icon + label chip, animated selection with scale spring
6. **`LoadingSpinner.tsx`** → **`Skeleton.tsx`** — Add skeleton shimmer placeholders for cards/lists instead of spinner
7. **New: `SectionHeader.tsx`** — Reusable "Title + See All" row
8. **New: `Avatar.tsx`** — Gradient avatar with initials, image support, online indicator
9. **New: `Badge.tsx`** — Notification badges, status pills
10. **New: `Divider.tsx`** — Themed horizontal/vertical divider
11. **New: `AnimatedPressable.tsx`** — Shared pressable with scale-down animation (replaces raw TouchableOpacity)

### Phase 3 — Tab Bar & Navigation Overhaul

Modern floating tab bar with animated indicators:

- **Custom tab bar component** (`src/components/navigation/TabBar.tsx`):
  - Floating pill design (positioned above bottom edge with rounded corners)
  - Active tab gets a tinted pill background behind icon
  - Animated icon transitions using Reanimated
  - Slightly larger icons (26px), hide labels on inactive tabs (icon-only)
  - Blur background on iOS (`BlurView`)
- **Large title headers** that collapse on scroll (animated header)
- **Stack transitions**: slide-from-right with shared element transitions for business detail

### Phase 4 — Screen-by-Screen Redesign

#### 4a. Home Screen
- Hero section: gradient background (green→dark green) with greeting, overlapping search bar that floats on top
- Quick actions: larger rounded cards with tinted icon backgrounds, subtle border
- Featured businesses: horizontal scroll carousel instead of vertical list
- Section headers with animated "See all" arrows
- Pull-to-refresh with custom animation

#### 4b. Business Tab
- Search bar sticks to top on scroll with blur background
- Category chips: horizontal scroll with icon + label, animated selection
- Business cards: redesigned with larger image (16:9), overlay gradient at bottom of image for name, rating badge floats on image corner
- Grid option (toggle between list and grid view)
- FAB: circular with icon only, scale-on-press animation, hide on scroll down / show on scroll up

#### 4c. Immigration Tab
- Hero: illustrative gradient header with icon composition
- Quick link cards: tinted icon backgrounds, border instead of shadow
- Category grid: larger icons in rounded square containers, 3-column
- Guide cards: accent color left stripe, cleaner meta info layout

#### 4d. Profile Tab
- Profile header: gradient background, larger avatar with border ring
- Stats row: number of reviews, businesses added (horizontal)
- Settings sections: grouped in rounded containers with dividers, chevron arrows
- Animated toggle for edit mode
- Sign out: red text only, at very bottom

#### 4e. Auth Screens (Login/Signup)
- Background: subtle gradient or pattern
- Logo/illustration at top
- Form fields: filled variant with tinted background
- Social login buttons placeholder (Google, Apple)
- Animated transitions between login ↔ signup

### Phase 5 — Animations & Polish

- **Reanimated** spring animations on card presses (already installed)
- **Layout animations** for list items appearing (FadeInDown stagger)
- **Shared element transitions** for business card → detail (Expo Router supports this)
- **Pull-to-refresh** with custom animation
- **Skeleton loading** replacing spinner on all data screens
- **Haptic feedback** on button presses and tab changes (`expo-haptics`)

### Phase 6 — Dark Mode

- Wire `ThemeContext` to system appearance via `useColorScheme()`
- Dark surface hierarchy (surface: #121212, surfaceVariant: #1E1E1E, surfaceDim: #2A2A2A)
- All components read from theme context
- Tab bar adapts
- StatusBar switches to light-content / dark-content

---

## New Dependencies

| Package | Purpose |
|---|---|
| `expo-haptics` | Haptic feedback on interactions |
| `expo-linear-gradient` | Gradient headers and backgrounds |
| `expo-blur` | Blur effects for tab bar and headers |

All are in the Expo SDK 57, so no native rebuild needed.

---

## Files Changed Summary

### New files (~15):
```
src/theme/tokens.ts
src/theme/colors.ts
src/theme/typography.ts
src/theme/ThemeContext.tsx
src/theme/index.ts
src/components/common/AnimatedPressable.tsx
src/components/common/Skeleton.tsx
src/components/common/SectionHeader.tsx
src/components/common/Avatar.tsx
src/components/common/Badge.tsx
src/components/common/Divider.tsx
src/components/navigation/TabBar.tsx
```

### Modified files (~20):
```
src/constants/colors.ts → delegates to theme
src/components/common/Button.tsx
src/components/common/Card.tsx
src/components/common/Input.tsx
src/components/common/SearchBar.tsx
src/components/common/CategoryChip.tsx
src/components/common/LoadingSpinner.tsx
src/components/business/BusinessCard.tsx
src/components/immigration/GuideCard.tsx
app/(tabs)/_layout.tsx
app/(tabs)/home.tsx
app/(tabs)/business.tsx
app/(tabs)/immigration.tsx
app/(tabs)/profile.tsx
app/(auth)/login.tsx
app/(auth)/signup.tsx
app/_layout.tsx
package.json (new deps)
```

---

## Execution Order

I recommend tackling this in order:
1. **Phase 1** (theme tokens) — 0 visual changes, everything compiles
2. **Phase 2** (component redesign) — components look modern, screens auto-improve
3. **Phase 3** (tab bar) — immediate "wow" factor
4. **Phase 4** (screen redesign) — full modern look
5. **Phase 5** (animations) — polish and delight
6. **Phase 6** (dark mode) — finish

This is a large effort. I can start with any single phase, or do a **vertical slice** (fully modernize one screen end-to-end to show the vision, then expand).
