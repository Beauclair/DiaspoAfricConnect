# Material Design Compliance Fixes

Based on developer feedback, addressing 5 issues:

## 1. Typography — Follow MD3 Specifications
**Current:** `typography.ts` has non-standard font sizes (e.g. `displayLarge: 34` instead of 57, `titleLarge: 17` instead of 22).
**Fix:** Update typography tokens to match [Material Design 3 type scale](https://m3.material.io/styles/typography/type-scale-tokens) exactly:
- displayLarge: 57/64, displayMedium: 45/52, displaySmall: 36/44
- headlineLarge: 32/40, headlineMedium: 28/36, headlineSmall: 24/32
- titleLarge: 22/28, titleMedium: 16/24, titleSmall: 14/20
- bodyLarge: 16/24, bodyMedium: 14/20, bodySmall: 12/16
- labelLarge: 14/20, labelMedium: 12/16, labelSmall: 11/16

**File:** `src/theme/typography.ts`

## 2. Layout Spacing — Use 16dp Vertical Margins
**Current:** Mixed spacing values (14, 12, 20, 28, etc.) across screens and cards.
**Fix:** Standardize to 16dp vertical margins between sections/cards:
- `BusinessCard.tsx`: `marginBottom: 14` → `marginBottom: 16`
- `home.tsx`: section `marginTop: 28` → `marginTop: 24` (MD3 uses multiples of 8), grid gap `12` → `16`
- `business.tsx`: padding values align to 16dp
- `lawyers.tsx`: `lawyerCard: marginBottom: 12` → `marginBottom: 16`, `list: padding: 16` (already good), `searchSection: padding: 16` (already good)
- Card content padding is already 16dp ✅

**Files:** `BusinessCard.tsx`, `home.tsx`, `business.tsx`, `lawyers.tsx`

## 3. Bottom Navigation Bar — Sticky with Solid Background
**Current:** Floating tab bar with `position: absolute`, transparent blur on iOS, 16px horizontal margins (rounded pill shape).
**Fix:** Make it a standard MD3 NavigationBar:
- Remove `position: absolute` → use it as a normal component in the layout flow (or keep absolute but ensure content doesn't go behind it)
- Remove horizontal margins (full-width)
- Use solid `surfaceContainer` background (no transparency/blur)
- Height: 80dp (MD3 spec)
- Add top elevation/border for separation
- Keep the active indicator pill on the icon (already correct)

**File:** `src/components/navigation/TabBar.tsx`

## 4. RecyclerView Cards — Same Dimensions and Spacing
**Current:** `BusinessCard` has `marginBottom: 14`, content padding `14`, image height `160`. Lawyer cards have `marginBottom: 12`.
**Fix:** Unify all list cards:
- All cards: `marginBottom: 16` (consistent spacing)
- BusinessCard content padding: `14` → `16`
- Ensure all business cards have same fixed image height (160 ✅ already consistent)
- Lawyer cards: `marginBottom: 12` → `marginBottom: 16`

**Files:** `BusinessCard.tsx`, `lawyers.tsx`

## 5. Status Bar vs Toolbar Color — Use 500 and 700
**Current:** Status bar and toolbar headers use the same green (#1B5E20 or #1B6B2E).
**Fix:** Apply Material color system:
- Add `primary700` (darker) to theme colors for the status bar
- Toolbar/header: use primary 500 (#2E7D32 — Material Green 500)
- Status bar: use primary 700 (#1B5E20 — Material Green 700, which is what we already have)
- Update `StatusBar` component to use dark background
- Update header gradients in `home.tsx` and `business.tsx` to use the 500 shade
- Update all layout headers (`business/_layout.tsx`, `legal/_layout.tsx`, etc.) to use primary 500

**Files:** `src/theme/colors.ts`, `app/_layout.tsx`, `app/(tabs)/home.tsx`, `app/(tabs)/business.tsx`, all `_layout.tsx` files

---

## Implementation Order
1. Theme tokens first (colors, typography, spacing) — foundation
2. TabBar — sticky bottom nav
3. Card spacing — uniform dimensions
4. Screen headers — status bar vs toolbar differentiation
