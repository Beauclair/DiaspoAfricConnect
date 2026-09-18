import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { CountryProvider } from '../src/contexts/CountryContext';
import { StatusBar } from 'expo-status-bar';
import ErrorBoundary from '../src/components/common/ErrorBoundary';
import OfflineBanner from '../src/components/common/OfflineBanner';

function InnerLayout() {
  const { user } = useAuth();
  return (
    <CountryProvider user={user}>
      <StatusBar style="light" />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="business" />
        <Stack.Screen name="immigration" />
      </Stack>
    </CountryProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <InnerLayout />
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
