import {
  collection, addDoc, getDocs, getDoc, query, where, orderBy,
  limit as firestoreLimit, startAfter, Timestamp, doc, updateDoc, deleteDoc,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { Review, PaginatedResult } from '../types';

const REVIEW_PAGE_SIZE = 15;

// ── Business reviews ──

export async function getReviewsForBusiness(
  businessId: string,
  cursor?: unknown,
): Promise<PaginatedResult<Review>> {
  const db = getDb();
  const constraints: any[] = [
    where('businessId', '==', businessId),
    orderBy('createdAt', 'desc'),
  ];
  if (cursor) constraints.push(startAfter(cursor as QueryDocumentSnapshot));
  constraints.push(firestoreLimit(REVIEW_PAGE_SIZE));

  const q = query(collection(db, 'reviews'), ...constraints);
  const snapshot = await getDocs(q);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return {
    data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review)),
    lastDoc,
    hasMore: snapshot.docs.length === REVIEW_PAGE_SIZE,
  };
}

export async function addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
  const db = getDb();

  // Fetch business to store ownerId on the review (required by Firestore rules
  // so the business owner can respond to reviews).
  const bizRef = doc(db, 'businesses', review.businessId!);
  const bizSnap = await getDoc(bizRef);
  if (!bizSnap.exists()) throw new Error('Business not found');
  const businessOwnerId = bizSnap.data().ownerId;
  if (!businessOwnerId) throw new Error('Business has no owner');

  const docRef = await addDoc(collection(db, 'reviews'), {
    ...review,
    businessOwnerId,
    createdAt: Timestamp.now(),
  });

  // Rating stats (averageRating, reviewCount) are recalculated server-side
  // by the onReviewCreate Cloud Function using the Admin SDK.

  return docRef.id;
}

export async function updateReview(
  reviewId: string,
  _businessId: string,
  newRating: number,
  newComment: string
): Promise<void> {
  const db = getDb();
  const reviewRef = doc(db, 'reviews', reviewId);

  await updateDoc(reviewRef, {
    rating: newRating,
    comment: newComment,
    updatedAt: Timestamp.now(),
  });

  // Rating stats are recalculated server-side by the onReviewUpdate Cloud Function.
}

export async function deleteReview(reviewId: string, _businessId: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, 'reviews', reviewId));

  // Rating stats are recalculated server-side by the onReviewDelete Cloud Function.
}

// ── Lawyer reviews ──

export async function getReviewsForLawyer(
  lawyerId: string,
  cursor?: unknown,
): Promise<PaginatedResult<Review>> {
  const db = getDb();
  const constraints: any[] = [
    where('lawyerId', '==', lawyerId),
    orderBy('createdAt', 'desc'),
  ];
  if (cursor) constraints.push(startAfter(cursor as QueryDocumentSnapshot));
  constraints.push(firestoreLimit(REVIEW_PAGE_SIZE));

  const q = query(collection(db, 'reviews'), ...constraints);
  const snapshot = await getDocs(q);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return {
    data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review)),
    lastDoc,
    hasMore: snapshot.docs.length === REVIEW_PAGE_SIZE,
  };
}

export async function addLawyerReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
  const db = getDb();

  // Fetch lawyer to store ownerId on the review (required by Firestore rules
  // so the lawyer can respond to reviews).
  const lawyerRef = doc(db, 'lawyers', review.lawyerId!);
  const lawyerSnap = await getDoc(lawyerRef);
  if (!lawyerSnap.exists()) throw new Error('Attorney not found');
  const lawyerOwnerId = lawyerSnap.data().ownerId;
  if (!lawyerOwnerId) throw new Error('Attorney has no owner');

  const docRef = await addDoc(collection(db, 'reviews'), {
    ...review,
    lawyerOwnerId,
    createdAt: Timestamp.now(),
  });

  // Rating stats are recalculated server-side by the onReviewCreate Cloud Function.

  return docRef.id;
}

export async function updateLawyerReview(
  reviewId: string,
  _lawyerId: string,
  newRating: number,
  newComment: string
): Promise<void> {
  const db = getDb();
  const reviewRef = doc(db, 'reviews', reviewId);

  await updateDoc(reviewRef, {
    rating: newRating,
    comment: newComment,
    updatedAt: Timestamp.now(),
  });

  // Rating stats are recalculated server-side by the onReviewUpdate Cloud Function.
}

export async function deleteLawyerReview(reviewId: string, _lawyerId: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, 'reviews', reviewId));

  // Rating stats are recalculated server-side by the onReviewDelete Cloud Function.
}

// ── Shared ──

export async function respondToReview(reviewId: string, response: string): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, 'reviews', reviewId), {
    ownerResponse: response,
    ownerResponseAt: Timestamp.now(),
  });
}
