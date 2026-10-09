import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { router, Stack, Redirect, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, Typography } from '../../src/theme';
import Card from '../../src/components/common/Card';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorView from '../../src/components/common/ErrorView';
import Button from '../../src/components/common/Button';
import VerificationBadge from '../../src/components/common/VerificationBadge';
import { useAuth } from '../../src/contexts/AuthContext';
import { getLawyersByOwner, deleteLawyer } from '../../src/services/legalService';
import { LEGAL_CATEGORIES } from '../../src/constants/countries';
import { Lawyer } from '../../src/types';
import { getUserMessage } from '../../src/utils/errorMessages';
import { trackEvent } from '../../src/config/analytics';
import { AnalyticsEvents } from '../../src/constants/analyticsEvents';

export default function MyLawyersScreen() {
  const { user } = useAuth();
  const { colors, radii } = useTheme();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMyLawyers = useCallback(async () => {
    if (!user) return;
    setError('');
    setLoading(true);
    try {
      const data = await getLawyersByOwner(user.uid);
      setLawyers(data);
    } catch (e: any) {
      setError(getUserMessage(e, 'loadMyLawyers', 'Failed to load your attorney profiles.'));
    }
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadMyLawyers();
    }, [loadMyLawyers])
  );

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const getSpecLabel = (key: string) => {
    const cat = LEGAL_CATEGORIES.find((c) => c.key === key);
    return cat?.label ?? key;
  };

  const handleDelete = (lawyer: Lawyer) => {
    Alert.alert(
      'Delete Attorney Profile',
      `Are you sure you want to delete "${lawyer.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLawyer(lawyer.id);
              trackEvent(AnalyticsEvents.LAWYER_DELETED, { lawyer_id: lawyer.id });
              setLawyers((prev) => prev.filter((l) => l.id !== lawyer.id));
            } catch (e: any) {
              Alert.alert('Error', getUserMessage(e, 'deleteLawyer', 'Failed to delete attorney profile.'));
            }
          },
        },
      ]
    );
  };

  const renderLawyer = ({ item }: { item: Lawyer }) => (
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => router.push({ pathname: '/legal/lawyer/[id]', params: { id: item.id } })}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary + '20', borderRadius: radii.full }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {item.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.onSurface }]} numberOfLines={1}>{item.name}</Text>
            {item.verificationStatus === 'verified' && (
              <VerificationBadge status="verified" variant="compact" size="sm" />
            )}
          </View>
          <Text style={[styles.firm, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{item.firm}</Text>
          <View style={styles.specRow}>
            {item.specializations.slice(0, 2).map((s) => (
              <View key={s} style={[styles.specChip, { backgroundColor: colors.primary + '15', borderRadius: radii.full }]}>
                <Text style={[styles.specText, { color: colors.primary }]}>{getSpecLabel(s)}</Text>
              </View>
            ))}
            {item.specializations.length > 2 && (
              <Text style={[styles.moreText, { color: colors.onSurfaceVariant }]}>+{item.specializations.length - 2}</Text>
            )}
          </View>
          <View style={styles.statsRow}>
            <MaterialIcons name="star" size={14} color={colors.star} />
            <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>
              {item.averageRating.toFixed(1)} ({item.reviewCount})
            </Text>
            <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>
              •  {item.city}, {item.state}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={[styles.actions, { borderTopColor: colors.outline + '30' }]}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push({ pathname: '/legal/edit-lawyer', params: { id: item.id } })}
        >
          <MaterialIcons name="edit" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDelete(item)}
        >
          <MaterialIcons name="delete" size={18} color={colors.tertiary} />
          <Text style={[styles.actionText, { color: colors.tertiary }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'My Attorney Profiles' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorView message={error} onRetry={loadMyLawyers} />
        ) : (
          <FlatList
            data={lawyers}
            keyExtractor={(item) => item.id}
            renderItem={renderLawyer}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialIcons name="gavel" size={64} color={colors.onSurfaceVariant} />
                <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No attorney profiles</Text>
                <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                  Register as an attorney to offer your services to the African diaspora community
                </Text>
                <Button
                  title="Register as Attorney"
                  onPress={() => router.push('/legal/register-lawyer')}
                  style={{ marginTop: 20 }}
                />
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
  list: { padding: 16, paddingBottom: 24 },
  card: { marginBottom: 12 },
  cardContent: { flexDirection: 'row', gap: 12 },
  avatar: {
    width: 50, height: 50, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: 'bold' },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { ...Typography.titleMedium, fontWeight: '600', flex: 1 },
  firm: { ...Typography.bodySmall, marginTop: 2 },
  specRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  specChip: { paddingHorizontal: 8, paddingVertical: 3 },
  specText: { fontSize: 11, fontWeight: '500' },
  moreText: { fontSize: 11, alignSelf: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  statText: { ...Typography.labelSmall },
  actions: { flexDirection: 'row', gap: 16, borderTopWidth: 1, paddingTop: 10, marginTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { ...Typography.titleSmall },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { ...Typography.headlineMedium, marginTop: 16 },
  emptyText: { ...Typography.bodyMedium, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
