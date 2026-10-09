import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, orderBy, Timestamp,
} from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { VerificationRequest, VerificationStatus } from '../types';

const COLLECTION = 'verificationRequests';

/** Submit a new verification request for a business or lawyer. */
export async function submitVerificationRequest(
  entityType: 'business' | 'lawyer',
  entityId: string,
  entityName: string,
  submittedBy: string,
  phone: string,
  barAssociationNumber?: string,
): Promise<string> {
  const db = getDb();
  const entityCollection = entityType === 'business' ? 'businesses' : 'lawyers';

  // Read the entity to check current verificationStatus before writing
  const entitySnap = await getDoc(doc(db, entityCollection, entityId));
  const currentStatus = entitySnap.data()?.verificationStatus;

  // Only update the entity if it's not already pending
  // (Firestore rules only allow unverified/rejected → pending)
  if (currentStatus !== 'pending') {
    await updateDoc(doc(db, entityCollection, entityId), {
      verificationStatus: 'pending',
      claimedPhone: phone,
    });
  }

  // Create the verification request document
  const docRef = await addDoc(collection(db, COLLECTION), {
    entityType,
    entityId,
    entityName,
    submittedBy,
    phone,
    ...(barAssociationNumber && { barAssociationNumber }),
    status: 'pending' as VerificationStatus,
    submittedAt: Timestamp.now(),
  });

  return docRef.id;
}

/** Get all verification requests for a specific entity submitted by the current user. */
export async function getVerificationRequests(entityId: string, userId: string): Promise<VerificationRequest[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTION),
    where('entityId', '==', entityId),
    where('submittedBy', '==', userId),
    orderBy('submittedAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as VerificationRequest));
}

/** Get all verification requests submitted by a user. */
export async function getMyVerificationRequests(userId: string): Promise<VerificationRequest[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTION),
    where('submittedBy', '==', userId),
    orderBy('submittedAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as VerificationRequest));
}

/** Check if the current user already has a pending request for this entity. */
export async function hasPendingRequest(entityId: string, userId: string): Promise<boolean> {
  const db = getDb();
  // Use the existing composite index (entityId + submittedBy + submittedAt desc)
  // and filter status client-side to avoid needing a separate 3-equality-field index.
  const q = query(
    collection(db, COLLECTION),
    where('entityId', '==', entityId),
    where('submittedBy', '==', userId),
    orderBy('submittedAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.some((d) => d.data().status === 'pending');
}

/**
 * Ensure the entity's verificationStatus matches the fact that a pending request exists.
 * Handles the edge case where a previous attempt created the request doc but failed
 * to update the entity (e.g. due to stale rules or a network hiccup).
 */
export async function syncEntityStatus(
  entityType: 'business' | 'lawyer',
  entityId: string,
  phone: string,
): Promise<void> {
  const db = getDb();
  const entityCollection = entityType === 'business' ? 'businesses' : 'lawyers';
  const entitySnap = await getDoc(doc(db, entityCollection, entityId));
  const currentStatus = entitySnap.data()?.verificationStatus;

  if (currentStatus !== 'pending') {
    await updateDoc(doc(db, entityCollection, entityId), {
      verificationStatus: 'pending',
      claimedPhone: phone,
    });
  }
}
