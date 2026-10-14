import Sentry, { registerNavigationContainer } from '../src/config/sentry';
import { useEffect, useRef } from 'react';
import { Stack, useNavigationContainerRef, useSegments, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PostHogProvider } from 'posthog-react-native';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { CountryProvider } from '../src/contexts/CountryContext';
import { ThemeProvider, useTheme } from '../src/theme';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';

// react-native-edge-to-edge requires native modules unavailable in Expo Go.
// Import it only when running a standalone/production build.
let SystemBars: React.ComponentType<{ style: 'light' | 'dark' | 'auto' }> | null = null;
if (Constants.appOwnership !== 'expo') {
  try {
    SystemBars = require('react-native-edge-to-edge').SystemBars;
  } catch {}
}
import ErrorBoundary from '../src/components/common/ErrorBoundary';
import OfflineBanner from '../src/components/common/OfflineBanner';
import { initAnalytics, getPostHog } from '../src/config/analytics';
import {
  configureNotificationHandler,
  registerForPushNotifications,
  useNotificationObserver,
} from '../src/services/notificationService';
import { migrateExistingData } from '../src/data/seedData';

// Keep the splash screen visible until we've resolved the auth state.
SplashScreen.preventAutoHideAsync().catch(() => {
  // On web or if called too late the promise rejects — safe to ignore.
});

// Configure how notifications are displayed when app is in the foreground.
// Wrapped in try/catch so a crash here never prevents the app from rendering
// (which would bypass Sentry.wrap and lose the error entirely).
try {
  configureNotificationHandler();
} catch (e) {
  Sentry.captureException(e);
}

// Initialise PostHog analytics as early as possible so events captured
// during the first render cycle are not lost.
try {
  initAnalytics();
} catch (e) {
  Sentry.captureException(e);
}

function InnerLayout() {
  const { user, loading } = useAuth();
  const { isDark } = useTheme();
  const tokenRegistered = useRef(false);
  const segments = useSegments();

  // Register Expo Router's navigation ref so Sentry can track screen transitions.
  const navigationRef = useNavigationContainerRef();
  useEffect(() => {
    if (navigationRef) {
      registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  // Hide the splash screen once the auth state has been resolved.
  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  // Run data migrations (seeds legalGuides if empty, migrates lawyer specializations)
  // Must wait for auth — Firestore rules require request.auth != null for writes.
  const migrated = useRef(false);
  useEffect(() => {
    if (!loading && user && !migrated.current) {
      migrated.current = true;
      migrateExistingData().catch((e) => {
        console.error('[migrateExistingData] failed:', e);
        Sentry.captureException(e);
      });
    }
  }, [loading, user]);

  // Redirect unverified users to the verify-email screen.
  // Wait until navigation is mounted (segments available) to avoid
  // "action was not handled by any navigator" errors.
  useEffect(() => {
    if (loading || !segments.length) return;
    if (user && !user.emailVerified) {
      const inVerify = segments[0] === '(auth)' && segments[1] === 'verify-email';
      if (!inVerify) {
        router.replace('/(auth)/verify-email');
      }
    }
  }, [loading, user, segments]);

  // Navigate to the right screen when a notification is tapped
  useNotificationObserver();

  // Register push token once the user is signed in.
  // Retry up to 3 times with a delay if registration fails on cold start.
  useEffect(() => {
    if (!user?.uid) {
      tokenRegistered.current = false;
      return;
    }
    if (tokenRegistered.current) return;

    let cancelled = false;
    const tryRegister = async (attempt: number) => {
      if (cancelled || tokenRegistered.current) return;
      try {
        const token = await registerForPushNotifications(user.uid);
        if (token) {
          tokenRegistered.current = true;
          Sentry.captureMessage(`[push] Token registered on attempt ${attempt}`, 'info');
        } else if (attempt < 3 && !cancelled) {
          Sentry.captureMessage(`[push] Attempt ${attempt} returned null, retrying in 5s`, 'warning');
          setTimeout(() => tryRegister(attempt + 1), 5000);
        } else {
          Sentry.captureMessage(`[push] All ${attempt} attempts failed — no token saved`, 'error');
        }
      } catch (e) {
        Sentry.captureException(e);
        if (attempt < 3 && !cancelled) {
          setTimeout(() => tryRegister(attempt + 1), 5000);
        }
      }
    };

    // Small delay on first attempt to let native modules fully initialize
    const timer = setTimeout(() => tryRegister(1), 2000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [user]);

  return (
    <CountryProvider user={user}>
      {SystemBars ? <SystemBars style="light" /> : <StatusBar style="light" backgroundColor="#1B5E20" />}
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="business" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="legal" />
        <Stack.Screen name="profile" />
      </Stack>
    </CountryProvider>
  );
}

function RootLayout() {
  const client = getPostHog();
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <PostHogProvider client={client}>
          <ThemeProvider>
            <AuthProvider>
              <InnerLayout />
            </AuthProvider>
          </ThemeProvider>
        </PostHogProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);
