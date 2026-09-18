import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import { signUp } from '../../src/services/authService';
import { isValidEmail, isStrongPassword } from '../../src/utils/validation';
import { HOST_COUNTRIES, HostCountryCode } from '../../src/constants/countries';

const HOST_COUNTRY_LIST = Object.values(HOST_COUNTRIES);

export default function SignupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [hostCountry, setHostCountry] = useState<HostCountryCode>('US');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!displayName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
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
      router.replace('/(tabs)/home');
    } catch (e: any) {
      setError(e.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Join the Community</Text>
          <Text style={styles.subtitle}>Create your DiaspoAfricConnect account</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={displayName}
            onChangeText={setDisplayName}
          />
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
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={<MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={22} color={Colors.textLight} />}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />
          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Text style={styles.countryLabel}>Where do you live?</Text>
          <View style={styles.countryGrid}>
            {HOST_COUNTRY_LIST.map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[styles.countryChip, hostCountry === c.code && styles.countryChipSelected]}
                onPress={() => setHostCountry(c.code)}
                accessibilityRole="button"
                accessibilityState={{ selected: hostCountry === c.code }}
                accessibilityLabel={c.name}
              >
                <Text style={styles.countryFlag}>{c.flag}</Text>
                <Text style={[styles.countryName, hostCountry === c.code && styles.countryNameSelected]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Create Account" onPress={handleSignup} loading={loading} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  countryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  countryChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '12',
  },
  countryFlag: {
    fontSize: 18,
  },
  countryName: {
    fontSize: 13,
    color: Colors.text,
  },
  countryNameSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  error: {
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: Colors.textLight,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
