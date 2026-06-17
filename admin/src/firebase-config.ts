import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// authDomain MUST be the same origin the admin is served from. The Firebase auth
// handler (/__/auth/handler) is auto-served on every Hosting site in the project,
// so each admin origin serves its own. Using the default
// rebuilt-village-web.firebaseapp.com made the handler cross-origin to this app,
// and modern browsers partition storage across origins - that broke both the popup
// (opener handshake) and the redirect (credential handoff on return). Pointing
// authDomain at the serving host keeps the whole OAuth flow first-party.
//
// REQUIREMENT: each serving host's handler must be (a) in Firebase Auth
// "Authorized domains" AND (b) an "Authorized redirect URI" on the Google OAuth
// web client, e.g. https://admin-rebuiltvillage.web.app/__/auth/handler and later
// https://admin.rebuiltvillage.org/__/auth/handler.
const firebaseConfig = {
  apiKey: "AIzaSyA2fiaZfGYZQYVyw6yqg0kkkmg1Gv3tkjs",
  authDomain:
    typeof window !== "undefined"
      ? window.location.hostname
      : "admin-rebuiltvillage.web.app",
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
