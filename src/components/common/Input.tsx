import React, { useState, useCallback } from 'react';
import { TextInput, View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';

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
  /** Show a red asterisk before the label to indicate a required field. */
  required?: boolean;
  style?: ViewStyle;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  multiline,
  numberOfLines,
  error,
  required,
  style,
  rightIcon,
  onRightIconPress,
}: InputProps) {
  const { colors, radii, typography } = useTheme();
  const [focused, setFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const handleFocus = useCallback(() => {
    setFocused(true);
    focusAnim.value = withTiming(1, { duration: 200 });
  }, []);

  const handleBlur = useCallback(() => {
    setFocused(false);
    focusAnim.value = withTiming(0, { duration: 200 });
  }, []);

  const borderColor = error
    ? colors.error
    : focused
    ? colors.primary
    : colors.outlineVariant;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            typography.labelMedium,
            {
              color: error ? colors.error : focused ? colors.primary : colors.onSurfaceVariant,
              marginBottom: 6,
            },
          ]}
        >
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.surfaceContainerLow,
            borderColor,
            borderRadius: radii.md,
            borderWidth: focused || error ? 2 : 1,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            typography.bodyLarge,
            { color: colors.onSurface },
            multiline && styles.multiline,
            rightIcon ? styles.inputWithIcon : null,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceDisabled}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          accessibilityLabel={label || placeholder}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
      {error && (
        <Text style={[typography.bodySmall, { color: colors.error, marginTop: 4 }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  inputWithIcon: {
    paddingRight: 4,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  iconBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
