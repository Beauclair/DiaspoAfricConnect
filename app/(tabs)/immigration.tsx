import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import Card from '../../src/components/common/Card';
import GuideCard from '../../src/components/immigration/GuideCard';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorView from '../../src/components/common/ErrorView';
import { useCountry } from '../../src/contexts/CountryContext';
import { getGuides, getLawyers } from '../../src/services/immigrationService';
import { ImmigrationGuide, Lawyer } from '../../src/types';

export default function ImmigrationHomeScreen() {
  const { hostCountry, countryConfig } = useCountry();
  const [guides, setGuides] = useState<ImmigrationGuide[]>([]);
  const [lawyerCount, setLawyerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [hostCountry]);

  const loadData = async () => {
    setError('');
    try {
      const [g, l] = await Promise.all([getGuides(hostCountry), getLawyers(hostCountry)]);
      setGuides(g);
      setLawyerCount(l.length);
    } catch (e: any) {
      setError(e.message || 'Failed to load immigration data');
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorView message={error} onRetry={loadData} />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Immigration Resource Hub</Text>
        <Text style={styles.heroSub}>Guides, lawyers & tools to navigate the {countryConfig.immigrationSystemLabel}</Text>
      </View>

      <View style={styles.quickLinks}>
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => router.push('/immigration/lawyers')}
        >
          <MaterialIcons name="gavel" size={28} color={Colors.primary} />
          <Text style={styles.linkTitle}>Find Lawyers</Text>
          <Text style={styles.linkSub}>{lawyerCount} listed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => router.push('/immigration/checklist')}
        >
          <MaterialIcons name="checklist" size={28} color={Colors.secondary} />
          <Text style={styles.linkTitle}>Document Checklist</Text>
          <Text style={styles.linkSub}>Track your docs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <View style={styles.categoryGrid}>
          {countryConfig.immigrationCategories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={styles.categoryItem}
              onPress={() => router.push({ pathname: '/immigration/guides', params: { category: cat.key } })}
            >
              <View style={styles.categoryIcon}>
                <MaterialIcons name={cat.icon as any} size={24} color={Colors.primary} />
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Guides</Text>
        {guides.length > 0 ? (
          guides.map((g) => (
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
  container: { flex: 1, backgroundColor: Colors.background },
  hero: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  heroTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textWhite },
  heroSub: { fontSize: 14, color: Colors.textWhite, opacity: 0.85, marginTop: 6, lineHeight: 20 },
  quickLinks: { flexDirection: 'row', padding: 16, gap: 12 },
  linkCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  linkTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginTop: 8 },
  linkSub: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: { fontSize: 11, color: Colors.text, marginTop: 6, textAlign: 'center' },
  emptyText: { textAlign: 'center', color: Colors.textLight, paddingVertical: 8 },
});
