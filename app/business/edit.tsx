import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Image, TouchableOpacity } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import CategoryChip from '../../src/components/common/CategoryChip';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorView from '../../src/components/common/ErrorView';
import { getBusinessById, updateBusiness } from '../../src/services/businessService';
import { uploadBusinessPhotos } from '../../src/services/storageService';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCountry } from '../../src/contexts/CountryContext';
import { Business, BusinessCategory } from '../../src/types';
import { BUSINESS_CATEGORIES } from '../../src/constants/categories';
import { validateBusinessForm } from '../../src/utils/validation';

export default function EditBusinessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { hostCountry, countryConfig } = useCountry();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('restaurant');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);

  useEffect(() => {
    loadBusiness();
  }, [id]);

  const loadBusiness = async () => {
    if (!id) return;
    setError('');
    try {
      const biz = await getBusinessById(id);
      if (!biz) {
        setError('Business not found');
        setLoading(false);
        return;
      }
      if (biz.ownerId !== user?.uid) {
        setError('You do not have permission to edit this business');
        setLoading(false);
        return;
      }
      setName(biz.name);
      setDescription(biz.description);
      setCategory(biz.category);
      setCountryOfOrigin(biz.countryOfOrigin);
      setAddress(biz.address);
      setCity(biz.city);
      setState(biz.state);
      setZipCode(biz.zipCode);
      setPhone(biz.phone || '');
      setWebsite(biz.website || '');
      setExistingPhotos(biz.photos || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load business');
    }
    setLoading(false);
  };

  const pickImage = async () => {
    const totalPhotos = existingPhotos.length + newImages.length;
    if (totalPhotos >= 3) {
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
    });
    if (!result.canceled && result.assets[0]) {
      setNewImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!id || !user) return;
    const businessHostCountry = hostCountry;
    const validationError = validateBusinessForm({
      name, description, countryOfOrigin, address, city, state, zipCode, phone, website,
    }, businessHostCountry);
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }
    setSaving(true);
    try {
      let allPhotos = [...existingPhotos];
      if (newImages.length > 0) {
        const uploaded = await uploadBusinessPhotos(id, newImages);
        allPhotos = [...allPhotos, ...uploaded];
      }

      await updateBusiness(id, {
        name,
        description,
        category,
        countryOfOrigin,
        address,
        city,
        state,
        zipCode,
        phone: phone || undefined,
        website: website || undefined,
        photos: allPhotos,
      });

      Alert.alert('Success', 'Business updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update business');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorView message={error} />;

  const totalPhotos = existingPhotos.length + newImages.length;

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Edit Business' }} />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Edit Business</Text>

          <Input label="Business Name *" placeholder="Enter business name" value={name} onChangeText={setName} />
          <Input label="Description *" placeholder="Describe your business" value={description} onChangeText={setDescription} multiline numberOfLines={4} />

          <Text style={styles.label}>Category *</Text>
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

          <Text style={styles.label}>Photos (up to 3)</Text>
          <View style={styles.imageRow}>
            {existingPhotos.map((uri, i) => (
              <View key={`existing-${i}`} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.thumbnail} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeExistingPhoto(i)}>
                  <MaterialIcons name="close" size={16} color={Colors.textWhite} />
                </TouchableOpacity>
              </View>
            ))}
            {newImages.map((uri, i) => (
              <View key={`new-${i}`} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.thumbnail} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeNewImage(i)}>
                  <MaterialIcons name="close" size={16} color={Colors.textWhite} />
                </TouchableOpacity>
              </View>
            ))}
            {totalPhotos < 3 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                <MaterialIcons name="add-a-photo" size={28} color={Colors.textLight} />
                <Text style={styles.addImageText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          <Input label="Country of Origin *" placeholder="e.g. Nigeria, Ethiopia" value={countryOfOrigin} onChangeText={setCountryOfOrigin} />
          <Input label="Street Address *" placeholder="Enter street address" value={address} onChangeText={setAddress} />
          <Input label="City *" placeholder="Enter city" value={city} onChangeText={setCity} />
          <Input label={`${countryConfig.addressFields.regionLabel} *`} placeholder={countryConfig.addressFields.regionPlaceholder} value={state} onChangeText={setState} />
          <Input label={`${countryConfig.addressFields.postalCodeLabel} *`} placeholder={countryConfig.addressFields.postalCodePlaceholder} value={zipCode} onChangeText={setZipCode} keyboardType={countryConfig.addressFields.postalCodeKeyboardType} />
          <Input label="Phone" placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label="Website" placeholder="https://..." value={website} onChangeText={setWebsite} autoCapitalize="none" />

          <Button title={saving ? 'Saving...' : 'Save Changes'} onPress={handleSave} loading={saving} style={{ marginTop: 16 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  imageRow: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  imageWrapper: { position: 'relative' },
  thumbnail: { width: 90, height: 90, borderRadius: 10 },
  removeBtn: {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: Colors.accent, borderRadius: 12,
    width: 24, height: 24, justifyContent: 'center', alignItems: 'center',
  },
  addImageBtn: {
    width: 90, height: 90, borderRadius: 10, borderWidth: 2,
    borderColor: Colors.border, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  addImageText: { fontSize: 12, color: Colors.textLight, marginTop: 4 },
});
