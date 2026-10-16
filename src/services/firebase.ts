import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  getAuth,
  Auth,
} from 'firebase/auth';
// @ts-ignore - getReactNativePersistence is provided at runtime by React Native entrypoint
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyB8dEn5TyVwf_N-QOdOA_gj1NkJdRgnePY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "ass-mma.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "ass-mma",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "ass-mma.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "879031054104",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:879031054104:web:0f1e8357529006eebeb86d"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth with AsyncStorage persistence
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // If already initialized (e.g. during fast refresh)
  auth = getAuth(app);
}

export { auth };
