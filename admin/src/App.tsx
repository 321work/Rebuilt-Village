import { useCallback } from "react";
import {
  FireCMS,
  useBuildNavigationController,
  NavigationRoutes,
  Scaffold,
  AppBar,
  DefaultDrawer,
} from "@firecms/core";
import type { Role, User } from "@firecms/core";
import {
  useFirebaseAuthController,
  useFirestoreDelegate,
  useFirebaseStorageSource,
  FirebaseLoginView,
} from "@firecms/firebase";

import { app } from "./firebase-config";

import { eventsCollection } from "./collections/events";
import { teamMembersCollection } from "./collections/teamMembers";
import { boardMembersCollection } from "./collections/boardMembers";
import { postsCollection } from "./collections/posts";
import { programsCollection } from "./collections/programs";
import { sponsorsCollection } from "./collections/sponsors";
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
    // Not whitelisted — return no roles (FireCMS will deny access).
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

  // Dev fallback: no claim set yet — treat founding admin account as admin.
  if (import.meta.env["DEV"] && email === "cortez@321work.com") {
    return [ADMIN_ROLE];
  }

  // Whitelisted but claim not yet set — default to editor until Admin SDK sets claim.
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
  donorsCollection,
  giftsCollection,
  grantsCollection,
];

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const authController = useFirebaseAuthController({
    firebaseApp: app,
    signInOptions: ["google.com"],
    defineRolesFor,
  });

  const firestoreDelegate = useFirestoreDelegate({ firebaseApp: app });
  const storageSource = useFirebaseStorageSource({ firebaseApp: app });

  const navigationController = useBuildNavigationController({
    authController,
    collections,
    dataSourceDelegate: firestoreDelegate,
  });

  // UI-layer whitelist gate. Real security is Firestore rules.
  const signInAllowed = useCallback((user: User | null): boolean => {
    if (!user?.email) return false;
    return ALLOWED_EMAILS.has(user.email);
  }, []);

  // ── Not signed in ─────────────────────────────────────────────────────────
  if (!authController.user) {
    return (
      <FirebaseLoginView
        authController={authController}
        firebaseApp={app}
        signInOptions={["google.com"]}
      />
    );
  }

  // ── Signed in but not on the whitelist ────────────────────────────────────
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
          Your account ({authController.user.email}) is not authorized to access
          the Rebuilt Village admin. Contact the admin to request access.
        </p>
        <button
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

  // ── Main CMS ──────────────────────────────────────────────────────────────
  return (
    <FireCMS
      authController={authController}
      dataSourceDelegate={firestoreDelegate}
      storageSource={storageSource}
      navigationController={navigationController}
    >
      {({ loading }) => {
        if (loading) {
          return (
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "system-ui, sans-serif",
                color: "#555",
              }}
            >
              Loading...
            </div>
          );
        }
        return (
          <Scaffold>
            <AppBar />
            <DefaultDrawer />
            <NavigationRoutes />
          </Scaffold>
        );
      }}
    </FireCMS>
  );
}
