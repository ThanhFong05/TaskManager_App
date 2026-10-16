import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';

const USERS_COLLECTION = 'users';

// 1. Sign Up
export const registerUser = async (
  name: string,
  email: string,
  pass: string
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const user = userCredential.user;

  // Update Auth displayName
  await updateProfile(user, {
    displayName: name.trim(),
  });

  // Create Firestore document in 'users'
  const userProfile: UserProfile = {
    id: user.uid,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    avatarUrl: null,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, USERS_COLLECTION, user.uid), userProfile);

  return user;
};

// 2. Sign In
export const loginUser = async (
  email: string,
  pass: string
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return userCredential.user;
};

// 3. Sign Out
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

// 4. Get User Profile once
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// 5. Subscribe to User Profile
export const subscribeToUserProfile = (
  uid: string,
  callback: (profile: UserProfile | null) => void
) => {
  const docRef = doc(db, USERS_COLLECTION, uid);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error subscribing to user profile:', error);
      callback(null);
    }
  );
};

// 6. Subscribe to Auth State
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
