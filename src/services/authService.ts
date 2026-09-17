import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';
import { HostCountryCode } from '../constants/countries';

export async function signUp(email: string, password: string, displayName: string, hostCountry: HostCountryCode = 'US'): Promise<FirebaseUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  const userData: User = {
    uid: credential.user.uid,
    email,
    displayName,
    hostCountry,
    savedBusinesses: [],
    createdAt: Timestamp.now(),
  };
  await setDoc(doc(db, 'users', credential.user.uid), userData);
  return credential.user;
}

export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const docRef = doc(db, 'users', uid);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? (snapshot.data() as User) : null;
}

export async function updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
  const docRef = doc(db, 'users', uid);
  await setDoc(docRef, data, { merge: true });
}
