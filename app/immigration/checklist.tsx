import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../src/constants/colors';
import ChecklistItem from '../../src/components/immigration/ChecklistItem';
import Card from '../../src/components/common/Card';
import { useCountry } from '../../src/contexts/CountryContext';
import { CHECKLISTS } from '../../src/data/checklists';

const LEGACY_KEY = '@checklist_state';

export default function DocumentChecklistScreen() {
  const { hostCountry } = useCountry();
  const storageKey = `@checklist_state_${hostCountry}`;
  const sections = CHECKLISTS[hostCountry] ?? CHECKLISTS['US'];
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      let data = await AsyncStorage.getItem(storageKey);
      if (!data && hostCountry === 'US') {
        data = await AsyncStorage.getItem(LEGACY_KEY);
        if (data) await AsyncStorage.setItem(storageKey, data);
      }
      if (data) setChecked(JSON.parse(data));
      else setChecked({});
    })();
  }, [hostCountry, storageKey]);

  const toggleItem = useCallback((item: string) => {
    setChecked((prev) => {
      const next = { ...prev, [item]: !prev[item] };
      AsyncStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Document Checklist' }} />
      <ScrollView style={styles.container}>
        <Card style={styles.progressCard}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(checkedCount / totalItems) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{checkedCount} of {totalItems} documents ready</Text>
        </Card>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card>
              {section.items.map((item) => (
                <ChecklistItem
                  key={item}
                  label={item}
                  checked={!!checked[item]}
                  onToggle={() => toggleItem(item)}
                />
              ))}
            </Card>
          </View>
        ))}

        <Card style={styles.note}>
          <Text style={styles.noteText}>
            This is a general checklist. Your specific case may require additional documents. Consult with an immigration attorney for personalized guidance.
          </Text>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  progressCard: { marginBottom: 16, alignItems: 'center' },
  progressTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  progressBar: {
    width: '100%', height: 8, backgroundColor: Colors.border,
    borderRadius: 4, marginTop: 12, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  progressText: { fontSize: 14, color: Colors.textLight, marginTop: 8 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
  note: { marginTop: 8, backgroundColor: Colors.primary + '08' },
  noteText: { fontSize: 13, color: Colors.textLight, lineHeight: 18 },
});
