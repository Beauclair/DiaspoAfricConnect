import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy,
  limit as firestoreLimit, startAfter, Timestamp, QueryDocumentSnapshot,
  getCountFromServer,
} from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { LegalGuide, Lawyer, LegalCategory, ImmigrationCategory, PaginatedResult } from '../types';
import { HostCountryCode, LEGAL_CATEGORIES } from '../constants/countries';

const PAGE_SIZE = 20;

// ── Guides ──────────────────────────────────────────────────────────

export async function getGuides(
  hostCountry?: HostCountryCode,
  cursor?: unknown,
): Promise<PaginatedResult<LegalGuide>> {
  const db = getDb();
  const constraints: any[] = [];
  if (hostCountry) constraints.push(where('hostCountry', '==', hostCountry));
  constraints.push(orderBy('lastUpdated', 'desc'));
  if (cursor) constraints.push(startAfter(cursor as QueryDocumentSnapshot));
  constraints.push(firestoreLimit(PAGE_SIZE));

  const q = query(collection(db, 'legalGuides'), ...constraints);
  const snapshot = await getDocs(q);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return {
    data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as LegalGuide)),
    lastDoc,
    hasMore: snapshot.docs.length === PAGE_SIZE,
  };
}

export async function getGuideById(id: string): Promise<LegalGuide | null> {
  const db = getDb();
  const snapshot = await getDoc(doc(db, 'legalGuides', id));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as LegalGuide) : null;
}

export async function getGuidesByCategory(
  category: ImmigrationCategory,
  hostCountry?: HostCountryCode,
  cursor?: unknown,
): Promise<PaginatedResult<LegalGuide>> {
  const db = getDb();
  const constraints: any[] = [where('category', '==', category)];
  if (hostCountry) constraints.push(where('hostCountry', '==', hostCountry));
  constraints.push(orderBy('lastUpdated', 'desc'));
  if (cursor) constraints.push(startAfter(cursor as QueryDocumentSnapshot));
  constraints.push(firestoreLimit(PAGE_SIZE));

  const q = query(collection(db, 'legalGuides'), ...constraints);
  const snapshot = await getDocs(q);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return {
    data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as LegalGuide)),
    lastDoc,
    hasMore: snapshot.docs.length === PAGE_SIZE,
  };
}

export async function getGuidesByLegalCategory(
  legalCategory: LegalCategory,
  hostCountry?: HostCountryCode,
  cursor?: unknown,
): Promise<PaginatedResult<LegalGuide>> {
  const db = getDb();
  const constraints: any[] = [where('legalCategory', '==', legalCategory)];
  if (hostCountry) constraints.push(where('hostCountry', '==', hostCountry));
  constraints.push(orderBy('lastUpdated', 'desc'));
  if (cursor) constraints.push(startAfter(cursor as QueryDocumentSnapshot));
  constraints.push(firestoreLimit(PAGE_SIZE));

  const q = query(collection(db, 'legalGuides'), ...constraints);
  const snapshot = await getDocs(q);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return {
    data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as LegalGuide)),
    lastDoc,
    hasMore: snapshot.docs.length === PAGE_SIZE,
  };
}

/** Returns guide count per legal category (for the current hostCountry). */
export async function getGuideCountsByCategory(
  hostCountry?: HostCountryCode,
): Promise<Record<LegalCategory, number>> {
  const db = getDb();
  const counts = {} as Record<LegalCategory, number>;

  await Promise.all(
    LEGAL_CATEGORIES.map(async (cat) => {
      const constraints: any[] = [where('legalCategory', '==', cat.key)];
      if (hostCountry) constraints.push(where('hostCountry', '==', hostCountry));
      const q = query(collection(db, 'legalGuides'), ...constraints);
      const snap = await getCountFromServer(q);
      counts[cat.key] = snap.data().count;
    }),
  );

  return counts;
}

// ── Lawyers ─────────────────────────────────────────────────────────

export async function getLawyers(
  hostCountry?: HostCountryCode,
  cursor?: unknown,
): Promise<PaginatedResult<Lawyer>> {
  const db = getDb();
  const constraints: any[] = [];
  if (hostCountry) constraints.push(where('hostCountry', '==', hostCountry));
  constraints.push(orderBy('averageRating', 'desc'));
  if (cursor) constraints.push(startAfter(cursor as QueryDocumentSnapshot));
  constraints.push(firestoreLimit(PAGE_SIZE));

  const q = query(collection(db, 'lawyers'), ...constraints);
  const snapshot = await getDocs(q);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return {
    data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Lawyer)),
    lastDoc,
    hasMore: snapshot.docs.length === PAGE_SIZE,
  };
}

export async function getLawyerById(id: string): Promise<Lawyer | null> {
  const db = getDb();
  const snapshot = await getDoc(doc(db, 'lawyers', id));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Lawyer) : null;
}

export async function getLawyersByPracticeArea(
  practiceArea: LegalCategory,
  hostCountry?: HostCountryCode,
  cursor?: unknown,
): Promise<PaginatedResult<Lawyer>> {
  const db = getDb();
  const constraints: any[] = [where('specializations', 'array-contains', practiceArea)];
  if (hostCountry) constraints.push(where('hostCountry', '==', hostCountry));
  constraints.push(orderBy('averageRating', 'desc'));
  if (cursor) constraints.push(startAfter(cursor as QueryDocumentSnapshot));
  constraints.push(firestoreLimit(PAGE_SIZE));

  const q = query(collection(db, 'lawyers'), ...constraints);
  const snapshot = await getDocs(q);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return {
    data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Lawyer)),
    lastDoc,
    hasMore: snapshot.docs.length === PAGE_SIZE,
  };
}

export async function searchLawyers(
  searchTerm: string,
  hostCountry?: HostCountryCode,
): Promise<PaginatedResult<Lawyer>> {
  // Client-side filter over one page — caps Firestore reads.
  const page = await getLawyers(hostCountry);
  const lower = searchTerm.toLowerCase();
  const filtered = page.data.filter(
    (l) =>
      l.name?.toLowerCase().includes(lower) ||
      l.firm?.toLowerCase().includes(lower) ||
      l.city?.toLowerCase().includes(lower) ||
      (l.specializations ?? []).some((s) => s?.toLowerCase().includes(lower)),
  );
  return { data: filtered, lastDoc: null, hasMore: false };
}

export async function addLawyer(
  lawyer: Omit<Lawyer, 'id' | 'createdAt' | 'averageRating' | 'reviewCount' | 'verificationStatus'>,
): Promise<string> {
  const db = getDb();
  const docRef = await addDoc(collection(db, 'lawyers'), {
    ...lawyer,
    averageRating: 0,
    reviewCount: 0,
    verificationStatus: 'unverified',
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateLawyer(id: string, data: Partial<Lawyer>): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, 'lawyers', id), data);
}

export async function deleteLawyer(id: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, 'lawyers', id));
}

export async function getLawyersByOwner(ownerId: string): Promise<Lawyer[]> {
  const db = getDb();
  const q = query(collection(db, 'lawyers'), where('ownerId', '==', ownerId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Lawyer));
}
