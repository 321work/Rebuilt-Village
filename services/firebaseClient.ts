/**
 * firebaseClient — frontend Firebase initialization for the main site.
 *
 * The web config below is NOT secret. These values ship in every client bundle
 * by design (they identify the project, they don't authorize privileged access;
 * Firestore security rules are the real gate). Actual secrets live in Google
 * Secret Manager / GitHub Actions and never appear here or in any .env file.
 *
 * In development (`import.meta.env.DEV`) we point Firestore and Storage at the
 * local emulators so content work never touches production data. Production
 * builds talk to live Firestore. If an emulator is not running in dev, reads
 * simply throw and the data services fall back to their FALLBACK_* arrays.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore';
import {
  getStorage,
  connectStorageEmulator,
  type FirebaseStorage,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyA2fiaZfGYZQYVyw6yqg0kkkmg1Gv3tkjs',
  authDomain: 'rebuilt-village-web.firebaseapp.com',
  projectId: 'rebuilt-village-web',
  storageBucket: 'rebuilt-village-web.firebasestorage.app',
  messagingSenderId: '903273862134',
  appId: '1:903273862134:web:e1ac3e7ac248be7364add7',
};

export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Connect to local emulators in development only. The global guard prevents
// double-connect on Vite HMR or repeated module imports (which would throw).
declare global {
  // eslint-disable-next-line no-var
  var __RV_EMULATORS_CONNECTED__: boolean | undefined;
}

if (import.meta.env.DEV && !globalThis.__RV_EMULATORS_CONNECTED__) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  globalThis.__RV_EMULATORS_CONNECTED__ = true;
}
