import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack, Redirect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, Typography } from '../../src/theme';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import CategoryChip from '../../src/components/common/CategoryChip';
import { addBusiness } from '../../src/services/businessService';
import { uploadBusinessPhotos } from '../../src/services/storageService';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCountry } from '../../src/contexts/CountryContext';
import { BusinessCategory } from '../../src/types';
import { BUSINESS_CATEGORIES } from '../../src/constants/categories';
import { validateBusinessForm } from '../../src/utils/validation';
import { useSubmitGuard } from '../../src/hooks';
import { getUserMessage } from '../../src/utils/errorMessages';
import { trackEvent } from '../../src/config/analytics';
import { AnalyticsEvents } from '../../src/constants/analyticsEvents';

export default function AddBusinessScreen() {
  const { user } = useAuth();
  const { hostCountry, countryConfig } = useCountry();
  const { colors, radii } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('restaurant');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [images, setImages] = useState<{ uri: string; base64: string }[]>([]);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const pickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Limit', 'Maximum 3 photos allowed');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        setImages((prev) => [...prev, { uri: asset.uri, base64: asset.base64! }]);
      } else {
        Alert.alert('Error', 'Could not read image data. Please try another photo.');
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const doSubmit = useCallback(async () => {
    const validationError = validateBusinessForm({
      name, description, address, city, state, zipCode, phone, website,
    }, hostCountry);
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }
    if (!user) return;
    setLoading(true);
    try {
      const businessData: Record<string, any> = {
        name,
        description,
        category,
        hostCountry,
        address,
        city,
        state,
        zipCode,
        coordinates: { latitude: 0, longitude: 0 },
        phone: phone.trim(),
        languagesSpoken: [],
        photos: [],
        ownerId: user.uid,
        isVerified: false,
      };
      if (website.trim()) businessData.website = website.trim();

      const businessId = await addBusiness(businessData as any);

      if (images.length > 0) {
        const photoUrls = await uploadBusinessPhotos(businessId, images.map((img) => img.base64));
        const { updateBusiness } = await import('../../src/services/businessService');
        await updateBusiness(businessId, { photos: photoUrls });
      }

      Alert.alert('Success', 'Business added successfully!', [
        { text: 'View', onPress: () => router.replace({ pathname: '/business/[id]', params: { id: businessId } }) },
      ]);
      trackEvent(AnalyticsEvents.BUSINESS_ADDED, { category, has_photos: images.length > 0, host_country: hostCountry });
    } catch (e: any) {
      Alert.alert('Error', getUserMessage(e, 'addBusiness', 'Failed to add business. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [name, description, address, city, state, zipCode, phone, website, category, hostCountry, user, images]);

  const handleSubmit = useSubmitGuard(doSubmit, 5000);

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Add Business' }} />
      <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(bottom, 20) + 20 }]} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: colors.onSurface }]}>Add Your Business</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Share your African-owned business with the community</Text>

          <Input label="Business Name" placeholder="Enter business name" value={name} onChangeText={setName} required />
          <Input label="Description" placeholder="Describe your business" value={description} onChangeText={setDescription} multiline numberOfLines={4} required />

          <Text style={[styles.label, { color: colors.onSurface }]}>Category <Text style={{ color: colors.error }}>*</Text></Text>
          <View style={styles.chips}>
            {BUSINESS_CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.key}
                label={cat.label}
                selected={category === cat.key}
                onPress={() => setCategory(cat.key)}
              />
            ))}
          </View>

          <Text style={[styles.label, { color: colors.onSurface }]}>Photos (up to 3)</Text>
          <View style={styles.imageRow}>
            {images.map((img, i) => (
              <View key={i} style={styles.imageWrapper}>
                <Image source={{ uri: img.uri }} style={[styles.thumbnail, { borderRadius: radii.md }]} />
                <TouchableOpacity
                  style={[styles.removeBtn, { backgroundColor: colors.tertiary, borderRadius: radii.full }]}
                  onPress={() => removeImage(i)}
                >
                  <MaterialIcons name="close" size={16} color={'#FFFFFF'} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 3 && (
              <TouchableOpacity
                style={[styles.addImageBtn, { borderRadius: radii.md, borderColor: colors.outline }]}
                onPress={pickImage}
              >
                <MaterialIcons name="add-a-photo" size={28} color={colors.onSurfaceVariant} />
                <Text style={[styles.addImageText, { color: colors.onSurfaceVariant }]}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          <Input label="Street Address" placeholder="Enter street address" value={address} onChangeText={setAddress} required />
          <Input label="City" placeholder="Enter city" value={city} onChangeText={setCity} required />
          <Input label={countryConfig.addressFields.regionLabel} placeholder={countryConfig.addressFields.regionPlaceholder} value={state} onChangeText={setState} required />
          <Input label={countryConfig.addressFields.postalCodeLabel} placeholder={countryConfig.addressFields.postalCodePlaceholder} value={zipCode} onChangeText={setZipCode} keyboardType={countryConfig.addressFields.postalCodeKeyboardType} required />
          <Input label="Phone" placeholder={countryConfig.phoneFields.placeholder} value={phone} onChangeText={setPhone} keyboardType="phone-pad" required />
          <Input label="Website" placeholder="https://..." value={website} onChangeText={setWebsite} autoCapitalize="none" />

          <Button title={loading ? 'Submitting...' : 'Submit Business'} onPress={handleSubmit} loading={loading} style={{ marginTop: 16 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  title: { ...Typography.displaySmall },
  subtitle: { ...Typography.bodyMedium, marginTop: 4, marginBottom: 24 },
  label: { ...Typography.titleSmall, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  imageRow: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  imageWrapper: { position: 'relative' },
  thumbnail: { width: 90, height: 90 },
  removeBtn: {
    position: 'absolute', top: -6, right: -6,
    width: 24, height: 24, justifyContent: 'center', alignItems: 'center',
  },
  addImageBtn: {
    width: 90, height: 90, borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  addImageText: { ...Typography.bodySmall, marginTop: 4 },
});
