import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface SkeletonProps {
  /** Width of the skeleton (number or '100%'). Default '100%' */
  width?: number | `${number}%` | '100%';
  /** Height. Default 16 */
  height?: number;
  /** Border radius. Default 8 */
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export default function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.4, 0.8]),
  }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.shimmer,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Pre-composed skeleton for a business card */
export function BusinessCardSkeleton() {
  const { colors, radii } = useTheme();
  return (
    <View style={[cardSkeletonStyles.card, { backgroundColor: colors.surface, borderRadius: radii.lg }]}>
      <Skeleton width="100%" height={160} borderRadius={0} />
      <View style={cardSkeletonStyles.content}>
        <Skeleton width="70%" height={18} />
        <Skeleton width="45%" height={14} style={{ marginTop: 8 }} />
        <Skeleton width="60%" height={14} style={{ marginTop: 6 }} />
        <Skeleton width="30%" height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

/** Pre-composed skeleton for a guide card */
export function GuideCardSkeleton() {
  const { colors, radii } = useTheme();
  return (
    <View style={[cardSkeletonStyles.guideCard, { backgroundColor: colors.surface, borderRadius: radii.lg }]}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width="80%" height={16} />
        <Skeleton width="100%" height={14} style={{ marginTop: 6 }} />
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
          <Skeleton width="35%" height={12} />
          <Skeleton width="35%" height={12} />
        </View>
      </View>
    </View>
  );
}

const cardSkeletonStyles = StyleSheet.create({
  card: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 14,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
});
