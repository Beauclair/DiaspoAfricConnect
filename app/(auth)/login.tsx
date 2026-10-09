import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/theme';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import { signIn } from '../../src/services/authService';
import { isValidEmail } from '../../src/utils/validation';
import { useSubmitGuard } from '../../src/hooks';
import { getUserMessage } from '../../src/utils/errorMessages';
import { trackEvent } from '../../src/config/analytics';
import { AnalyticsEvents } from '../../src/constants/analyticsEvents';

export default function LoginScreen() {
  const { colors, typography, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const doLogin = useCallback(async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await signIn(email, password);
      trackEvent(AnalyticsEvents.LOGIN, { method: 'email' });
      if (!user.emailVerified) {
        router.replace('/(auth)/verify-email');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (e: any) {
      setError(getUserMessage(e, 'login', 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const handleLogin = useSubmitGuard(doLogin, 3000);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: colors.background }}
      >
        {/* Logo section */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <LinearGradient
            colors={['#1B6B2E', '#2E7D32']}
            style={styles.logoBg}
          >
            <MaterialIcons name="public" size={36} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[typography.displayMedium, { color: colors.onSurface, marginTop: 20 }]}>
            Welcome back
          </Text>
          <Text style={[typography.bodyLarge, { color: colors.onSurfaceVariant, marginTop: 6 }]}>
            Sign in to your account
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={<MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={22} color={colors.onSurfaceVariant} />}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.errorContainer, borderRadius: radii.md }]}>
              <MaterialIcons name="error-outline" size={18} color={colors.error} />
              <Text style={[typography.bodySmall, { color: colors.error, marginLeft: 8, flex: 1 }]}>{error}</Text>
            </View>
          ) : null}

          <Button title="Sign In" onPress={handleLogin} loading={loading} icon="login" size="lg" />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.link}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[typography.labelMedium, { color: colors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant }]} />
            <Text style={[typography.labelSmall, { color: colors.onSurfaceVariant, marginHorizontal: 12 }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant }]} />
          </View>

          <View style={styles.footer}>
            <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={[typography.labelLarge, { color: colors.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.guestLink}>
            <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant }]}>
              Continue without an account
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoBg: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    width: '100%',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
  },
  link: {
    alignItems: 'center',
    marginTop: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  guestLink: {
    alignItems: 'center',
    marginTop: 16,
  },
});
