import React, { useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Image, ImageStyle } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { logger } from '../../utils/logger';

interface NetworkImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
  placeholderIcon?: string;
  iconSize?: number;
  accessibilityLabel?: string;
}

/**
 * Resilient network image using expo-image.
 * Falls back to a placeholder icon if loading fails.
 */
export default function NetworkImage({
  uri,
  style,
  placeholderIcon = 'storefront',
  iconSize = 40,
  accessibilityLabel: a11yLabel,
}: NetworkImageProps) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);

  if (failed || !uri) {
    if (!uri) logger.warn('NetworkImage: no URI provided');
    return (
      <View
        style={[
          styles.placeholder,
          { backgroundColor: colors.outline },
          style as StyleProp<ViewStyle>,
        ]}
        accessibilityLabel={a11yLabel || 'Image unavailable'}
      >
        <MaterialIcons name={placeholderIcon as any} size={iconSize} color={colors.onSurfaceVariant} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit="cover"
      transition={200}
      accessibilityLabel={a11yLabel}
      onError={(e) => {
        logger.warn('NetworkImage load failed:', uri.substring(0, 80), e);
        setFailed(true);
      }}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
