import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';
import { router } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { logger } from '../utils/logger';

// expo-notifications native module crashes on import in Expo Go (SDK 53+).
// We lazy-load it only when NOT in Expo Go to avoid the crash entirely.
type NotificationsModule = typeof import('expo-notifications');

function isExpoGo(): boolean {
  // Constants.appOwnership is deprecated in SDK 57.
  // executionEnvironment is the reliable replacement:
  //   'storeClient' = Expo Go (and legacy dev-client — but appOwnership
  //                   narrows it to Expo Go specifically).
  //   'standalone'  = production or EAS dev-build
  //   'bare'        = bare RN project
  const env = (Constants as any).executionEnvironment;
  if (env) return env === 'storeClient' && Constants.appOwnership === 'expo';
  // Fallback for older Constants versions
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
  const env = (Constants as any).executionEnvironment;
  const ownership = Constants.appOwnership;

  Sentry.addBreadcrumb({
    category: 'push',
    message: 'registerForPushNotifications called',
    data: { uid, platform: Platform.OS, env, ownership, isExpoGo: isExpoGo() },
    level: 'info',
  });

  const Notifications = getNotifications();
  if (Platform.OS === 'web' || !Notifications) {
    logger.error(`[push] Skipped — web or Notifications module unavailable (platform=${Platform.OS}, isExpoGo=${isExpoGo()}, env=${env}, ownership=${ownership})`);
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    logger.error(`[push] Permission not granted: ${finalStatus}`);
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
    logger.error(`[push] No Expo project ID found — expoConfig.extra.eas.projectId=${Constants.expoConfig?.extra?.eas?.projectId}, easConfig.projectId=${Constants.easConfig?.projectId}`);
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    // Persist the token to the user's Firestore document
    await setDoc(doc(getDb(), 'users', uid), { expoPushToken: token }, { merge: true });

    Sentry.addBreadcrumb({
      category: 'push',
      message: 'Push token registered successfully',
      data: { uid, tokenPrefix: token.substring(0, 25) },
      level: 'info',
    });

    return token;
  } catch (e) {
    logger.error('[push] Failed to get/save push token:', e);
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
