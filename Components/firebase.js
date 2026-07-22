import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Shared across every prototype — one Firebase project backs the Dev
// Comments feature repo-wide. This config is meant to be public in client
// code (Firebase enforces access via Firestore security rules, not by
// hiding these values) — see Firestore rules in the console for the real
// access control.
const firebaseConfig = {
  apiKey: 'AIzaSyDhUBEr6vmQ2hbkojsYr7ST9uA2YC8i3bk',
  authDomain: 'pass-prototypes.firebaseapp.com',
  projectId: 'pass-prototypes',
  storageBucket: 'pass-prototypes.firebasestorage.app',
  messagingSenderId: '504110357208',
  appId: '1:504110357208:web:a4419dab2e7a157ce195ad',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
