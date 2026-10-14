import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where,
  orderBy, limit as firestoreLimit, startAfter, Timestamp, QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { Business, BusinessCategory, PaginatedResult } from '../types';
import { HostCountryCode } from '../constants/countries';

const COLLECTION = 'businesses';
const PAGE_SIZE = 20;
const NEAR_ME_LIMIT = 500;

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

/** Fetch all businesses (up to NEAR_ME_LIMIT) for client-side distance sorting. */
export async function getAllBusinessesForNearMe(
  hostCountry?: HostCountryCode,
): Promise<Business[]> {
  const db = getDb();
  const constraints: any[] = [];
  if (hostCountry) constraints.push(where('hostCountry', '==', hostCountry));
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(firestoreLimit(NEAR_ME_LIMIT));

  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Business));
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
  // Fetch all businesses for thorough client-side search.
  const all = await getAllBusinessesForNearMe(hostCountry);
  const lower = searchTerm.toLowerCase();
  const filtered = all.filter(
    (b) =>
      b.name?.toLowerCase().includes(lower) ||
      b.description?.toLowerCase().includes(lower) ||
      b.category?.toLowerCase().includes(lower) ||
      b.address?.toLowerCase().includes(lower) ||
      b.city?.toLowerCase().includes(lower) ||
      b.state?.toLowerCase().includes(lower) ||
      b.zipCode?.toLowerCase().includes(lower) ||
      b.countryOfOrigin?.toLowerCase().includes(lower),
  );

  // Prioritize name matches: exact start > contains > other field matches
  filtered.sort((a, b) => {
    const aName = a.name?.toLowerCase() ?? '';
    const bName = b.name?.toLowerCase() ?? '';
    const aStartsWith = aName.startsWith(lower) ? 0 : 1;
    const bStartsWith = bName.startsWith(lower) ? 0 : 1;
    if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith;

    const aIncludes = aName.includes(lower) ? 0 : 1;
    const bIncludes = bName.includes(lower) ? 0 : 1;
    return aIncludes - bIncludes;
  });

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

export async function getBusinessesByIds(ids: string[]): Promise<Business[]> {
  if (ids.length === 0) return [];
  const db = getDb();
  // Firestore 'in' queries support max 30 items per batch
  const results: Business[] = [];
  for (let i = 0; i < ids.length; i += 30) {
    const batch = ids.slice(i, i + 30);
    const q = query(collection(db, COLLECTION), where('__name__', 'in', batch));
    const snapshot = await getDocs(q);
    results.push(...snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Business)));
  }
  return results;
}
