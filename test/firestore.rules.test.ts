import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Requires the Firestore emulator running on localhost:8080, e.g.:
//   firebase emulators:exec --only firestore "npm run test:rules"

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'rebuilt-village-web',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

function db(role?: 'admin' | 'editor') {
  const context = role
    ? testEnv.authenticatedContext(`uid-${role}`, { role })
    : testEnv.unauthenticatedContext();
  return context.firestore();
}

describe('content collections', () => {
  test('anyone can read events', async () => {
    await assertSucceeds(getDoc(doc(db(), 'events/e1')));
  });

  test('anonymous cannot write events', async () => {
    await assertFails(setDoc(doc(db(), 'events/e1'), { title: 'x' }));
  });

  test('editor can write events', async () => {
    await assertSucceeds(setDoc(doc(db('editor'), 'events/e1'), { title: 'x' }));
  });

  test('admin can write programs', async () => {
    await assertSucceeds(setDoc(doc(db('admin'), 'programs/p1'), { title: 'x' }));
  });

  test('anyone can read documents', async () => {
    await assertSucceeds(getDoc(doc(db(), 'documents/d1')));
  });

  test('anonymous cannot write documents', async () => {
    await assertFails(setDoc(doc(db(), 'documents/d1'), { title: 'x' }));
  });

  test('editor can write documents', async () => {
    await assertSucceeds(setDoc(doc(db('editor'), 'documents/d1'), { title: 'x' }));
  });
});

describe('donorProjects (admin-only write, public read)', () => {
  test('public can read donorProjects', async () => {
    await assertSucceeds(getDoc(doc(db(), 'donorProjects/dp1')));
  });

  test('editor cannot write donorProjects', async () => {
    await assertFails(setDoc(doc(db('editor'), 'donorProjects/dp1'), { goal: 1 }));
  });

  test('admin can write donorProjects', async () => {
    await assertSucceeds(setDoc(doc(db('admin'), 'donorProjects/dp1'), { goal: 1 }));
  });
});

describe('sensitive financial collections', () => {
  test('editor cannot read donors', async () => {
    await assertFails(getDoc(doc(db('editor'), 'donors/d1')));
  });

  test('admin can read donors', async () => {
    await assertSucceeds(getDoc(doc(db('admin'), 'donors/d1')));
  });

  test('admin cannot client-write gifts (Admin SDK only)', async () => {
    await assertFails(setDoc(doc(db('admin'), 'gifts/g1'), { amount: 1 }));
  });
});
