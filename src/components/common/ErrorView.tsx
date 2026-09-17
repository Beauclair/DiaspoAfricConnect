import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import Button from './Button';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorView({ message = 'Something went wrong. Please try again.', onRetry }: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="error-outline" size={48} color={Colors.accent} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && <Button title="Retry" onPress={onRetry} variant="outline" style={styles.button} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background,
  },
  message: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  button: {
    marginTop: 16,
    minWidth: 120,
  },
});
