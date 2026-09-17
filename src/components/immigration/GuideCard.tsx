import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../common/Card';
import { Colors } from '../../constants/colors';
import { ImmigrationGuide } from '../../types';

interface GuideCardProps {
  guide: ImmigrationGuide;
  onPress: () => void;
}

export default function GuideCard({ guide, onPress }: GuideCardProps) {
  const categoryIcons: Record<string, string> = {
    visa: 'card-travel',
    greencard: 'credit-card',
    asylum: 'security',
    citizenship: 'flag',
    'work-permit': 'work',
    family: 'people',
    student: 'school',
    other: 'help-outline',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${guide.title}, timeline ${guide.estimatedTimeline}, cost ${guide.estimatedCost}`}
    >
      <Card style={styles.card}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={(categoryIcons[guide.category] || 'help-outline') as any}
            size={28}
            color={Colors.primary}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{guide.title}</Text>
          <Text style={styles.summary} numberOfLines={2}>{guide.summary}</Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={14} color={Colors.textLight} />
              <Text style={styles.metaText}>{guide.estimatedTimeline}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="attach-money" size={14} color={Colors.textLight} />
              <Text style={styles.metaText}>{guide.estimatedCost}</Text>
            </View>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textLight} />
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  summary: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});
