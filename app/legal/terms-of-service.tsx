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

export default function TermsOfServiceScreen() {
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

      <Section title="1. Acceptance of Terms">
        <P>
          By creating an account or using DiaspoAfricConnect ("the App"), you agree to be
          bound by these Terms of Service. If you do not agree to these terms, please do
          not use the App.
        </P>
      </Section>

      <Section title="2. Description of Service">
        <P>
          DiaspoAfricConnect is a community platform that connects African diaspora members
          with local businesses, immigration resources, and legal professionals. We provide
          tools for discovering and reviewing businesses, accessing immigration guides,
          and finding qualified lawyers.
        </P>
      </Section>

      <Section title="3. User Accounts">
        <P>To use certain features, you must create an account. You agree to:</P>
        <Bullet>Provide accurate and complete information</Bullet>
        <Bullet>Maintain the security of your account credentials</Bullet>
        <Bullet>Notify us immediately of any unauthorized access</Bullet>
        <Bullet>Accept responsibility for all activity under your account</Bullet>
      </Section>

      <Section title="4. User-Generated Content">
        <P>
          You may submit business listings, reviews, ratings, and other content. By posting
          content, you grant us a non-exclusive, worldwide license to display it within the App.
          You retain ownership of your content and may delete it at any time.
        </P>
        <P>You agree not to post content that:</P>
        <Bullet>Is false, misleading, or fraudulent</Bullet>
        <Bullet>Is defamatory, obscene, or offensive</Bullet>
        <Bullet>Violates any third party's intellectual property rights</Bullet>
        <Bullet>Contains spam, advertising, or solicitation</Bullet>
        <Bullet>Promotes illegal activities or violence</Bullet>
      </Section>

      <Section title="5. Business Listings">
        <P>
          Business owners may list their businesses on the platform. You represent that you
          have the authority to list any business you submit. We reserve the right to remove
          listings that violate these terms or are reported as fraudulent.
        </P>
      </Section>

      <Section title="6. Immigration Information Disclaimer">
        <P>
          Immigration guides and resources provided in the App are for informational purposes
          only and do not constitute legal advice. Laws and procedures change frequently.
          Always consult a qualified immigration attorney for advice specific to your situation.
        </P>
        <P>
          Lawyer listings are provided as a directory service. We do not endorse, guarantee,
          or verify the qualifications of any listed professional beyond our stated verification
          process.
        </P>
      </Section>

      <Section title="7. Prohibited Conduct">
        <P>You agree not to:</P>
        <Bullet>Use the App for any unlawful purpose</Bullet>
        <Bullet>Harass, abuse, or threaten other users</Bullet>
        <Bullet>Attempt to gain unauthorized access to any part of the App</Bullet>
        <Bullet>Interfere with the proper functioning of the App</Bullet>
        <Bullet>Create multiple accounts for deceptive purposes</Bullet>
        <Bullet>Scrape, mine, or extract data from the App</Bullet>
      </Section>

      <Section title="8. Account Termination">
        <P>
          You may delete your account at any time from the Profile screen. We may suspend
          or terminate your account if you violate these terms. Upon termination, all your
          data will be permanently deleted in accordance with our Privacy Policy.
        </P>
      </Section>

      <Section title="9. Limitation of Liability">
        <P>
          The App is provided "as is" without warranties of any kind. We are not liable for
          any damages arising from your use of the App, including but not limited to loss
          of data, business interruption, or reliance on information provided through the App.
        </P>
      </Section>

      <Section title="10. Changes to Terms">
        <P>
          We may modify these Terms at any time. Continued use of the App after changes
          constitutes acceptance of the updated terms. We will provide notice of material
          changes within the App.
        </P>
      </Section>

      <Section title="11. Governing Law">
        <P>
          These Terms are governed by the laws of the United States of America. Any disputes
          arising from these Terms shall be resolved in the courts of competent jurisdiction.
        </P>
      </Section>

      <Section title="12. Contact Us">
        <P>
          If you have questions about these Terms of Service, please contact us at:
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
