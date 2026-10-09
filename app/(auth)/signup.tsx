import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/theme';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import AnimatedPress from '../../src/components/common/AnimatedPressable';
import { signUp } from '../../src/services/authService';
import { isValidEmail, isStrongPassword } from '../../src/utils/validation';
import { HOST_COUNTRIES, HostCountryCode } from '../../src/constants/countries';
import { useSubmitGuard } from '../../src/hooks';
import { getUserMessage } from '../../src/utils/errorMessages';
import { trackEvent } from '../../src/config/analytics';
import { AnalyticsEvents } from '../../src/constants/analyticsEvents';

const HOST_COUNTRY_LIST = Object.values(HOST_COUNTRIES);

export default function SignupScreen() {
  const { colors, typography, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hostCountry, setHostCountry] = useState<HostCountryCode>('US');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const doSignup = useCallback(async () => {
    if (!displayName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const passwordError = isStrongPassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp(email, password, displayName, hostCountry);
      trackEvent(AnalyticsEvents.SIGN_UP, { method: 'email', host_country: hostCountry });
      router.replace('/(auth)/verify-email');
    } catch (e: any) {
      setError(getUserMessage(e, 'signup', 'Signup failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [displayName, email, password, confirmPassword, hostCountry, agreedToTerms]);

  const handleSignup = useSubmitGuard(doSignup, 5000);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: colors.background }}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <LinearGradient
            colors={['#1B6B2E', '#2E7D32']}
            style={styles.logoBg}
          >
            <MaterialIcons name="people" size={36} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[typography.displayMedium, { color: colors.onSurface, marginTop: 20 }]}>
            Join the Community
          </Text>
          <Text style={[typography.bodyLarge, { color: colors.onSurfaceVariant, marginTop: 6 }]}>
            Create your DiaspoAfricConnect account
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={displayName}
            onChangeText={setDisplayName}
            required
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />
          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={<MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={22} color={colors.onSurfaceVariant} />}
            onRightIconPress={() => setShowPassword(!showPassword)}
            required
          />
          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            required
          />

          <Text style={[typography.labelMedium, { color: colors.onSurface, marginBottom: 8 }]}>
            Where do you live?
          </Text>
          <View style={styles.countryGrid}>
            {HOST_COUNTRY_LIST.map((c) => {
              const isAvailable = c.code === 'US';
              return (
                <AnimatedPress
                  key={c.code}
                  onPress={isAvailable ? () => setHostCountry(c.code) : undefined}
                  disabled={!isAvailable}
                  pressScale={isAvailable ? 0.95 : 1}
                  style={[
                    styles.countryChip,
                    {
                      borderRadius: radii.full,
                      borderWidth: 1.5,
                      borderColor: isAvailable
                        ? hostCountry === c.code ? colors.primary : colors.outlineVariant
                        : colors.outlineVariant,
                      backgroundColor: isAvailable
                        ? hostCountry === c.code ? colors.primaryContainer : colors.surfaceContainerLow
                        : colors.surfaceContainerLow,
                      opacity: isAvailable ? 1 : 0.4,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: hostCountry === c.code, disabled: !isAvailable }}
                  accessibilityLabel={isAvailable ? c.name : `${c.name} — coming soon`}
                >
                  <Text style={styles.countryFlag}>{c.flag}</Text>
                  <Text
                    style={[
                      typography.labelMedium,
                      { color: hostCountry === c.code ? colors.primary : colors.onSurface },
                    ]}
                  >
                    {c.name}
                  </Text>
                  {!isAvailable && (
                    <Text style={[typography.labelSmall, { color: colors.onSurfaceVariant, marginLeft: 4, fontSize: 9 }]}>
                      Soon
                    </Text>
                  )}
                </AnimatedPress>
              );
            })}
          </View>

          {/* Legal consent */}
          <Pressable
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            style={styles.legalRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreedToTerms }}
          >
            <MaterialIcons
              name={agreedToTerms ? 'check-box' : 'check-box-outline-blank'}
              size={22}
              color={agreedToTerms ? colors.primary : colors.onSurfaceVariant}
            />
            <Text style={[typography.bodySmall, { color: colors.onSurfaceVariant, flex: 1, marginLeft: 8, lineHeight: 18 }]}>
              I agree to the{' '}
              <Text
                style={{ color: colors.primary, textDecorationLine: 'underline' }}
                onPress={() => router.push('/legal/terms-of-service')}
              >
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text
                style={{ color: colors.primary, textDecorationLine: 'underline' }}
                onPress={() => router.push('/legal/privacy-policy')}
              >
                Privacy Policy
              </Text>
            </Text>
          </Pressable>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.errorContainer, borderRadius: radii.md }]}>
              <MaterialIcons name="error-outline" size={18} color={colors.error} />
              <Text style={[typography.bodySmall, { color: colors.error, marginLeft: 8, flex: 1 }]}>{error}</Text>
            </View>
          ) : null}

          <Button title="Create Account" onPress={handleSignup} loading={loading} disabled={!agreedToTerms} icon="person-add" size="lg" />

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant }]} />
            <Text style={[typography.labelSmall, { color: colors.onSurfaceVariant, marginHorizontal: 12 }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant }]} />
          </View>

          <View style={styles.footer}>
            <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[typography.labelLarge, { color: colors.primary }]}>Sign In</Text>
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
    marginBottom: 28,
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
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  countryFlag: {
    fontSize: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 16,
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
