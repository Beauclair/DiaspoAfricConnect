import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Image, TouchableOpacity } from 'react-native';
import { router, Stack, Redirect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import PickerSelect from '../../src/components/common/PickerSelect';
import CategoryChip from '../../src/components/common/CategoryChip';
import { addLawyer } from '../../src/services/legalService';
import { uploadLawyerPhoto } from '../../src/services/storageService';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCountry } from '../../src/contexts/CountryContext';
import { LegalCategory } from '../../src/types';
import { LEGAL_CATEGORIES, COMMON_LANGUAGES } from '../../src/constants/countries';
import { isValidEmail, isValidPhone, isValidURL } from '../../src/utils/validation';
import { useSubmitGuard } from '../../src/hooks';
import { getUserMessage } from '../../src/utils/errorMessages';
import { trackEvent } from '../../src/config/analytics';
import { AnalyticsEvents } from '../../src/constants/analyticsEvents';

export default function RegisterLawyerScreen() {
  const { user } = useAuth();
  const { hostCountry, countryConfig } = useCountry();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [firm, setFirm] = useState('');
  const [specializations, setSpecializations] = useState<LegalCategory[]>([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [consultationFee, setConsultationFee] = useState('');
  const [profileImage, setProfileImage] = useState<{ uri: string; base64: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        setProfileImage({ uri: asset.uri, base64: asset.base64 });
      } else {
        Alert.alert('Error', 'Could not read image data. Please try another photo.');
      }
    }
  };

  const toggleSpecialization = (key: LegalCategory) => {
    setSpecializations((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
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

  const doSubmit = useCallback(async () => {
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
        languagesSpoken: languages,
        ownerId: user.uid,
      };
      if (website.trim()) lawyerData.website = website.trim();
      if (consultationFee.trim()) lawyerData.consultationFee = consultationFee.trim();

      const lawyerId = await addLawyer(lawyerData as any);

      if (profileImage) {
        try {
          const photoURL = await uploadLawyerPhoto(lawyerId, profileImage.base64);
          const { updateLawyer } = await import('../../src/services/legalService');
          await updateLawyer(lawyerId, { photoURL });
        } catch {
          // Photo upload failed but profile was created — not a blocker
        }
      }

      trackEvent(AnalyticsEvents.LAWYER_REGISTERED, { specialization_count: specializations.length });
      Alert.alert('Success', 'Your attorney profile has been registered!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', getUserMessage(e, 'registerLawyer', 'Failed to register. Please try again.'));
    }
    setLoading(false);
  }, [name, firm, specializations, hostCountry, city, state, phone, email, website, languages, consultationFee, user, profileImage]);

  const handleSubmit = useSubmitGuard(doSubmit, 5000);

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Register as Attorney' }} />
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
          <Text style={[styles.title, { color: colors.onSurface }]}>Attorney Registration</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Register yourself as an attorney to help the African diaspora community with legal matters
          </Text>

          {/* Profile photo picker */}
          <View style={styles.photoPicker}>
            <TouchableOpacity
              style={[
                styles.photoCircle,
                { borderColor: profileImage ? colors.primary : colors.outline },
              ]}
              onPress={pickProfileImage}
              accessibilityRole="button"
              accessibilityLabel={profileImage ? 'Change profile photo' : 'Add profile photo'}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage.uri }} style={styles.photoImage} />
              ) : (
                <>
                  <MaterialIcons name="camera-alt" size={28} color={colors.onSurfaceVariant} />
                  <Text style={[styles.photoPlaceholderText, { color: colors.onSurfaceVariant }]}>
                    Add Photo
                  </Text>
                </>
              )}
            </TouchableOpacity>
            {profileImage && (
              <TouchableOpacity
                style={[styles.photoRemoveBtn, { backgroundColor: colors.tertiary }]}
                onPress={() => setProfileImage(null)}
                accessibilityRole="button"
                accessibilityLabel="Remove profile photo"
              >
                <MaterialIcons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

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
          <PickerSelect
            label={countryConfig.addressFields.regionLabel}
            placeholder={countryConfig.addressFields.regionPlaceholder}
            value={state}
            options={countryConfig.regions.map((r) => ({ label: r.name, value: r.name }))}
            onValueChange={setState}
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
          <Text style={[styles.label, { color: colors.onSurface }]}>Languages Spoken</Text>
          <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>Select all languages you speak</Text>
          <View style={styles.chips}>
            {COMMON_LANGUAGES.map((lang) => (
              <CategoryChip
                key={lang}
                label={lang}
                selected={languages.includes(lang)}
                onPress={() => toggleLanguage(lang)}
              />
            ))}
          </View>
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
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 6, marginBottom: 20, lineHeight: 20 },
  photoPicker: { alignItems: 'center', marginBottom: 20, position: 'relative' },
  photoCircle: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  photoImage: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholderText: { fontSize: 11, marginTop: 2 },
  photoRemoveBtn: {
    position: 'absolute', top: 0, right: '33%',
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  hint: { fontSize: 12, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
});
