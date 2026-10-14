import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../src/theme';
import Card from '../../src/components/common/Card';
import { useAuth } from '../../src/contexts/AuthContext';
import { getReviewsByUser } from '../../src/services/reviewService';
import { Review } from '../../src/types';
import { trackScreen } from '../../src/config/analytics';

export default function MyReviewsScreen() {
  const { user } = useAuth();
  const { colors, typography, spacing } = useTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<unknown>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadReviews = useCallback(async (isRefresh = false) => {
    if (!user) return;
    setError(null);
    try {
      const result = await getReviewsByUser(user.uid, isRefresh ? undefined : cursor);
      setReviews(result.data);
      setCursor(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (e: any) {
      console.error('Failed to load reviews:', e);
      setError(e?.message ?? 'Failed to load reviews. Pull down to retry.');
    }
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  const loadMore = async () => {
    if (!user || !hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await getReviewsByUser(user.uid, cursor);
      setReviews((prev) => [...prev, ...result.data]);
      setCursor(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (e) {
      console.error('Failed to load more reviews:', e);
    }
    setLoadingMore(false);
  };

  useEffect(() => {
    trackScreen('MyReviews');
    loadReviews();
  }, [loadReviews]);

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialIcons
            key={star}
            name={star <= rating ? 'star' : 'star-border'}
            size={16}
            color={star <= rating ? '#F9A825' : colors.onSurfaceDisabled}
          />
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: Review }) => {
    const target = item.businessId
      ? { route: `/business/${item.businessId}`, icon: 'storefront' as const, label: 'Business' }
      : { route: `/legal/lawyer/${item.lawyerId}`, icon: 'gavel' as const, label: 'Attorney' };

    return (
      <Animated.View entering={FadeIn.duration(300)}>
        <TouchableOpacity
          onPress={() => router.push(target.route as any)}
          activeOpacity={0.7}
        >
          <Card variant="outlined" style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.typeIcon, { backgroundColor: colors.primaryContainer }]}>
                <MaterialIcons name={target.icon} size={18} color={colors.primary} />
              </View>
              <View style={styles.headerText}>
                <Text style={[typography.labelSmall, { color: colors.onSurfaceVariant }]}>
                  {target.label} Review
                </Text>
                {renderStars(item.rating)}
              </View>
              <Text style={[typography.labelSmall, { color: colors.onSurfaceDisabled }]}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
            <Text style={[typography.bodyMedium, { color: colors.onSurface, marginTop: 8 }]} numberOfLines={3}>
              {item.comment}
            </Text>
            {item.ownerResponse && (
              <View style={[styles.ownerResponse, { backgroundColor: colors.surfaceVariant, borderRadius: 8 }]}>
                <Text style={[typography.labelSmall, { color: colors.primary, marginBottom: 4 }]}>
                  Owner Response
                </Text>
                <Text style={[typography.bodySmall, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
                  {item.ownerResponse}
                </Text>
              </View>
            )}
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'My Reviews' }} />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'My Reviews' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {error ? (
          <View style={styles.center}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.errorContainer ?? '#FFDAD6' }]}>
              <MaterialIcons name="error-outline" size={48} color={colors.error ?? '#B3261E'} />
            </View>
            <Text style={[typography.titleMedium, { color: colors.onSurface, marginTop: 16 }]}>
              Something went wrong
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }]}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => { setLoading(true); loadReviews(); }}
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[typography.labelLarge, { color: '#fff' }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : reviews.length === 0 ? (
          <View style={styles.center}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialIcons name="rate-review" size={48} color={colors.onSurfaceVariant} />
            </View>
            <Text style={[typography.titleMedium, { color: colors.onSurface, marginTop: 16 }]}>
              No reviews yet
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }]}>
              Reviews you write for businesses and attorneys will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: spacing.md }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadReviews(true); }}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 16 }} color={colors.primary} /> : null}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 14 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  ownerResponse: {
    marginTop: 10,
    padding: 10,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
