import React from 'react';
import { ScrollView, View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
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

export default function AboutScreen() {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ title: 'About' }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ padding: spacing.xxl, paddingBottom: insets.bottom + 40 }}
      >
        <Text style={[typography.headlineLarge, { color: colors.onSurface, textAlign: 'center', marginBottom: 4 }]}>
          DiaspoAfricConnect
        </Text>
        <Text style={[typography.bodySmall, { color: colors.onSurfaceDisabled, textAlign: 'center', marginBottom: 24 }]}>
          v1.0.0
        </Text>

        <Section title="Our Mission">
          <P>
            DiaspoAfricConnect is a community platform built for the African diaspora.
            We help you discover African-owned businesses, find immigration attorneys,
            and access legal guides — all in one place, across 5 countries.
          </P>
        </Section>

        <Section title="What We Offer">
          <Bullet>🏪 African-owned business directory with reviews and ratings</Bullet>
          <Bullet>⚖️ Immigration attorney directory</Bullet>
          <Bullet>📋 Step-by-step immigration guides for US, Canada, UK, France, and Germany</Bullet>
          <Bullet>✅ Document checklists to track your immigration paperwork</Bullet>
          <Bullet>📍 "Near Me" — find African businesses around you</Bullet>
          <Bullet>🗣️ Support for 25+ African languages</Bullet>
        </Section>

        <Section title="Countries Supported">
          <P>🇺🇸 United States · 🇨🇦 Canada · 🇬🇧 United Kingdom · 🇫🇷 France · 🇩🇪 Germany</P>
        </Section>

        <Section title="Connect with Us">
          <P>Questions, feedback, or partnership inquiries:</P>
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

        <Section title="Legal">
          <TouchableOpacity
            onPress={() => router.push('/legal/privacy-policy')}
            style={styles.legalRow}
            activeOpacity={0.7}
          >
            <MaterialIcons name="privacy-tip" size={20} color={colors.primary} />
            <Text style={[typography.bodyMedium, { color: colors.primary, marginLeft: 8 }]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/legal/terms-of-service')}
            style={styles.legalRow}
            activeOpacity={0.7}
          >
            <MaterialIcons name="description" size={20} color={colors.primary} />
            <Text style={[typography.bodyMedium, { color: colors.primary, marginLeft: 8 }]}>
              Terms of Service
            </Text>
          </TouchableOpacity>
        </Section>

        <Text style={[typography.bodySmall, { color: colors.onSurfaceDisabled, textAlign: 'center', marginTop: 16 }]}>
          Made with ❤️ for the African diaspora
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginBottom: 24 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4, paddingLeft: 8 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  legalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
});
