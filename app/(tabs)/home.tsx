import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import SearchBar from '../../src/components/common/SearchBar';
import Card from '../../src/components/common/Card';
import BusinessCard from '../../src/components/business/BusinessCard';
import GuideCard from '../../src/components/immigration/GuideCard';
import ErrorView from '../../src/components/common/ErrorView';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCountry } from '../../src/contexts/CountryContext';
import { getBusinesses } from '../../src/services/businessService';
import { getGuides } from '../../src/services/immigrationService';
import { Business, ImmigrationGuide } from '../../src/types';

export default function HomeScreen() {
  const { user } = useAuth();
  const { hostCountry } = useCountry();
  const [search, setSearch] = useState('');
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [recentGuides, setRecentGuides] = useState<ImmigrationGuide[]>([]);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setError('');
    try {
      const [businesses, guides] = await Promise.all([getBusinesses(hostCountry), getGuides(hostCountry)]);
      setFeaturedBusinesses(businesses.slice(0, 5));
      setRecentGuides(guides.slice(0, 3));
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    }
  }, [hostCountry]);

  // Reload data every time this tab gains focus (e.g. after adding a business)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (error) {
    return <ErrorView message={error} onRetry={loadData} />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.welcome}>
        <Text style={styles.greeting}>Welcome{user?.displayName ? `, ${user.displayName}` : ''}!</Text>
        <Text style={styles.tagline}>Connect with your African community</Text>
      </View>

      <View style={styles.section}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search businesses, guides..."
        />
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/business')}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.primary + '15' }]}>
            <MaterialIcons name="storefront" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.actionTitle}>Find Business</Text>
          <Text style={styles.actionSub}>African-owned businesses near you</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/immigration')}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.secondary + '25' }]}>
            <MaterialIcons name="article" size={32} color={Colors.secondary} />
          </View>
          <Text style={styles.actionTitle}>Immigration</Text>
          <Text style={styles.actionSub}>Guides, lawyers & resources</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Businesses</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/business')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {featuredBusinesses.length > 0 ? (
          featuredBusinesses.map((b) => (
            <BusinessCard
              key={b.id}
              business={b}
              onPress={() => router.push({ pathname: '/business/[id]', params: { id: b.id } })}
            />
          ))
        ) : (
          <Card>
            <Text style={styles.emptyText}>No businesses yet. Be the first to add one!</Text>
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Immigration Guides</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/immigration')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentGuides.length > 0 ? (
          recentGuides.map((g) => (
            <GuideCard
              key={g.id}
              guide={g}
              onPress={() => router.push({ pathname: '/immigration/guide/[id]', params: { id: g.id } })}
            />
          ))
        ) : (
          <Card>
            <Text style={styles.emptyText}>Immigration guides coming soon!</Text>
          </Card>
        )}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  welcome: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
  tagline: {
    fontSize: 15,
    color: Colors.textWhite,
    opacity: 0.85,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAll: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  actionSub: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: 14,
    paddingVertical: 8,
  },
});
