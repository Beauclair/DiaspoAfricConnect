import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Review } from '../../types';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const stars = Array.from({ length: 5 }, (_, i) => (
    <MaterialIcons
      key={i}
      name={i < review.rating ? 'star' : 'star-border'}
      size={16}
      color={Colors.star}
    />
  ));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{review.userName}</Text>
        <View style={styles.stars}>{stars}</View>
      </View>
      <Text style={styles.comment}>{review.comment}</Text>
      <Text style={styles.date}>
        {review.createdAt?.toDate?.()?.toLocaleDateString() ?? ''}
      </Text>
      {review.ownerResponse ? (
        <View style={styles.responseContainer}>
          <View style={styles.responseHeader}>
            <MaterialIcons name="storefront" size={14} color={Colors.primary} />
            <Text style={styles.responseLabel}>Owner response</Text>
          </View>
          <Text style={styles.responseText}>{review.ownerResponse}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  stars: {
    flexDirection: 'row',
  },
  comment: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 6,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 6,
  },
  responseContainer: {
    marginTop: 10,
    marginLeft: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  responseText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
});
