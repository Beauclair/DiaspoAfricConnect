import {
  collection, doc, getDocs, getDoc, addDoc, query, where, orderBy, Timestamp,
} from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { ImmigrationGuide, Lawyer, ImmigrationCategory } from '../types';
import { HostCountryCode } from '../constants/countries';

export async function getGuides(hostCountry?: HostCountryCode): Promise<ImmigrationGuide[]> {
  const db = getDb();
  const constraints: any[] = [];
  if (hostCountry) constraints.push(where('hostCountry', '==', hostCountry));
  constraints.push(orderBy('lastUpdated', 'desc'));
  const q = query(collection(db, 'immigrationGuides'), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ImmigrationGuide));
}

export async function getGuideById(id: string): Promise<ImmigrationGuide | null> {
  const db = getDb();
  const snapshot = await getDoc(doc(db, 'immigrationGuides', id));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as ImmigrationGuide) : null;
}

export async function getGuidesByCategory(category: ImmigrationCategory, hostCountry?: HostCountryCode): Promise<ImmigrationGuide[]> {
  const db = getDb();
  const constraints: any[] = [where('category', '==', category)];
  if (hostCountry) constraints.push(where('hostCountry', '==', hostCountry));
  constraints.push(orderBy('lastUpdated', 'desc'));
  const q = query(collection(db, 'immigrationGuides'), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ImmigrationGuide));
}

export async function getLawyers(hostCountry?: HostCountryCode): Promise<Lawyer[]> {
  const db = getDb();
  const constraints: any[] = [];
  if (hostCountry) constraints.push(where('hostCountry', '==', hostCountry));
  constraints.push(orderBy('averageRating', 'desc'));
  const q = query(collection(db, 'lawyers'), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Lawyer));
}

export async function getLawyerById(id: string): Promise<Lawyer | null> {
  const db = getDb();
  const snapshot = await getDoc(doc(db, 'lawyers', id));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Lawyer) : null;
}

export async function searchLawyers(searchTerm: string, hostCountry?: HostCountryCode): Promise<Lawyer[]> {
  const all = await getLawyers(hostCountry);
  const lower = searchTerm.toLowerCase();
  return all.filter(
    (l) =>
      l.name.toLowerCase().includes(lower) ||
      l.firm.toLowerCase().includes(lower) ||
      l.city.toLowerCase().includes(lower) ||
      l.specializations.some((s) => s.toLowerCase().includes(lower))
  );
}

export async function addLawyer(lawyer: Omit<Lawyer, 'id' | 'createdAt' | 'averageRating' | 'reviewCount'>): Promise<string> {
  const db = getDb();
  const docRef = await addDoc(collection(db, 'lawyers'), {
    ...lawyer,
    averageRating: 0,
    reviewCount: 0,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}
