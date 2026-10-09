// Dynamic Expo config — reads secrets from environment variables so they
// stay out of version control.  See .env.example for the full list.
require('dotenv').config();

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: 'DiaspoAfricConnect',
  slug: 'DiaspoAfricConnect',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'diaspoafricconnect',
  userInterfaceStyle: 'automatic',

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.diaspoafricconnect.app',
  },

  android: {
    adaptiveIcon: {
      backgroundColor: '#1B5E20',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    package: 'com.diaspoafricconnect.app',
    versionCode: 2,
  },

  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },

  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#1B5E20',
        image: './assets/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        dark: {
          backgroundColor: '#0D3B0F',
          image: './assets/splash-icon.png',
        },
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow DiaspoAfricConnect to access your photos to add business images.',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Allow DiaspoAfricConnect to use your location to find nearby businesses.',
      },
    ],
    [
      'expo-notifications',
      {
        color: '#1B5E20',
      },
    ],
    [
      '@sentry/react-native/expo',
      {
        organization: process.env.SENTRY_ORG || 'o4512176942743552',
        project: 'diaspoafricconnect',
      },
    ],
  ],

  updates: {
    url: `https://u.expo.dev/${process.env.EXPO_PROJECT_ID}`,
  },

  runtimeVersion: '1.0.0',

  extra: {
    eas: {
      projectId: process.env.EXPO_PROJECT_ID,
    },
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.FIREBASE_APP_ID,
    sentryDsn: process.env.SENTRY_DSN,
    posthogApiKey: process.env.POSTHOG_API_KEY,
    posthogHost: process.env.POSTHOG_HOST,
  },
};

module.exports = { expo: config };
