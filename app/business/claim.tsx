import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme, Typography } from '../../src/theme';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import Card from '../../src/components/common/Card';
import { useAuth } from '../../src/contexts/AuthContext';
import { submitVerificationRequest, hasPendingRequest, syncEntityStatus } from '../../src/services/verificationService';
import AnimatedPress from '../../src/components/common/AnimatedPressable';
import { useSubmitGuard } from '../../src/hooks';
import { getUserMessage } from '../../src/utils/errorMessages';

export default function ClaimBusinessScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { user } = useAuth();
  const { colors, radii, spacing } = useTheme();

  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const isValid = phone.trim().length >= 8 && agreed;

  const doSubmit = useCallback(async () => {
    if (!user || !id || !isValid) return;
    setLoading(true);
    setError('');

    try {
      // Check for existing pending request
      const pending = await hasPendingRequest(id, user.uid);
      if (pending) {
        // A request already exists — make sure the entity status is synced to 'pending'
        // (handles the case where a previous attempt created the request but failed to update the entity)
        await syncEntityStatus('business', id, phone.trim());
        setSubmitted(true);
        setLoading(false);
        return;
      }

      await submitVerificationRequest(
        'business',
        id,
        name || 'Unknown Business',
        user.uid,
        phone.trim(),
      );
      setSubmitted(true);
    } catch (e: any) {
      setError(getUserMessage(e, 'submitVerification', 'Failed to submit verification request.'));
    }
    setLoading(false);
  }, [user, id, isValid, phone, name]);

  const handleSubmit = useSubmitGuard(doSubmit, 10000);

  if (!user) {
    router.replace('/(auth)/login');
    return null;
  }

  if (submitted) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: 'Verification Submitted' }} />
        <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.successContent}>
            <View style={[styles.successIcon, { backgroundColor: colors.successContainer }]}>
              <MaterialIcons name="check-circle" size={64} color={colors.success} />
            </View>
            <Text style={[styles.successTitle, { color: colors.onSurface }]}>
              Request Submitted!
            </Text>
            <Text style={[styles.successText, { color: colors.onSurfaceVariant }]}>
              Your verification request for {name} has been submitted. We'll review it and update the status shortly.
            </Text>
            <Text style={[styles.successNote, { color: colors.onSurfaceVariant }]}>
              In a future update, you'll receive an OTP code to verify your phone number instantly.
            </Text>
            <Button
              title="Back to Business"
              onPress={() => router.back()}
              style={{ marginTop: 24 }}
            />
          </Animated.View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Verify Business' }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
      <ScrollView
        ref={scrollViewRef}
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Business name header */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Card style={styles.businessHeader}>
            <View style={styles.businessHeaderRow}>
              <MaterialIcons name="storefront" size={24} color={colors.primary} />
              <Text style={[styles.businessName, { color: colors.onSurface }]} numberOfLines={2}>
                {name}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Info section */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Card style={styles.infoCard}>
            <Text style={[styles.infoTitle, { color: colors.onSurface }]}>
              Why verify your business?
            </Text>
            <View style={styles.benefitRow}>
              <MaterialIcons name="verified" size={20} color={colors.success} />
              <Text style={[styles.benefitText, { color: colors.onSurfaceVariant }]}>
                Verified badge builds trust with customers
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <MaterialIcons name="trending-up" size={20} color={colors.success} />
              <Text style={[styles.benefitText, { color: colors.onSurfaceVariant }]}>
                Higher ranking in search results
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <MaterialIcons name="shield" size={20} color={colors.success} />
              <Text style={[styles.benefitText, { color: colors.onSurfaceVariant }]}>
                Only you can manage the listing
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Phone input */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
            Business Phone Number
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.onSurfaceVariant }]}>
            Enter the phone number associated with your business. In a future update, we'll send a verification code to confirm ownership.
          </Text>
          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (555) 123-4567"
            keyboardType="phone-pad"
            leftIcon="phone"
            autoCapitalize="none"
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }}
          />
        </Animated.View>

        {/* Agreement */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <AnimatedPress
            onPress={() => setAgreed(!agreed)}
            style={styles.agreementRow}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: agreed ? colors.primary : colors.outline,
                  backgroundColor: agreed ? colors.primary : 'transparent',
                  borderRadius: radii.sm,
                },
              ]}
            >
              {agreed && <MaterialIcons name="check" size={16} color={colors.onPrimary} />}
            </View>
            <Text style={[styles.agreementText, { color: colors.onSurface }]}>
              I confirm that I am the owner or authorized representative of this business.
            </Text>
          </AnimatedPress>
        </Animated.View>

        {/* Error */}
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.errorContainer }]}>
            <MaterialIcons name="error-outline" size={18} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        {/* Submit */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Button
            title="Submit Verification Request"
            onPress={handleSubmit}
            loading={loading}
            disabled={!isValid}
            icon="verified"
            style={{ marginTop: 24 }}
          />
        </Animated.View>
      </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  businessHeader: { marginBottom: 16 },
  businessHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  businessName: { ...Typography.headlineMedium, flex: 1 },
  infoCard: { marginBottom: 24 },
  infoTitle: { ...Typography.titleLarge, marginBottom: 12 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  benefitText: { ...Typography.bodyMedium, flex: 1 },
  sectionTitle: { ...Typography.titleLarge, marginBottom: 4 },
  sectionDescription: { ...Typography.bodyMedium, marginBottom: 16, lineHeight: 20 },
  agreementRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 16 },
  checkbox: { width: 24, height: 24, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  agreementText: { ...Typography.bodyMedium, flex: 1, lineHeight: 20 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: { ...Typography.bodySmall, flex: 1 },
  successContent: { alignItems: 'center', paddingHorizontal: 32 },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: { ...Typography.headlineMedium, marginBottom: 12 },
  successText: { ...Typography.bodyMedium, textAlign: 'center', lineHeight: 22 },
  successNote: { ...Typography.bodySmall, textAlign: 'center', lineHeight: 18, marginTop: 12, fontStyle: 'italic' },
});
