import React from 'react';
import { ScrollView, View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
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

function QA({ question, answer }: { question: string; answer: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.qaItem}>
      <Text style={[typography.labelLarge, { color: colors.onSurface, marginBottom: 4 }]}>{question}</Text>
      <Text style={[typography.bodyMedium, { color: colors.onSurfaceVariant, lineHeight: 22 }]}>{answer}</Text>
    </View>
  );
}

export default function HelpSupportScreen() {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ title: 'Help & Support' }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ padding: spacing.xxl, paddingBottom: insets.bottom + 40 }}
      >
        <Section title="Frequently Asked Questions">
          <QA
            question="How do I add my business?"
            answer="Go to the Business tab, tap the + button, and fill in your business details. It's completely free!"
          />
          <QA
            question="How do I find businesses near me?"
            answer='On the Business tab, tap the "Near Me" button to enable location-based sorting. Make sure to allow location access when prompted.'
          />
          <QA
            question="How do I leave a review?"
            answer='Open any business or attorney profile and scroll down to the Reviews section. Tap "Write a Review" to share your experience.'
          />
          <QA
            question="How do I edit or delete my business?"
            answer="Go to Profile → My Businesses, select your business, and use the edit or delete options."
          />
          <QA
            question="Can I use the app in my language?"
            answer="Business and attorney listings support multiple languages. We're working on full app translation."
          />
          <QA
            question="How do I report an issue with a listing?"
            answer="Contact us at the email below and include the business name and a description of the issue."
          />
        </Section>

        <Section title="Contact Us">
          <P>Have a question or need help? Reach out to us:</P>
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:infos@weskillupcenter.com')}
            style={styles.contactRow}
            activeOpacity={0.7}
          >
            <MaterialIcons name="email" size={20} color={colors.primary} />
            <Text style={[typography.bodyMedium, { color: colors.primary, marginLeft: 8 }]}>
              infos@weskillupcenter.com
            </Text>
          </TouchableOpacity>
        </Section>

        <Section title="Follow Us">
          <P>
            Follow us on social media for updates and community news.
          </P>
        </Section>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginBottom: 24 },
  qaItem: { marginBottom: 16 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
});
