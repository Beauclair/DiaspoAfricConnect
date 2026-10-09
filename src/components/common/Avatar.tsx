import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useTheme } from '../../theme';

interface AvatarProps {
  /** Name to derive initials from */
  name?: string;
  /** Image URI */
  imageUri?: string;
  /** Size in px. Default 48 */
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const GRADIENTS: [string, string][] = [
  ['#1B6B2E', '#2E7D32'],
  ['#D4960A', '#E8A817'],
  ['#0284C7', '#0EA5E9'],
  ['#7C3AED', '#8B5CF6'],
  ['#B71C1C', '#E53935'],
];

function getGradient(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function Avatar({ name, imageUri, size = 48, style }: AvatarProps) {
  const { colors } = useTheme();
  const borderRadius = size / 2;
  const fontSize = size * 0.4;

  if (imageUri) {
    return (
      <View
        style={[{ width: size, height: size, borderRadius }, style]}
        accessibilityLabel={name ? `${name} avatar` : 'User avatar'}
      >
        <Image
          source={{ uri: imageUri }}
          style={{ width: size, height: size, borderRadius }}
          contentFit="cover"
          transition={200}
          accessibilityLabel={name ? `${name} photo` : 'User photo'}
        />
      </View>
    );
  }

  const displayName = name || 'U';
  const gradient = getGradient(displayName);

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          width: size,
          height: size,
          borderRadius,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
      accessibilityLabel={name ? `${name} avatar` : 'User avatar'}
    >
      <Text style={{ fontSize, fontWeight: '700', color: '#FFFFFF' }}>
        {getInitials(displayName)}
      </Text>
    </LinearGradient>
  );
}
