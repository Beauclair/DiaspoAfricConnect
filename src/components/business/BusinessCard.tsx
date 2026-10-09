import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedPress from '../common/AnimatedPressable';
import NetworkImage from '../common/NetworkImage';
import Badge from '../common/Badge';
import VerificationBadge from '../common/VerificationBadge';
import { useTheme } from '../../theme';
import { Business } from '../../types';

interface BusinessCardProps {
  business: Business;
  onPress: () => void;
  /** Formatted distance string, e.g. "2.3 km". Shown when provided. */
  distance?: string;
}

export default function BusinessCard({ business, onPress, distance }: BusinessCardProps) {
  const { colors, radii, typography, shadows, spacing } = useTheme();

  return (
    <AnimatedPress
      onPress={onPress}
      pressScale={0.98}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${business.name}, ${business.category}, rated ${business.averageRating.toFixed(1)} stars, ${business.city} ${business.state}`}
    >
      {/* Image section */}
      <View style={styles.imageWrapper}>
        {business.photos.length > 0 ? (
          <NetworkImage uri={business.photos[0]} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialIcons name="storefront" size={40} color={colors.onSurfaceDisabled} />
          </View>
        )}
        {/* Gradient overlay at bottom of image */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={styles.imageGradient}
        />
        {/* Rating badge on image */}
        <View style={[styles.ratingBadge, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="star" size={14} color={colors.star} />
          <Text style={[typography.labelMedium, { color: colors.onSurface }]}>
            {business.averageRating.toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Content section */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[typography.titleLarge, { color: colors.onSurface, flex: 1 }]} numberOfLines={1}>
            {business.name}
          </Text>
          {(business.verificationStatus === 'verified' || business.isVerified) && (
            <VerificationBadge status="verified" variant="compact" size="sm" />
          )}
        </View>

        <View style={styles.metaRow}>
          <Badge label={business.category.charAt(0).toUpperCase() + business.category.slice(1)} variant="primary" size="sm" />
          <MaterialIcons name="location-on" size={13} color={colors.onSurfaceVariant} />
          <Text style={[typography.bodySmall, { color: colors.onSurfaceVariant, flex: 1 }]} numberOfLines={1}>
            {business.city}, {business.state}
          </Text>
          {distance ? (
            <View style={styles.distanceBadge}>
              <MaterialIcons name="near-me" size={11} color={colors.primary} />
              <Text style={[typography.labelSmall, { color: colors.primary }]}>{distance}</Text>
            </View>
          ) : null}
        </View>

        <Text style={[typography.bodySmall, { color: colors.onSurfaceVariant, marginTop: 6 }]}>
          {business.reviewCount} review{business.reviewCount !== 1 ? 's' : ''}
        </Text>
      </View>
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  content: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 2,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
});
