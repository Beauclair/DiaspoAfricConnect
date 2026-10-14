import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme, Typography } from '../../src/theme';
import Card from '../../src/components/common/Card';
import { useAuth } from '../../src/contexts/AuthContext';
import { getOwnerListings, OwnerListing } from '../../src/services/dashboardService';
import { trackScreen, trackEvent } from '../../src/config/analytics';
import { AnalyticsEvents } from '../../src/constants/analyticsEvents';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors, typography, spacing, radii } = useTheme();
  const [listings, setListings] = useState<OwnerListing[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const data = await getOwnerListings(user.uid);
      setListings(data);
      if (data.length > 0) {
        trackEvent(AnalyticsEvents.DASHBOARD_VIEWED, {
          entity_type: data[0].entityType,
          entity_id: data[0].id,
        });
      }
    } catch (e: any) {
      console.error('Failed to load dashboard:', e);
      setError(e?.message ?? 'Failed to load dashboard data.');
    }
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    trackScreen('Dashboard');
    loadData();
  }, [loadData]);

  const selected = listings[selectedIndex];

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    setPickerOpen(false);
    if (listings[index]) {
      trackEvent(AnalyticsEvents.DASHBOARD_VIEWED, {
        entity_type: listings[index].entityType,
        entity_id: listings[index].id,
      });
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Activity Dashboard' }} />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: 'Activity Dashboard' }} />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
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
            onPress={() => { setLoading(true); loadData(); }}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={[typography.labelLarge, { color: '#fff' }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  if (listings.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'Activity Dashboard' }} />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialIcons name="insights" size={48} color={colors.onSurfaceVariant} />
          </View>
          <Text style={[typography.titleMedium, { color: colors.onSurface, marginTop: 16 }]}>
            No listings found
          </Text>
          <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }]}>
            Add a business or attorney profile to see your activity dashboard.
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Activity Dashboard' }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
      >
        {/* Listing picker */}
        {listings.length > 1 && (
          <Animated.View entering={FadeIn.duration(300)}>
            <Text style={[typography.labelMedium, { color: colors.onSurfaceVariant, marginBottom: 6 }]}>
              Select Listing
            </Text>
            <TouchableOpacity
              onPress={() => setPickerOpen(!pickerOpen)}
              style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: radii.md }]}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={selected.entityType === 'business' ? 'storefront' : 'gavel'}
                size={20}
                color={colors.primary}
              />
              <Text style={[typography.bodyLarge, { color: colors.onSurface, flex: 1 }]} numberOfLines={1}>
                {selected.name}
              </Text>
              <MaterialIcons
                name={pickerOpen ? 'expand-less' : 'expand-more'}
                size={24}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
            {pickerOpen && (
              <Card variant="outlined" style={[styles.pickerDropdown, { borderColor: colors.outline }]}>
                {listings.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.entityType}-${item.id}`}
                    onPress={() => handleSelect(index)}
                    style={[
                      styles.pickerItem,
                      index === selectedIndex && { backgroundColor: colors.primaryContainer },
                    ]}
                  >
                    <MaterialIcons
                      name={item.entityType === 'business' ? 'storefront' : 'gavel'}
                      size={18}
                      color={index === selectedIndex ? colors.primary : colors.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        typography.bodyMedium,
                        { color: index === selectedIndex ? colors.primary : colors.onSurface, flex: 1 },
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    {index === selectedIndex && (
                      <MaterialIcons name="check" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </Card>
            )}
          </Animated.View>
        )}

        {/* Single listing header (when only 1 listing) */}
        {listings.length === 1 && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.singleHeader}>
            <MaterialIcons
              name={selected.entityType === 'business' ? 'storefront' : 'gavel'}
              size={22}
              color={colors.primary}
            />
            <Text style={[typography.titleLarge, { color: colors.onSurface, flex: 1 }]} numberOfLines={1}>
              {selected.name}
            </Text>
          </Animated.View>
        )}

        {/* Stats grid */}
        <Animated.View entering={FadeIn.duration(400).delay(100)} style={styles.statsGrid}>
          <StatCard
            icon="visibility"
            label="Views"
            value={selected.totalViews}
            color={colors.primary}
            bgColor={colors.primaryContainer}
            colors={colors}
            typography={typography}
            radii={radii}
          />
          <StatCard
            icon="star"
            label="Rating"
            value={selected.averageRating > 0 ? selected.averageRating.toFixed(1) : '—'}
            color={colors.star}
            bgColor={colors.secondaryContainer}
            colors={colors}
            typography={typography}
            radii={radii}
          />
          <StatCard
            icon="touch-app"
            label="Contact Taps"
            value={selected.totalContactTaps}
            color="#7C3AED"
            bgColor="#EDE9FE"
            colors={colors}
            typography={typography}
            radii={radii}
          />
          {selected.entityType === 'business' ? (
            <StatCard
              icon="bookmark"
              label="Saves"
              value={selected.totalSaves}
              color="#0891B2"
              bgColor="#CFFAFE"
              colors={colors}
              typography={typography}
              radii={radii}
            />
          ) : (
            <StatCard
              icon="rate-review"
              label="Reviews"
              value={selected.reviewCount}
              color="#059669"
              bgColor="#D1FAE5"
              colors={colors}
              typography={typography}
              radii={radii}
            />
          )}
        </Animated.View>

        {/* Reviews summary (show for business since saves took the 4th slot) */}
        {selected.entityType === 'business' && (
          <Animated.View entering={FadeIn.duration(400).delay(200)}>
            <Card variant="outlined" style={styles.reviewSummary}>
              <View style={styles.reviewSummaryRow}>
                <View style={[styles.reviewSummaryIcon, { backgroundColor: '#D1FAE5' }]}>
                  <MaterialIcons name="rate-review" size={22} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.titleLarge, { color: colors.onSurface }]}>
                    {selected.reviewCount}
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.onSurfaceVariant }]}>
                    Total Reviews
                  </Text>
                </View>
                <View style={styles.ratingPill}>
                  <MaterialIcons name="star" size={16} color={colors.star} />
                  <Text style={[typography.labelLarge, { color: colors.onSurface }]}>
                    {selected.averageRating > 0 ? selected.averageRating.toFixed(1) : '—'}
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Tips section */}
        <Animated.View entering={FadeIn.duration(400).delay(300)}>
          <Text style={[typography.titleMedium, { color: colors.onSurface, marginTop: 24, marginBottom: 12 }]}>
            Tips to Grow
          </Text>
          {selected.totalViews === 0 && (
            <TipCard
              icon="share"
              text="Share your listing link with friends and on social media to get your first views."
              colors={colors}
              typography={typography}
              radii={radii}
            />
          )}
          {selected.reviewCount === 0 && (
            <TipCard
              icon="star-border"
              text="Ask your customers to leave a review — listings with reviews rank higher in search."
              colors={colors}
              typography={typography}
              radii={radii}
            />
          )}
          {selected.averageRating > 0 && selected.averageRating < 4 && (
            <TipCard
              icon="trending-up"
              text="Respond to reviews to show customers you care. It often encourages updated ratings."
              colors={colors}
              typography={typography}
              radii={radii}
            />
          )}
          {selected.totalViews > 0 && selected.totalContactTaps === 0 && (
            <TipCard
              icon="phone-in-talk"
              text="People are viewing your profile but not reaching out. Make sure your contact info is up to date."
              colors={colors}
              typography={typography}
              radii={radii}
            />
          )}
          {selected.totalViews > 5 && selected.totalContactTaps > 0 && selected.reviewCount > 0 && (
            <TipCard
              icon="emoji-events"
              text="Your listing is performing well! Keep your info updated and respond to reviews promptly."
              colors={colors}
              typography={typography}
              radii={radii}
            />
          )}
          {/* Always show at least one general tip */}
          <TipCard
            icon="photo-camera"
            text="Listings with photos get up to 3x more views. Add quality photos to stand out."
            colors={colors}
            typography={typography}
            radii={radii}
          />
        </Animated.View>
      </ScrollView>
    </>
  );
}

// ── Stat Card Component ──

function StatCard({
  icon, label, value, color, bgColor, colors, typography, radii,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
  colors: any;
  typography: any;
  radii: any;
}) {
  return (
    <Card variant="outlined" style={[styles.statCard, { borderRadius: radii.lg }]}>
      <View style={[styles.statIconWrap, { backgroundColor: bgColor }]}>
        <MaterialIcons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.onSurface }]}>
        {typeof value === 'number' ? formatNumber(value) : value}
      </Text>
      <Text style={[typography.labelSmall, { color: colors.onSurfaceVariant }]}>
        {label}
      </Text>
    </Card>
  );
}

// ── Tip Card Component ──

function TipCard({
  icon, text, colors, typography, radii,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  text: string;
  colors: any;
  typography: any;
  radii: any;
}) {
  return (
    <View style={[styles.tipCard, { backgroundColor: colors.surfaceVariant, borderRadius: radii.md }]}>
      <MaterialIcons name={icon} size={20} color={colors.primary} style={{ marginTop: 2 }} />
      <Text style={[typography.bodySmall, { color: colors.onSurface, flex: 1, lineHeight: 18 }]}>
        {text}
      </Text>
    </View>
  );
}

// ── Helpers ──

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

// ── Styles ──

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  retryButton: {
    marginTop: 20, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20,
  },

  // Picker
  picker: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderWidth: 1, marginBottom: 4,
  },
  pickerDropdown: {
    marginBottom: 12, overflow: 'hidden',
  },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  singleHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginTop: 16,
  },
  statCard: {
    width: '47%', flexGrow: 1,
    padding: 14, alignItems: 'center', gap: 6,
  },
  statIconWrap: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
  },
  statValue: {
    ...Typography.headlineMedium,
    fontWeight: '700',
  },

  // Review summary
  reviewSummary: { marginTop: 10, padding: 14 },
  reviewSummaryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  reviewSummaryIcon: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
  },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
  },

  // Tips
  tipCard: {
    flexDirection: 'row', gap: 10, padding: 12, marginBottom: 8,
  },
});
