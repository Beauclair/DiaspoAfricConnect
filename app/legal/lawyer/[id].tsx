import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput, Alert,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { useLocalSearchParams, Stack, router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, Typography } from '../../../src/theme';
import Card from '../../../src/components/common/Card';
import Button from '../../../src/components/common/Button';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';
import ErrorView from '../../../src/components/common/ErrorView';
import VerificationBadge from '../../../src/components/common/VerificationBadge';
import ReviewCard from '../../../src/components/business/ReviewCard';
import { getLawyerById, deleteLawyer } from '../../../src/services/legalService';
import { LEGAL_CATEGORIES } from '../../../src/constants/countries';
import {
  getReviewsForLawyer, addLawyerReview, updateLawyerReview, deleteLawyerReview, respondToReview,
} from '../../../src/services/reviewService';
import { useAuth } from '../../../src/contexts/AuthContext';
import { requireAuth } from '../../../src/utils/authGuard';
import { useSubmitGuard } from '../../../src/hooks';
import { getUserMessage } from '../../../src/utils/errorMessages';
import { Lawyer, Review } from '../../../src/types';
import { logger } from '../../../src/utils/logger';
import { trackEvent } from '../../../src/config/analytics';
import { AnalyticsEvents } from '../../../src/constants/analyticsEvents';

export default function LawyerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { colors, radii } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Respond state
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [respondingSubmitting, setRespondingSubmitting] = useState(false);

  const isOwner = lawyer && user && lawyer.ownerId === user.uid;

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Delete Attorney Profile',
      'Are you sure you want to delete this profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLawyer(id);
              trackEvent(AnalyticsEvents.LAWYER_DELETED, { lawyer_id: id });
              router.back();
            } catch (e: any) {
              Alert.alert('Error', getUserMessage(e, 'deleteLawyer', 'Failed to delete attorney profile.'));
            }
          },
        },
      ]
    );
  };

  // Map practice area keys to readable labels
  const getSpecLabel = (key: string) => {
    const cat = LEGAL_CATEGORIES.find((c) => c.key === key);
    return cat?.label ?? key;
  };

  const loadData = useCallback(async () => {
    if (!id) return;
    setError('');
    try {
      const l = await getLawyerById(id);
      setLawyer(l);
      if (l) {
        trackEvent(AnalyticsEvents.LAWYER_VIEWED, { lawyer_id: id });
      }

      // Load reviews separately — the composite index may not exist yet
      try {
        const revs = await getReviewsForLawyer(id);
        setReviews(revs.data);
      } catch (revErr: any) {
        logger.warn('Failed to load reviews (index may be missing):', revErr.message);
        setReviews([]);
      }
    } catch (e: any) {
      setError(getUserMessage(e, 'loadLawyer', 'Failed to load attorney details.'));
    }
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const updateLocalStats = useCallback((updatedReviews: Review[]) => {
    setLawyer((prev) => {
      if (!prev) return prev;
      const count = updatedReviews.length;
      const avg = count > 0
        ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / count
        : 0;
      return {
        ...prev,
        reviewCount: count,
        averageRating: Math.round(avg * 10) / 10,
      };
    });
  }, []);

  const doSubmitReview = useCallback(async () => {
    if (!user || !id || !comment.trim()) return;
    setSubmitting(true);
    setReviewError('');

    const prevReviews = reviews;
    const trimmed = comment.trim();

    if (editingReview) {
      const updated = reviews.map((r) =>
        r.id === editingReview.id ? { ...r, rating, comment: trimmed } : r,
      );
      setReviews(updated);
      updateLocalStats(updated);
      setShowReviewForm(false);
      setEditingReview(null);
      setComment('');
      setRating(5);
      setSubmitting(false);

      updateLawyerReview(editingReview.id, id, rating, trimmed).catch(() => {
        setReviews(prevReviews);
        updateLocalStats(prevReviews);
        setReviewError('Failed to update review. Please try again.');
      });
    } else {
      const tempId = `temp_${Date.now()}`;
      const optimisticReview: Review = {
        id: tempId,
        lawyerId: id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating,
        comment: trimmed,
        createdAt: { toDate: () => new Date() } as any,
      };
      const updated = [optimisticReview, ...reviews];
      setReviews(updated);
      updateLocalStats(updated);
      setShowReviewForm(false);
      setEditingReview(null);
      setComment('');
      setRating(5);
      setSubmitting(false);

      addLawyerReview({
        lawyerId: id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating,
        comment: trimmed,
      })
        .then((newId) => {
          setReviews((prev) =>
            prev.map((r) => (r.id === tempId ? { ...r, id: newId } : r)),
          );
        })
        .catch(() => {
          setReviews(prevReviews);
          updateLocalStats(prevReviews);
          setReviewError('Failed to submit review. Please try again.');
        });
    }
  }, [user, id, comment, rating, editingReview, reviews, updateLocalStats]);

  const handleSubmitReview = useSubmitGuard(doSubmitReview, 5000);

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setShowReviewForm(true);
  };

  const handleDeleteReview = (review: Review) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const prevReviews = reviews;
            const updated = reviews.filter((r) => r.id !== review.id);
            setReviews(updated);
            updateLocalStats(updated);

            deleteLawyerReview(review.id, id!).catch(() => {
              setReviews(prevReviews);
              updateLocalStats(prevReviews);
              Alert.alert('Error', 'Failed to delete review. Please try again.');
            });
          },
        },
      ]
    );
  };

  const handleRespondToReview = async (reviewId: string) => {
    if (!responseText.trim()) return;
    setRespondingSubmitting(true);
    try {
      await respondToReview(reviewId, responseText.trim());
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, ownerResponse: responseText.trim() } : r,
        ),
      );
      setRespondingTo(null);
      setResponseText('');
    } catch (e: any) {
      Alert.alert('Error', getUserMessage(e, 'respondToLawyerReview', 'Failed to submit response.'));
    }
    setRespondingSubmitting(false);
  };

  if (loading) return (
    <>
      <Stack.Screen options={{ headerTitle: 'Attorney Details' }} />
      <LoadingSpinner />
    </>
  );
  if (error) return (
    <>
      <Stack.Screen options={{ headerTitle: 'Attorney Details' }} />
      <ErrorView message={error} onRetry={loadData} />
    </>
  );
  if (!lawyer) return (
    <>
      <Stack.Screen options={{ headerTitle: 'Attorney Details' }} />
      <ErrorView message="Attorney not found" />
    </>
  );

  return (
    <>
      <Stack.Screen options={{ headerTitle: lawyer.name }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
      >
      <ScrollView
        ref={scrollViewRef}
        style={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Profile header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.primary }]}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.onPrimary + '20' }]}>
            <Text style={[styles.avatarLargeText, { color: colors.onPrimary }]}>
              {lawyer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.onPrimary }]}>{lawyer.name}</Text>
          <Text style={[styles.firm, { color: colors.onPrimary + 'CC' }]}>{lawyer.firm}</Text>
          <View style={styles.headerMeta}>
            <View style={styles.headerRatingBadge}>
              <MaterialIcons name="star" size={18} color="#FFD700" />
              <Text style={[styles.headerRatingText, { color: colors.onPrimary }]}>
                {lawyer.averageRating.toFixed(1)}
              </Text>
              <Text style={[styles.headerReviewCount, { color: colors.onPrimary + '99' }]}>
                ({lawyer.reviewCount} {lawyer.reviewCount === 1 ? 'review' : 'reviews'})
              </Text>
            </View>
            {lawyer.verificationStatus === 'verified' && (
              <VerificationBadge status="verified" variant="compact" size="sm" />
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Owner banner with edit/delete */}
          {isOwner && (
            <View style={[styles.ownerBanner, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
              <View style={styles.ownerBannerTop}>
                <MaterialIcons name="verified-user" size={18} color={colors.primary} />
                <Text style={[styles.ownerBannerText, { color: colors.primary }]}>This is your profile</Text>
              </View>
              <View style={styles.ownerActions}>
                <TouchableOpacity
                  style={styles.ownerActionBtn}
                  onPress={() => router.push({ pathname: '/legal/edit-lawyer', params: { id: lawyer.id } })}
                  accessibilityRole="button"
                  accessibilityLabel="Edit attorney profile"
                >
                  <MaterialIcons name="edit" size={18} color={colors.primary} />
                  <Text style={[styles.ownerActionText, { color: colors.primary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ownerActionBtn}
                  onPress={handleDelete}
                  accessibilityRole="button"
                  accessibilityLabel="Delete attorney profile"
                >
                  <MaterialIcons name="delete" size={18} color={colors.tertiary} />
                  <Text style={[styles.ownerActionText, { color: colors.tertiary }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* Specializations */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Practice Areas</Text>
            <View style={styles.tags}>
              {lawyer.specializations.map((s) => (
                <View key={s} style={[styles.tag, { backgroundColor: colors.primary + '15', borderRadius: radii.full }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>{getSpecLabel(s)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Contact info */}
          <Card style={styles.infoCard}>
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Contact Information</Text>

            <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`tel:${lawyer.phone}`)}>
              <View style={[styles.infoIcon, { backgroundColor: colors.primaryContainer, borderRadius: radii.sm }]}>
                <MaterialIcons name="phone" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Phone</Text>
                <Text style={[styles.infoValue, { color: colors.primary }]}>{lawyer.phone}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`mailto:${lawyer.email}`)}>
              <View style={[styles.infoIcon, { backgroundColor: colors.primaryContainer, borderRadius: radii.sm }]}>
                <MaterialIcons name="email" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Email</Text>
                <Text style={[styles.infoValue, { color: colors.primary }]}>{lawyer.email}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>

            {lawyer.website && (
              <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(lawyer.website!)}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primaryContainer, borderRadius: radii.sm }]}>
                  <MaterialIcons name="language" size={20} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Website</Text>
                  <Text style={[styles.infoValue, { color: colors.primary }]} numberOfLines={1}>{lawyer.website}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            )}

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: colors.primaryContainer, borderRadius: radii.sm }]}>
                <MaterialIcons name="location-on" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Location</Text>
                <Text style={[styles.infoValue, { color: colors.onSurface }]}>{lawyer.city}, {lawyer.state}</Text>
              </View>
            </View>
          </Card>

          {/* Details */}
          <Card style={styles.infoCard}>
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Details</Text>

            {lawyer.languagesSpoken.length > 0 && (
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: colors.secondaryContainer, borderRadius: radii.sm }]}>
                  <MaterialIcons name="translate" size={20} color={colors.secondary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Languages</Text>
                  <Text style={[styles.infoValue, { color: colors.onSurface }]}>{lawyer.languagesSpoken.join(', ')}</Text>
                </View>
              </View>
            )}

            {lawyer.barAssociationNumber && (
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: colors.secondaryContainer, borderRadius: radii.sm }]}>
                  <MaterialIcons name="badge" size={20} color={colors.secondary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Bar Association #</Text>
                  <Text style={[styles.infoValue, { color: colors.onSurface }]}>{lawyer.barAssociationNumber}</Text>
                </View>
              </View>
            )}
          </Card>

          {/* Verification status */}
          {(lawyer.verificationStatus === 'verified' || lawyer.verificationStatus === 'pending') && (
            <Card style={[styles.verificationCard, {
              backgroundColor: lawyer.verificationStatus === 'verified'
                ? colors.primary + '10' : colors.warning + '10',
            }]}>
              <VerificationBadge status={lawyer.verificationStatus} variant="full" size="md" />
            </Card>
          )}

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary, borderRadius: radii.lg }]}
              onPress={() => {
                trackEvent(AnalyticsEvents.LAWYER_CALL_TAPPED, { lawyer_id: lawyer.id });
                Linking.openURL(`tel:${lawyer.phone}`);
              }}
            >
              <MaterialIcons name="phone" size={22} color={colors.onPrimary} />
              <Text style={[styles.actionBtnText, { color: colors.onPrimary }]}>Call Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.outline }]}
              onPress={() => Linking.openURL(`mailto:${lawyer.email}`)}
            >
              <MaterialIcons name="email" size={22} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>Send Email</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Reviews ({lawyer.reviewCount})
              </Text>
              <View style={styles.ratingBadge}>
                <MaterialIcons name="star" size={18} color={colors.star} />
                <Text style={[styles.ratingText, { color: colors.onSurface }]}>{lawyer.averageRating.toFixed(1)}</Text>
              </View>
            </View>

            {!isOwner && (
              !showReviewForm ? (
                <Button
                  title="Write a Review"
                  onPress={() => requireAuth(user, () => setShowReviewForm(true))}
                  variant="outline"
                  style={{ marginBottom: 16 }}
                />
              ) : (
                <Card style={styles.reviewForm}>
                  <Text style={[styles.reviewFormTitle, { color: colors.onSurface }]}>
                    {editingReview ? 'Edit Review' : 'Your Rating'}
                  </Text>
                  <View style={styles.starPicker}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <TouchableOpacity key={s} onPress={() => setRating(s)}>
                        <MaterialIcons
                          name={s <= rating ? 'star' : 'star-border'}
                          size={32}
                          color={colors.star}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={[styles.reviewInput, { borderColor: colors.outline, borderRadius: radii.md, color: colors.onSurface }]}
                    placeholder="Write your review..."
                    placeholderTextColor={colors.onSurfaceVariant}
                    value={comment}
                    onChangeText={setComment}
                    maxLength={2000}
                    multiline
                    numberOfLines={4}
                    onFocus={() => {
                      const sub = Keyboard.addListener('keyboardDidShow', () => {
                        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
                        sub.remove();
                      });
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                        sub.remove();
                      }, 300);
                      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 600);
                    }}
                  />
                  <Text style={[styles.charCount, { color: comment.length > 1900 ? colors.error : colors.onSurfaceVariant }]}>
                    {comment.length}/2000
                  </Text>
                  {reviewError ? <Text style={[styles.reviewErrorText, { color: colors.error }]}>{reviewError}</Text> : null}
                  <View style={styles.reviewActions}>
                    <Button title="Cancel" onPress={() => { setShowReviewForm(false); setEditingReview(null); setComment(''); setRating(5); }} variant="outline" style={{ flex: 1 }} />
                    <Button title={editingReview ? 'Update' : 'Submit'} onPress={handleSubmitReview} loading={submitting} style={{ flex: 1 }} />
                  </View>
                </Card>
              )
            )}

            {reviews.map((r) => (
              <View key={r.id}>
                <ReviewCard
                  review={r}
                  currentUserId={user?.uid}
                  entityType="lawyer"
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                />
                {isOwner && !r.ownerResponse && (
                  respondingTo === r.id ? (
                    <View style={[styles.respondForm, { borderLeftColor: colors.primary }]}>
                      <TextInput
                        style={[styles.respondInput, { borderColor: colors.outline, borderRadius: radii.sm, color: colors.onSurface }]}
                        placeholder="Write your response..."
                        placeholderTextColor={colors.onSurfaceVariant}
                        value={responseText}
                        onChangeText={setResponseText}
                        maxLength={2000}
                        multiline
                        numberOfLines={3}
                        onFocus={() => {
                          const sub = Keyboard.addListener('keyboardDidShow', () => {
                            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
                            sub.remove();
                          });
                          setTimeout(() => {
                            scrollViewRef.current?.scrollToEnd({ animated: true });
                            sub.remove();
                          }, 300);
                          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 600);
                        }}
                      />
                      <Text style={[styles.charCount, { color: responseText.length > 1900 ? colors.error : colors.onSurfaceVariant }]}>
                        {responseText.length}/2000
                      </Text>
                      <View style={styles.respondActions}>
                        <Button
                          title="Cancel"
                          onPress={() => { setRespondingTo(null); setResponseText(''); }}
                          variant="outline"
                          style={{ flex: 1 }}
                        />
                        <Button
                          title="Respond"
                          onPress={() => handleRespondToReview(r.id)}
                          loading={respondingSubmitting}
                          style={{ flex: 1 }}
                        />
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.respondBtn}
                      onPress={() => setRespondingTo(r.id)}
                    >
                      <MaterialIcons name="reply" size={16} color={colors.primary} />
                      <Text style={[styles.respondBtnText, { color: colors.primary }]}>Respond</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            ))}

            {reviews.length === 0 && (
              <Text style={[styles.emptyReviews, { color: colors.onSurfaceVariant }]}>No reviews yet. Be the first!</Text>
            )}
          </View>

          {/* Disclaimer */}
          <Card style={[styles.disclaimer, { backgroundColor: colors.warning + '10' }]}>
            <MaterialIcons name="info-outline" size={18} color={colors.warning} />
            <Text style={[styles.disclaimerText, { color: colors.onSurfaceVariant }]}>
              Listing on this directory does not constitute an endorsement. Always verify credentials independently before engaging services.
            </Text>
          </Card>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarLargeText: { fontSize: 30, fontWeight: 'bold' },
  name: { ...Typography.headlineSmall, fontWeight: '700' },
  firm: { ...Typography.bodyLarge, marginTop: 4 },
  headerMeta: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10,
  },
  headerRatingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerRatingText: { ...Typography.titleMedium, fontWeight: '700' },
  headerReviewCount: { ...Typography.bodySmall },
  content: { padding: 20 },
  ownerBanner: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    gap: 10,
  },
  ownerBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownerBannerText: { ...Typography.titleSmall },
  ownerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  ownerActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ownerActionText: { ...Typography.titleSmall },
  section: { marginBottom: 20 },
  sectionTitle: { ...Typography.titleMedium, fontWeight: '700', marginBottom: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 14, paddingVertical: 6 },
  tagText: { ...Typography.labelMedium },
  infoCard: { marginBottom: 16 },
  cardTitle: { ...Typography.titleMedium, fontWeight: '700', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  infoIcon: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { ...Typography.labelSmall },
  infoValue: { ...Typography.bodyMedium, marginTop: 1 },
  verificationCard: { marginBottom: 16, padding: 14 },
  actionButtons: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
  },
  actionBtnText: { ...Typography.labelLarge, fontWeight: '600' },

  // Reviews
  reviewsSection: { marginTop: 8, marginBottom: 20 },
  reviewsHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { ...Typography.titleMedium, fontWeight: '600' },
  reviewForm: { marginBottom: 16 },
  reviewFormTitle: { ...Typography.titleMedium, fontWeight: '600', marginBottom: 8 },
  starPicker: { flexDirection: 'row', gap: 4, marginBottom: 12 },
  reviewInput: { borderWidth: 1, padding: 12, fontSize: 14, minHeight: 90, textAlignVertical: 'top' },
  charCount: { ...Typography.labelSmall, textAlign: 'right', marginTop: 4 },
  reviewActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  reviewErrorText: { fontSize: 13, marginTop: 8, textAlign: 'center' },
  emptyReviews: { textAlign: 'center', marginTop: 16, ...Typography.bodyMedium },
  respondBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 8, paddingLeft: 16,
  },
  respondBtnText: { ...Typography.labelMedium },
  respondForm: {
    marginLeft: 16, marginTop: 8, marginBottom: 16,
    paddingLeft: 12, paddingBottom: 8, borderLeftWidth: 2,
  },
  respondInput: { borderWidth: 1, padding: 10, fontSize: 14, minHeight: 70, textAlignVertical: 'top' },
  respondActions: { flexDirection: 'row', gap: 8, marginTop: 8 },

  disclaimer: { flexDirection: 'row', gap: 10, marginBottom: 40 },
  disclaimerText: { flex: 1, ...Typography.bodySmall, lineHeight: 18 },
});
