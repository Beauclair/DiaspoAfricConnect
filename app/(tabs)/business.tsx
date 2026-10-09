import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../src/theme';
import SearchBar from '../../src/components/common/SearchBar';
import CategoryChip from '../../src/components/common/CategoryChip';
import BusinessCard from '../../src/components/business/BusinessCard';
import Button from '../../src/components/common/Button';
import ErrorView from '../../src/components/common/ErrorView';
import { BusinessCardSkeleton } from '../../src/components/common/Skeleton';
import AnimatedPress from '../../src/components/common/AnimatedPressable';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCountry } from '../../src/contexts/CountryContext';
import { requireAuth } from '../../src/utils/authGuard';
import { getBusinesses, getBusinessesByCategory, searchBusinesses } from '../../src/services/businessService';
import { Business, BusinessCategory } from '../../src/types';
import { getUserMessage } from '../../src/utils/errorMessages';
import { BUSINESS_CATEGORIES } from '../../src/constants/categories';
import { trackEvent, trackScreen } from '../../src/config/analytics';
import { AnalyticsEvents } from '../../src/constants/analyticsEvents';
import { getCurrentLocation, getDistanceKm, formatDistance } from '../../src/utils/location';

export default function BusinessListScreen() {
  const { user } = useAuth();
  const { hostCountry } = useCountry();
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null);
  const [error, setError] = useState('');
  const hasLoadedOnce = useRef(false);
  const cursorRef = useRef<unknown>(null);
  const hasMoreRef = useRef(true);
  const [nearMe, setNearMe] = useState(false);
  const userCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);

  /** Sort businesses by distance from the user and compute display distances. */
  const withDistance = useCallback(
    (list: Business[]): { sorted: Business[]; distances: Map<string, string> } => {
      const distances = new Map<string, string>();
      const loc = userCoordsRef.current;
      if (!loc) return { sorted: list, distances };

      const decorated = list.map((b) => {
        const km = getDistanceKm(loc.latitude, loc.longitude, b.coordinates.latitude, b.coordinates.longitude);
        const label = formatDistance(km);
        if (label) distances.set(b.id, label);
        return { b, km };
      });
      decorated.sort((a, b) => a.km - b.km);
      return { sorted: decorated.map((d) => d.b), distances };
    },
    [],
  );

  const [distanceMap, setDistanceMap] = useState<Map<string, string>>(new Map());

  const loadBusinesses = useCallback(async () => {
    if (!hasLoadedOnce.current) setLoading(true);
    setError('');
    cursorRef.current = null;
    hasMoreRef.current = true;
    try {
      const page = selectedCategory
        ? await getBusinessesByCategory(selectedCategory, hostCountry)
        : await getBusinesses(hostCountry);

      if (nearMe && userCoordsRef.current) {
        const { sorted, distances } = withDistance(page.data);
        setBusinesses(sorted);
        setDistanceMap(distances);
      } else {
        setBusinesses(page.data);
        setDistanceMap(new Map());
      }

      cursorRef.current = page.lastDoc;
      hasMoreRef.current = page.hasMore;
      hasLoadedOnce.current = true;
    } catch (e: any) {
      setBusinesses([]);
      if (!hasLoadedOnce.current) setError(getUserMessage(e, 'loadBusinesses', 'Failed to load businesses.'));
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, hostCountry, nearMe, withDistance]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMoreRef.current || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      const page = selectedCategory
        ? await getBusinessesByCategory(selectedCategory, hostCountry, cursorRef.current)
        : await getBusinesses(hostCountry, cursorRef.current);
      setBusinesses((prev) => [...prev, ...page.data]);
      cursorRef.current = page.lastDoc;
      hasMoreRef.current = page.hasMore;
    } catch {
      // Silently fail on load-more — user still has current data
    } finally {
      setLoadingMore(false);
    }
  }, [selectedCategory, hostCountry, loadingMore]);

  const refreshList = useCallback(async () => {
    trackScreen('BusinessList');
    if (search.length > 2) {
      setLoading(true);
      try {
        const results = await searchBusinesses(search, hostCountry);
        setBusinesses(results.data);
        cursorRef.current = results.lastDoc;
        hasMoreRef.current = results.hasMore;
      } catch {
        // Keep stale results on refocus failure
      } finally {
        setLoading(false);
      }
    } else {
      loadBusinesses();
    }
  }, [search, hostCountry, loadBusinesses]);

  useFocusEffect(
    useCallback(() => {
      refreshList();
    }, [refreshList])
  );

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.length > 2) {
      setLoading(true);
      try {
        const results = await searchBusinesses(text, hostCountry);
        setBusinesses(results.data);
        cursorRef.current = results.lastDoc;
        hasMoreRef.current = results.hasMore;
        trackEvent(AnalyticsEvents.BUSINESS_SEARCH, { search_term: text, result_count: results.data.length });
      } catch (e: any) {
        setError(getUserMessage(e, 'searchBusinesses', 'Search failed.'));
      } finally {
        setLoading(false);
      }
    } else if (text.length === 0) {
      loadBusinesses();
    }
  };

  const handleCategoryPress = (key: BusinessCategory) => {
    const newCategory = selectedCategory === key ? null : key;
    setSelectedCategory(newCategory);
    setSearch('');
    if (newCategory) {
      trackEvent(AnalyticsEvents.BUSINESS_CATEGORY_FILTERED, { category: newCategory });
    }
  };

  const handleNearMe = async () => {
    if (nearMe) {
      // Toggle off
      setNearMe(false);
      userCoordsRef.current = null;
      setDistanceMap(new Map());
      return;
    }
    // Toggle on — request location
    const loc = await getCurrentLocation();
    if (!loc) {
      Alert.alert('Location unavailable', 'Please allow location access in your device settings to use Near Me.');
      return;
    }
    userCoordsRef.current = loc;
    setNearMe(true);
    trackEvent('near_me_toggled', { enabled: true });
  };

  const renderItem = ({ item, index }: { item: Business; index: number }) => (
    <Animated.View entering={FadeIn.delay(Math.min(index * 40, 160)).duration(250)}>
      <BusinessCard
        business={item}
        onPress={() => router.push({ pathname: '/business/[id]', params: { id: item.id } })}
        distance={distanceMap.get(item.id)}
      />
    </Animated.View>
  );

  const ListFooter = loadingMore ? (
    <ActivityIndicator size="small" color={colors.primary} style={{ paddingVertical: 16 }} />
  ) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#1B6B2E', '#145222']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Text style={[typography.displaySmall, { color: '#FFFFFF' }]}>
          Businesses
        </Text>
        <Text style={[typography.bodyMedium, { color: 'rgba(255,255,255,0.8)', marginTop: 2 }]}>
          Discover African-owned businesses
        </Text>
      </LinearGradient>

      {/* Sticky search + categories */}
      <View style={[styles.filterSection, { backgroundColor: colors.background }]}>
        <View style={{ paddingHorizontal: spacing.xxl, paddingTop: spacing.xl }}>
          <SearchBar
            value={search}
            onChangeText={handleSearch}
            placeholder="Search businesses..."
          />
        </View>
        <View style={{ paddingHorizontal: spacing.xxl, paddingTop: spacing.lg }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <CategoryChip
              label={nearMe ? '📍 Near Me' : '📍 Near Me'}
              selected={nearMe}
              onPress={handleNearMe}
            />
            {BUSINESS_CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.key}
                label={cat.label}
                selected={selectedCategory === cat.key}
                onPress={() => handleCategoryPress(cat.key)}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Business list */}
      {loading ? (
        <View style={{ paddingHorizontal: spacing.xxl, paddingTop: spacing.xl }}>
          <BusinessCardSkeleton />
          <BusinessCardSkeleton />
          <BusinessCardSkeleton />
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={loadBusinesses} />
      ) : (
        <FlatList
          data={businesses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: spacing.xxl, paddingBottom: 120 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={
            <View style={[styles.empty, { backgroundColor: colors.surfaceContainerLow, borderRadius: radii.lg }]}>
              <MaterialIcons name="search-off" size={48} color={colors.onSurfaceDisabled} />
              <Text style={[typography.titleMedium, { color: colors.onSurface, marginTop: 12 }]}>
                No businesses found
              </Text>
              <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' }]}>
                Be the first to list your business
              </Text>
              <Button
                title="Add a Business"
                onPress={() => requireAuth(user, () => router.push('/business/add'))}
                variant="tonal"
                icon="add"
                style={{ marginTop: 16 }}
              />
            </View>
          }
        />
      )}

      {/* FAB */}
      <AnimatedPress
        onPress={() => requireAuth(user, () => router.push('/business/add'))}
        pressScale={0.92}
        haptic
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            borderRadius: radii.full,
          },
          shadows.lg,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Add business"
      >
        <MaterialIcons name="add" size={28} color={colors.onPrimary} />
      </AnimatedPress>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filterSection: {
    // Sticky search and category area
  },
  empty: {
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
