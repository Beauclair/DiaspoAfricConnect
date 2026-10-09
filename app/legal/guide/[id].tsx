import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/theme';
import Card from '../../../src/components/common/Card';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';
import ErrorView from '../../../src/components/common/ErrorView';
import { getGuideById } from '../../../src/services/legalService';
import { LegalGuide } from '../../../src/types';
import { getUserMessage } from '../../../src/utils/errorMessages';
import { trackEvent } from '../../../src/config/analytics';
import { AnalyticsEvents } from '../../../src/constants/analyticsEvents';

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [guide, setGuide] = useState<LegalGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGuide = async () => {
    if (!id) return;
    setError('');
    setLoading(true);
    try {
      const g = await getGuideById(id);
      setGuide(g);
      if (g) {
        trackEvent(AnalyticsEvents.GUIDE_VIEWED, { guide_id: id, category: g.category });
      }
    } catch (e: any) {
      setError(getUserMessage(e, 'loadGuide', 'Failed to load guide.'));
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
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.onSurface }]}>{guide.title}</Text>
          <Text style={[styles.summary, { color: colors.onSurfaceVariant }]}>{guide.summary}</Text>
        </View>

        <View style={styles.metaRow}>
          <Card style={styles.metaCard}>
            <MaterialIcons name="schedule" size={24} color={colors.primary} />
            <Text style={[styles.metaLabel, { color: colors.onSurfaceVariant }]}>Timeline</Text>
            <Text style={[styles.metaValue, { color: colors.onSurface }]}>{guide.estimatedTimeline}</Text>
          </Card>
          <Card style={styles.metaCard}>
            <MaterialIcons name="attach-money" size={24} color={colors.secondary} />
            <Text style={[styles.metaLabel, { color: colors.onSurfaceVariant }]}>Est. Cost</Text>
            <Text style={[styles.metaValue, { color: colors.onSurface }]}>{guide.estimatedCost}</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Step-by-Step Process</Text>
          {guide.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[styles.stepNumberText, { color: colors.onPrimary }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.onSurface }]}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Required Documents</Text>
          {guide.requiredDocuments.map((doc, i) => (
            <View key={i} style={styles.docRow}>
              <MaterialIcons name="description" size={20} color={colors.primary} />
              <Text style={[styles.docText, { color: colors.onSurface }]}>{doc}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Detailed Information</Text>
          <Text style={[styles.content, { color: colors.onSurface }]}>{guide.content}</Text>
        </View>

        {/* Official sources */}
        {guide.sources && guide.sources.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Official Sources</Text>
            <Text style={[styles.sourcesIntro, { color: colors.onSurfaceVariant }]}>
              Information in this guide is based on the following official sources:
            </Text>
            {guide.sources.map((source, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => Linking.openURL(source.url)}
                style={[styles.sourceRow, { borderColor: colors.outlineVariant }]}
                accessibilityRole="link"
              >
                <MaterialIcons name="open-in-new" size={16} color={colors.primary} />
                <View style={styles.sourceText}>
                  <Text style={[styles.sourceLabel, { color: colors.primary }]}>{source.label}</Text>
                  <Text style={[styles.sourceUrl, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{source.url}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Legal disclaimer */}
        <Card style={[styles.disclaimer, { backgroundColor: colors.warning + '15' }]}>
          <MaterialIcons name="gavel" size={22} color={colors.warning} />
          <View style={styles.disclaimerContent}>
            <Text style={[styles.disclaimerTitle, { color: colors.onSurface }]}>Legal Disclaimer</Text>
            <Text style={[styles.disclaimerText, { color: colors.onSurface }]}>
              This guide is for general informational purposes only and does not constitute legal advice. Laws and regulations change frequently. The information provided may not reflect the most current legal developments.{'\n\n'}Always consult a qualified attorney licensed in your jurisdiction for advice specific to your situation. DiaspoAfricConnect does not guarantee the accuracy, completeness, or timeliness of the information in this guide.
            </Text>
          </View>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', lineHeight: 30 },
  summary: { fontSize: 15, marginTop: 8, lineHeight: 22 },
  metaRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  metaCard: { flex: 1, alignItems: 'center', paddingVertical: 16, paddingHorizontal: 8 },
  metaLabel: { fontSize: 12, marginTop: 6 },
  metaValue: { fontSize: 15, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  stepRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  stepNumber: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2,
  },
  stepNumberText: { fontSize: 14, fontWeight: 'bold' },
  stepText: { fontSize: 15, flex: 1, lineHeight: 22 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  docText: { fontSize: 15, flex: 1 },
  content: { fontSize: 15, lineHeight: 24 },
  sourcesIntro: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  sourceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sourceText: { flex: 1 },
  sourceLabel: { fontSize: 14, fontWeight: '600' },
  sourceUrl: { fontSize: 12, marginTop: 2 },
  disclaimer: {
    flexDirection: 'row', marginHorizontal: 20, marginTop: 24, gap: 12,
    alignItems: 'flex-start',
  },
  disclaimerContent: { flex: 1 },
  disclaimerTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  disclaimerText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
