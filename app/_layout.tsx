import { useEffect } from 'react';
import { Slot } from 'expo-router';
import * as Sentry from '@sentry/react-native';
import { AuthProvider } from '../src/contexts/AuthContext';
import { CountryProvider } from '../src/contexts/CountryContext';
import { StatusBar } from 'expo-status-bar';
import ErrorBoundary from '../src/components/common/ErrorBoundary';
import OfflineBanner from '../src/components/common/OfflineBanner';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  tracesSampleRate: 0.2,
  enabled: !__DEV__,
});

function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CountryProvider>
          <StatusBar style="dark" />
          <OfflineBanner />
          <Slot />
        </CountryProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);
