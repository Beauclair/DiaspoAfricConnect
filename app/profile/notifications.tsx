import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../src/theme';
import Card from '../../src/components/common/Card';
import { trackScreen } from '../../src/config/analytics';

type NotificationsModule = typeof import('expo-notifications');

function isExpoGo(): boolean {
  const env = (Constants as any).executionEnvironment;
  if (env) return env === 'storeClient' && Constants.appOwnership === 'expo';
  return Constants.appOwnership === 'expo';
}

function getNotifications(): NotificationsModule | null {
  if (isExpoGo()) return null;
  return require('expo-notifications') as NotificationsModule;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: Date;
}

export default function NotificationsScreen() {
  const { colors, typography, spacing } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const loadNotifications = useCallback(async () => {
    const Notifications = getNotifications();
    if (!Notifications) {
      setUnavailable(true);
      setLoading(false);
      return;
    }

    try {
      const delivered = await Notifications.getPresentedNotificationsAsync();
      const items: NotificationItem[] = delivered
        .map((n) => ({
          id: n.request.identifier,
          title: n.request.content.title || 'Notification',
          body: n.request.content.body || '',
          date: new Date(n.date * 1000),
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      setNotifications(items);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    trackScreen('Notifications');
    loadNotifications();
  }, [loadNotifications]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <Animated.View entering={FadeIn.duration(300)}>
      <Card variant="outlined" style={styles.card}>
        <View style={styles.cardRow}>
          <View style={[styles.iconBg, { backgroundColor: colors.primaryContainer }]}>
            <MaterialIcons name="notifications" size={20} color={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={[typography.titleSmall, { color: colors.onSurface }]} numberOfLines={1}>
              {item.title}
            </Text>
            {item.body ? (
              <Text style={[typography.bodySmall, { color: colors.onSurfaceVariant, marginTop: 2 }]} numberOfLines={2}>
                {item.body}
              </Text>
            ) : null}
          </View>
          <Text style={[typography.labelSmall, { color: colors.onSurfaceDisabled }]}>
            {formatDate(item.date)}
          </Text>
        </View>
      </Card>
    </Animated.View>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Notifications' }} />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {unavailable ? (
          <View style={styles.center}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialIcons name="notifications-off" size={48} color={colors.onSurfaceVariant} />
            </View>
            <Text style={[typography.titleMedium, { color: colors.onSurface, marginTop: 16 }]}>
              Notifications unavailable
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }]}>
              Push notifications are available in the production app. Download from the App Store or Google Play to receive notifications.
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.center}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialIcons name="notifications-none" size={48} color={colors.onSurfaceVariant} />
            </View>
            <Text style={[typography.titleMedium, { color: colors.onSurface, marginTop: 16 }]}>
              No notifications yet
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }]}>
              You'll see notifications here when you receive them.
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: spacing.md }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 0 },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
