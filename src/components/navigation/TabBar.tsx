import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
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
    // MD3 emphasized motion for navigation state changes
    scale.value = withSpring(0.9, { damping: 20, stiffness: 300, mass: 0.8 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300, mass: 0.8 });
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
            marginTop: 4,
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
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceContainer,
          paddingBottom: Math.max(insets.bottom, 8),
          borderTopWidth: 1,
          borderTopColor: colors.outlineVariant,
        },
        shadows.sm,
      ]}
    >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Full-width, sticky at bottom — not floating
  },
  tabRow: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 8,
    height: 64,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 64,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
