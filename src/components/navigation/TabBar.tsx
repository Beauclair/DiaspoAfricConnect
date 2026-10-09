import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabItemProps {
  label: string;
  iconName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const TabItem = React.memo(function TabItem({ label, iconName, isFocused, onPress, onLongPress }: TabItemProps) {
  const { colors, typography, radii } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 500 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={onLongPress}
      style={[styles.tabItem, animatedStyle]}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.iconWrapper,
          isFocused && {
            backgroundColor: colors.primaryContainer,
            borderRadius: radii.full,
          },
        ]}
      >
        <MaterialIcons
          name={iconName as any}
          size={24}
          color={isFocused ? colors.primary : colors.onSurfaceVariant}
        />
      </View>
      <Text
        style={[
          typography.labelSmall,
          {
            color: isFocused ? colors.primary : colors.onSurfaceVariant,
            fontWeight: isFocused ? '700' : '500',
            marginTop: 2,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
});

const TAB_ICONS: Record<string, string> = {
  home: 'home',
  business: 'storefront',
  legal: 'balance',
  profile: 'person',
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, radii, shadows, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const content = (
    <View style={styles.tabRow}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = typeof options.tabBarLabel === 'string'
          ? options.tabBarLabel
          : options.title ?? route.name;
        const isFocused = state.index === index;
        const iconName = TAB_ICONS[route.name] || 'circle';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <TabItem
            key={route.key}
            label={label}
            iconName={iconName}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={[styles.barOuter, { marginHorizontal: 16, borderRadius: radii.xxl }]}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={[styles.blurBar, { borderRadius: radii.xxl }]}
          >
            {content}
          </BlurView>
        ) : (
          <View
            style={[
              styles.solidBar,
              {
                backgroundColor: isDark ? colors.surfaceContainer : colors.surface,
                borderRadius: radii.xxl,
                borderWidth: 1,
                borderColor: colors.outlineVariant,
              },
              shadows.lg,
            ]}
          >
            {content}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  barOuter: {
    overflow: 'hidden',
  },
  blurBar: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  solidBar: {
    // Styles applied inline
  },
  tabRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 48,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
