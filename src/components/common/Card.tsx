import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme';

interface CardProps {
  children: ReactNode;
  variant?: 'elevated' | 'filled' | 'outlined';
  style?: StyleProp<ViewStyle>;
}

export default function Card({ children, variant = 'elevated', style }: CardProps) {
  const { colors, radii, shadows } = useTheme();

  const variantStyles: Record<string, ViewStyle> = {
    elevated: {
      backgroundColor: colors.surface,
      ...shadows.md,
    },
    filled: {
      backgroundColor: colors.surfaceContainerLow,
    },
    outlined: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
  };

  return (
    <View style={[{ borderRadius: radii.lg, padding: 16 }, variantStyles[variant], style]}>
      {children}
    </View>
  );
}
