import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import Card from '../../src/components/common/Card';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCountry } from '../../src/contexts/CountryContext';
import { getUserProfile, updateUserProfile, logOut } from '../../src/services/authService';
import { User } from '../../src/types';
import { HOST_COUNTRIES, HostCountryCode } from '../../src/constants/countries';

const HOST_COUNTRY_LIST = Object.values(HOST_COUNTRIES);

export default function ProfileScreen() {
  const { user } = useAuth();
  const { hostCountry, countryConfig, setHostCountry } = useCountry();
  const [profile, setProfile] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [editHostCountry, setEditHostCountry] = useState<HostCountryCode>(hostCountry);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const p = await getUserProfile(user.uid);
    if (p) {
      setProfile(p);
      setDisplayName(p.displayName || '');
      setCountryOfOrigin(p.countryOfOrigin || '');
      setEditHostCountry(p.hostCountry || hostCountry);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { displayName, countryOfOrigin, hostCountry: editHostCountry });
      await setHostCountry(editHostCountry);
      setEditing(false);
      await loadProfile();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.displayName || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.displayName || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {editing ? (
        <Card style={styles.editCard}>
          <Input label="Display Name" value={displayName} onChangeText={setDisplayName} />
          <Input label="Country of Origin" placeholder="e.g. Nigeria, Ghana" value={countryOfOrigin} onChangeText={setCountryOfOrigin} />

          <Text style={styles.countryPickerLabel}>Host Country</Text>
          <View style={styles.countryGrid}>
            {HOST_COUNTRY_LIST.map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[styles.countryChip, editHostCountry === c.code && styles.countryChipSelected]}
                onPress={() => setEditHostCountry(c.code)}
                accessibilityRole="button"
                accessibilityState={{ selected: editHostCountry === c.code }}
                accessibilityLabel={c.name}
              >
                <Text style={styles.countryFlag}>{c.flag}</Text>
                <Text style={[styles.countryChipText, editHostCountry === c.code && styles.countryChipTextSelected]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.editActions}>
            <Button title="Cancel" onPress={() => setEditing(false)} variant="outline" style={{ flex: 1 }} />
            <Button title="Save" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
          </View>
        </Card>
      ) : (
        <Card style={styles.infoCard}>
          <ProfileRow icon="person" label="Name" value={user?.displayName || 'Not set'} />
          <ProfileRow icon="email" label="Email" value={user?.email || ''} />
          <ProfileRow icon="public" label="Country of Origin" value={profile?.countryOfOrigin || 'Not set'} />
          <ProfileRow icon="location-on" label="Host Country" value={`${countryConfig.flag} ${countryConfig.name}`} />
          <ProfileRow icon="translate" label="Languages" value={profile?.languagesSpoken?.join(', ') || 'Not set'} />
          <Button title="Edit Profile" onPress={() => setEditing(true)} variant="outline" style={{ marginTop: 16 }} />
        </Card>
      )}

      <View style={styles.menuSection}>
        <MenuItem icon="storefront" label="My Businesses" onPress={() => router.push('/business/my-businesses')} />
        <MenuItem icon="bookmark" label="Saved Businesses" onPress={() => {}} />
        <MenuItem icon="history" label="My Reviews" onPress={() => {}} />
        <MenuItem icon="notifications" label="Notifications" onPress={() => {}} />
        <MenuItem icon="help-outline" label="Help & Support" onPress={() => {}} />
        <MenuItem icon="info" label="About DiaspoAfricConnect" onPress={() => {}} />
      </View>

      <Button
        title="Sign Out"
        onPress={handleLogout}
        variant="outline"
        style={styles.logoutBtn}
        textStyle={{ color: Colors.accent }}
      />

      <Text style={styles.version}>DiaspoAfricConnect v1.0.0</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function ProfileRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.profileRow}>
      <MaterialIcons name={icon as any} size={20} color={Colors.primary} />
      <View style={styles.profileRowText}>
        <Text style={styles.profileLabel}>{label}</Text>
        <Text style={styles.profileValue}>{value}</Text>
      </View>
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <MaterialIcons name={icon as any} size={22} color={Colors.text} />
      <Text style={styles.menuLabel}>{label}</Text>
      <MaterialIcons name="chevron-right" size={22} color={Colors.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  avatarSection: { alignItems: 'center', paddingVertical: 24, backgroundColor: Colors.primary },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.textWhite,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: Colors.primary },
  name: { fontSize: 22, fontWeight: 'bold', color: Colors.textWhite, marginTop: 12 },
  email: { fontSize: 14, color: Colors.textWhite, opacity: 0.8, marginTop: 4 },
  infoCard: { margin: 16 },
  editCard: { margin: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  profileRowText: { flex: 1 },
  profileLabel: { fontSize: 12, color: Colors.textLight },
  profileValue: { fontSize: 15, color: Colors.text, marginTop: 2 },
  editActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  menuSection: { marginHorizontal: 16, backgroundColor: Colors.card, borderRadius: 12, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12,
  },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.text },
  logoutBtn: { marginHorizontal: 16, marginTop: 24, borderColor: Colors.accent },
  version: { textAlign: 'center', color: Colors.textLight, fontSize: 12, marginTop: 16 },
  countryPickerLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8, marginTop: 8 },
  countryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  countryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card,
  },
  countryChipSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '12' },
  countryFlag: { fontSize: 18 },
  countryChipText: { fontSize: 13, color: Colors.text },
  countryChipTextSelected: { color: Colors.primary, fontWeight: '600' },
});
