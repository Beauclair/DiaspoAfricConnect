import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import BusinessCard from '../../src/components/business/BusinessCard';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorView from '../../src/components/common/ErrorView';
import Button from '../../src/components/common/Button';
import { useAuth } from '../../src/contexts/AuthContext';
import { getBusinessesByOwner } from '../../src/services/businessService';
import { Business } from '../../src/types';

export default function MyBusinessesScreen() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyBusinesses();
  }, [user]);

  const loadMyBusinesses = async () => {
    if (!user) return;
    setError('');
    setLoading(true);
    try {
      const data = await getBusinessesByOwner(user.uid);
      setBusinesses(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load your businesses');
    }
    setLoading(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'My Businesses' }} />
      <View style={styles.container}>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorView message={error} onRetry={loadMyBusinesses} />
        ) : (
          <FlatList
            data={businesses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BusinessCard
                business={item}
                onPress={() => router.push({ pathname: '/business/[id]', params: { id: item.id } })}
              />
            )}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialIcons name="storefront" size={64} color={Colors.textLight} />
                <Text style={styles.emptyTitle}>No businesses yet</Text>
                <Text style={styles.emptyText}>Add your business to connect with the African diaspora community</Text>
                <Button
                  title="Add a Business"
                  onPress={() => router.push('/business/add')}
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
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16, paddingBottom: 24 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: Colors.textLight, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
