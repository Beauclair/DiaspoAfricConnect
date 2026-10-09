import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput, Alert,
  FlatList, Dimensions, NativeScrollEvent, NativeSyntheticEvent, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { useLocalSearchParams, Stack, router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
import { useTheme, Typography } from '../../src/theme';
import Card from '../../src/components/common/Card';
import Button from '../../src/components/common/Button';
import NetworkImage from '../../src/components/common/NetworkImage';
import ReviewCard from '../../src/components/business/ReviewCard';
import Skeleton from '../../src/components/common/Skeleton';
import ErrorView from '../../src/components/common/ErrorView';
import { getBusinessById, deleteBusiness } from '../../src/services/businessService';
import { getReviewsForBusiness, addReview, respondToReview, updateReview, deleteReview } from '../../src/services/reviewService';
import { useAuth } from '../../src/contexts/AuthContext';
import { requireAuth } from '../../src/utils/authGuard';
import { useSubmitGuard } from '../../src/hooks';
import { getUserMessage } from '../../src/utils/errorMessages';
import VerificationBadge from '../../src/components/common/VerificationBadge';
import { Business, Review } from '../../src/types';
import { trackEvent, trackScreen } from '../../src/config/analytics';
import { AnalyticsEvents } from '../../src/constants/analyticsEvents';

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { colors, radii } = useTheme();
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [respondingSubmitting, setRespondingSubmitting] = useState(false);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const isOwner = business && user && business.ownerId === user.uid;

  const loadData = useCallback(async () => {
    if (!id) return;
    setError('');
    try {
      const [biz, revs] = await Promise.all([
        getBusinessById(id),
        getReviewsForBusiness(id),
      ]);
      setBusiness(biz);
      setReviews(revs.data);
      if (biz) {
        trackEvent(AnalyticsEvents.BUSINESS_VIEWED, { business_id: id, category: biz.category });
      }
    } catch (e: any) {
      setError(getUserMessage(e, 'loadBusiness', 'Failed to load business details.'));
    }
    setLoading(false);
  }, [id]);

  // Reload data every time the screen gains focus (e.g. returning from claim screen)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Compute and apply optimistic rating stats from the local reviews list
  const updateLocalStats = useCallback((updatedReviews: Review[]) => {
    setBusiness((prev) => {
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

    // Snapshot for rollback
    const prevReviews = reviews;
    const trimmed = comment.trim();

    if (editingReview) {
      // Optimistic: update UI immediately
      const updated = reviews.map((r) =>
        r.id === editingReview.id ? { ...r, rating, comment: trimmed } : r,
      );
      setReviews(updated);
      updateLocalStats(updated);
      setComment('');
      setRating(5);
      setShowReviewForm(false);
      setEditingReview(null);
      setSubmitting(false);

      // Fire network call in background
      updateReview(editingReview.id, id, rating, trimmed)
        .then(() => trackEvent(AnalyticsEvents.REVIEW_EDITED, { business_id: id }))
        .catch(() => {
          // Roll back on failure
          setReviews(prevReviews);
          updateLocalStats(prevReviews);
          setReviewError('Failed to update review. Please try again.');
        });
    } else {
      // Optimistic: add review to UI immediately with a temp ID
      const tempId = `temp_${Date.now()}`;
      const optimisticReview: Review = {
        id: tempId,
        businessId: id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating,
        comment: trimmed,
        createdAt: { toDate: () => new Date() } as any,
      };
      const updated = [optimisticReview, ...reviews];
      setReviews(updated);
      updateLocalStats(updated);
      setComment('');
      setRating(5);
      setShowReviewForm(false);
      setSubmitting(false);

      // Fire network call in background, replace temp ID with real one
      addReview({
        businessId: id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating,
        comment: trimmed,
      })
        .then((newId) => {
          setReviews((prev) =>
            prev.map((r) => (r.id === tempId ? { ...r, id: newId } : r)),
          );
          trackEvent(AnalyticsEvents.REVIEW_SUBMITTED, { business_id: id, rating });
        })
        .catch(() => {
          // Roll back on failure
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
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const handleDeleteReview = (review: Review) => {
    // Snapshot for rollback
    const prevReviews = reviews;

    // Optimistic: remove from UI immediately
    const updated = reviews.filter((r) => r.id !== review.id);
    setReviews(updated);
    updateLocalStats(updated);

    // Fire network call in background
    deleteReview(review.id, review.businessId)
      .then(() => trackEvent(AnalyticsEvents.REVIEW_DELETED, { business_id: review.businessId }))
      .catch(() => {
        // Roll back on failure
        setReviews(prevReviews);
        updateLocalStats(prevReviews);
        Alert.alert('Error', 'Failed to delete review. Please try again.');
      });
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Delete Business',
      'Are you sure you want to delete this business? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBusiness(id);
              trackEvent(AnalyticsEvents.BUSINESS_DELETED, { business_id: id });
              router.back();
            } catch (e: any) {
              Alert.alert('Error', getUserMessage(e, 'deleteBusiness', 'Failed to delete business.'));
            }
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
      // Optimistically update the review with the owner response
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, ownerResponse: responseText.trim() } : r,
        ),
      );
      setRespondingTo(null);
      setResponseText('');
    } catch (e: any) {
      Alert.alert('Error', getUserMessage(e, 'respondToReview', 'Failed to submit response.'));
    }
    setRespondingSubmitting(false);
  };

  if (loading) return (
    <>
      <Stack.Screen options={{ headerTitle: '' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Photo placeholder */}
        <Skeleton width="100%" height={250} borderRadius={0} />
        <View style={styles.content}>
          <Skeleton width="70%" height={24} style={{ marginBottom: 12 }} />
          <Skeleton width="40%" height={16} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={80} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={80} />
        </View>
      </View>
    </>
  );
  if (error) return <ErrorView message={error} onRetry={loadData} />;
  if (!business) return <ErrorView message="Business not found" />;

  return (
    <>
      <Stack.Screen options={{ headerTitle: business.name }} />
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
        {business.photos.length > 0 ? (
          <View>
            <FlatList
              data={business.photos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => `photo-${i}`}
              onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setActivePhotoIndex(index);
              }}
              renderItem={({ item }) => (
                <NetworkImage uri={item} style={styles.heroImage} />
              )}
            />
            {business.photos.length > 1 && (
              <View style={styles.dotRow}>
                {business.photos.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === activePhotoIndex && styles.dotActive]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.heroImage, styles.placeholder, { backgroundColor: colors.outline }]}>
            <MaterialIcons name="storefront" size={60} color={colors.onSurfaceVariant} />
          </View>
        )}

        <View style={styles.content}>
          {isOwner && (
            <View style={[styles.ownerBanner, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
              <View style={styles.ownerBannerTop}>
                <MaterialIcons name="verified-user" size={18} color={colors.primary} />
                <Text style={[styles.ownerBannerText, { color: colors.primary }]}>You own this business</Text>
              </View>
              <View style={styles.ownerActions}>
                <TouchableOpacity
                  style={styles.ownerActionBtn}
                  onPress={() => router.push({ pathname: '/business/edit', params: { id: business.id } })}
                  accessibilityRole="button"
                  accessibilityLabel="Edit business"
                >
                  <MaterialIcons name="edit" size={18} color={colors.primary} />
                  <Text style={[styles.ownerActionText, { color: colors.primary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ownerActionBtn}
                  onPress={handleDelete}
                  accessibilityRole="button"
                  accessibilityLabel="Delete business"
                >
                  <MaterialIcons name="delete" size={18} color={colors.tertiary} />
                  <Text style={[styles.ownerActionText, { color: colors.tertiary }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Verification status section for owners */}
          {isOwner && (
            <View style={[styles.verificationSection, {
              backgroundColor: business.verificationStatus === 'verified' ? colors.successContainer
                : business.verificationStatus === 'pending' ? colors.warningContainer
                : business.verificationStatus === 'rejected' ? colors.errorContainer
                : colors.surfaceVariant,
              borderRadius: radii.md,
            }]}>
              <View style={styles.verificationRow}>
                <VerificationBadge
                  status={business.verificationStatus ?? (business.isVerified ? 'verified' : 'unverified')}
                  variant="full"
                  size="md"
                />
              </View>
              {(!business.verificationStatus || business.verificationStatus === 'unverified') && (
                <View style={styles.verifyCta}>
                  <Text style={[styles.verifyCtaText, { color: colors.onSurfaceVariant }]}>
                    Verify your business to build trust with customers and rank higher in search.
                  </Text>
                  <Button
                    title="Verify My Business"
                    onPress={() => router.push({ pathname: '/business/claim', params: { id: business.id, name: business.name } })}
                    variant="primary"
                    icon="verified"
                    size="sm"
                    style={{ marginTop: 10 }}
                  />
                </View>
              )}
              {business.verificationStatus === 'pending' && (
                <Text style={[styles.verifyStatusText, { color: colors.warning }]}>
                  Your verification request is being reviewed. We'll notify you once it's processed.
                </Text>
              )}
              {business.verificationStatus === 'rejected' && (
                <View style={styles.verifyCta}>
                  <Text style={[styles.verifyStatusText, { color: colors.error }]}>
                    Your verification request was not approved. You can resubmit with updated information.
                  </Text>
                  <Button
                    title="Resubmit Verification"
                    onPress={() => router.push({ pathname: '/business/claim', params: { id: business.id, name: business.name } })}
                    variant="outline"
                    icon="refresh"
                    size="sm"
                    style={{ marginTop: 10 }}
                  />
                </View>
              )}
              {business.verificationStatus === 'verified' && (
                <Text style={[styles.verifyStatusText, { color: colors.success }]}>
                  Your business is verified. Customers see a trust badge on your listing.
                </Text>
              )}
            </View>
          )}

          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: colors.onSurface }]}>{business.name}</Text>
            <VerificationBadge
              status={business.verificationStatus ?? (business.isVerified ? 'verified' : 'unverified')}
              variant="compact"
              size="md"
            />
          </View>

          {/* Show full verification badge for visitors when verified */}
          {!isOwner && (business.verificationStatus === 'verified' || business.isVerified) && (
            <VerificationBadge status="verified" variant="full" size="sm" style={{ marginTop: 6 }} />
          )}

          <Text style={[styles.category, { color: colors.primary, textTransform: 'capitalize' }]}>
            {business.category}
          </Text>

          <Text style={[styles.description, { color: colors.onSurface }]}>{business.description}</Text>

          <Card style={styles.infoCard}>
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => {
                trackEvent(AnalyticsEvents.BUSINESS_DIRECTIONS_TAPPED, { business_id: business.id });
                const address = `${business.address}, ${business.city}, ${business.state} ${business.zipCode}`;
                const encoded = encodeURIComponent(address);
                const url = Platform.select({
                  ios: `maps:0,0?q=${encoded}`,
                  default: `geo:0,0?q=${encoded}`,
                });
                Linking.openURL(url);
              }}
            >
              <MaterialIcons name="location-on" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.primary }]}>{business.address}, {business.city}, {business.state} {business.zipCode}</Text>
              <MaterialIcons name="open-in-new" size={16} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            {business.phone && (
              <TouchableOpacity style={styles.infoRow} onPress={() => {
                trackEvent(AnalyticsEvents.BUSINESS_CALL_TAPPED, { business_id: business.id });
                Linking.openURL(`tel:${business.phone}`);
              }}>
                <MaterialIcons name="phone" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.primary }]}>{business.phone}</Text>
              </TouchableOpacity>
            )}
            {business.website && (
              <TouchableOpacity style={styles.infoRow} onPress={() => {
                trackEvent(AnalyticsEvents.BUSINESS_WEBSITE_TAPPED, { business_id: business.id });
                Linking.openURL(business.website!);
              }}>
                <MaterialIcons name="language" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.primary }]}>{business.website}</Text>
              </TouchableOpacity>
            )}
            {business.languagesSpoken.length > 0 && (
              <View style={styles.infoRow}>
                <MaterialIcons name="translate" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.onSurface }]}>{business.languagesSpoken.join(', ')}</Text>
              </View>
            )}
          </Card>

          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Reviews ({business.reviewCount})
              </Text>
              <View style={styles.ratingBadge}>
                <MaterialIcons name="star" size={18} color={colors.star} />
                <Text style={[styles.ratingText, { color: colors.onSurface }]}>{business.averageRating.toFixed(1)}</Text>
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
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                        sub.remove();
                      });
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                        sub.remove();
                      }, 500);
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
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroImage: { width: SCREEN_WIDTH, height: 220 },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { ...Typography.displaySmall, flex: 1 },
  category: { ...Typography.bodyMedium, marginTop: 4, textTransform: 'capitalize' },
  description: { ...Typography.titleMedium, lineHeight: 22, marginTop: 12 },
  infoCard: { marginTop: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  infoText: { ...Typography.bodyMedium, flex: 1 },
  reviewsSection: { marginTop: 24 },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { ...Typography.headlineMedium },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 18, fontWeight: '700' },
  reviewForm: { marginBottom: 16 },
  reviewFormTitle: { ...Typography.titleLarge, marginBottom: 8 },
  starPicker: { flexDirection: 'row', gap: 4, marginBottom: 12 },
  reviewInput: { borderWidth: 1, padding: 12, fontSize: 15, minHeight: 100, textAlignVertical: 'top' },
  charCount: { ...Typography.labelSmall, textAlign: 'right', marginTop: 4 },
  reviewActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  emptyReviews: { textAlign: 'center', marginTop: 16, ...Typography.bodyMedium },
  reviewErrorText: { fontSize: 13, marginTop: 8, textAlign: 'center' },
  respondBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 8, paddingLeft: 16,
  },
  respondBtnText: { ...Typography.labelMedium },
  respondForm: {
    marginLeft: 16, marginTop: 8, marginBottom: 16,
    paddingLeft: 12, paddingBottom: 8, borderLeftWidth: 2,
  },
  respondInput: {
    borderWidth: 1, padding: 10, fontSize: 14, minHeight: 70, textAlignVertical: 'top',
  },
  respondActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  verificationSection: {
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifyCta: {
    marginTop: 4,
  },
  verifyCtaText: { ...Typography.bodySmall, lineHeight: 18 },
  verifyStatusText: { ...Typography.bodySmall, lineHeight: 18, marginTop: 2 },
});

