import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme';

export default function LoadingSpinner({ message }: { message?: string }) {
  const { colors, typography } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      accessibilityRole="progressbar"
      accessibilityLabel={message || 'Loading'}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant, marginTop: 12 }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
