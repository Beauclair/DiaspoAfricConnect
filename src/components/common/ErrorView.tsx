import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Button from './Button';
import { useTheme } from '../../theme';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorView({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorViewProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <View style={[styles.iconWrapper, { backgroundColor: colors.errorContainer }]}>
        <MaterialIcons name="wifi-off" size={32} color={colors.error} />
      </View>
      <Text style={[typography.titleMedium, { color: colors.onSurface, marginTop: spacing.xl }]}>
        Oops!
      </Text>
      <Text style={[typography.bodyMedium, styles.message, { color: colors.onSurfaceVariant }]}>
        {message}
      </Text>
      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          variant="tonal"
          icon="refresh"
          style={{ marginTop: spacing.xxl }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    maxWidth: 280,
  },
});
