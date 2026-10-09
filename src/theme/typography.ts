/**
 * Type scale — Material 3 inspired.
 * Each entry has fontSize, lineHeight, fontWeight, and optional letterSpacing.
 */

import { TextStyle } from 'react-native';

type FontWeight = TextStyle['fontWeight'];

interface TypeToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
  letterSpacing?: number;
}

export const Typography = {
  displayLarge: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '700' as FontWeight,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as FontWeight,
    letterSpacing: -0.3,
  },
  displaySmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as FontWeight,
  },
  headlineLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as FontWeight,
  },
  headlineMedium: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as FontWeight,
  },
  headlineSmall: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as FontWeight,
  },
  titleLarge: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600' as FontWeight,
  },
  titleMedium: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600' as FontWeight,
    letterSpacing: 0.1,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as FontWeight,
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as FontWeight,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as FontWeight,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400' as FontWeight,
  },
  labelLarge: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as FontWeight,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as FontWeight,
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500' as FontWeight,
    letterSpacing: 0.3,
  },
} as const satisfies Record<string, TypeToken>;

export type TypographyKey = keyof typeof Typography;
