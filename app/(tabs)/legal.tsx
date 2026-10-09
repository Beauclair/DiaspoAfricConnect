import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../src/theme';
import AnimatedPress from '../../src/components/common/AnimatedPressable';
import ErrorView from '../../src/components/common/ErrorView';
import SectionHeader from '../../src/components/common/SectionHeader';
import { useCountry } from '../../src/contexts/CountryContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { requireAuth } from '../../src/utils/authGuard';
import { getLawyers, getGuideCountsByCategory } from '../../src/services/legalService';
import { LEGAL_CATEGORIES } from '../../src/constants/countries';
import { LegalCategory } from '../../src/types';
import { getUserMessage } from '../../src/utils/errorMessages';
import { trackScreen } from '../../src/config/analytics';

export default function LegalAidHomeScreen() {
  const { hostCountry, countryConfig } = useCountry();
  const { user } = useAuth();
  const { colors, typography, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const [lawyerCount, setLawyerCount] = useState(0);
  const [guideCounts, setGuideCounts] = useState<Record<LegalCategory, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasLoadedOnce = useRef(false);

  const loadData = useCallback(async () => {
    setError('');
    if (!hasLoadedOnce.current) setLoading(true);
    try {
      const [l, counts] = await Promise.all([
        getLawyers(hostCountry),
        getGuideCountsByCategory(hostCountry),
      ]);
      setLawyerCount(l.data.length);
      setGuideCounts(counts);
      hasLoadedOnce.current = true;
    } catch (e: any) {
      if (!hasLoadedOnce.current) setError(getUserMessage(e, 'loadLegal', 'Failed to load legal data.'));
    } finally {
      setLoading(false);
    }
  }, [hostCountry]);

  useFocusEffect(
    useCallback(() => {
      trackScreen('LegalAid');
      loadData();
    }, [loadData])
  );

  if (error) return <ErrorView message={error} onRetry={loadData} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero header */}
        <LinearGradient
          colors={['#1B6B2E', '#145222', '#0D3B17']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 16 }]}
        >
          <Animated.View entering={FadeIn.duration(300)}>
            <Text style={[typography.displaySmall, { color: '#FFFFFF' }]}>
              Legal Aid
            </Text>
            <Text style={[typography.bodyLarge, { color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 22 }]}>
              Find attorneys & guides for your legal needs
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Practice area grid (2×3) */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.practiceAreas, { paddingHorizontal: spacing.xxl }]}
        >
          <SectionHeader title="Practice Areas" />
          <View style={styles.areaGrid}>
            {LEGAL_CATEGORIES.map((cat) => {
              const count = guideCounts?.[cat.key] ?? 0;
              const isEmpty = guideCounts !== null && count === 0;

              return (
                <AnimatedPress
                  key={cat.key}
                  onPress={() => router.push({ pathname: '/legal/guides', params: { legalCategory: cat.key } })}
                  pressScale={0.95}
                  haptic
                  style={[
                    styles.areaCard,
                    {
                      backgroundColor: colors.surface,
                      borderRadius: radii.lg,
                      borderWidth: 1,
                      borderColor: colors.outlineVariant,
                      opacity: isEmpty ? 0.5 : 1,
                    },
                  ]}
                >
                  <View style={[styles.areaIcon, { backgroundColor: colors.primaryContainer, borderRadius: radii.md }]}>
                    <MaterialIcons name={cat.icon as any} size={24} color={colors.primary} />
                  </View>
                  <Text style={[typography.labelSmall, { color: colors.onSurface, textAlign: 'center', marginTop: 6 }]} numberOfLines={2}>
                    {cat.label}
                  </Text>
                  {guideCounts !== null && (
                    <Text style={[typography.labelSmall, { color: isEmpty ? colors.onSurfaceVariant : colors.primary, fontSize: 11, marginTop: 2 }]}>
                      {count} {count === 1 ? 'guide' : 'guides'}
                    </Text>
                  )}
                </AnimatedPress>
              );
            })}
          </View>
        </Animated.View>

        {/* Quick action cards */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.quickLinks, { paddingHorizontal: spacing.xxl }]}
        >
          <AnimatedPress
            onPress={() => router.push('/legal/lawyers')}
            pressScale={0.97}
            haptic
            style={[styles.linkCard, { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.outlineVariant }]}
          >
            <View style={[styles.linkIcon, { backgroundColor: colors.primaryContainer, borderRadius: radii.md }]}>
              <MaterialIcons name="gavel" size={24} color={colors.primary} />
            </View>
            <Text style={[typography.titleSmall, { color: colors.onSurface, marginTop: 8 }]}>Find Attorneys</Text>
            <Text style={[typography.labelSmall, { color: colors.onSurfaceVariant, marginTop: 2 }]}>
              {lawyerCount} listed
            </Text>
          </AnimatedPress>

          <AnimatedPress
            onPress={() => requireAuth(user, () => router.push('/legal/register-lawyer'))}
            pressScale={0.97}
            haptic
            style={[styles.linkCard, { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.outlineVariant }]}
          >
            <View style={[styles.linkIcon, { backgroundColor: colors.tertiaryContainer, borderRadius: radii.md }]}>
              <MaterialIcons name="person-add" size={24} color={colors.tertiary} />
            </View>
            <Text style={[typography.titleSmall, { color: colors.onSurface, marginTop: 8 }]}>I'm an Attorney</Text>
            <Text style={[typography.labelSmall, { color: colors.onSurfaceVariant, marginTop: 2 }]}>Register</Text>
          </AnimatedPress>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  practiceAreas: {
    marginTop: 20,
  },
  areaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  areaCard: {
    width: '30%',
    alignItems: 'center',
    padding: 14,
  },
  areaIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  linkCard: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
  },
  linkIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
