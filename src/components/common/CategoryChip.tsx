import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AnimatedPress from './AnimatedPressable';
import { useTheme } from '../../theme';

interface CategoryChipProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  selected?: boolean;
  onPress: () => void;
}

export default function CategoryChip({ label, icon, selected, onPress }: CategoryChipProps) {
  const { colors, radii, typography } = useTheme();

  return (
    <AnimatedPress
      onPress={onPress}
      pressScale={0.95}
      haptic
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surfaceContainer,
          borderRadius: radii.full,
          borderWidth: selected ? 0 : 1,
          borderColor: selected ? 'transparent' : colors.outlineVariant,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${label} category${selected ? ', selected' : ''}`}
      accessibilityState={{ selected }}
    >
      {icon && (
        <MaterialIcons
          name={icon}
          size={16}
          color={selected ? colors.onPrimary : colors.onSurfaceVariant}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={[
          typography.labelMedium,
          { color: selected ? colors.onPrimary : colors.onSurface },
        ]}
      >
        {label}
      </Text>
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
});
