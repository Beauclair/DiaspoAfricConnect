import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import { signIn } from '../../src/services/authService';
import { isValidEmail } from '../../src/utils/validation';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>DiaspoAfricConnect</Text>
          <Text style={styles.subtitle}>Your African community in the US</Text>
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
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={<MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={22} color={Colors.textLight} />}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Sign In" onPress={handleLogin} loading={loading} />

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.link}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.guestLink}>
            <Text style={styles.guestLinkText}>Continue without an account</Text>
          </TouchableOpacity>
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
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
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
  error: {
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  link: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: Colors.primary,
    fontSize: 14,
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
  guestLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  guestLinkText: {
    color: Colors.textLight,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
