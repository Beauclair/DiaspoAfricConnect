import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import { resetPassword } from '../../src/services/authService';
import { useSubmitGuard } from '../../src/hooks';
import { getUserMessage } from '../../src/utils/errorMessages';
import { trackEvent } from '../../src/config/analytics';
import { AnalyticsEvents } from '../../src/constants/analyticsEvents';

export default function ForgotPasswordScreen() {
  const { colors, typography, radii } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const doReset = useCallback(async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      trackEvent(AnalyticsEvents.PASSWORD_RESET_REQUESTED, { email_provided: true });
      setSent(true);
    } catch (e: any) {
      setError(getUserMessage(e, 'resetPassword', 'Failed to send reset email. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleReset = useSubmitGuard(doReset, 10000);

  if (sent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.scroll}>
          <View style={styles.header}>
            <MaterialIcons name="mark-email-read" size={64} color={colors.primary} />
            <Text style={[styles.title, { color: colors.primary, marginTop: 16 }]}>Check Your Email</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              We sent a password reset link to
            </Text>
            <Text style={[typography.titleMedium, { color: colors.primary, marginTop: 4 }]}>
              {email}
            </Text>
          </View>

          <View style={[styles.infoBox, { backgroundColor: colors.surfaceContainerLow, borderRadius: radii.md }]}>
            <MaterialIcons name="report-gmailerrorred" size={18} color={colors.onSurfaceVariant} />
            <Text style={[typography.bodySmall, { color: colors.onSurfaceVariant, flex: 1, marginLeft: 8, lineHeight: 18 }]}>
              Didn't receive the email? Check your spam or junk folder.
            </Text>
          </View>

          <View style={styles.form}>
            <Button
              title="Back to Login"
              onPress={() => router.back()}
              icon="login"
            />

            <Button
              title="Send Again"
              onPress={() => { setSent(false); setError(''); }}
              variant="outline"
              icon="refresh"
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Enter your email and we'll send you a reset link</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

          <Button title="Send Reset Link" onPress={handleReset} loading={loading} />

          <Button
            title="Back to Login"
            onPress={() => router.back()}
            variant="outline"
            style={{ marginTop: 16 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  error: {
    textAlign: 'center',
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    marginBottom: 24,
    width: '100%',
  },
});
