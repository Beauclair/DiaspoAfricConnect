import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

const routingIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: extra.sentryDsn,
  enabled: !__DEV__ && extra.sentryDsn !== 'YOUR_SENTRY_DSN',

  // Capture 20% of transactions in production — good balance between
  // visibility and quota usage on the free tier (10K transactions/month).
  tracesSampleRate: 0.2,

  // Send user IP + identifiers so we can trace errors to specific users.
  sendDefaultPii: true,

  integrations: [routingIntegration],

  // Native frames tracking is not available in Expo Go.
  enableNativeFramesTracking: !isRunningInExpoGo(),
});

/**
 * Register the Expo Router navigation container ref so Sentry can
 * automatically track screen transitions as performance spans.
 * Call once from the root layout after `useNavigationContainerRef()`.
 */
export function registerNavigationContainer(ref: unknown) {
  routingIntegration.registerNavigationContainer(ref);
}

/**
 * Call after login / logout to attach or clear user context on every error.
 */
export function setSentryUser(user: { id: string; email?: string | null } | null) {
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email ?? undefined });
  } else {
    Sentry.setUser(null);
  }
}

export default Sentry;
