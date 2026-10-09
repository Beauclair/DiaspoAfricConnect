import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
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
        Last updated: June 2025
      </Text>

      <Section title="1. Introduction">
        <P>
          DiaspoAfricConnect ("we", "our", "us") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your personal information
          when you use our mobile application.
        </P>
      </Section>

      <Section title="2. Information We Collect">
        <P>We collect the following information when you create an account and use our services:</P>
        <Bullet>Name and display name</Bullet>
        <Bullet>Email address</Bullet>
        <Bullet>Country of origin and host country</Bullet>
        <Bullet>Languages spoken</Bullet>
        <Bullet>Profile photo (if provided)</Bullet>
        <Bullet>Business listings you create (name, description, address, photos, category)</Bullet>
        <Bullet>Reviews and ratings you submit</Bullet>
        <Bullet>Lawyer registration details (if applicable)</Bullet>
      </Section>

      <Section title="3. How We Use Your Information">
        <P>Your information is used to:</P>
        <Bullet>Provide and personalize our services</Bullet>
        <Bullet>Display business listings and reviews to the community</Bullet>
        <Bullet>Connect users with relevant businesses and immigration resources</Bullet>
        <Bullet>Communicate important updates about our services</Bullet>
        <Bullet>Ensure the safety and integrity of our platform</Bullet>
      </Section>

      <Section title="4. Data Storage & Security">
        <P>
          Your data is stored securely using Google Firebase services, including Firebase Authentication
          and Cloud Firestore. We implement appropriate technical and organizational measures
          to protect your personal data against unauthorized access, alteration, or destruction.
        </P>
      </Section>

      <Section title="5. Data Sharing">
        <P>
          We do not sell, trade, or rent your personal information to third parties. Your public
          profile information (display name, reviews, business listings) is visible to other
          users of the app. We may share data only when required by law.
        </P>
      </Section>

      <Section title="6. Your Rights (GDPR & CCPA)">
        <P>You have the right to:</P>
        <Bullet>Access — request a copy of your personal data</Bullet>
        <Bullet>Rectification — correct inaccurate personal data</Bullet>
        <Bullet>Erasure — request deletion of your account and all associated data</Bullet>
        <Bullet>Portability — request your data in a portable format</Bullet>
        <Bullet>Restriction — restrict the processing of your data</Bullet>
        <Bullet>Objection — object to processing of your personal data</Bullet>
        <P>
          You can delete your account and all associated data at any time from the Profile
          screen in the app. To exercise other rights, contact us at the email below.
        </P>
      </Section>

      <Section title="7. Data Retention">
        <P>
          We retain your personal data for as long as your account is active. When you delete
          your account, all personal data, business listings, reviews, and other content you
          created is permanently deleted from our systems.
        </P>
      </Section>

      <Section title="8. Children's Privacy">
        <P>
          Our service is not intended for users under the age of 13. We do not knowingly
          collect personal information from children under 13.
        </P>
      </Section>

      <Section title="9. Changes to This Policy">
        <P>
          We may update this Privacy Policy from time to time. We will notify you of any
          material changes by updating the "Last updated" date and, where appropriate,
          providing notice within the app.
        </P>
      </Section>

      <Section title="10. Contact Us">
        <P>
          If you have questions about this Privacy Policy or wish to exercise your rights,
          please contact us at:
        </P>
        <P>📧 support@diaspoafricconnect.com</P>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginBottom: 24 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4, paddingLeft: 8 },
});
