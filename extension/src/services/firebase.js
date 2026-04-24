import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth/web-extension';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyCa9RleIZj90KQoZjS-9Z-4esrxi7tsAp8',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'autoassign-c23b7.firebaseapp.com',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || 'autoassign-c23b7',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'autoassign-c23b7.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '717700897285',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:717700897285:web:7aefc987d286fd6c32da6c',
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-TVFK24SL72'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, firebaseConfig };
