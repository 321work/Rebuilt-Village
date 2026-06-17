/**
 * set-custom-claims — one-off: set a role claim on a Firebase Auth user.
 *
 * The FireCMS admin and firestore.rules read `request.auth.token.role`
 * ('admin' | 'editor'). A user only exists in Auth AFTER they have signed in
 * once at https://admin-rebuiltvillage.web.app, so run this only after sign-in.
 *
 * Usage (targets production via Application Default Credentials):
 *   npx tsx scripts/set-custom-claims.ts <email> <role>
 *   e.g.  npx tsx scripts/set-custom-claims.ts cortez@321work.com admin
 *
 * Defaults: email cortez@321work.com, role admin.
 */
import { createRequire } from 'module';

// firebase-admin ships CommonJS; require() avoids the ESM named-export gap.
const require = createRequire(import.meta.url);
const admin = require('firebase-admin') as typeof import('firebase-admin');

const email = process.argv[2] ?? 'cortez@321work.com';
const role = process.argv[3] ?? 'admin';

if (role !== 'admin' && role !== 'editor') {
  console.error(`Invalid role "${role}". Use "admin" or "editor".`);
  process.exit(1);
}

admin.initializeApp({ projectId: 'rebuilt-village-web' });

(async () => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role });
    console.log(`OK: set role="${role}" on ${email} (uid ${user.uid}).`);
    console.log('The user must sign out and back in for the new claim to take effect in their ID token.');
    process.exit(0);
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'auth/user-not-found') {
      console.error(
        `No Auth user for ${email} yet. Sign in once at https://admin-rebuiltvillage.web.app, then re-run.`,
      );
    } else {
      console.error('Failed:', (err as Error)?.message ?? err);
    }
    process.exit(1);
  }
})();
