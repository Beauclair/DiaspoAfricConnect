import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme';

interface DividerProps {
  style?: StyleProp<ViewStyle>;
}

export default function Divider({ style }: DividerProps) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.outlineVariant,
        },
        style,
      ]}
    />
  );
}
