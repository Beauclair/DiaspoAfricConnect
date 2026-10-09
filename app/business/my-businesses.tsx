import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { router, Stack, Redirect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, Typography } from '../../src/theme';
import BusinessCard from '../../src/components/business/BusinessCard';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorView from '../../src/components/common/ErrorView';
import Button from '../../src/components/common/Button';
import { useAuth } from '../../src/contexts/AuthContext';
import { getBusinessesByOwner } from '../../src/services/businessService';
import { Business } from '../../src/types';
import { getUserMessage } from '../../src/utils/errorMessages';

export default function MyBusinessesScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyBusinesses();
  }, [user]);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const loadMyBusinesses = async () => {
    if (!user) return;
    setError('');
    setLoading(true);
    try {
      const data = await getBusinessesByOwner(user.uid);
      setBusinesses(data);
    } catch (e: any) {
      setError(getUserMessage(e, 'loadMyBusinesses', 'Failed to load your businesses.'));
    }
    setLoading(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'My Businesses' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
                <MaterialIcons name="storefront" size={64} color={colors.onSurfaceVariant} />
                <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No businesses yet</Text>
                <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>Add your business to connect with the African diaspora community</Text>
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
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 24 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { ...Typography.headlineMedium, marginTop: 16 },
  emptyText: { ...Typography.bodyMedium, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
