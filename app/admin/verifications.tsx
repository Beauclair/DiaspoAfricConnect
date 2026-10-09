import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, Redirect, useFocusEffect } from 'expo-router';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, Typography } from '../../src/theme';
import Card from '../../src/components/common/Card';
import Button from '../../src/components/common/Button';
import Divider from '../../src/components/common/Divider';
import { useAuth } from '../../src/contexts/AuthContext';
import { getUserMessage } from '../../src/utils/errorMessages';

interface PendingRequest {
  id: string;
  entityType: 'business' | 'lawyer';
  entityId: string;
  entityName: string;
  submittedBy: string;
  phone: string;
  barAssociationNumber?: string;
  submittedAt: string | null;
}

export default function VerificationsScreen() {
  const { user } = useAuth();
  const { colors, radii, typography } = useTheme();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState<string | null>(null);

  if (!user) return <Redirect href="/(auth)/login" />;

  const functions = getFunctions();

  const loadRequests = useCallback(async () => {
    setError('');
    try {
      const listFn = httpsCallable(functions, 'listPendingVerifications');
      const result = await listFn();
      setRequests(result.data as PendingRequest[]);
    } catch (e: any) {
      setError(getUserMessage(e, 'loadVerifications', 'Failed to load verification requests.'));
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests])
  );

  const handleReview = async (requestId: string, decision: 'approved' | 'rejected') => {
    const actionLabel = decision === 'approved' ? 'Approve' : 'Reject';

    const doReview = async (reason?: string) => {
      setReviewing(requestId);
      try {
        const reviewFn = httpsCallable(functions, 'reviewVerificationRequest');
        const result = await reviewFn({ requestId, decision, ...(reason ? { reason } : {}) });
        const data = result.data as any;
        Alert.alert(
          'Done',
          `${data.entityName} has been ${decision}.`,
        );
        // Remove from local list
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      } catch (e: any) {
        Alert.alert('Error', getUserMessage(e, 'reviewVerification', `Failed to ${decision} request.`));
      }
      setReviewing(null);
    };

    if (decision === 'approved') {
      Alert.alert(
        `${actionLabel} Verification`,
        `Are you sure you want to approve this request?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Approve', onPress: () => doReview() },
        ],
      );
    } else {
      // For rejection, ask for a reason
      Alert.prompt?.(
        'Reject Verification',
        'Provide a reason (optional):',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reject', style: 'destructive', onPress: (reason) => doReview(reason) },
        ],
        'plain-text',
      ) ??
        // Alert.prompt is iOS-only; fallback for Android
        Alert.alert(
          'Reject Verification',
          'Are you sure you want to reject this request?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reject', style: 'destructive', onPress: () => doReview() },
          ],
        );
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return 'Unknown';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Verification Requests' }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scroll}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[Typography.bodyMedium, { color: colors.onSurfaceVariant, marginTop: 12 }]}>
              Loading requests...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <MaterialIcons name="error-outline" size={48} color={colors.error} />
            <Text style={[Typography.bodyLarge, { color: colors.error, marginTop: 12, textAlign: 'center' }]}>
              {error}
            </Text>
            <Button title="Retry" onPress={loadRequests} variant="outline" style={{ marginTop: 16 }} />
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.center}>
            <MaterialIcons name="verified" size={48} color={colors.primary} />
            <Text style={[Typography.headlineSmall, { color: colors.onSurface, marginTop: 12 }]}>
              All caught up!
            </Text>
            <Text style={[Typography.bodyMedium, { color: colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' }]}>
              No pending verification requests.
            </Text>
          </View>
        ) : (
          <>
            <Text style={[Typography.titleMedium, { color: colors.onSurfaceVariant, marginBottom: 16 }]}>
              {requests.length} pending request{requests.length !== 1 ? 's' : ''}
            </Text>
            {requests.map((req) => (
              <Card key={req.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialIcons
                    name={req.entityType === 'business' ? 'storefront' : 'gavel'}
                    size={24}
                    color={colors.primary}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[Typography.titleMedium, { color: colors.onSurface }]}>
                      {req.entityName}
                    </Text>
                    <Text style={[Typography.labelSmall, { color: colors.onSurfaceVariant, textTransform: 'capitalize' }]}>
                      {req.entityType === 'lawyer' ? 'Attorney' : req.entityType}
                    </Text>
                  </View>
                </View>

                <Divider style={{ marginVertical: 12 }} />

                <View style={styles.detailRow}>
                  <MaterialIcons name="phone" size={16} color={colors.onSurfaceVariant} />
                  <Text style={[Typography.bodyMedium, { color: colors.onSurface, marginLeft: 8 }]}>
                    {req.phone}
                  </Text>
                </View>

                {req.barAssociationNumber && (
                  <View style={styles.detailRow}>
                    <MaterialIcons name="badge" size={16} color={colors.onSurfaceVariant} />
                    <Text style={[Typography.bodyMedium, { color: colors.onSurface, marginLeft: 8 }]}>
                      Bar #: {req.barAssociationNumber}
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <MaterialIcons name="schedule" size={16} color={colors.onSurfaceVariant} />
                  <Text style={[Typography.bodySmall, { color: colors.onSurfaceVariant, marginLeft: 8 }]}>
                    Submitted {formatDate(req.submittedAt)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialIcons name="person" size={16} color={colors.onSurfaceVariant} />
                  <Text style={[Typography.bodySmall, { color: colors.onSurfaceVariant, marginLeft: 8 }]} numberOfLines={1}>
                    User: {req.submittedBy}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <Button
                    title="Reject"
                    onPress={() => handleReview(req.id, 'rejected')}
                    variant="outline"
                    loading={reviewing === req.id}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Approve"
                    onPress={() => handleReview(req.id, 'approved')}
                    icon="verified"
                    loading={reviewing === req.id}
                    style={{ flex: 1 }}
                  />
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  card: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
});
