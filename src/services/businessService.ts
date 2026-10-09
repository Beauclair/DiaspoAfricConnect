import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where,
  orderBy, limit as firestoreLimit, startAfter, Timestamp, QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { Business, BusinessCategory, PaginatedResult } from '../types';
import { HostCountryCode } from '../constants/countries';

const COLLECTION = 'businesses';
const PAGE_SIZE = 20;

export async function getBusinesses(
  hostCountry?: HostCountryCode,
  cursor?: unknown,
): Promise<PaginatedResult<Business>> {
  const db = getDb();
  const constraints: any[] = [];
  if (hostCountry) constraints.push(where('hostCountry', '==', hostCountry));
  constraints.push(orderBy('createdAt', 'desc'));
  if (cursor) constraints.push(startAfter(cursor as QueryDocumentSnapshot));
  constraints.push(firestoreLimit(PAGE_SIZE));

  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return {
    data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Business)),
    lastDoc,
    hasMore: snapshot.docs.length === PAGE_SIZE,
  };
}

/** Fetch a limited number of recent businesses — avoids over-fetching for home screen. */
export async function getRecentBusinesses(hostCountry?: HostCountryCode, count = 5): Promise<Business[]> {
  const db = getDb();
  const constraints: any[] = [];
  if (hostCountry) constraints.push(where('hostCountry', '==', hostCountry));
  constraints.push(orderBy('createdAt', 'desc'), firestoreLimit(count));
  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Business));
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const db = getDb();
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Business) : null;
}

export async function getBusinessesByCategory(
  category: BusinessCategory,
  hostCountry?: HostCountryCode,
  cursor?: unknown,
): Promise<PaginatedResult<Business>> {
  const db = getDb();
  const constraints: any[] = [where('category', '==', category)];
  if (hostCountry) constraints.push(where('hostCountry', '==', hostCountry));
  constraints.push(orderBy('createdAt', 'desc'));
  if (cursor) constraints.push(startAfter(cursor as QueryDocumentSnapshot));
  constraints.push(firestoreLimit(PAGE_SIZE));

  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return {
    data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Business)),
    lastDoc,
    hasMore: snapshot.docs.length === PAGE_SIZE,
  };
}

export async function searchBusinesses(
  searchTerm: string,
  hostCountry?: HostCountryCode,
): Promise<PaginatedResult<Business>> {
  // Client-side filter over one page — caps Firestore reads at PAGE_SIZE.
  const page = await getBusinesses(hostCountry);
  const lower = searchTerm.toLowerCase();
  const filtered = page.data.filter(
    (b) =>
      b.name?.toLowerCase().includes(lower) ||
      b.description?.toLowerCase().includes(lower) ||
      b.city?.toLowerCase().includes(lower) ||
      b.countryOfOrigin?.toLowerCase().includes(lower),
  );
  return { data: filtered, lastDoc: null, hasMore: false };
}

export async function addBusiness(business: Omit<Business, 'id' | 'createdAt' | 'averageRating' | 'reviewCount' | 'isVerified' | 'verificationStatus'>): Promise<string> {
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...business,
    averageRating: 0,
    reviewCount: 0,
    isVerified: false,
    verificationStatus: 'unverified',
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateBusiness(id: string, data: Partial<Business>): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function getBusinessesByOwner(ownerId: string): Promise<Business[]> {
  const db = getDb();
  const q = query(collection(db, COLLECTION), where('ownerId', '==', ownerId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Business));
}

export async function deleteBusiness(id: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTION, id));
}
