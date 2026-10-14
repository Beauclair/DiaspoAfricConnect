import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../src/theme';
import Card from '../../src/components/common/Card';
import { useAuth } from '../../src/contexts/AuthContext';
import { getSavedBusinessIds, toggleSavedBusiness } from '../../src/services/authService';
import { getBusinessesByIds } from '../../src/services/businessService';
import { Business } from '../../src/types';
import { trackScreen } from '../../src/config/analytics';

export default function SavedBusinessesScreen() {
  const { user } = useAuth();
  const { colors, typography, spacing, radii } = useTheme();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSaved = useCallback(async () => {
    if (!user) return;
    try {
      const ids = await getSavedBusinessIds(user.uid);
      if (ids.length > 0) {
        const biz = await getBusinessesByIds(ids);
        setBusinesses(biz);
      } else {
        setBusinesses([]);
      }
    } catch (e) {
      console.error('Failed to load saved businesses:', e);
    }
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    trackScreen('SavedBusinesses');
    loadSaved();
  }, [loadSaved]);

  const handleUnsave = async (businessId: string) => {
    if (!user) return;
    Alert.alert('Remove Saved', 'Remove this business from your saved list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await toggleSavedBusiness(user.uid, businessId);
          setBusinesses((prev) => prev.filter((b) => b.id !== businessId));
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Business }) => (
    <Animated.View entering={FadeIn.duration(300)}>
      <TouchableOpacity
        onPress={() => router.push(`/business/${item.id}`)}
        activeOpacity={0.7}
      >
        <Card variant="outlined" style={styles.card}>
          <View style={styles.cardRow}>
            <View style={[styles.categoryIcon, { backgroundColor: colors.primaryContainer }]}>
              <MaterialIcons name="storefront" size={22} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[typography.titleMedium, { color: colors.onSurface }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.onSurfaceVariant, marginTop: 2 }]} numberOfLines={1}>
                {item.category?.charAt(0).toUpperCase() + item.category?.slice(1)} · {item.city}, {item.state}
              </Text>
              {item.averageRating > 0 && (
                <View style={styles.ratingRow}>
                  <MaterialIcons name="star" size={14} color="#F9A825" />
                  <Text style={[typography.labelSmall, { color: colors.onSurfaceVariant, marginLeft: 2 }]}>
                    {item.averageRating.toFixed(1)} ({item.reviewCount})
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => handleUnsave(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="bookmark" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Saved Businesses' }} />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Saved Businesses' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {businesses.length === 0 ? (
          <View style={styles.center}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialIcons name="bookmark-border" size={48} color={colors.onSurfaceVariant} />
            </View>
            <Text style={[typography.titleMedium, { color: colors.onSurface, marginTop: 16 }]}>
              No saved businesses
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }]}>
              Tap the bookmark icon on any business to save it for later.
            </Text>
          </View>
        ) : (
          <FlatList
            data={businesses}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: spacing.md }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadSaved(); }}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 0 },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
