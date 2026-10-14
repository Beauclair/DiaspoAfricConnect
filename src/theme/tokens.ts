/**
 * Design tokens: spacing, radii, shadows, elevation, motion
 * Based on an 8px grid with 4px subdivisions.
 * Shape and motion tokens follow the Material Design 3 spec.
 */

export const Spacing = {
  /** 4px */ xs: 4,
  /** 6px */ sm: 6,
  /** 8px */ md: 8,
  /** 12px */ lg: 12,
  /** 16px */ xl: 16,
  /** 20px */ xxl: 20,
  /** 24px */ xxxl: 24,
  /** 32px */ huge: 32,
  /** 40px */ giant: 40,
  /** 48px */ massive: 48,
} as const;

/**
 * MD3 Shape scale — corner radii mapped to spec names.
 * https://m3.material.io/styles/shape/shape-scale-tokens
 */
export const Radii = {
  /** 0px — none (MD3 shape.corner.none) */ none: 0,
  /** 4px — extra small (MD3 shape.corner.extraSmall) */ xs: 4,
  /** 8px — small (MD3 shape.corner.small) */ sm: 8,
  /** 12px — medium (MD3 shape.corner.medium) */ md: 12,
  /** 16px — large (MD3 shape.corner.large) */ lg: 16,
  /** 20px — extra large top (MD3 shape.corner.extraLargeTop) */ xl: 20,
  /** 28px — extra large (MD3 shape.corner.extraLarge) */ xxl: 28,
  /** 9999px — full / pill / circle */ full: 9999,
} as const;

/**
 * MD3 Elevation levels.
 * https://m3.material.io/styles/elevation/tokens
 */
export const Shadows = {
  /** Level 0 — 0dp */ none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  /** Level 1 — 1dp */ sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  /** Level 2 — 3dp */ md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  /** Level 3 — 6dp */ lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  /** Level 4 — 8dp */ xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
  /** Level 5 — 12dp */ xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

/**
 * MD3 Motion — duration & easing tokens.
 * https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
 *
 * Note: MD3 "emphasized" easing uses a two-phase cubic-bezier which is not
 * natively expressible as a single Animated.timing easing.  For Reanimated
 * spring-based animations we rely on damping/stiffness instead.  The Bezier
 * values below are the closest single-curve approximations for use with
 * withTiming when a spring is not appropriate.
 */
export const Duration = {
  /** 50ms  — MD3 duration.short1 */ short1: 50,
  /** 100ms — MD3 duration.short2 */ short2: 100,
  /** 150ms — MD3 duration.short3 */ short3: 150,
  /** 200ms — MD3 duration.short4 */ short4: 200,
  /** 250ms — MD3 duration.medium1 */ medium1: 250,
  /** 300ms — MD3 duration.medium2 */ medium2: 300,
  /** 350ms — MD3 duration.medium3 */ medium3: 350,
  /** 400ms — MD3 duration.medium4 */ medium4: 400,
  /** 450ms — MD3 duration.long1 */ long1: 450,
  /** 500ms — MD3 duration.long2 */ long2: 500,
  /** 550ms — MD3 duration.long3 */ long3: 550,
  /** 700ms — MD3 duration.long4 */ long4: 700,
  /** 800ms — MD3 duration.extraLong1 */ extraLong1: 800,
  /** 1000ms — MD3 duration.extraLong2 */ extraLong2: 1000,
  /** 1200ms — MD3 duration.extraLong3 */ extraLong3: 1200,
  /** 1400ms — MD3 duration.extraLong4 */ extraLong4: 1400,

  // Legacy aliases — kept for backward compatibility
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

/**
 * MD3 Easing cubic-bezier values for use with Animated.timing / withTiming.
 * https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
 */
export const Easing = {
  /** Standard — elements that begin and end on screen */
  standard: { x1: 0.2, y1: 0, x2: 0, y2: 1 },
  /** Standard decelerate — entering elements */
  standardDecelerate: { x1: 0, y1: 0, x2: 0, y2: 1 },
  /** Standard accelerate — exiting elements */
  standardAccelerate: { x1: 0.3, y1: 0, x2: 1, y2: 1 },
  /** Emphasized decelerate — high-emphasis enter */
  emphasizedDecelerate: { x1: 0.05, y1: 0.7, x2: 0.1, y2: 1 },
  /** Emphasized accelerate — high-emphasis exit */
  emphasizedAccelerate: { x1: 0.3, y1: 0, x2: 0.8, y2: 0.15 },
} as const;
