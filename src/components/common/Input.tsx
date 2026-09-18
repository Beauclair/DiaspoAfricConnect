import React from 'react';
import { TextInput, View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  style?: ViewStyle;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export default function Input({
  label, placeholder, value, onChangeText, secureTextEntry, keyboardType,
  autoCapitalize, multiline, numberOfLines, error, style, rightIcon, onRightIconPress,
}: InputProps) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={[styles.input, multiline && styles.multiline, rightIcon ? styles.inputWithIcon : null]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          accessibilityLabel={label || placeholder}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel={secureTextEntry ? 'Show password' : 'Hide password'}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.card,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  inputWithIcon: {
    paddingRight: 4,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.error,
  },
  iconBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});
