import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  /** Debounce delay in ms applied to onChangeText (default 400). Set 0 to disable. */
  debounceMs?: number;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  debounceMs = 400,
}: SearchBarProps) {
  const { colors, radii } = useTheme();
  const [focused, setFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes (e.g. programmatic clear)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChangeText = useCallback(
    (text: string) => {
      setLocalValue(text);

      if (timerRef.current) clearTimeout(timerRef.current);

      if (debounceMs <= 0 || text.length === 0) {
        // Immediate on clear or when debounce disabled
        onChangeText(text);
      } else {
        timerRef.current = setTimeout(() => {
          onChangeText(text);
        }, debounceMs);
      }
    },
    [onChangeText, debounceMs],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      accessibilityRole="search"
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceContainer,
          borderRadius: radii.xl,
          borderWidth: focused ? 2 : 1,
          borderColor: focused ? colors.primary : colors.outline,
        },
      ]}
    >
      <MaterialIcons
        name="search"
        size={22}
        color={focused ? colors.primary : colors.onSurfaceVariant}
        style={styles.icon}
      />
      <TextInput
        ref={inputRef}
        style={[styles.input, { color: colors.onSurface, fontSize: 16 }]}
        value={localValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceVariant}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={placeholder}
      />
      {localValue.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            handleChangeText('');
            onClear?.();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.clearBtn}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <View style={[styles.clearIcon, { backgroundColor: colors.onSurfaceVariant }]}>
            <MaterialIcons name="close" size={14} color={colors.surface} />
          </View>
        </TouchableOpacity>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    padding: 0,
    margin: 0,
  },
  clearBtn: {
    marginLeft: 8,
  },
  clearIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
