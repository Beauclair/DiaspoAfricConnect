import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import SearchBar from '../../src/components/common/SearchBar';
import CategoryChip from '../../src/components/common/CategoryChip';
import BusinessCard from '../../src/components/business/BusinessCard';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorView from '../../src/components/common/ErrorView';
import Button from '../../src/components/common/Button';
import { useCountry } from '../../src/contexts/CountryContext';
import { getBusinesses, getBusinessesByCategory, searchBusinesses } from '../../src/services/businessService';
import { Business, BusinessCategory } from '../../src/types';
import { BUSINESS_CATEGORIES } from '../../src/constants/categories';

export default function BusinessListScreen() {
  const { hostCountry } = useCountry();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null);
  const [error, setError] = useState('');

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = selectedCategory
        ? await getBusinessesByCategory(selectedCategory, hostCountry)
        : await getBusinesses(hostCountry);
      setBusinesses(data);
    } catch (e: any) {
      setBusinesses([]);
      setError(e.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, hostCountry]);

  // Reload every time this tab gains focus
  useFocusEffect(
    useCallback(() => {
      loadBusinesses();
    }, [loadBusinesses])
  );

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.length > 2) {
      setLoading(true);
      try {
        const results = await searchBusinesses(text, hostCountry);
        setBusinesses(results);
      } catch (e: any) {
        setError(e.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    } else if (text.length === 0) {
      loadBusinesses();
    }
  };

  const handleCategoryPress = (key: BusinessCategory) => {
    setSelectedCategory(selectedCategory === key ? null : key);
    setSearch('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <SearchBar
          value={search}
          onChangeText={handleSearch}
          placeholder="Search businesses..."
        />
      </View>

      <View style={styles.categories}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorView message={error} onRetry={loadBusinesses} />
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
              <Text style={styles.emptyText}>No businesses found</Text>
              <Button
                title="Add a Business"
                onPress={() => router.push('/business/add')}
                variant="outline"
                style={{ marginTop: 16 }}
              />
            </View>
          }
        />
      )}

      <Button
        title="+ Add Business"
        onPress={() => router.push('/business/add')}
        style={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchSection: {
    padding: 16,
    paddingBottom: 8,
  },
  categories: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 30,
    paddingHorizontal: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
