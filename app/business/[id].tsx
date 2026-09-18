import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput, Alert,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import Card from '../../src/components/common/Card';
import Button from '../../src/components/common/Button';
import NetworkImage from '../../src/components/common/NetworkImage';
import ReviewCard from '../../src/components/business/ReviewCard';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorView from '../../src/components/common/ErrorView';
import { getBusinessById, deleteBusiness } from '../../src/services/businessService';
import { getReviewsForBusiness, addReview, respondToReview } from '../../src/services/reviewService';
import { useAuth } from '../../src/contexts/AuthContext';
import { Business, Review } from '../../src/types';

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [respondingSubmitting, setRespondingSubmitting] = useState(false);

  const isOwner = business && user && business.ownerId === user.uid;

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setError('');
    try {
      const [biz, revs] = await Promise.all([
        getBusinessById(id),
        getReviewsForBusiness(id),
      ]);
      setBusiness(biz);
      setReviews(revs);
    } catch (e: any) {
      setError(e.message || 'Failed to load business details');
    }
    setLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!user || !id || !comment.trim()) return;
    setSubmitting(true);
    setReviewError('');
    try {
      await addReview({
        businessId: id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating,
        comment: comment.trim(),
      });
      setComment('');
      setShowReviewForm(false);
      await loadData();
    } catch (e: any) {
      setReviewError(e.message || 'Failed to submit review');
    }
    setSubmitting(false);
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
              router.back();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete business');
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
      setRespondingTo(null);
      setResponseText('');
      await loadData();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit response');
    }
    setRespondingSubmitting(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorView message={error} onRetry={loadData} />;
  if (!business) return <ErrorView message="Business not found" />;

  return (
    <>
      <Stack.Screen options={{ headerTitle: business.name }} />
      <ScrollView style={styles.container}>
        {business.photos.length > 0 ? (
          <NetworkImage uri={business.photos[0]} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.placeholder]}>
            <MaterialIcons name="storefront" size={60} color={Colors.textLight} />
          </View>
        )}

        <View style={styles.content}>
          {isOwner && (
            <View style={styles.ownerBanner}>
              <MaterialIcons name="verified-user" size={18} color={Colors.primary} />
              <Text style={styles.ownerBannerText}>You own this business</Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                style={styles.ownerActionBtn}
                onPress={() => router.push({ pathname: '/business/edit', params: { id: business.id } })}
                accessibilityRole="button"
                accessibilityLabel="Edit business"
              >
                <MaterialIcons name="edit" size={18} color={Colors.primary} />
                <Text style={styles.ownerActionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ownerActionBtn}
                onPress={handleDelete}
                accessibilityRole="button"
                accessibilityLabel="Delete business"
              >
                <MaterialIcons name="delete" size={18} color={Colors.accent} />
                <Text style={[styles.ownerActionText, { color: Colors.accent }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.titleRow}>
            <Text style={styles.name}>{business.name}</Text>
            {business.isVerified && <MaterialIcons name="verified" size={22} color={Colors.primary} />}
          </View>

          <Text style={styles.category}>
            {business.category} | {business.countryOfOrigin}
          </Text>

          <Text style={styles.description}>{business.description}</Text>

          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>{business.address}, {business.city}, {business.state} {business.zipCode}</Text>
            </View>
            {business.phone && (
              <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`tel:${business.phone}`)}>
                <MaterialIcons name="phone" size={20} color={Colors.primary} />
                <Text style={[styles.infoText, styles.link]}>{business.phone}</Text>
              </TouchableOpacity>
            )}
            {business.website && (
              <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(business.website!)}>
                <MaterialIcons name="language" size={20} color={Colors.primary} />
                <Text style={[styles.infoText, styles.link]}>{business.website}</Text>
              </TouchableOpacity>
            )}
            {business.languagesSpoken.length > 0 && (
              <View style={styles.infoRow}>
                <MaterialIcons name="translate" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>{business.languagesSpoken.join(', ')}</Text>
              </View>
            )}
          </Card>

          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>
                Reviews ({business.reviewCount})
              </Text>
              <View style={styles.ratingBadge}>
                <MaterialIcons name="star" size={18} color={Colors.star} />
                <Text style={styles.ratingText}>{business.averageRating.toFixed(1)}</Text>
              </View>
            </View>

            {!isOwner && (
              !showReviewForm ? (
                <Button
                  title="Write a Review"
                  onPress={() => setShowReviewForm(true)}
                  variant="outline"
                  style={{ marginBottom: 16 }}
                />
              ) : (
                <Card style={styles.reviewForm}>
                  <Text style={styles.reviewFormTitle}>Your Rating</Text>
                  <View style={styles.starPicker}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <TouchableOpacity key={s} onPress={() => setRating(s)}>
                        <MaterialIcons
                          name={s <= rating ? 'star' : 'star-border'}
                          size={32}
                          color={Colors.star}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="Write your review..."
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    numberOfLines={4}
                  />
                  {reviewError ? <Text style={styles.reviewErrorText}>{reviewError}</Text> : null}
                  <View style={styles.reviewActions}>
                    <Button title="Cancel" onPress={() => setShowReviewForm(false)} variant="outline" style={{ flex: 1 }} />
                    <Button title="Submit" onPress={handleSubmitReview} loading={submitting} style={{ flex: 1 }} />
                  </View>
                </Card>
              )
            )}

            {reviews.map((r) => (
              <View key={r.id}>
                <ReviewCard review={r} />
                {isOwner && !r.ownerResponse && (
                  respondingTo === r.id ? (
                    <View style={styles.respondForm}>
                      <TextInput
                        style={styles.respondInput}
                        placeholder="Write your response..."
                        value={responseText}
                        onChangeText={setResponseText}
                        multiline
                        numberOfLines={3}
                      />
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
                      <MaterialIcons name="reply" size={16} color={Colors.primary} />
                      <Text style={styles.respondBtnText}>Respond</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            ))}

            {reviews.length === 0 && (
              <Text style={styles.emptyReviews}>No reviews yet. Be the first!</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroImage: { width: '100%', height: 220 },
  placeholder: { backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  ownerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary + '10',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  ownerBannerText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  ownerActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 },
  ownerActionText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 24, fontWeight: 'bold', color: Colors.text, flex: 1 },
  category: { fontSize: 14, color: Colors.primary, marginTop: 4, textTransform: 'capitalize' },
  description: { fontSize: 15, color: Colors.text, lineHeight: 22, marginTop: 12 },
  infoCard: { marginTop: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  infoText: { fontSize: 14, color: Colors.text, flex: 1 },
  link: { color: Colors.primary },
  reviewsSection: { marginTop: 24 },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  reviewForm: { marginBottom: 16 },
  reviewFormTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  starPicker: { flexDirection: 'row', gap: 4, marginBottom: 12 },
  reviewInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 15, minHeight: 100, textAlignVertical: 'top' },
  reviewActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  emptyReviews: { textAlign: 'center', color: Colors.textLight, marginTop: 16, fontSize: 14 },
  reviewErrorText: { color: Colors.error, fontSize: 13, marginTop: 8, textAlign: 'center' },
  respondBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 8, paddingLeft: 16,
  },
  respondBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  respondForm: {
    marginLeft: 16, marginTop: 8, marginBottom: 8,
    paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: Colors.primary,
  },
  respondInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    padding: 10, fontSize: 14, minHeight: 70, textAlignVertical: 'top',
  },
  respondActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
});
