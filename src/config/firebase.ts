import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey: extra.firebaseApiKey,
  authDomain: extra.firebaseAuthDomain,
  projectId: extra.firebaseProjectId,
  storageBucket: extra.firebaseStorageBucket,
  messagingSenderId: extra.firebaseMessagingSenderId,
  appId: extra.firebaseAppId,
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Lazy singletons – call getDb() / getStorageRef() the first time you need them.
// Keeps the top-level module import safe even if firebase/firestore or
// firebase/storage have Metro resolution problems.
let _db: any = null;
export function getDb() {
  if (!_db) {
    const mod = require('firebase/firestore');
    _db = mod.getFirestore(app);
  }
  return _db;
}

let _storage: any = null;
export function getStorageRef() {
  if (!_storage) {
    const mod = require('firebase/storage');
    _storage = mod.getStorage(app);
  }
  return _storage;
}

export default app;
