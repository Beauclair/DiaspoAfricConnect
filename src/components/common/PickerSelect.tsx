import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

export interface PickerOption {
  label: string;
  value: string;
}

interface PickerSelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  options: PickerOption[];
  onValueChange: (value: string) => void;
  required?: boolean;
  error?: string;
  style?: ViewStyle;
}

export default function PickerSelect({
  label,
  placeholder = 'Select...',
  value,
  options,
  onValueChange,
  required,
  error,
  style,
}: PickerSelectProps) {
  const { colors, radii, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);

  const selected = options.find((o) => o.value === value);

  const borderColor = error ? colors.error : colors.outlineVariant;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            typography.labelMedium,
            { color: error ? colors.error : colors.onSurfaceVariant, marginBottom: 6 },
          ]}
        >
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surfaceContainerLow,
            borderColor,
            borderRadius: radii.md,
          },
        ]}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label || placeholder}, ${selected?.label || 'none selected'}`}
      >
        <Text
          style={[
            typography.bodyLarge,
            { color: selected ? colors.onSurface : colors.onSurfaceDisabled, flex: 1 },
          ]}
          numberOfLines={1}
        >
          {selected?.label || placeholder}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color={colors.onSurfaceVariant} />
      </TouchableOpacity>

      {error && (
        <Text style={[typography.bodySmall, { color: colors.error, marginTop: 4 }]}>
          {error}
        </Text>
      )}

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: radii.xl,
                borderTopRightRadius: radii.xl,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={[typography.titleMedium, { color: colors.onSurface }]}>
                {label || 'Select'}
              </Text>
              <TouchableOpacity onPress={() => setVisible(false)} accessibilityLabel="Close">
                <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Options list */}
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      isSelected && { backgroundColor: colors.primary + '15' },
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setVisible(false);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        typography.bodyLarge,
                        {
                          color: isSelected ? colors.primary : colors.onSurface,
                          fontWeight: isSelected ? '600' : '400',
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <MaterialIcons name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              style={{ maxHeight: 400 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingTop: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
});
