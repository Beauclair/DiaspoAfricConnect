import React from 'react';
import { Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AnimatedPress from './AnimatedPressable';
import { useTheme } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'tonal' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading,
  disabled,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, radii, typography } = useTheme();
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, ...typography.labelMedium },
    md: { paddingVertical: 12, paddingHorizontal: 22, ...typography.labelLarge },
    lg: { paddingVertical: 16, paddingHorizontal: 28, ...typography.titleMedium },
  };

  const variantStyles: Record<string, { bg: string; text: string; border?: string }> = {
    primary: { bg: colors.primary, text: colors.onPrimary },
    secondary: { bg: colors.secondary, text: colors.onSecondary },
    outline: { bg: 'transparent', text: colors.primary, border: colors.outline },
    tonal: { bg: colors.primaryContainer, text: colors.onPrimaryContainer },
    ghost: { bg: 'transparent', text: colors.primary },
  };

  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  const iconElement = icon ? (
    <MaterialIcons name={icon} size={iconSize} color={v.text} style={iconPosition === 'left' ? { marginRight: 6 } : { marginLeft: 6 }} />
  ) : null;

  return (
    <AnimatedPress
      onPress={onPress}
      disabled={isDisabled}
      pressScale={0.97}
      haptic
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          borderRadius: radii.md,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border || 'transparent',
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.onPrimary}
          size="small"
        />
      ) : (
        <>
          {iconPosition === 'left' && iconElement}
          <Text style={[{ fontSize: s.fontSize, fontWeight: s.fontWeight, letterSpacing: s.letterSpacing, color: v.text }, textStyle]}>
            {title}
          </Text>
          {iconPosition === 'right' && iconElement}
        </>
      )}
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
