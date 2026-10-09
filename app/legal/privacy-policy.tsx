import React from 'react';
import { ScrollView, View, Text, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[typography.titleMedium, { color: colors.onSurface, marginBottom: 8 }]}>{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  const { colors, typography } = useTheme();
  return (
    <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant, lineHeight: 22, marginBottom: 10 }]}>
      {children}
    </Text>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.bulletRow}>
      <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant }]}>•</Text>
      <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant, lineHeight: 22, flex: 1, marginLeft: 8 }]}>
        {children}
      </Text>
    </View>
  );
}

export default function PrivacyPolicyScreen() {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.xxl, paddingBottom: insets.bottom + 40 }}
    >
      <Text style={[typography.bodySmall, { color: colors.onSurfaceDisabled, marginBottom: 20 }]}>
        Last updated: October 9, 2026
      </Text>

      <P>
        DiaspoAfricConnect ("we", "us", "the App") is a community platform that
        helps the African diaspora discover local businesses, find attorneys, and
        access legal guides in their host country. This Privacy Policy explains
        what data we collect, why, and how you can control it.
      </P>

      <Section title="1. Data We Collect">
        <Text style={[typography.labelLarge, { color: colors.onSurface, marginBottom: 6 }]}>
          1.1 Account Information
        </Text>
        <P>When you create an account we collect:</P>
        <Bullet>Full name (display name)</Bullet>
        <Bullet>Email address</Bullet>
        <Bullet>Password (hashed — we never store or see plain-text passwords)</Bullet>
        <Bullet>Country of residence ("Where do you live")</Bullet>

        <Text style={[typography.labelLarge, { color: colors.onSurface, marginTop: 12, marginBottom: 6 }]}>
          1.2 Business & Attorney Listings
        </Text>
        <P>If you register a business or attorney profile, we additionally collect:</P>
        <Bullet>Business/attorney name, description, category</Bullet>
        <Bullet>Address, city, host country</Bullet>
        <Bullet>Phone number and email</Bullet>
        <Bullet>Photos you upload (businesses and attorney profile photos)</Bullet>
        <Bullet>Practice areas, firm name, consultation fee (attorneys)</Bullet>
        <Bullet>Profile photo — attorneys (optional)</Bullet>
        <Bullet>Website and languages spoken — attorneys (optional)</Bullet>

        <Text style={[typography.labelLarge, { color: colors.onSurface, marginTop: 12, marginBottom: 6 }]}>
          1.3 User-Generated Content
        </Text>
        <Bullet>Reviews and ratings you post</Bullet>
        <Bullet>Owner responses to reviews</Bullet>
        <Bullet>Saved/bookmarked businesses</Bullet>

        <Text style={[typography.labelLarge, { color: colors.onSurface, marginTop: 12, marginBottom: 6 }]}>
          1.4 Device & Usage Data
        </Text>
        <Bullet>Analytics events — screen views, searches, button taps (via PostHog)</Bullet>
        <Bullet>Crash reports — stack traces, device model, OS version (via Sentry)</Bullet>
        <Bullet>Push-notification token — anonymous device token (via Expo Push)</Bullet>

        <Text style={[typography.labelLarge, { color: colors.onSurface, marginTop: 12, marginBottom: 6 }]}>
          1.5 Location
        </Text>
        <P>
          If you tap the "Near Me" button, we request your device's approximate location
          to sort businesses by distance. Your location is used on-device only — it is not
          stored on our servers, sent to any third party, or used for tracking.
        </P>
      </Section>

      <Section title="2. How We Use Your Data">
        <Bullet>Create & manage your account — name, email, password</Bullet>
        <Bullet>Display your profile to other users — display name, country of residence</Bullet>
        <Bullet>Show relevant business & attorney listings — country of residence, searches</Bullet>
        <Bullet>Display & moderate reviews — reviews, ratings, user name</Bullet>
        <Bullet>Verify business/attorney ownership — phone number, entity details</Bullet>
        <Bullet>Send push notifications — Expo push token</Bullet>
        <Bullet>Fix crashes & improve the app — crash reports, analytics events</Bullet>
        <Bullet>Sort businesses by distance (Near Me) — device location (on-device only)</Bullet>
      </Section>

      <Section title="3. Third-Party Services">
        <P>We use the following third-party services that may process your data under their own privacy policies:</P>
        <Bullet>Google Firebase (Auth, Firestore, Storage, Functions) — authentication, database, file storage</Bullet>
        <Bullet>Sentry — crash & error reporting</Bullet>
        <Bullet>PostHog — product analytics</Bullet>
        <Bullet>Expo (EAS) — push notifications, OTA updates</Bullet>
        <P>We do not sell your data, display ads, or share personal information with data brokers.</P>
      </Section>

      <Section title="4. Data Storage & Security">
        <Bullet>Data is stored in Google Cloud (Firebase) in the United States</Bullet>
        <Bullet>All network communication uses TLS encryption</Bullet>
        <Bullet>Passwords are hashed by Firebase Authentication</Bullet>
        <Bullet>Firestore security rules enforce that users can only read/write their own data</Bullet>
        <Bullet>Uploaded images are stored in Firebase Cloud Storage with authenticated write access</Bullet>
      </Section>

      <Section title="5. Your Rights & Choices">
        <Text style={[typography.labelLarge, { color: colors.onSurface, marginBottom: 6 }]}>
          5.1 Access & Correction
        </Text>
        <P>You can view and update your profile information at any time from the Profile tab.</P>

        <Text style={[typography.labelLarge, { color: colors.onSurface, marginTop: 12, marginBottom: 6 }]}>
          5.2 Delete Your Account & Data
        </Text>
        <P>You can delete your account from Profile → Delete Account. This permanently removes:</P>
        <Bullet>Your user profile</Bullet>
        <Bullet>All businesses and attorney listings you created</Bullet>
        <Bullet>All reviews you wrote</Bullet>
        <Bullet>All verification requests you submitted</Bullet>
        <Bullet>Your uploaded images</Bullet>
        <P>Account deletion is processed immediately and is irreversible.</P>

        <Text style={[typography.labelLarge, { color: colors.onSurface, marginTop: 12, marginBottom: 6 }]}>
          5.3 Location
        </Text>
        <P>
          Location is only used when you tap "Near Me". You can revoke location permission
          at any time in your device settings. The app will continue to work normally.
        </P>

        <Text style={[typography.labelLarge, { color: colors.onSurface, marginTop: 12, marginBottom: 6 }]}>
          5.4 Push Notifications
        </Text>
        <P>You can disable push notifications in your device settings at any time.</P>
      </Section>

      <Section title="6. Children's Privacy">
        <P>
          DiaspoAfricConnect is not directed at children under 13. We do not knowingly
          collect data from children. If you believe a child has provided us with personal
          information, please contact us and we will delete it promptly.
        </P>
      </Section>

      <Section title="7. Changes to This Policy">
        <P>
          We may update this Privacy Policy from time to time. We will notify you of
          material changes via an in-app notice or push notification. The "Last updated"
          date at the top will always reflect the latest revision.
        </P>
      </Section>

      <Section title="8. Contact Us">
        <P>
          If you have questions about this Privacy Policy or want to exercise your data
          rights, contact us at:
        </P>
        <P>📧 infos@weskillupcenter.com</P>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginBottom: 24 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4, paddingLeft: 8 },
});
