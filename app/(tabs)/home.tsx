import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/theme';
import SectionHeader from '../../src/components/common/SectionHeader';
import BusinessCard from '../../src/components/business/BusinessCard';
import AnimatedPress from '../../src/components/common/AnimatedPressable';
import ErrorView from '../../src/components/common/ErrorView';
import { BusinessCardSkeleton } from '../../src/components/common/Skeleton';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCountry } from '../../src/contexts/CountryContext';
import { getRecentBusinesses } from '../../src/services/businessService';
import { Business } from '../../src/types';
import { LEGAL_CATEGORIES } from '../../src/constants/countries';
import { getUserMessage } from '../../src/utils/errorMessages';
import { trackScreen } from '../../src/config/analytics';

/* ------------------------------------------------------------------ */
/*  Quick-action category card data                                    */
/* ------------------------------------------------------------------ */
const QUICK_ACTIONS: {
  label: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
  bgKey: 'primaryContainer' | 'secondaryContainer' | 'tertiaryContainer' | 'successContainer';
  fgKey: 'primary' | 'secondary' | 'tertiary' | 'success';
}[] = [
  {
    label: 'Find Business',
    subtitle: 'African-owned near you',
    icon: 'storefront',
    route: '/(tabs)/business',
    bgKey: 'primaryContainer',
    fgKey: 'primary',
  },
  {
    label: 'Legal Aid',
    subtitle: 'Attorneys & guides',
    icon: 'balance',
    route: '/(tabs)/legal',
    bgKey: 'secondaryContainer',
    fgKey: 'secondary',
  },
  {
    label: 'Find an Attorney',
    subtitle: 'Legal professionals',
    icon: 'gavel',
    route: '/legal/lawyers',
    bgKey: 'tertiaryContainer',
    fgKey: 'tertiary',
  },
  {
    label: 'Add Business',
    subtitle: 'List yours for free',
    icon: 'add-business',
    route: '/business/add',
    bgKey: 'successContainer',
    fgKey: 'success',
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { hostCountry } = useCountry();
  const { colors, typography, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasLoadedOnce = useRef(false);

  const loadData = useCallback(async () => {
    setError('');
    // Only show skeletons on the very first load
    if (!hasLoadedOnce.current) setLoading(true);
    try {
      const businesses = await getRecentBusinesses(hostCountry, 5);
      setFeaturedBusinesses(businesses);
      hasLoadedOnce.current = true;
    } catch (e: any) {
      if (!hasLoadedOnce.current) setError(getUserMessage(e, 'loadHome', 'Failed to load data.'));
    } finally {
      setLoading(false);
    }
  }, [hostCountry]);

  useFocusEffect(
    useCallback(() => {
      trackScreen('Home');
      loadData();
    }, [loadData])
  );

  if (error) return <ErrorView message={error} onRetry={loadData} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* ── Hero gradient header ── */}
        <LinearGradient
          colors={['#1B5E20', '#1B5E20', '#1B5E20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 20 }]}
        >
          <Animated.View entering={FadeIn.duration(300)} style={styles.heroContent}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.heroLogo}
              contentFit="cover"
            />
            <Text style={[typography.displaySmall, { color: '#FFFFFF', marginTop: 4 }]}>
              {user?.displayName ? `Hello, ${user.displayName.split(' ')[0]}` : 'Welcome'} 👋
            </Text>
            <Text style={[typography.bodyLarge, styles.tagline]}>
              Connect with your African community
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* ── Quick-action category grid (2 × 2) ── */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={[styles.gridContainer, { paddingHorizontal: spacing.xxl }]}
        >
          <View style={styles.gridRow}>
            {QUICK_ACTIONS.slice(0, 2).map((action) => (
              <AnimatedPress
                key={action.label}
                onPress={() => router.push(action.route as any)}
                pressScale={0.96}
                haptic
                style={[
                  styles.gridCard,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: radii.lg,
                    borderWidth: 1,
                    borderColor: colors.outlineVariant,
                  },
                ]}
              >
                <View
                  style={[
                    styles.gridIcon,
                    { backgroundColor: colors[action.bgKey], borderRadius: radii.md },
                  ]}
                >
                  <MaterialIcons name={action.icon} size={28} color={colors[action.fgKey]} />
                </View>
                <Text style={[typography.titleMedium, { color: colors.onSurface, marginTop: 10 }]}>
                  {action.label}
                </Text>
                <Text style={[typography.bodySmall, { color: colors.onSurfaceVariant, marginTop: 2 }]}>
                  {action.subtitle}
                </Text>
              </AnimatedPress>
            ))}
          </View>

          <View style={styles.gridRow}>
            {QUICK_ACTIONS.slice(2, 4).map((action) => (
              <AnimatedPress
                key={action.label}
                onPress={() => router.push(action.route as any)}
                pressScale={0.96}
                haptic
                style={[
                  styles.gridCard,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: radii.lg,
                    borderWidth: 1,
                    borderColor: colors.outlineVariant,
                  },
                ]}
              >
                <View
                  style={[
                    styles.gridIcon,
                    { backgroundColor: colors[action.bgKey], borderRadius: radii.md },
                  ]}
                >
                  <MaterialIcons name={action.icon} size={28} color={colors[action.fgKey]} />
                </View>
                <Text style={[typography.titleMedium, { color: colors.onSurface, marginTop: 10 }]}>
                  {action.label}
                </Text>
                <Text style={[typography.bodySmall, { color: colors.onSurfaceVariant, marginTop: 2 }]}>
                  {action.subtitle}
                </Text>
              </AnimatedPress>
            ))}
          </View>
        </Animated.View>

        {/* ── Featured businesses ── */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={[styles.section, { paddingHorizontal: spacing.xxl }]}
        >
          <SectionHeader
            title="Featured Businesses"
            onAction={() => router.push('/(tabs)/business')}
          />
          {loading ? (
            <>
              <BusinessCardSkeleton />
              <BusinessCardSkeleton />
            </>
          ) : featuredBusinesses.length > 0 ? (
            featuredBusinesses.map((b) => (
              <BusinessCard
                key={b.id}
                business={b}
                onPress={() => router.push({ pathname: '/business/[id]', params: { id: b.id } })}
              />
            ))
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.surfaceContainerLow, borderRadius: radii.lg }]}>
              <MaterialIcons name="storefront" size={32} color={colors.onSurfaceDisabled} />
              <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant, marginTop: 8 }]}>
                No businesses yet. Be the first to add one!
              </Text>
            </View>
          )}
        </Animated.View>

        {/* ── Need Legal Help? — compact practice area banner ── */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          style={[styles.section, { paddingHorizontal: spacing.xxl }]}
        >
          <SectionHeader
            title="Need Legal Help?"
            onAction={() => router.push('/(tabs)/legal')}
          />
          <AnimatedPress
            onPress={() => router.push('/(tabs)/legal')}
            pressScale={0.98}
            style={[
              styles.legalBanner,
              { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.outlineVariant },
            ]}
          >
            <View style={styles.legalChips}>
              {LEGAL_CATEGORIES.map((cat) => (
                <AnimatedPress
                  key={cat.key}
                  onPress={() => router.push({ pathname: '/legal/guides', params: { legalCategory: cat.key } } as any)}
                  pressScale={0.95}
                  haptic
                  style={[
                    styles.legalChip,
                    { backgroundColor: colors.primaryContainer, borderRadius: radii.full },
                  ]}
                >
                  <MaterialIcons name={cat.icon as any} size={16} color={colors.primary} />
                  <Text style={[typography.labelMedium, { color: colors.primary, marginLeft: 4 }]}>
                    {cat.label}
                  </Text>
                </AnimatedPress>
              ))}
            </View>
            <View style={styles.legalBannerFooter}>
              <Text style={[typography.bodySmall, { color: colors.onSurfaceVariant, flex: 1 }]}>
                Browse guides & find attorneys in your area
              </Text>
              <MaterialIcons name="arrow-forward" size={20} color={colors.primary} />
            </View>
          </AnimatedPress>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  /* Hero */
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroLogo: {
    width: 200,
    height: 200,
    borderRadius: 0,
    marginBottom: 0,
    marginTop: -10,
  },
  tagline: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  /* 2×2 quick-action grid */
  gridContainer: {
    marginTop: -12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  gridCard: {
    flex: 1,
    padding: 16,
  },
  gridIcon: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* Sections */
  section: {
    marginTop: 28,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  /* Legal help banner */
  legalBanner: {
    padding: 16,
    marginTop: 4,
  },
  legalChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  legalBannerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
});
