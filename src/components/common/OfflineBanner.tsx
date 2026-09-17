import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export default function OfflineBanner() {
  const isConnected = useNetworkStatus();

  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <MaterialIcons name="wifi-off" size={16} color={Colors.textWhite} />
      <Text style={styles.text}>You're offline. Some features may be limited.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '500',
  },
});
