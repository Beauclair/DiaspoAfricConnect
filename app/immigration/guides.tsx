import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { router } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import GuideCard from '../../src/components/immigration/GuideCard';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import CategoryChip from '../../src/components/common/CategoryChip';
import { useCountry } from '../../src/contexts/CountryContext';
import { getGuides, getGuidesByCategory } from '../../src/services/immigrationService';
import { ImmigrationGuide, ImmigrationCategory } from '../../src/types';

export default function GuideListScreen() {
  const { category: initialCategory } = useLocalSearchParams<{ category?: string }>();
  const { hostCountry, countryConfig } = useCountry();
  const [guides, setGuides] = useState<ImmigrationGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ImmigrationCategory | null>(
    (initialCategory as ImmigrationCategory) || null
  );

  useEffect(() => {
    loadGuides();
  }, [selectedCategory, hostCountry]);

  const loadGuides = async () => {
    setLoading(true);
    try {
      const data = selectedCategory
        ? await getGuidesByCategory(selectedCategory, hostCountry)
        : await getGuides(hostCountry);
      setGuides(data);
    } catch {
      setGuides([]);
    }
    setLoading(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Immigration Guides' }} />
      <View style={styles.container}>
        <View style={styles.categories}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={countryConfig.immigrationCategories}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <CategoryChip
                label={item.label}
                selected={selectedCategory === item.key}
                onPress={() => setSelectedCategory(selectedCategory === item.key ? null : item.key as ImmigrationCategory)}
              />
            )}
          />
        </View>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={guides}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <GuideCard
                guide={item}
                onPress={() => router.push({ pathname: '/immigration/guide/[id]', params: { id: item.id } })}
              />
            )}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>No guides found for this category</Text>
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  categories: { padding: 16, paddingBottom: 8 },
  list: { padding: 16, paddingBottom: 24 },
  empty: { textAlign: 'center', color: Colors.textLight, marginTop: 40, fontSize: 16 },
});
