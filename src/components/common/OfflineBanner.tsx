import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export default function OfflineBanner() {
  const { colors, typography } = useTheme();
  const isConnected = useNetworkStatus();

  if (isConnected) return null;

  return (
    <View
      style={[styles.banner, { backgroundColor: colors.tertiary }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel="You're offline. Some features may be limited."
    >
      <MaterialIcons name="wifi-off" size={16} color="#FFFFFF" />
      <Text style={[styles.text, { color: '#FFFFFF', ...typography.labelMedium }]}>
        You're offline. Some features may be limited.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    // color and typography applied inline via useTheme()
  },
});
