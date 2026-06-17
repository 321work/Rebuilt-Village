import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2fiaZfGYZQYVyw6yqg0kkkmg1Gv3tkjs",
  authDomain: "rebuilt-village-web.firebaseapp.com",
  projectId: "rebuilt-village-web",
  storageBucket: "rebuilt-village-web.firebasestorage.app",
  messagingSenderId: "903273862134",
  appId: "1:903273862134:web:e1ac3e7ac248be7364add7",
};

// Initialise only once (Vite HMR can re-run this module).
const app =
  getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// In dev mode, point all three SDKs at the local emulators.
// Guard against double-connect on HMR by checking a global flag.
declare global {
  interface Window {
    __emulatorsConnected?: boolean;
  }
}

if (import.meta.env["DEV"] && !window.__emulatorsConnected) {
  window.__emulatorsConnected = true;
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(firestore, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
}

export { app };
