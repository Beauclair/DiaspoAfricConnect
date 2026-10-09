import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { logger } from '../utils/logger';

// expo-notifications native module crashes on import in Expo Go (SDK 53+).
// We lazy-load it only when NOT in Expo Go to avoid the crash entirely.
type NotificationsModule = typeof import('expo-notifications');

function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/** Lazy-load expo-notifications — returns null in Expo Go. */
function getNotifications(): NotificationsModule | null {
  if (isExpoGo()) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('expo-notifications') as NotificationsModule;
}

// ── Foreground notification behaviour ───────────────────────────────
export function configureNotificationHandler() {
  const Notifications = getNotifications();
  if (!Notifications) {
    logger.log('[notifications] Skipped — remote notifications unavailable in Expo Go');
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
}

// ── Permission + token registration ─────────────────────────────────
export async function registerForPushNotifications(uid: string): Promise<string | null> {
  const Notifications = getNotifications();
  if (Platform.OS === 'web' || !Notifications) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    logger.log('Push notification permission not granted');
    return null;
  }

  // Android requires a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1B5E20',
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  if (!projectId) {
    logger.warn('No Expo project ID found — push token registration skipped');
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    // Persist the token to the user's Firestore document
    await setDoc(doc(getDb(), 'users', uid), { expoPushToken: token }, { merge: true });

    return token;
  } catch (e) {
    logger.error('Failed to get push token:', e);
    return null;
  }
}

// ── Hook: navigate on notification tap ──────────────────────────────
export function useNotificationObserver() {
  const lastResponseId = useRef<string | null>(null);

  useEffect(() => {
    const Notifications = getNotifications();
    if (!Notifications) return;

    function handleResponse(response: { notification: { request: { identifier: string; content: { data?: { url?: string } } } } }) {
      const id = response.notification.request.identifier;
      if (id === lastResponseId.current) return;
      lastResponseId.current = id;

      const url = response.notification.request.content.data?.url;
      if (typeof url === 'string') {
        // Small delay ensures the root navigator is mounted after a cold start
        setTimeout(() => router.push(url as any), 300);
      }
    }

    // Cold start: app was killed, user tapped a notification
    Notifications.getLastNotificationResponseAsync?.().then((response: any) => {
      if (response) handleResponse(response);
    });

    // Warm / background: app is running, user taps a notification
    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse as any);

    return () => subscription.remove();
  }, []);
}
