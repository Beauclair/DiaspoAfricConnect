import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme';

interface BadgeProps {
  /** Text inside badge */
  label: string;
  /** Badge color variant */
  variant?: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'neutral';
  /** Size */
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export default function Badge({ label, variant = 'primary', size = 'md', style }: BadgeProps) {
  const { colors, typography, radii } = useTheme();

  const colorMap = {
    primary: { bg: colors.primaryContainer, text: colors.onPrimaryContainer },
    secondary: { bg: colors.secondaryContainer, text: colors.onSecondaryContainer },
    error: { bg: colors.errorContainer, text: colors.error },
    success: { bg: colors.successContainer, text: colors.success },
    warning: { bg: colors.warningContainer, text: colors.warning },
    neutral: { bg: colors.surfaceVariant, text: colors.onSurfaceVariant },
  };

  const c = colorMap[variant];
  const isSmall = size === 'sm';

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      style={[
        {
          backgroundColor: c.bg,
          borderRadius: radii.full,
          paddingHorizontal: isSmall ? 8 : 10,
          paddingVertical: isSmall ? 2 : 4,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text
        style={[
          isSmall ? typography.labelSmall : typography.labelMedium,
          { color: c.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}
