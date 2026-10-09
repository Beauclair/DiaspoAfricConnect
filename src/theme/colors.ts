/**
 * Color palette — light & dark themes with semantic tokens.
 * Follows Material 3 naming conventions.
 */

export interface ThemeColors {
  // Brand
  primary: string;
  primaryContainer: string;
  onPrimary: string;
  onPrimaryContainer: string;

  secondary: string;
  secondaryContainer: string;
  onSecondary: string;
  onSecondaryContainer: string;

  tertiary: string;
  tertiaryContainer: string;

  // Semantic
  error: string;
  errorContainer: string;
  onError: string;
  success: string;
  successContainer: string;
  warning: string;
  warningContainer: string;

  // Surfaces
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerLow: string;
  inverseSurface: string;
  inverseOnSurface: string;

  // Text
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;
  onSurfaceDisabled: string;

  // Borders & dividers
  outline: string;
  outlineVariant: string;

  // Misc
  star: string;
  overlay: string;
  shimmer: string;
  scrim: string;
}

export const LightColors: ThemeColors = {
  // Brand
  primary: '#1B6B2E',
  primaryContainer: '#D4EDDA',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#0A3D14',

  secondary: '#D4960A',
  secondaryContainer: '#FFF3CD',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#5C4003',

  tertiary: '#B71C1C',
  tertiaryContainer: '#FFCDD2',

  // Semantic
  error: '#DC2626',
  errorContainer: '#FEE2E2',
  onError: '#FFFFFF',
  success: '#16A34A',
  successContainer: '#DCFCE7',
  warning: '#EA580C',
  warningContainer: '#FFF7ED',

  // Surfaces
  background: '#F8FAFB',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F4',
  surfaceDim: '#E8ECEB',
  surfaceBright: '#FFFFFF',
  surfaceContainer: '#F3F6F5',
  surfaceContainerHigh: '#EAEDEC',
  surfaceContainerLow: '#F8FAF9',
  inverseSurface: '#1A1C1B',
  inverseOnSurface: '#EFF1F0',

  // Text
  onBackground: '#1A1C1B',
  onSurface: '#1A1C1B',
  onSurfaceVariant: '#6B7280',
  onSurfaceDisabled: '#9CA3AF',

  // Borders
  outline: '#D1D5DB',
  outlineVariant: '#E5E7EB',

  // Misc
  star: '#F59E0B',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shimmer: '#E5E7EB',
  scrim: 'rgba(0, 0, 0, 0.3)',
};

export const DarkColors: ThemeColors = {
  // Brand
  primary: '#6EE07F',
  primaryContainer: '#0E4F1A',
  onPrimary: '#003909',
  onPrimaryContainer: '#A4F4AB',

  secondary: '#FFD54F',
  secondaryContainer: '#4A3600',
  onSecondary: '#3B2D00',
  onSecondaryContainer: '#FFE082',

  tertiary: '#FF8A80',
  tertiaryContainer: '#5C1111',

  // Semantic
  error: '#F87171',
  errorContainer: '#450A0A',
  onError: '#3B0707',
  success: '#4ADE80',
  successContainer: '#052E16',
  warning: '#FB923C',
  warningContainer: '#431407',

  // Surfaces
  background: '#0F1211',
  surface: '#1A1D1C',
  surfaceVariant: '#252928',
  surfaceDim: '#0F1211',
  surfaceBright: '#353938',
  surfaceContainer: '#1E2221',
  surfaceContainerHigh: '#282C2B',
  surfaceContainerLow: '#161A19',
  inverseSurface: '#E0E3E1',
  inverseOnSurface: '#2C302F',

  // Text
  onBackground: '#E0E3E1',
  onSurface: '#E0E3E1',
  onSurfaceVariant: '#9CA3AF',
  onSurfaceDisabled: '#6B7280',

  // Borders
  outline: '#4B5563',
  outlineVariant: '#374151',

  // Misc
  star: '#F59E0B',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shimmer: '#374151',
  scrim: 'rgba(0, 0, 0, 0.6)',
};
