import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../src/theme';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import { resetPassword } from '../../src/services/authService';
import { useSubmitGuard } from '../../src/hooks';
import { getUserMessage } from '../../src/utils/errorMessages';
import { trackEvent } from '../../src/config/analytics';
import { AnalyticsEvents } from '../../src/constants/analyticsEvents';

export default function ForgotPasswordScreen() {
  const { colors, typography } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const doReset = useCallback(async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await resetPassword(email);
      trackEvent(AnalyticsEvents.PASSWORD_RESET_REQUESTED, { email_provided: true });
      setMessage('Password reset email sent. Check your inbox.');
    } catch (e: any) {
      setError(getUserMessage(e, 'resetPassword', 'Failed to send reset email. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleReset = useSubmitGuard(doReset, 10000);

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
          {message ? <Text style={[styles.success, { color: colors.success }]}>{message}</Text> : null}

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
  success: {
    textAlign: 'center',
    marginBottom: 16,
  },
});
