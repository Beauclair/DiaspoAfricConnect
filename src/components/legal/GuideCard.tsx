import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AnimatedPress from '../common/AnimatedPressable';
import { useTheme } from '../../theme';
import { LegalGuide } from '../../types';
import { LEGAL_CATEGORIES } from '../../constants/countries';

interface GuideCardProps {
  guide: LegalGuide;
  onPress: () => void;
}

const categoryIcons: Record<string, string> = {
  visa: 'card-travel',
  greencard: 'credit-card',
  asylum: 'security',
  citizenship: 'flag',
  'work-permit': 'work',
  family: 'people',
  student: 'school',
  other: 'help-outline',
  // Legal category icons
  immigration: 'flight',
  'deportation-defense': 'shield',
  'family-law': 'people',
  'criminal-defense': 'gavel',
  'personal-injury': 'local-hospital',
  housing: 'home',
};

export default function GuideCard({ guide, onPress }: GuideCardProps) {
  const { colors, radii, typography, spacing } = useTheme();
  const iconName = categoryIcons[guide.legalCategory] || categoryIcons[guide.category] || 'help-outline';

  // Show practice area badge
  const practiceArea = LEGAL_CATEGORIES.find((c) => c.key === guide.legalCategory);

  return (
    <AnimatedPress
      onPress={onPress}
      pressScale={0.98}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${guide.title}, timeline ${guide.estimatedTimeline}, cost ${guide.estimatedCost}`}
    >
      {/* Accent stripe */}
      <View style={[styles.stripe, { backgroundColor: colors.primary }]} />

      <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
        <MaterialIcons name={iconName as any} size={24} color={colors.primary} />
      </View>

      <View style={styles.content}>
        {practiceArea && (
          <Text style={[typography.labelSmall, { color: colors.primary, marginBottom: 2 }]}>
            {practiceArea.label}
          </Text>
        )}
        <Text style={[typography.titleMedium, { color: colors.onSurface }]} numberOfLines={2}>
          {guide.title}
        </Text>
        <Text
          style={[typography.bodySmall, { color: colors.onSurfaceVariant, marginTop: 4, lineHeight: 18 }]}
          numberOfLines={2}
        >
          {guide.summary}
        </Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <MaterialIcons name="schedule" size={13} color={colors.onSurfaceVariant} />
            <Text style={[typography.labelSmall, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
              {guide.estimatedTimeline}
            </Text>
          </View>
          <View style={[styles.metaDot, { backgroundColor: colors.outline }]} />
          <View style={styles.metaItem}>
            <MaterialIcons name="attach-money" size={13} color={colors.onSurfaceVariant} />
            <Text style={[typography.labelSmall, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
              {guide.estimatedCost}
            </Text>
          </View>
        </View>
      </View>

      <MaterialIcons name="chevron-right" size={22} color={colors.onSurfaceDisabled} />
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});
