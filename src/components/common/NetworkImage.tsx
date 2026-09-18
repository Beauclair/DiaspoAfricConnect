import React, { useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Image, ImageStyle } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface NetworkImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
  placeholderIcon?: string;
  iconSize?: number;
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
}: NetworkImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !uri) {
    if (!uri) console.warn('NetworkImage: no URI provided');
    return (
      <View style={[styles.placeholder, style as StyleProp<ViewStyle>]}>
        <MaterialIcons name={placeholderIcon as any} size={iconSize} color={Colors.textLight} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit="cover"
      transition={200}
      onError={(e) => {
        console.warn('NetworkImage load failed:', uri.substring(0, 80), e);
        setFailed(true);
      }}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
