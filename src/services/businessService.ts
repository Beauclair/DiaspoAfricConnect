import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where,
  orderBy, limit as firestoreLimit, Timestamp,
} from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { Business, BusinessCategory } from '../types';
import { HostCountryCode } from '../constants/countries';

const COLLECTION = 'businesses';

export async function getBusinesses(hostCountry?: HostCountryCode): Promise<Business[]> {
  const db = getDb();
  const constraints: any[] = [];
  if (hostCountry) constraints.push(where('hostCountry', '==', hostCountry));
  constraints.push(orderBy('createdAt', 'desc'), firestoreLimit(100));
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

export async function getBusinessesByCategory(category: BusinessCategory, hostCountry?: HostCountryCode): Promise<Business[]> {
  const db = getDb();
  const constraints: any[] = [where('category', '==', category)];
  if (hostCountry) constraints.push(where('hostCountry', '==', hostCountry));
  constraints.push(orderBy('createdAt', 'desc'));
  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Business));
}

export async function searchBusinesses(searchTerm: string, hostCountry?: HostCountryCode): Promise<Business[]> {
  const all = await getBusinesses(hostCountry);
  const lower = searchTerm.toLowerCase();
  return all.filter(
    (b) =>
      b.name.toLowerCase().includes(lower) ||
      b.description.toLowerCase().includes(lower) ||
      b.city.toLowerCase().includes(lower) ||
      b.countryOfOrigin.toLowerCase().includes(lower)
  );
}

export async function addBusiness(business: Omit<Business, 'id' | 'createdAt' | 'averageRating' | 'reviewCount'>): Promise<string> {
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...business,
    averageRating: 0,
    reviewCount: 0,
    isVerified: false,
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
