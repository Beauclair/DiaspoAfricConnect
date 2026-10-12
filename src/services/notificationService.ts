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

  Sentry.captureMessage(`[push] START — uid=${uid}, platform=${Platform.OS}, env=${env}, ownership=${ownership}, isExpoGo=${isExpoGo()}`, 'info');

  const Notifications = getNotifications();
  if (Platform.OS === 'web' || !Notifications) {
    Sentry.captureMessage(`[push] BAIL — web or Notifications unavailable (platform=${Platform.OS}, isExpoGo=${isExpoGo()}, env=${env}, ownership=${ownership})`, 'error');
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
    Sentry.captureMessage(`[push] BAIL — permission not granted: ${finalStatus}`, 'error');
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
    Sentry.captureMessage(`[push] BAIL — no projectId (expoConfig.extra.eas.projectId=${Constants.expoConfig?.extra?.eas?.projectId}, easConfig.projectId=${Constants.easConfig?.projectId})`, 'error');
    return null;
  }

  Sentry.captureMessage(`[push] PASSED all checks — projectId=${projectId}, permission=${finalStatus}, requesting token...`, 'info');

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData?.data;

    if (!token) {
      Sentry.captureMessage(`[push] FAIL — getExpoPushTokenAsync returned no data: ${JSON.stringify(tokenData)}`, 'error');
      return null;
    }

    Sentry.captureMessage(`[push] GOT TOKEN — saving to Firestore for ${uid}, prefix=${token.substring(0, 25)}`, 'info');

    // Persist the token to the user's Firestore document
    await setDoc(doc(getDb(), 'users', uid), { expoPushToken: token }, { merge: true });

    Sentry.captureMessage(`[push] SUCCESS — token saved for ${uid}, prefix=${token.substring(0, 25)}`, 'info');

    return token;
  } catch (e: any) {
    Sentry.captureMessage(`[push] EXCEPTION — ${e?.message || e} | code=${e?.code} | stack=${e?.stack?.substring(0, 300)}`, 'error');
    Sentry.captureException(e, { tags: { feature: 'push-registration' } });
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
