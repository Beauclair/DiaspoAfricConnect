/**
 * Legacy Colors export — kept for backward compatibility.
 * New code should use `useTheme().colors` instead.
 */
import { LightColors } from '../theme/colors';

export const Colors = {
  primary: LightColors.primary,
  primaryLight: '#2E7D32',
  primaryDark: '#0D3B0F',
  secondary: LightColors.secondary,
  secondaryLight: '#FDD835',
  accent: LightColors.tertiary,
  accentLight: '#E53935',
  background: LightColors.background,
  card: LightColors.surface,
  text: LightColors.onSurface,
  textLight: LightColors.onSurfaceVariant,
  textWhite: '#FFFFFF',
  border: LightColors.outline,
  star: LightColors.star,
  success: LightColors.success,
  error: LightColors.error,
  warning: LightColors.warning,
  overlay: LightColors.overlay,
} as const;
