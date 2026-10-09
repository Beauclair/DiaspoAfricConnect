import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';
import GuideCard from '../../src/components/legal/GuideCard';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorView from '../../src/components/common/ErrorView';
import CategoryChip from '../../src/components/common/CategoryChip';
import { useCountry } from '../../src/contexts/CountryContext';
import { getGuides, getGuidesByCategory, getGuidesByLegalCategory } from '../../src/services/legalService';
import { LegalGuide, ImmigrationCategory, LegalCategory } from '../../src/types';
import { LEGAL_CATEGORIES } from '../../src/constants/countries';
import { trackScreen } from '../../src/config/analytics';
import { getUserMessage } from '../../src/utils/errorMessages';

export default function GuideListScreen() {
  const { category: initialCategory, legalCategory: initialLegalCategory } = useLocalSearchParams<{
    category?: string;
    legalCategory?: string;
  }>();
  const { hostCountry, countryConfig } = useCountry();
  const { colors } = useTheme();
  const [guides, setGuides] = useState<LegalGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ImmigrationCategory | null>(
    (initialCategory as ImmigrationCategory) || null
  );
  const [selectedLegalCategory, setSelectedLegalCategory] = useState<LegalCategory | null>(
    (initialLegalCategory as LegalCategory) || null
  );
  const cursorRef = useRef<unknown>(null);
  const hasMoreRef = useRef(true);

  // Show immigration sub-categories when viewing immigration practice area
  const showSubCategories = selectedLegalCategory === 'immigration' || (!selectedLegalCategory && !initialLegalCategory);

  const loadGuides = useCallback(async () => {
    setLoading(true);
    setError('');
    cursorRef.current = null;
    hasMoreRef.current = true;
    try {
      let page;
      if (selectedCategory) {
        page = await getGuidesByCategory(selectedCategory, hostCountry);
      } else if (selectedLegalCategory) {
        page = await getGuidesByLegalCategory(selectedLegalCategory, hostCountry);
      } else {
        page = await getGuides(hostCountry);
      }
      setGuides(page.data);
      cursorRef.current = page.lastDoc;
      hasMoreRef.current = page.hasMore;
    } catch (e: any) {
      setGuides([]);
      setError(getUserMessage(e, 'loadGuides', 'Failed to load guides.'));
    }
    setLoading(false);
  }, [selectedCategory, selectedLegalCategory, hostCountry]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMoreRef.current || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      let page;
      if (selectedCategory) {
        page = await getGuidesByCategory(selectedCategory, hostCountry, cursorRef.current);
      } else if (selectedLegalCategory) {
        page = await getGuidesByLegalCategory(selectedLegalCategory, hostCountry, cursorRef.current);
      } else {
        page = await getGuides(hostCountry, cursorRef.current);
      }
      setGuides((prev) => [...prev, ...page.data]);
      cursorRef.current = page.lastDoc;
      hasMoreRef.current = page.hasMore;
    } catch {
      // Silently fail on load-more
    } finally {
      setLoadingMore(false);
    }
  }, [selectedCategory, selectedLegalCategory, hostCountry, loadingMore]);

  useEffect(() => {
    trackScreen('LegalGuides');
    loadGuides();
  }, [loadGuides]);

  const headerTitle = selectedLegalCategory
    ? `${LEGAL_CATEGORIES.find((c) => c.key === selectedLegalCategory)?.label ?? 'Legal'} Guides`
    : 'Legal Guides';

  const ListFooter = loadingMore ? (
    <ActivityIndicator size="small" color={colors.primary} style={{ paddingVertical: 16 }} />
  ) : null;

  return (
    <>
      <Stack.Screen options={{ headerTitle }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Practice area filter chips */}
        <View style={styles.categories}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={LEGAL_CATEGORIES}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <CategoryChip
                label={item.label}
                selected={selectedLegalCategory === item.key}
                onPress={() => {
                  setSelectedCategory(null);
                  setSelectedLegalCategory(selectedLegalCategory === item.key ? null : item.key);
                }}
              />
            )}
          />
        </View>

        {/* Legal disclaimer banner */}
        <View style={[styles.disclaimerBanner, { backgroundColor: colors.warning + '12' }]}>
          <MaterialIcons name="info-outline" size={14} color={colors.warning} />
          <Text style={[styles.disclaimerBannerText, { color: colors.onSurfaceVariant }]}>
            For general information only — not legal advice. Always consult a qualified attorney.
          </Text>
        </View>

        {/* Immigration sub-category chips (shown when immigration is selected) */}
        {selectedLegalCategory === 'immigration' && (
          <View style={styles.subCategories}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={countryConfig.immigrationSubCategories}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <CategoryChip
                  label={item.label}
                  selected={selectedCategory === item.key}
                  onPress={() => setSelectedCategory(
                    selectedCategory === item.key ? null : item.key as ImmigrationCategory
                  )}
                />
              )}
            />
          </View>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorView message={error} onRetry={loadGuides} />
        ) : (
          <FlatList
            data={guides}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <GuideCard
                guide={item}
                onPress={() => router.push({ pathname: '/legal/guide/[id]', params: { id: item.id } })}
              />
            )}
            contentContainerStyle={styles.list}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={ListFooter}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="library-books" size={56} color={colors.outlineVariant} />
                <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No guides yet</Text>
                <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                  {selectedLegalCategory
                    ? `We're working on adding ${LEGAL_CATEGORIES.find((c) => c.key === selectedLegalCategory)?.label ?? 'legal'} guides for your country. Check back soon!`
                    : 'Legal guides will appear here once available for your country.'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  categories: { padding: 16, paddingBottom: 4 },
  disclaimerBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 16, marginTop: 4, marginBottom: 4,
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
  },
  disclaimerBannerText: { flex: 1, fontSize: 11, lineHeight: 15 },
  subCategories: { paddingHorizontal: 16, paddingBottom: 8 },
  list: { padding: 16, paddingBottom: 24 },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptyText: { textAlign: 'center', marginTop: 8, fontSize: 14, lineHeight: 20 },
});
