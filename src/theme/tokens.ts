/**
 * Design tokens: spacing, radii, shadows, elevation
 * Based on an 8px grid with 4px subdivisions
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

export const Radii = {
  /** 6px — subtle rounding */ xs: 6,
  /** 8px — inputs, small cards */ sm: 8,
  /** 12px — standard cards */ md: 12,
  /** 16px — large cards */ lg: 16,
  /** 20px — containers */ xl: 20,
  /** 24px — prominent surfaces */ xxl: 24,
  /** 9999px — pill/circle */ full: 9999,
} as const;

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

export const Duration = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;
