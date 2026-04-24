import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = getApps().length ? getApps()[0] : initializeApp();
const db = getFirestore(app);

export { app, db };

