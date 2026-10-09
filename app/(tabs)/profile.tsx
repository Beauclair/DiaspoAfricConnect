import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../src/theme';
import Card from '../../src/components/common/Card';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import Avatar from '../../src/components/common/Avatar';
import Divider from '../../src/components/common/Divider';
import ErrorView from '../../src/components/common/ErrorView';
import AnimatedPress from '../../src/components/common/AnimatedPressable';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCountry } from '../../src/contexts/CountryContext';
import { getUserProfile, updateUserProfile, logOut, deleteAccount } from '../../src/services/authService';
import { User } from '../../src/types';
import { HOST_COUNTRIES, HostCountryCode } from '../../src/constants/countries';
import { useSubmitGuard } from '../../src/hooks';
import { getUserMessage } from '../../src/utils/errorMessages';
import { trackEvent, trackScreen } from '../../src/config/analytics';
import { AnalyticsEvents } from '../../src/constants/analyticsEvents';

const HOST_COUNTRY_LIST = Object.values(HOST_COUNTRIES);

export default function ProfileScreen() {
  const { user } = useAuth();
  const { hostCountry, countryConfig, setHostCountry } = useCountry();
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [editHostCountry, setEditHostCountry] = useState<HostCountryCode>(hostCountry);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (user) {
      trackScreen('Profile');
      loadProfile();
      // Check admin claim
      user.getIdTokenResult()
        .then((result) => { setIsAdmin(result.claims.admin === true); })
        .catch(() => { /* non-critical — admin section just stays hidden */ });
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setProfileError('');
    try {
      const p = await getUserProfile(user.uid);
      if (p) {
        setProfile(p);
        setDisplayName(p.displayName || '');
        setCountryOfOrigin(p.countryOfOrigin || '');
        setEditHostCountry(p.hostCountry || hostCountry);
      }
    } catch (e: any) {
      setProfileError(getUserMessage(e, 'loadProfile', 'Failed to load profile.'));
    }
  };

  const doSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { displayName, countryOfOrigin, hostCountry: editHostCountry });
      await setHostCountry(editHostCountry);
      setEditing(false);
      await loadProfile();
    } catch (e: any) {
      Alert.alert('Error', getUserMessage(e, 'updateProfile', 'Failed to update profile.'));
    }
    setSaving(false);
  }, [user, displayName, countryOfOrigin, editHostCountry]);

  const handleSave = useSubmitGuard(doSave, 3000);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          trackEvent(AnalyticsEvents.LOGOUT);
          await logOut();
          router.replace('/(tabs)/home');
        },
      },
    ]);
  };

  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data including businesses, reviews, and attorney listings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              // signOut is called inside deleteAccount — the auth state
              // listener redirects to the login screen automatically.
            } catch (e: any) {
              Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  // Guest state
  if (!user) {
    return (
      <View style={[styles.guestContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.guestIconWrapper, { backgroundColor: colors.surfaceVariant }]}>
          <MaterialIcons name="person-outline" size={48} color={colors.onSurfaceVariant} />
        </View>
        <Text style={[typography.headlineLarge, { color: colors.onSurface, marginTop: 20 }]}>
          Welcome
        </Text>
        <Text style={[typography.bodyLarge, styles.guestSubtitle, { color: colors.onSurfaceVariant }]}>
          Sign in to add businesses, write reviews, and manage your profile.
        </Text>
        <Button
          title="Sign In"
          onPress={() => router.push('/(auth)/login')}
          icon="login"
          style={{ marginTop: 24, width: '100%' }}
        />
        <Button
          title="Create Account"
          onPress={() => router.push('/(auth)/signup')}
          variant="outline"
          icon="person-add"
          style={{ marginTop: 12, width: '100%' }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Profile header */}
      <LinearGradient
        colors={['#1B6B2E', '#145222', '#0D3B17']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.profileHeader, { paddingTop: insets.top + 20 }]}
      >
        <Animated.View entering={FadeIn.duration(300)} style={styles.avatarSection}>
          <Avatar
            name={user?.displayName || 'U'}
            size={88}
            style={{ borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' }}
          />
          <Text style={[typography.headlineLarge, { color: '#FFFFFF', marginTop: 12 }]}>
            {user?.displayName || 'User'}
          </Text>
          <Text style={[typography.bodyMedium, { color: 'rgba(255,255,255,0.75)', marginTop: 2 }]}>
            {user?.email}
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* Profile load error */}
      {profileError ? (
        <ErrorView message={profileError} onRetry={loadProfile} />
      ) : (
      <>
      {/* Profile info / edit */}
      <Animated.View entering={FadeIn.duration(300)}>
        {editing ? (
          <Card variant="outlined" style={styles.editCard}>
            <Input label="Display Name" value={displayName} onChangeText={setDisplayName} />
            <Input label="Country of Origin" placeholder="e.g. Nigeria, Ghana" value={countryOfOrigin} onChangeText={setCountryOfOrigin} />

            <Text style={[typography.labelMedium, { color: colors.onSurface, marginBottom: 8, marginTop: 4 }]}>
              Host Country
            </Text>
            <View style={styles.countryGrid}>
              {HOST_COUNTRY_LIST.map((c) => {
                const isAvailable = c.code === 'US';
                return (
                  <AnimatedPress
                    key={c.code}
                    onPress={isAvailable ? () => setEditHostCountry(c.code) : undefined}
                    disabled={!isAvailable}
                    pressScale={isAvailable ? 0.95 : 1}
                    style={[
                      styles.countryChip,
                      {
                        borderRadius: radii.full,
                        borderWidth: 1.5,
                        borderColor: isAvailable
                          ? editHostCountry === c.code ? colors.primary : colors.outlineVariant
                          : colors.outlineVariant,
                        backgroundColor: isAvailable
                          ? editHostCountry === c.code ? colors.primaryContainer : colors.surfaceContainerLow
                          : colors.surfaceContainerLow,
                        opacity: isAvailable ? 1 : 0.4,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: editHostCountry === c.code, disabled: !isAvailable }}
                    accessibilityLabel={isAvailable ? c.name : `${c.name} — coming soon`}
                  >
                    <Text style={styles.countryFlag}>{c.flag}</Text>
                    <Text
                      style={[
                        typography.labelMedium,
                        {
                          color: editHostCountry === c.code ? colors.primary : colors.onSurface,
                        },
                      ]}
                    >
                      {c.name}
                    </Text>
                    {!isAvailable && (
                      <Text style={[typography.labelSmall, { color: colors.onSurfaceVariant, marginLeft: 4, fontSize: 9 }]}>
                        Soon
                      </Text>
                    )}
                  </AnimatedPress>
                );
              })}
            </View>

            <View style={styles.editActions}>
              <Button title="Cancel" onPress={() => setEditing(false)} variant="outline" style={{ flex: 1 }} />
              <Button title="Save" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
            </View>
          </Card>
        ) : (
          <Card variant="outlined" style={styles.infoCard}>
            <ProfileRow icon="person" label="Name" value={user?.displayName || 'Not set'} />
            <Divider />
            <ProfileRow icon="email" label="Email" value={user?.email || ''} />
            <Divider />
            <ProfileRow icon="public" label="Country of Origin" value={profile?.countryOfOrigin || 'Not set'} />
            <Divider />
            <ProfileRow icon="location-on" label="Host Country" value={`${countryConfig.flag} ${countryConfig.name}`} />
            <Divider />
            <ProfileRow icon="translate" label="Languages" value={profile?.languagesSpoken?.join(', ') || 'Not set'} />
            <Button title="Edit Profile" onPress={() => setEditing(true)} variant="tonal" icon="edit" style={{ marginTop: 16 }} />
          </Card>
        )}
      </Animated.View>

      {/* Menu section */}
      <Animated.View entering={FadeIn.duration(300)}>
        <View style={[styles.menuSection, { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.outlineVariant }]}>
          <MenuItem icon="storefront" label="My Businesses" onPress={() => router.push('/business/my-businesses')} />
          <Divider />
          <MenuItem icon="gavel" label="My Attorney Profiles" onPress={() => router.push('/legal/my-lawyers')} />
          <Divider />
          <MenuItem icon="bookmark" label="Saved Businesses" onPress={() => {}} />
          <Divider />
          <MenuItem icon="history" label="My Reviews" onPress={() => {}} />
          <Divider />
          <MenuItem icon="notifications" label="Notifications" onPress={() => {}} />
          <Divider />
          <MenuItem icon="help-outline" label="Help & Support" onPress={() => {}} />
          <Divider />
          <MenuItem icon="info" label="About DiaspoAfricConnect" onPress={() => {}} />
          <Divider />
          <MenuItem icon="privacy-tip" label="Privacy Policy" onPress={() => router.push('/legal/privacy-policy')} />
          <Divider />
          <MenuItem icon="description" label="Terms of Service" onPress={() => router.push('/legal/terms-of-service')} />
        </View>
      </Animated.View>

      {/* Admin section — only visible to admins */}
      {isAdmin && (
        <Animated.View entering={FadeIn.duration(300)}>
          <Text style={[typography.labelMedium, { color: colors.onSurfaceVariant, marginLeft: 20, marginTop: 20, marginBottom: 8 }]}>
            Admin
          </Text>
          <View style={[styles.menuSection, { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.primary + '40' }]}>
            <MenuItem icon="verified-user" label="Verification Requests" onPress={() => router.push('/admin/verifications')} />
          </View>
        </Animated.View>
      )}

      {/* Sign out & Delete account */}
      <Animated.View entering={FadeIn.duration(300)}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={20} color={colors.error} />
          <Text style={[typography.labelLarge, { color: colors.error, marginLeft: 8 }]}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDeleteAccount} disabled={deleting} style={[styles.deleteBtn, { opacity: deleting ? 0.5 : 1 }]}>
          <MaterialIcons name="delete-forever" size={20} color={colors.error} />
          <Text style={[typography.labelLarge, { color: colors.error, marginLeft: 8 }]}>
            {deleting ? 'Deleting…' : 'Delete Account'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
      </>
      )}

      <Text style={[typography.labelSmall, { textAlign: 'center', color: colors.onSurfaceDisabled, marginTop: spacing.xl }]}>
        DiaspoAfricConnect v1.0.0
      </Text>
    </ScrollView>
  );
}

function ProfileRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.profileRow}>
      <View style={[styles.profileIconBg, { backgroundColor: colors.primaryContainer }]}>
        <MaterialIcons name={icon as any} size={18} color={colors.primary} />
      </View>
      <View style={styles.profileRowText}>
        <Text style={[typography.labelSmall, { color: colors.onSurfaceVariant }]}>{label}</Text>
        <Text style={[typography.bodyMedium, { color: colors.onSurface, marginTop: 1 }]}>{value}</Text>
      </View>
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const { colors, typography } = useTheme();
  return (
    <AnimatedPress onPress={onPress} pressScale={0.99} style={styles.menuItem}>
      <MaterialIcons name={icon as any} size={22} color={colors.onSurfaceVariant} />
      <Text style={[typography.bodyLarge, { flex: 1, color: colors.onSurface, marginLeft: 12 }]}>
        {label}
      </Text>
      <MaterialIcons name="chevron-right" size={22} color={colors.onSurfaceDisabled} />
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  guestIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestSubtitle: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
    maxWidth: 300,
  },
  profileHeader: {
    paddingBottom: 28,
  },
  avatarSection: {
    alignItems: 'center',
  },
  infoCard: {
    margin: 20,
  },
  editCard: {
    margin: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  profileIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileRowText: {
    flex: 1,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  countryFlag: {
    fontSize: 18,
  },
  menuSection: {
    marginHorizontal: 20,
    marginTop: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 14,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 4,
    paddingVertical: 14,
  },
});
