import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { LightColors, DarkColors, ThemeColors } from './colors';
import { Typography } from './typography';
import { Spacing, Radii, Shadows, Duration, Easing } from './tokens';

export interface Theme {
  colors: ThemeColors;
  typography: typeof Typography;
  spacing: typeof Spacing;
  radii: typeof Radii;
  shadows: typeof Shadows;
  duration: typeof Duration;
  easing: typeof Easing;
  isDark: boolean;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = useMemo<Theme>(() => ({
    colors: isDark ? DarkColors : LightColors,
    typography: Typography,
    spacing: Spacing,
    radii: Radii,
    shadows: Shadows,
    duration: Duration,
    easing: Easing,
    isDark,
  }), [isDark]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
}
