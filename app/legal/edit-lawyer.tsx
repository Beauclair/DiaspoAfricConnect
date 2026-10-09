import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router, Stack, useLocalSearchParams, Redirect } from 'expo-router';
import { useTheme } from '../../src/theme';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import CategoryChip from '../../src/components/common/CategoryChip';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorView from '../../src/components/common/ErrorView';
import { getLawyerById, updateLawyer } from '../../src/services/legalService';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCountry } from '../../src/contexts/CountryContext';
import { LegalCategory } from '../../src/types';
import { LEGAL_CATEGORIES } from '../../src/constants/countries';
import { isValidEmail, isValidPhone, isValidURL } from '../../src/utils/validation';
import { useSubmitGuard } from '../../src/hooks';
import { getUserMessage } from '../../src/utils/errorMessages';
import { trackEvent } from '../../src/config/analytics';
import { AnalyticsEvents } from '../../src/constants/analyticsEvents';

export default function EditLawyerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { hostCountry, countryConfig } = useCountry();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [firm, setFirm] = useState('');
  const [specializations, setSpecializations] = useState<LegalCategory[]>([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [languages, setLanguages] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [barAssociationNumber, setBarAssociationNumber] = useState('');

  useEffect(() => {
    loadLawyer();
  }, [id]);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const loadLawyer = async () => {
    if (!id) return;
    setError('');
    try {
      const lawyer = await getLawyerById(id);
      if (!lawyer) {
        setError('Attorney profile not found');
        setLoading(false);
        return;
      }
      if (lawyer.ownerId !== user?.uid) {
        setError('You do not have permission to edit this profile');
        setLoading(false);
        return;
      }
      setName(lawyer.name);
      setFirm(lawyer.firm);
      setSpecializations(lawyer.specializations || []);
      setCity(lawyer.city);
      setState(lawyer.state);
      setPhone(lawyer.phone);
      setEmail(lawyer.email);
      setWebsite(lawyer.website || '');
      setLanguages((lawyer.languagesSpoken || []).join(', '));
      setConsultationFee(lawyer.consultationFee || '');
      setBarAssociationNumber(lawyer.barAssociationNumber || '');
    } catch (e: any) {
      setError(getUserMessage(e, 'loadLawyer', 'Failed to load attorney details.'));
    }
    setLoading(false);
  };

  const toggleSpecialization = (key: LegalCategory) => {
    setSpecializations((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const validate = (): string | null => {
    if (!name.trim()) return 'Full name is required';
    if (!firm.trim()) return 'Firm / practice name is required';
    if (specializations.length === 0) return 'Select at least one practice area';
    if (!city.trim()) return 'City is required';
    if (!state.trim()) return `${countryConfig.addressFields.regionLabel} is required`;
    if (!phone.trim()) return 'Phone number is required';
    if (!isValidPhone(phone, hostCountry)) {
      return `Enter a valid phone number (e.g. ${countryConfig.phoneFields.placeholder})`;
    }
    if (!email.trim()) return 'Email is required';
    if (!isValidEmail(email)) return 'Enter a valid email address';
    if (website.trim() && !isValidURL(website)) return 'Enter a valid website URL (https://...)';
    return null;
  };

  const doSave = useCallback(async () => {
    if (!id || !user) return;
    const validationError = validate();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setSaving(true);
    try {
      const updateData: Record<string, any> = {
        name: name.trim(),
        firm: firm.trim(),
        specializations,
        city: city.trim(),
        state: state.trim(),
        phone: phone.trim(),
        email: email.trim(),
        languagesSpoken: languages.trim()
          ? languages.split(',').map((l) => l.trim()).filter(Boolean)
          : [],
      };
      if (website.trim()) updateData.website = website.trim();
      else updateData.website = '';
      if (consultationFee.trim()) updateData.consultationFee = consultationFee.trim();
      else updateData.consultationFee = '';
      if (barAssociationNumber.trim()) updateData.barAssociationNumber = barAssociationNumber.trim();
      else updateData.barAssociationNumber = '';

      await updateLawyer(id, updateData as any);
      trackEvent(AnalyticsEvents.LAWYER_EDITED, { lawyer_id: id });

      Alert.alert('Success', 'Attorney profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', getUserMessage(e, 'updateLawyer', 'Failed to update profile. Please try again.'));
    } finally {
      setSaving(false);
    }
  }, [id, user, name, firm, specializations, city, state, phone, email, website, languages, consultationFee, barAssociationNumber]);

  const handleSave = useSubmitGuard(doSave, 5000);

  if (loading) return (
    <>
      <Stack.Screen options={{ headerTitle: 'Edit Attorney Profile' }} />
      <LoadingSpinner />
    </>
  );
  if (error) return (
    <>
      <Stack.Screen options={{ headerTitle: 'Edit Attorney Profile' }} />
      <ErrorView message={error} />
    </>
  );

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Edit Attorney Profile' }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: colors.onSurface }]}>Edit Profile</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Update your attorney profile information
          </Text>

          <Input
            label="Full Name"
            placeholder="e.g. John Doe, Esq."
            value={name}
            onChangeText={setName}
            required
          />
          <Input
            label="Firm / Practice Name"
            placeholder="e.g. Doe Law Firm"
            value={firm}
            onChangeText={setFirm}
            required
          />

          <Text style={[styles.label, { color: colors.onSurface }]}>Practice Areas <Text style={{ color: colors.error }}>*</Text></Text>
          <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>Select all areas you practice in</Text>
          <View style={styles.chips}>
            {LEGAL_CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.key}
                label={cat.label}
                selected={specializations.includes(cat.key)}
                onPress={() => toggleSpecialization(cat.key)}
              />
            ))}
          </View>

          <Input
            label="City"
            placeholder="e.g. Washington"
            value={city}
            onChangeText={setCity}
            required
          />
          <Input
            label={countryConfig.addressFields.regionLabel}
            placeholder={countryConfig.addressFields.regionPlaceholder}
            value={state}
            onChangeText={setState}
            required
          />
          <Input
            label="Phone"
            placeholder={countryConfig.phoneFields.placeholder}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            required
          />
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />
          <Input
            label="Website"
            placeholder="https://www.yourfirm.com"
            value={website}
            onChangeText={setWebsite}
            autoCapitalize="none"
          />
          <Input
            label="Languages Spoken"
            placeholder="e.g. English, French, Swahili"
            value={languages}
            onChangeText={setLanguages}
          />
          <Input
            label="Consultation Fee"
            placeholder="e.g. $150/hr, Free initial consultation"
            value={consultationFee}
            onChangeText={setConsultationFee}
          />
          <Input
            label="Bar Association Number"
            placeholder="e.g. 12345"
            value={barAssociationNumber}
            onChangeText={setBarAssociationNumber}
          />

          <Button
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            loading={saving}
            style={{ marginTop: 8, marginBottom: 32 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 6, marginBottom: 20, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  hint: { fontSize: 12, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
});
