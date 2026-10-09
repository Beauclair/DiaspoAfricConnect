import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, AppState } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/theme';
import Button from '../../src/components/common/Button';
import { useAuth } from '../../src/contexts/AuthContext';
import { resendVerificationEmail, logOut } from '../../src/services/authService';

const RESEND_COOLDOWN = 60; // seconds
const POLL_INTERVAL = 3000; // check every 3 seconds

export default function VerifyEmailScreen() {
  const { colors, typography, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const navigated = useRef(false);

  // Navigate once when verification is detected
  const onVerified = useCallback(() => {
    if (navigated.current) return;
    navigated.current = true;
    router.replace('/(tabs)/home');
  }, []);

  // Poll Firebase for email verification status
  useEffect(() => {
    if (!user) return;
    const poll = setInterval(async () => {
      try {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(poll);
          onVerified();
        }
      } catch {
        // Silently ignore — will retry on next interval
      }
    }, POLL_INTERVAL);
    return () => clearInterval(poll);
  }, [user, onVerified]);

  // Also check immediately when the app comes back to the foreground
  // (user may have verified in the browser and switched back)
  useEffect(() => {
    if (!user) return;
    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        try {
          await user.reload();
          if (user.emailVerified) onVerified();
        } catch {
          // ignore
        }
      }
    });
    return () => sub.remove();
  }, [user, onVerified]);

  // Start cooldown timer on mount (email was just sent during signup)
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      setCooldown(RESEND_COOLDOWN);
      Alert.alert('Email Sent', 'A new verification email has been sent. Check your inbox.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleSignOut = async () => {
    await logOut();
    router.replace('/(auth)/login');
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.content}>
        <LinearGradient
          colors={['#1B6B2E', '#2E7D32']}
          style={styles.iconBg}
        >
          <MaterialIcons name="mark-email-unread" size={40} color="#FFFFFF" />
        </LinearGradient>

        <Text style={[typography.displayMedium, { color: colors.onSurface, marginTop: 24, textAlign: 'center' }]}>
          Verify Your Email
        </Text>

        <Text style={[typography.bodyLarge, { color: colors.onSurfaceVariant, marginTop: 12, textAlign: 'center', lineHeight: 24 }]}>
          We sent a verification link to
        </Text>
        <Text style={[typography.titleMedium, { color: colors.primary, marginTop: 4, textAlign: 'center' }]}>
          {user?.email}
        </Text>

        <View style={[styles.infoBox, { backgroundColor: colors.surfaceContainerLow, borderRadius: radii.md }]}>
          <MaterialIcons name="autorenew" size={18} color={colors.primary} />
          <Text style={[typography.bodySmall, { color: colors.onSurfaceVariant, flex: 1, marginLeft: 8, lineHeight: 18 }]}>
            We'll detect automatically when you verify. Just tap the link in the email — no need to come back here.
          </Text>
        </View>

        <Button
          title={cooldown > 0 ? `Resend Email (${cooldown}s)` : 'Resend Verification Email'}
          onPress={handleResend}
          loading={resending}
          disabled={cooldown > 0}
          variant="outline"
          icon="email"
          size="lg"
          style={{ marginTop: 8 }}
        />

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="ghost"
          icon="logout"
          style={{ marginTop: 24 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    marginTop: 24,
    marginBottom: 24,
    width: '100%',
  },
});
