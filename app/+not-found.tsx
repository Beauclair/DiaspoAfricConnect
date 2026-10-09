import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../src/theme';
import Button from '../src/components/common/Button';

export default function NotFoundScreen() {
  const { colors, typography, spacing } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.iconWrapper, { backgroundColor: colors.errorContainer }]}>
          <MaterialIcons name="explore-off" size={32} color={colors.error} />
        </View>
        <Text style={[typography.titleMedium, { color: colors.onSurface, marginTop: spacing.xl }]}>
          Page not found
        </Text>
        <Text style={[typography.bodyMedium, styles.message, { color: colors.onSurfaceVariant }]}>
          The page you're looking for doesn't exist or may have been moved.
        </Text>
        <Link href="/(tabs)/home" asChild>
          <Button
            title="Go Home"
            variant="tonal"
            icon="home"
            style={{ marginTop: spacing.xxl }}
          />
        </Link>
      </View>
    </>
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
