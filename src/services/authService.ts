import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, getDb } from '../config/firebase';
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
  await setDoc(doc(getDb(), 'users', credential.user.uid), userData);

  // Send branded verification email via Cloud Function.
  const functions = getFunctions();
  const sendVerification = httpsCallable(functions, 'sendVerificationEmail');
  await sendVerification();

  return credential.user;
}

/** Re-send the verification email for the currently signed-in user. */
export async function resendVerificationEmail(): Promise<void> {
  if (!auth.currentUser) throw new Error('Not signed in');
  const functions = getFunctions();
  const sendVerification = httpsCallable(functions, 'sendVerificationEmail');
  await sendVerification();
}

export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  const functions = getFunctions();
  const sendReset = httpsCallable(functions, 'sendPasswordResetEmail');
  await sendReset({ email });
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const docRef = doc(getDb(), 'users', uid);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? (snapshot.data() as User) : null;
}

export async function updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
  const docRef = doc(getDb(), 'users', uid);
  await setDoc(docRef, data, { merge: true });
}

export async function deleteAccount(): Promise<void> {
  const functions = getFunctions();
  const deleteFn = httpsCallable(functions, 'deleteAccount');
  await deleteFn();
  // Sign out locally so the client auth state is cleared after server-side deletion.
  await signOut(auth);
}
