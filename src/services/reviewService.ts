import {
  collection, addDoc, getDocs, getDoc, query, where, orderBy, Timestamp, doc, updateDoc, increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Review } from '../types';

export async function getReviewsForBusiness(businessId: string): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    where('businessId', '==', businessId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
}

export async function addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...review,
    createdAt: Timestamp.now(),
  });

  const bizRef = doc(db, 'businesses', review.businessId);
  const bizSnap = await getDoc(bizRef);

  if (bizSnap.exists()) {
    const data = bizSnap.data();
    const oldCount = data.reviewCount || 0;
    const oldAvg = data.averageRating || 0;
    const newCount = oldCount + 1;
    const newAvg = (oldAvg * oldCount + review.rating) / newCount;

    await updateDoc(bizRef, {
      averageRating: Math.round(newAvg * 10) / 10,
      reviewCount: newCount,
    });
  }

  return docRef.id;
}

export async function respondToReview(reviewId: string, response: string): Promise<void> {
  await updateDoc(doc(db, 'reviews', reviewId), {
    ownerResponse: response,
    ownerResponseAt: Timestamp.now(),
  });
}
