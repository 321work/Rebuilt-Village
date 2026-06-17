/**
 * migrate-fallbacks-to-firestore.ts
 *
 * One-time idempotent migration: writes FALLBACK_* content from the seed-data
 * file into the corresponding Firestore collections.
 *
 * Idempotency guarantee: every document is written with set() using a
 * deterministic doc ID derived from the source data (event id, kebab-cased
 * name, or slug). Re-running updates documents in place; it does not create
 * duplicates.
 *
 * Safety:
 *   - Connects to the Firestore emulator when FIRESTORE_EMULATOR_HOST is set.
 *   - When FIRESTORE_EMULATOR_HOST is NOT set, the script refuses to run
 *     unless the RUN_AGAINST_PRODUCTION env var is explicitly set to "yes".
 *     Production writes must be confirmed by the lead developer.
 *
 * Usage (emulator):
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 npm run migrate:fallbacks
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// firebase-admin ships CommonJS; require() avoids the ESM named-export gap.
const admin = require('firebase-admin') as typeof import('firebase-admin');

import {
  SEED_EVENTS,
  SEED_TEAM_MEMBERS,
  SEED_BOARD_MEMBERS,
  SEED_PROGRAMS,
  SEED_POSTS,
} from './seed-data.js';
import { COLLECTIONS } from '../types/firestore.js';

// ─── Safety gate ─────────────────────────────────────────────────────────────

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
const runAgainstProduction = process.env.RUN_AGAINST_PRODUCTION === 'yes';

if (!emulatorHost && !runAgainstProduction) {
  console.error(
    'ERROR: FIRESTORE_EMULATOR_HOST is not set and RUN_AGAINST_PRODUCTION is not "yes".\n' +
      'To run against the emulator:\n' +
      '  FIRESTORE_EMULATOR_HOST=localhost:8080 npm run migrate:fallbacks\n' +
      'To run against production (only after emulator verification, with lead confirmation):\n' +
      '  RUN_AGAINST_PRODUCTION=yes npm run migrate:fallbacks'
  );
  process.exit(1);
}

const target = emulatorHost ? `emulator (${emulatorHost})` : 'PRODUCTION';
console.log(`\nTarget: Firestore ${target}`);

// ─── Initialize firebase-admin ────────────────────────────────────────────────

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'rebuilt-village-web',
  });
}

const db = admin.firestore();
const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Writes an array of seed objects into a Firestore collection.
 * Each object must carry a `_docId` field (stripped before writing).
 * Uses set() so re-runs update instead of duplicate.
 *
 * Returns the count of documents written.
 */
async function seedCollection<T extends { _docId: string }>(
  collectionName: string,
  items: T[]
): Promise<number> {
  const batch = db.batch();

  for (const item of items) {
    const { _docId, ...fields } = item;
    const ref = db.collection(collectionName).doc(_docId);
    batch.set(ref, {
      ...fields,
      _updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return items.length;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\nStarting migration...\n');

  const results: Record<string, number> = {};

  results[COLLECTIONS.events] = await seedCollection(
    COLLECTIONS.events,
    SEED_EVENTS
  );

  results[COLLECTIONS.teamMembers] = await seedCollection(
    COLLECTIONS.teamMembers,
    SEED_TEAM_MEMBERS
  );

  results[COLLECTIONS.boardMembers] = await seedCollection(
    COLLECTIONS.boardMembers,
    SEED_BOARD_MEMBERS
  );

  results[COLLECTIONS.programs] = await seedCollection(
    COLLECTIONS.programs,
    SEED_PROGRAMS
  );

  results[COLLECTIONS.posts] = await seedCollection(
    COLLECTIONS.posts,
    SEED_POSTS
  );

  console.log('Migration complete. Document counts per collection:');
  for (const [collection, count] of Object.entries(results)) {
    console.log(`  ${collection}: ${count} docs`);
  }
  console.log('');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
