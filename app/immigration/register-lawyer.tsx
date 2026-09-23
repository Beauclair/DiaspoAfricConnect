import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router, Stack, Redirect } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import CategoryChip from '../../src/components/common/CategoryChip';
import { addLawyer } from '../../src/services/immigrationService';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCountry } from '../../src/contexts/CountryContext';
import { ImmigrationCategory } from '../../src/types';
import { isValidEmail, isValidPhone, isValidURL } from '../../src/utils/validation';

export default function RegisterLawyerScreen() {
  const { user } = useAuth();
  const { hostCountry, countryConfig } = useCountry();
  const [name, setName] = useState('');
  const [firm, setFirm] = useState('');
  const [specializations, setSpecializations] = useState<ImmigrationCategory[]>([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [languages, setLanguages] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const toggleSpecialization = (key: ImmigrationCategory) => {
    setSpecializations((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const validate = (): string | null => {
    if (!name.trim()) return 'Full name is required';
    if (!firm.trim()) return 'Firm / practice name is required';
    if (specializations.length === 0) return 'Select at least one specialization';
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

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    setLoading(true);
    try {
      const lawyerData: Record<string, any> = {
        name: name.trim(),
        firm: firm.trim(),
        specializations,
        hostCountry,
        city: city.trim(),
        state: state.trim(),
        phone: phone.trim(),
        email: email.trim(),
        languagesSpoken: languages.trim()
          ? languages.split(',').map((l) => l.trim()).filter(Boolean)
          : [],
        ownerId: user.uid,
      };
      if (website.trim()) lawyerData.website = website.trim();
      if (consultationFee.trim()) lawyerData.consultationFee = consultationFee.trim();

      await addLawyer(lawyerData as any);
      Alert.alert('Success', 'Your lawyer profile has been registered!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to register. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Register as Lawyer' }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Lawyer Registration</Text>
          <Text style={styles.subtitle}>
            Register yourself as an immigration lawyer to help the diaspora community
          </Text>

          <Input
            label="Full Name *"
            placeholder="e.g. John Doe, Esq."
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Firm / Practice Name *"
            placeholder="e.g. Doe Immigration Law"
            value={firm}
            onChangeText={setFirm}
          />

          <Text style={styles.label}>Specializations *</Text>
          <Text style={styles.hint}>Select all areas you practice in</Text>
          <View style={styles.chips}>
            {countryConfig.immigrationCategories.map((cat) => (
              <CategoryChip
                key={cat.key}
                label={cat.label}
                selected={specializations.includes(cat.key as ImmigrationCategory)}
                onPress={() => toggleSpecialization(cat.key as ImmigrationCategory)}
              />
            ))}
          </View>

          <Input
            label="City *"
            placeholder="e.g. Washington"
            value={city}
            onChangeText={setCity}
          />
          <Input
            label={`${countryConfig.addressFields.regionLabel} *`}
            placeholder={countryConfig.addressFields.regionPlaceholder}
            value={state}
            onChangeText={setState}
          />
          <Input
            label="Phone *"
            placeholder={countryConfig.phoneFields.placeholder}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Input
            label="Email *"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
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

          <Button
            title="Register"
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: 8, marginBottom: 32 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textLight, marginTop: 6, marginBottom: 20, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  hint: { fontSize: 12, color: Colors.textLight, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
});
