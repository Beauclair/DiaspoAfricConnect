import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import Card from '../../src/components/common/Card';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorView from '../../src/components/common/ErrorView';
import { getGuideById } from '../../src/services/immigrationService';
import { ImmigrationGuide } from '../../src/types';

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [guide, setGuide] = useState<ImmigrationGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGuide = async () => {
    if (!id) return;
    setError('');
    setLoading(true);
    try {
      const g = await getGuideById(id);
      setGuide(g);
    } catch (e: any) {
      setError(e.message || 'Failed to load guide');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGuide();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorView message={error} onRetry={loadGuide} />;
  if (!guide) return <ErrorView message="Guide not found" />;

  return (
    <>
      <Stack.Screen options={{ headerTitle: guide.category.toUpperCase() }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{guide.title}</Text>
          <Text style={styles.summary}>{guide.summary}</Text>
        </View>

        <View style={styles.metaRow}>
          <Card style={styles.metaCard}>
            <MaterialIcons name="schedule" size={24} color={Colors.primary} />
            <Text style={styles.metaLabel}>Timeline</Text>
            <Text style={styles.metaValue}>{guide.estimatedTimeline}</Text>
          </Card>
          <Card style={styles.metaCard}>
            <MaterialIcons name="attach-money" size={24} color={Colors.secondary} />
            <Text style={styles.metaLabel}>Est. Cost</Text>
            <Text style={styles.metaValue}>{guide.estimatedCost}</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step-by-Step Process</Text>
          {guide.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          {guide.requiredDocuments.map((doc, i) => (
            <View key={i} style={styles.docRow}>
              <MaterialIcons name="description" size={20} color={Colors.primary} />
              <Text style={styles.docText}>{doc}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Information</Text>
          <Text style={styles.content}>{guide.content}</Text>
        </View>

        <Card style={styles.disclaimer}>
          <MaterialIcons name="info" size={20} color={Colors.warning} />
          <Text style={styles.disclaimerText}>
            This guide is for informational purposes only and does not constitute legal advice. Consult with an immigration attorney for your specific case.
          </Text>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, lineHeight: 30 },
  summary: { fontSize: 15, color: Colors.textLight, marginTop: 8, lineHeight: 22 },
  metaRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  metaCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  metaLabel: { fontSize: 12, color: Colors.textLight, marginTop: 6 },
  metaValue: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  stepRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  stepNumber: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2,
  },
  stepNumberText: { color: Colors.textWhite, fontSize: 14, fontWeight: 'bold' },
  stepText: { fontSize: 15, color: Colors.text, flex: 1, lineHeight: 22 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  docText: { fontSize: 15, color: Colors.text, flex: 1 },
  content: { fontSize: 15, color: Colors.text, lineHeight: 24 },
  disclaimer: {
    flexDirection: 'row', marginHorizontal: 20, marginTop: 24, gap: 10,
    backgroundColor: Colors.warning + '15',
  },
  disclaimerText: { flex: 1, fontSize: 13, color: Colors.text, lineHeight: 18 },
  error: { textAlign: 'center', marginTop: 40, color: Colors.error, fontSize: 16 },
});
