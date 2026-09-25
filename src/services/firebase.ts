import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB8dEn5TyVwf_N-QOdOA_gj1NkJdRgnePY",
  authDomain: "ass-mma.firebaseapp.com",
  projectId: "ass-mma",
  storageBucket: "ass-mma.firebasestorage.app",
  messagingSenderId: "879031054104",
  appId: "1:879031054104:web:0f1e8357529006eebeb86d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
