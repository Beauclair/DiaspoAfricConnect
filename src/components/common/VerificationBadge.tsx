import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { VerificationStatus } from '../../types';

interface VerificationBadgeProps {
  status: VerificationStatus;
  /** 'compact' shows icon only, 'full' shows icon + label */
  variant?: 'compact' | 'full';
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

const CONFIG: Record<VerificationStatus, {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  badgeVariant: 'success' | 'warning' | 'neutral' | 'error';
}> = {
  verified: { icon: 'verified', label: 'Verified', badgeVariant: 'success' },
  pending: { icon: 'hourglass-top', label: 'Pending', badgeVariant: 'warning' },
  unverified: { icon: 'help-outline', label: 'Unverified', badgeVariant: 'neutral' },
  rejected: { icon: 'cancel', label: 'Rejected', badgeVariant: 'error' },
};

export default function VerificationBadge({
  status,
  variant = 'full',
  size = 'md',
  style,
}: VerificationBadgeProps) {
  const { colors, typography, radii } = useTheme();

  // Don't render anything for unverified in compact mode (cards)
  if (status === 'unverified' && variant === 'compact') return null;

  const config = CONFIG[status];
  const isSmall = size === 'sm';
  const iconSize = isSmall ? 14 : 16;

  const colorMap = {
    success: { bg: colors.successContainer, text: colors.success },
    warning: { bg: colors.warningContainer, text: colors.warning },
    neutral: { bg: colors.surfaceVariant, text: colors.onSurfaceVariant },
    error: { bg: colors.errorContainer, text: colors.error },
  };

  const c = colorMap[config.badgeVariant];

  if (variant === 'compact') {
    // Icon only — used in cards
    return (
      <MaterialIcons
        name={config.icon}
        size={isSmall ? 16 : 20}
        color={c.text}
        style={style as any}
        accessibilityLabel={config.label}
      />
    );
  }

  // Full badge with icon + label
  return (
    <View
      accessibilityLabel={`${config.label} status`}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: c.bg,
          borderRadius: radii.full,
          paddingHorizontal: isSmall ? 8 : 10,
          paddingVertical: isSmall ? 3 : 5,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <MaterialIcons name={config.icon} size={iconSize} color={c.text} />
      <Text
        style={[
          isSmall ? typography.labelSmall : typography.labelMedium,
          { color: c.text },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}
