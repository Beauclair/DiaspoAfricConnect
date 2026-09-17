import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface ChecklistItemProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export default function ChecklistItem({ label, checked, onToggle }: ChecklistItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
    >
      <MaterialIcons
        name={checked ? 'check-box' : 'check-box-outline-blank'}
        size={24}
        color={checked ? Colors.primary : Colors.textLight}
      />
      <Text style={[styles.label, checked && styles.checkedLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  label: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  checkedLabel: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
});
