import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import SearchBar from '../../src/components/common/SearchBar';
import Card from '../../src/components/common/Card';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorView from '../../src/components/common/ErrorView';
import { useCountry } from '../../src/contexts/CountryContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { requireAuth } from '../../src/utils/authGuard';
import { getLawyers, searchLawyers } from '../../src/services/immigrationService';
import { Lawyer } from '../../src/types';

function LawyerCard({ lawyer }: { lawyer: Lawyer }) {
  return (
    <Card style={styles.lawyerCard}>
      <View style={styles.lawyerHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {lawyer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <View style={styles.lawyerInfo}>
          <Text style={styles.lawyerName}>{lawyer.name}</Text>
          <Text style={styles.firmName}>{lawyer.firm}</Text>
          <Text style={styles.location}>{lawyer.city}, {lawyer.state}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <MaterialIcons name="star" size={14} color={Colors.star} />
          <Text style={styles.ratingText}>{lawyer.averageRating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.tags}>
        {lawyer.specializations.map((s) => (
          <View key={s} style={styles.tag}>
            <Text style={styles.tagText}>{s}</Text>
          </View>
        ))}
      </View>

      <View style={styles.details}>
        {lawyer.languagesSpoken.length > 0 && (
          <View style={styles.detailRow}>
            <MaterialIcons name="translate" size={16} color={Colors.textLight} />
            <Text style={styles.detailText}>{lawyer.languagesSpoken.join(', ')}</Text>
          </View>
        )}
        {lawyer.consultationFee && (
          <View style={styles.detailRow}>
            <MaterialIcons name="attach-money" size={16} color={Colors.textLight} />
            <Text style={styles.detailText}>Consultation: {lawyer.consultationFee}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${lawyer.phone}`)}>
          <MaterialIcons name="phone" size={18} color={Colors.primary} />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`mailto:${lawyer.email}`)}>
          <MaterialIcons name="email" size={18} color={Colors.primary} />
          <Text style={styles.actionText}>Email</Text>
        </TouchableOpacity>
        {lawyer.website && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(lawyer.website!)}>
            <MaterialIcons name="language" size={18} color={Colors.primary} />
            <Text style={styles.actionText}>Website</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

export default function LawyerDirectoryScreen() {
  const { hostCountry } = useCountry();
  const { user } = useAuth();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadLawyers = async () => {
    setError('');
    setLoading(true);
    try {
      const l = await getLawyers(hostCountry);
      setLawyers(l);
    } catch (e: any) {
      setError(e.message || 'Failed to load lawyers');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLawyers();
  }, [hostCountry]);

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.length > 2) {
      setLoading(true);
      try {
        const results = await searchLawyers(text, hostCountry);
        setLawyers(results);
      } catch (e: any) {
        setError(e.message || 'Search failed');
      }
      setLoading(false);
    } else if (text.length === 0) {
      loadLawyers();
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Immigration Lawyers' }} />
      <View style={styles.container}>
        <View style={styles.searchSection}>
          <SearchBar value={search} onChangeText={handleSearch} placeholder="Search lawyers..." />
        </View>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorView message={error} onRetry={loadLawyers} />
        ) : (
          <FlatList
            data={lawyers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <LawyerCard lawyer={item} />}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="gavel" size={48} color={Colors.textLight} />
                <Text style={styles.empty}>No lawyers registered yet</Text>
                <TouchableOpacity
                  style={styles.registerLink}
                  onPress={() => requireAuth(user, () => router.push('/immigration/register-lawyer'))}
                >
                  <Text style={styles.registerLinkText}>Be the first to register</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => requireAuth(user, () => router.push('/immigration/register-lawyer'))}
          accessibilityRole="button"
          accessibilityLabel="Register as a lawyer"
        >
          <MaterialIcons name="person-add" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchSection: { padding: 16, paddingBottom: 8 },
  list: { padding: 16, paddingBottom: 24 },
  empty: { textAlign: 'center', color: Colors.textLight, marginTop: 12, fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  registerLink: { marginTop: 12 },
  registerLinkText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
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
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: Colors.textWhite, fontSize: 18, fontWeight: 'bold' },
  lawyerInfo: { flex: 1 },
  lawyerName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  firmName: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  location: { fontSize: 12, color: Colors.textLight },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 6 },
  tag: { backgroundColor: Colors.primary + '15', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, color: Colors.primary, fontWeight: '500', textTransform: 'capitalize' },
  details: { marginTop: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 },
  detailText: { fontSize: 13, color: Colors.textLight },
  actions: { flexDirection: 'row', marginTop: 12, gap: 12, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});
