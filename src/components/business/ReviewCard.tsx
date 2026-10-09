import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Review } from '../../types';

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  entityType?: 'business' | 'lawyer';
  onEdit?: (review: Review) => void;
  onDelete?: (review: Review) => void;
}

export default function ReviewCard({ review, currentUserId, entityType = 'business', onEdit, onDelete }: ReviewCardProps) {
  const { colors, typography } = useTheme();
  const isOwn = currentUserId && review.userId === currentUserId;

  const stars = Array.from({ length: 5 }, (_, i) => (
    <MaterialIcons
      key={i}
      name={i < review.rating ? 'star' : 'star-border'}
      size={16}
      color={colors.star}
    />
  ));

  const handleMore = () => {
    Alert.alert('Review', undefined, [
      { text: 'Edit', onPress: () => onEdit?.(review) },
      { text: 'Delete', style: 'destructive', onPress: () => {
        Alert.alert('Delete Review', 'Are you sure you want to delete your review?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(review) },
        ]);
      }},
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View
      style={[styles.card, { borderBottomColor: colors.outline }]}
      accessibilityLabel={`${review.userName}, ${review.rating} out of 5 stars, ${review.comment}`}
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: colors.onSurface, ...typography.titleMedium }]}>
          {review.userName}
        </Text>
        <View style={styles.headerRight}>
          <View style={styles.stars} accessibilityLabel={`${review.rating} out of 5 stars`}>{stars}</View>
          {isOwn && (
            <TouchableOpacity
              onPress={handleMore}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Review options"
            >
              <MaterialIcons name="more-vert" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={[styles.comment, { color: colors.onSurface, ...typography.bodyMedium }]}>
        {review.comment}
      </Text>
      <View style={styles.dateLine}>
        <Text style={[styles.date, { color: colors.onSurfaceVariant, ...typography.bodySmall }]}>
          {review.createdAt?.toDate?.()?.toLocaleDateString() ?? ''}
        </Text>
        {review.updatedAt && (
          <Text style={[styles.edited, { color: colors.onSurfaceVariant, ...typography.bodySmall }]}>
            {' · edited'}
          </Text>
        )}
      </View>
      {review.ownerResponse ? (
        <View style={[styles.responseContainer, { borderLeftColor: colors.primary }]}>
          <View style={styles.responseHeader}>
            <MaterialIcons name={entityType === 'lawyer' ? 'gavel' : 'storefront'} size={14} color={colors.primary} />
            <Text style={[styles.responseLabel, { color: colors.primary, ...typography.bodySmall, fontWeight: '600' }]}>
              {entityType === 'lawyer' ? 'Attorney response' : 'Owner response'}
            </Text>
          </View>
          <Text style={[styles.responseText, { color: colors.onSurface, ...typography.labelMedium }]}>
            {review.ownerResponse}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {},
  stars: {
    flexDirection: 'row',
  },
  comment: {
    marginTop: 6,
  },
  dateLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  date: {},
  edited: {
    fontStyle: 'italic',
  },
  responseContainer: {
    marginTop: 10,
    marginLeft: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  responseLabel: {},
  responseText: {},
});
