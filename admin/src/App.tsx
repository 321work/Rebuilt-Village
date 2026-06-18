import { useCallback, useEffect, useState } from "react";
import {
  FireCMS,
  useBuildNavigationController,
  useBuildModeController,
  ModeControllerProvider,
  SnackbarProvider,
  CircularProgressCenter,
  NavigationRoutes,
  Scaffold,
  AppBar,
  Drawer,
  SideDialogs,
} from "@firecms/core";
import type { Role, User } from "@firecms/core";
import {
  useFirebaseAuthController,
  useFirestoreDelegate,
  useFirebaseStorageSource,
} from "@firecms/firebase";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

import { app, auth } from "./firebase-config";

import { eventsCollection } from "./collections/events";
import { teamMembersCollection } from "./collections/teamMembers";
import { boardMembersCollection } from "./collections/boardMembers";
import { postsCollection } from "./collections/posts";
import { programsCollection } from "./collections/programs";
import { sponsorsCollection } from "./collections/sponsors";
import { documentsCollection } from "./collections/documents";
import { donorsCollection } from "./collections/donors";
import { giftsCollection } from "./collections/gifts";
import { grantsCollection } from "./collections/grants";

// ─── Email whitelist ────────────────────────────────────────────────────────
// In production: add Tony, Jess, and Amanda's emails before deploying.
const ALLOWED_EMAILS = new Set([
  "cortez@321work.com",
  // "tony@<domain>",
  // "jess@<domain>",
  // "amanda@<domain>",
]);

// ─── Role definitions ────────────────────────────────────────────────────────
const ADMIN_ROLE: Role = {
  id: "admin",
  name: "Admin",
  isAdmin: true,
};

const EDITOR_ROLE: Role = {
  id: "editor",
  name: "Editor",
  isAdmin: false,
  defaultPermissions: {
    read: true,
    create: true,
    edit: true,
    delete: false,
  },
};

// ─── Role resolver ────────────────────────────────────────────────────────────
// Called by useFirebaseAuthController after sign-in. Must return Role[] objects.
// Reads the custom claim `role` from the Firebase ID token.
// Falls back to admin for cortez@321work.com in dev when no claim is set.
async function defineRolesFor(user: User): Promise<Role[] | undefined> {
  const email = user.email ?? "";

  if (!ALLOWED_EMAILS.has(email)) {
    // Not whitelisted - return no roles (FireCMS will deny access).
    return undefined;
  }

  // Read the ID token claim. FirebaseUserWrapper includes getIdTokenResult.
  const firebaseUser = user as unknown as {
    getIdTokenResult?: (forceRefresh?: boolean) => Promise<{
      claims: Record<string, unknown>;
    }>;
  };

  if (firebaseUser.getIdTokenResult) {
    const tokenResult = await firebaseUser.getIdTokenResult(false);
    const claimedRole = tokenResult?.claims?.role as string | undefined;
    if (claimedRole === "admin") return [ADMIN_ROLE];
    if (claimedRole === "editor") return [EDITOR_ROLE];
  }

  // Dev fallback: no claim set yet - treat founding admin account as admin.
  if (import.meta.env["DEV"] && email === "cortez@321work.com") {
    return [ADMIN_ROLE];
  }

  // Whitelisted but claim not yet set - default to editor until Admin SDK sets claim.
  return [EDITOR_ROLE];
}

// ─── Collections ─────────────────────────────────────────────────────────────
const collections = [
  eventsCollection,
  teamMembersCollection,
  boardMembersCollection,
  postsCollection,
  programsCollection,
  sponsorsCollection,
  documentsCollection,
  donorsCollection,
  giftsCollection,
  grantsCollection,
];

// ─── Google sign-in (redirect flow) ──────────────────────────────────────────
// FireCMS's built-in FirebaseLoginView uses signInWithPopup. That fails here with
// "The requested action is invalid." because the auth handler at the default
// authDomain (rebuilt-village-web.firebaseapp.com) is cross-origin to this app
// (admin-rebuiltvillage.web.app), and modern-browser cross-origin isolation
// (COOP / storage partitioning) blocks the popup→opener handshake the handler
// needs to verify the calling domain. signInWithRedirect has no opener and works.
function startGoogleRedirect() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithRedirect(auth, provider);
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const authController = useFirebaseAuthController({
    firebaseApp: app,
    defineRolesFor,
  });

  // Surface any redirect sign-in error and finalize the pending credential on
  // return from Google. The resolved user flows into FireCMS via the auth
  // controller's onAuthStateChanged listener - no extra wiring needed.
  const [signInError, setSignInError] = useState<string | null>(null);
  useEffect(() => {
    getRedirectResult(auth).catch((e: unknown) => {
      const err = e as { code?: string; message?: string };
      setSignInError(err.code ?? err.message ?? "sign-in-failed");
    });
  }, []);

  const firestoreDelegate = useFirestoreDelegate({ firebaseApp: app });
  const storageSource = useFirebaseStorageSource({ firebaseApp: app });

  const navigationController = useBuildNavigationController({
    authController,
    collections,
    dataSourceDelegate: firestoreDelegate,
  });

  // Theme/mode controller - REQUIRED. Without ModeControllerProvider the
  // FireCMS UI (and the login view) render blank.
  const modeController = useBuildModeController();

  // UI-layer whitelist gate. Real security is Firestore rules.
  const signInAllowed = useCallback((user: User | null): boolean => {
    if (!user?.email) return false;
    return ALLOWED_EMAILS.has(user.email);
  }, []);

  return (
    <SnackbarProvider>
      <ModeControllerProvider value={modeController}>
        <FireCMS
          authController={authController}
          dataSourceDelegate={firestoreDelegate}
          storageSource={storageSource}
          navigationController={navigationController}
        >
          {({ loading }) => {
            if (loading) {
              return <CircularProgressCenter />;
            }

            // Not signed in - show the Google login screen (redirect flow).
            if (!authController.user) {
              return (
                <div
                  style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "system-ui, sans-serif",
                    background: "#f5f5f5",
                    gap: "1.5rem",
                    padding: "2rem",
                    textAlign: "center",
                  }}
                >
                  <h1 style={{ fontSize: "1.5rem", color: "#1a1a1a", margin: 0 }}>
                    Rebuilt Village Admin
                  </h1>
                  <p style={{ color: "#555", maxWidth: 360, margin: 0 }}>
                    Sign in with your authorized Google account to manage site
                    content.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInError(null);
                      startGoogleRedirect().catch((e: unknown) => {
                        const err = e as { code?: string; message?: string };
                        setSignInError(err.code ?? err.message ?? "sign-in-failed");
                      });
                    }}
                    style={{
                      padding: "0.65rem 1.5rem",
                      background: "#1a1a1a",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: "0.95rem",
                    }}
                  >
                    Sign in with Google
                  </button>
                  {signInError && (
                    <p style={{ color: "#b00020", fontSize: "0.85rem", margin: 0 }}>
                      Sign-in failed: {signInError}
                    </p>
                  )}
                </div>
              );
            }

            // Signed in but not on the whitelist - access denied.
            if (!signInAllowed(authController.user)) {
              return (
                <div
                  style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "system-ui, sans-serif",
                    background: "#f5f5f5",
                    gap: "1rem",
                    padding: "2rem",
                    textAlign: "center",
                  }}
                >
                  <h1 style={{ fontSize: "1.5rem", color: "#1a1a1a" }}>Access denied</h1>
                  <p style={{ color: "#555", maxWidth: 400 }}>
                    Your account ({authController.user.email}) is not authorized to
                    access the Rebuilt Village admin. Contact the admin to request
                    access.
                  </p>
                  <button
                    type="button"
                    onClick={() => authController.signOut()}
                    style={{
                      padding: "0.5rem 1.25rem",
                      background: "#1a1a1a",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    Sign out
                  </button>
                </div>
              );
            }

            // Authorized - full CMS. Drawer (not DefaultDrawer) is the
            // Scaffold-integrated sidebar; SideDialogs powers the record-edit
            // side panels.
            return (
              <Scaffold autoOpenDrawer={false}>
                <AppBar title="Rebuilt Village" />
                <Drawer />
                <NavigationRoutes />
                <SideDialogs />
              </Scaffold>
            );
          }}
        </FireCMS>
      </ModeControllerProvider>
    </SnackbarProvider>
  );
}
