import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../common/Card';
import { Colors } from '../../constants/colors';
import { Business } from '../../types';

interface BusinessCardProps {
  business: Business;
  onPress: () => void;
}

export default function BusinessCard({ business, onPress }: BusinessCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${business.name}, ${business.category}, rated ${business.averageRating.toFixed(1)} stars, ${business.city} ${business.state}`}
    >
      <Card style={styles.card}>
        {business.photos.length > 0 ? (
          <Image source={{ uri: business.photos[0] }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <MaterialIcons name="storefront" size={40} color={Colors.textLight} />
          </View>
        )}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>{business.name}</Text>
            {business.isVerified && (
              <MaterialIcons name="verified" size={18} color={Colors.primary} />
            )}
          </View>
          <Text style={styles.category}>{business.category} | {business.countryOfOrigin}</Text>
          <Text style={styles.address} numberOfLines={1}>
            <MaterialIcons name="location-on" size={14} color={Colors.textLight} />
            {' '}{business.city}, {business.state}
          </Text>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={16} color={Colors.star} />
            <Text style={styles.rating}>
              {business.averageRating.toFixed(1)} ({business.reviewCount})
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholder: {
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  category: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  address: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
});
