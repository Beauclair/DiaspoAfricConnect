import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import SearchBar from '../../src/components/common/SearchBar';
import Card from '../../src/components/common/Card';
import CategoryChip from '../../src/components/common/CategoryChip';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorView from '../../src/components/common/ErrorView';
import { useCountry } from '../../src/contexts/CountryContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { requireAuth } from '../../src/utils/authGuard';
import { getLawyers, getLawyersByPracticeArea, searchLawyers } from '../../src/services/legalService';
import { Lawyer, LegalCategory } from '../../src/types';
import { LEGAL_CATEGORIES } from '../../src/constants/countries';
import { getUserMessage } from '../../src/utils/errorMessages';
import { trackEvent, trackScreen } from '../../src/config/analytics';
import { AnalyticsEvents } from '../../src/constants/analyticsEvents';

function LawyerCard({ lawyer, onPress }: { lawyer: Lawyer; onPress: () => void }) {
  const { colors } = useTheme();

  // Map practice area keys to readable labels
  const getSpecLabel = (key: string) => {
    const cat = LEGAL_CATEGORIES.find((c) => c.key === key);
    return cat?.label ?? key;
  };

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
    <Card style={styles.lawyerCard}>
      <View style={styles.lawyerHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.onPrimary }]}>
            {lawyer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <View style={styles.lawyerInfo}>
          <Text style={[styles.lawyerName, { color: colors.onSurface }]}>{lawyer.name}</Text>
          <Text style={[styles.firmName, { color: colors.onSurfaceVariant }]}>{lawyer.firm}</Text>
          <Text style={[styles.location, { color: colors.onSurfaceVariant }]}>{lawyer.city}, {lawyer.state}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <MaterialIcons name="star" size={14} color={colors.star} />
          <Text style={[styles.ratingText, { color: colors.onSurface }]}>{lawyer.averageRating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.tags}>
        {lawyer.specializations.map((s) => (
          <View key={s} style={[styles.tag, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.tagText, { color: colors.primary }]}>{getSpecLabel(s)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.details}>
        {lawyer.languagesSpoken.length > 0 && (
          <View style={styles.detailRow}>
            <MaterialIcons name="translate" size={16} color={colors.onSurfaceVariant} />
            <Text style={[styles.detailText, { color: colors.onSurfaceVariant }]}>{lawyer.languagesSpoken.join(', ')}</Text>
          </View>
        )}
      </View>

      <View style={[styles.actions, { borderTopColor: colors.outline }]}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${lawyer.phone}`)}>
          <MaterialIcons name="phone" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`mailto:${lawyer.email}`)}>
          <MaterialIcons name="email" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Email</Text>
        </TouchableOpacity>
        {lawyer.website && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(lawyer.website!)}>
            <MaterialIcons name="language" size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Website</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
    </TouchableOpacity>
  );
}

export default function LawyerDirectoryScreen() {
  const { practiceArea: initialPracticeArea } = useLocalSearchParams<{ practiceArea?: string }>();
  const { hostCountry } = useCountry();
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [selectedArea, setSelectedArea] = useState<LegalCategory | null>(
    (initialPracticeArea as LegalCategory) || null
  );
  const cursorRef = useRef<unknown>(null);
  const hasMoreRef = useRef(true);

  const loadLawyers = useCallback(async () => {
    setError('');
    setLoading(true);
    cursorRef.current = null;
    hasMoreRef.current = true;
    try {
      const page = selectedArea
        ? await getLawyersByPracticeArea(selectedArea, hostCountry)
        : await getLawyers(hostCountry);
      setLawyers(page.data);
      cursorRef.current = page.lastDoc;
      hasMoreRef.current = page.hasMore;
    } catch (e: any) {
      setError(getUserMessage(e, 'loadLawyers', 'Failed to load attorneys.'));
    }
    setLoading(false);
  }, [hostCountry, selectedArea]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMoreRef.current || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      const page = selectedArea
        ? await getLawyersByPracticeArea(selectedArea, hostCountry, cursorRef.current)
        : await getLawyers(hostCountry, cursorRef.current);
      setLawyers((prev) => [...prev, ...page.data]);
      cursorRef.current = page.lastDoc;
      hasMoreRef.current = page.hasMore;
    } catch {
      // Silently fail on load-more
    } finally {
      setLoadingMore(false);
    }
  }, [hostCountry, selectedArea, loadingMore]);

  useEffect(() => {
    trackScreen('LawyerDirectory');
    loadLawyers();
  }, [loadLawyers]);

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.length > 2) {
      setLoading(true);
      cursorRef.current = null;
      hasMoreRef.current = false;
      try {
        const results = await searchLawyers(text, hostCountry);
        setLawyers(results.data);
        trackEvent(AnalyticsEvents.LAWYER_SEARCH, { search_term: text, result_count: results.data.length });
      } catch (e: any) {
        setError(getUserMessage(e, 'searchLawyers', 'Search failed.'));
      }
      setLoading(false);
    } else if (text.length === 0) {
      loadLawyers();
    }
  };

  const headerTitle = selectedArea
    ? `${LEGAL_CATEGORIES.find((c) => c.key === selectedArea)?.label ?? ''} Attorneys`
    : 'Find an Attorney';

  const ListFooter = loadingMore ? (
    <ActivityIndicator size="small" color={colors.primary} style={{ paddingVertical: 16 }} />
  ) : null;

  return (
    <>
      <Stack.Screen options={{ headerTitle }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.searchSection}>
          <SearchBar value={search} onChangeText={handleSearch} placeholder="Search attorneys..." />
        </View>

        {/* Practice area filter chips */}
        <View style={styles.filterChips}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={LEGAL_CATEGORIES}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <CategoryChip
                label={item.label}
                selected={selectedArea === item.key}
                onPress={() => {
                  setSearch('');
                  setSelectedArea(selectedArea === item.key ? null : item.key);
                }}
              />
            )}
          />
        </View>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorView message={error} onRetry={loadLawyers} />
        ) : (
          <FlatList
            data={lawyers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <LawyerCard
                lawyer={item}
                onPress={() => router.push({ pathname: '/legal/lawyer/[id]', params: { id: item.id } })}
              />
            )}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.list, { paddingBottom: Math.max(insets.bottom, 16) + 80 }]}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={ListFooter}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="gavel" size={48} color={colors.onSurfaceVariant} />
                <Text style={[styles.empty, { color: colors.onSurfaceVariant }]}>No attorneys registered yet</Text>
                <TouchableOpacity
                  style={styles.registerLink}
                  onPress={() => requireAuth(user, () => router.push('/legal/register-lawyer'))}
                >
                  <Text style={[styles.registerLinkText, { color: colors.primary }]}>Be the first to register</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary, bottom: Math.max(insets.bottom, 16) + 16 }]}
          onPress={() => requireAuth(user, () => router.push('/legal/register-lawyer'))}
          accessibilityRole="button"
          accessibilityLabel="Register as an attorney"
        >
          <MaterialIcons name="person-add" size={24} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchSection: { padding: 16, paddingBottom: 4 },
  filterChips: { paddingHorizontal: 16, paddingBottom: 8 },
  list: { padding: 16, paddingBottom: 24 },
  empty: { textAlign: 'center', marginTop: 12, fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  registerLink: { marginTop: 12 },
  registerLinkText: { fontSize: 15, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  lawyerCard: { marginBottom: 12 },
  lawyerHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: 'bold' },
  lawyerInfo: { flex: 1 },
  lawyerName: { fontSize: 16, fontWeight: '700' },
  firmName: { fontSize: 13, marginTop: 2 },
  location: { fontSize: 12 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 14, fontWeight: '600' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 6 },
  tag: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, fontWeight: '500' },
  details: { marginTop: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 },
  detailText: { fontSize: 13 },
  actions: { flexDirection: 'row', marginTop: 12, gap: 12, borderTopWidth: 1, paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 14, fontWeight: '600' },
});
