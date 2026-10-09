import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AnimatedPress from '../common/AnimatedPressable';
import { useTheme } from '../../theme';

interface PracticeAreaCardProps {
  label: string;
  icon: string;
  description: string;
  onPress: () => void;
}

export default function PracticeAreaCard({ label, icon, description, onPress }: PracticeAreaCardProps) {
  const { colors, typography, radii } = useTheme();

  return (
    <AnimatedPress
      onPress={onPress}
      pressScale={0.96}
      haptic
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer, borderRadius: radii.md }]}>
        <MaterialIcons name={icon as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[typography.titleSmall, { color: colors.onSurface }]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[typography.labelSmall, { color: colors.onSurfaceVariant, marginTop: 2 }]} numberOfLines={2}>
          {description}
        </Text>
      </View>
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
  },
});
