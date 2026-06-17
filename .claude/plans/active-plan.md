# Active Plan

**Phase:** 2 (FireCMS Standup & Content Migration)
**Owner:** Cortez
**Started:** 2026-04-19
**Target completion:** 2026-05-03
**PRD reference:** Section 8, Phase 2

Update this file at the start of each phase. Claude Code reads it to understand what you're working on right now. When you finish a phase, archive this file to `.claude/plans/archive/phase-N-<name>.md` and write a fresh active-plan.md for the next phase.

Phase 1 (Debloat & Consolidate) archived at `.claude/plans/archive/phase-1-debloat.md`. Phase 0 prep tasks remain at `.claude/plans/archive/phase-0-prep.md`; open items there (real EIN, original hero asset, program metrics confirmation) still continue in parallel.

---

## Preconditions

- Phase 1 and Phase 1.5 merged to `main` and deployed to production (current HEAD: `214ffa1`).
- Sanity is shimmed (ADR-002); `services/sanityService.ts` returns empty data; pages render from hardcoded `FALLBACK_*` arrays. Phase 2 replaces both.
- Firebase project `rebuilt-village-web` exists and has Firestore in Native mode enabled. If not, enable before step 1.
- Google Workspace admin access for Cortez to invite Tony, Jess, Amanda to the admin FireCMS app. If Phase 0 email creation is still open (`hello@`, `donate@`, `grants@`, `board@`, `admin@`), not a Phase 2 blocker but Phase 2 step 4 depends on at minimum Tony/Jess/Amanda having a Google identity we can whitelist.
- Original hero asset from founder is NOT a Phase 2 blocker for the FireCMS standup steps (1–6). It blocks only step 7 (Unsplash hero replacement); step 7 can ship in a separate commit once the asset lands.
- Real EIN is a Phase 3 concern; not blocking.

## Steps

### 1. Tag rollback anchor

`git tag release/pre-firecms-v1 && git push origin release/pre-firecms-v1`. Must exist before any Firestore writes or hosting-site additions.

### 2. Enable Firestore collections and write security rules

Canonical collection list per `CLAUDE.md`: `events`, `teamMembers`, `boardMembers`, `posts`, `programs`, `sponsors`, `donors`, `gifts`, `grants`, `donorProjects`. Phase 2 populates the first six (content collections); `donors`, `gifts`, `grants`, `donorProjects` are already written by Cloud Functions and stay as-is.

a. Draft `firestore.rules` with role-based access:
  - Public read on `events`, `teamMembers`, `boardMembers`, `posts`, `programs`, `sponsors`, `donorProjects` (site reads these).
  - Admin write on all collections (`role == 'admin'` via custom claims).
  - Editor write on content collections only (`role == 'editor'`), read-only on `donors`, `gifts`, `grants`.
  - Authenticated read on `donors`, `gifts`, `grants` restricted to admins.

b. Define document schemas (TypeScript interfaces in a shared `types/firestore.ts`): each interface matches the FALLBACK shape in the corresponding page plus a `_updatedAt` server timestamp.

c. Deploy rules to the emulator first, run the emulator test suite (per CLAUDE.md safety rule, never modify Firestore rules without emulator test). Only after emulator green, deploy to production.

Verification: `firebase emulators:exec --only firestore "npm run test:rules"` exits 0. `firebase deploy --only firestore:rules` exits 0 (requires explicit confirmation per CLAUDE.md safety).

### 3. Stand up FireCMS admin app at admin.rebuiltvillage.org

Use the `firecms-builder` subagent for the heavy lifting. Invoke proactively for this step.

a. Create a new Firebase Hosting site named `admin-rebuiltvillage` targeted at `admin.rebuiltvillage.org`.

b. Bootstrap a FireCMS v3+ self-hosted project in a new `/admin` directory at the repo root. Keep it a separate Vite build (independent `package.json`, `tsconfig.json`, build script).

c. Wire Firebase Auth with Google sign-in provider only. Whitelist emails: `cortez@321work.com`, Tony's email, Jess's email, Amanda's email. Reject all others with a clear "access denied" screen.

d. Add `admin` target to `firebase.json` hosting array so `firebase deploy --only hosting:admin` deploys only the admin site. Keep the main site deploy (`hosting:rebuilt-village-web`) unchanged.

e. Configure Cloudflare DNS: `admin.rebuiltvillage.org` CNAME to the Firebase Hosting target for the admin site.

Verification: admin site loads without console errors; Google sign-in rejects a non-whitelisted test account; accepted account lands in the empty FireCMS dashboard.

### 4. Define FireCMS collection schemas

Use the `firecms-schema` skill from `.claude/skills/firecms-schema/`. Apply the canonical patterns documented there: image refs to Firebase Storage, slug fields, server timestamps, references, roles.

Collections to define in FireCMS:
- `events` (date, dateEnd, time, location, description, type, featured, registrationUrl, sponsoredBy, tags)
- `teamMembers` (name, role, bio, headshot, order, active, socialLinks)
- `boardMembers` (name, role, bio, headshot, order, active, linkedIn, email, committees, termStart, termEnd)
- `posts` (title, slug, excerpt, category, author, mainImage, publishedAt, body (rich text), seo)
- `programs` (title, slug, shortLabel, description, details, category, ageGroup, schedule, location, cost, highlights, enrollmentUrl, image, partnerInstitution, featured, active)
- `sponsors` (name, tier, logo, url, order, active)

Rich-text (`posts.body`) uses FireCMS's rich-text editor; on the frontend, the existing `@portabletext/react` dependency handles the rendered blocks (retained from Phase 1 shim decision for exactly this purpose).

Verification: FireCMS admin UI lists all six collections; opening each shows the defined field inspector without console errors.

### 5. Role-based permissions in FireCMS

a. Set custom claims via a one-off Admin SDK script: Cortez and Tony get `role: 'admin'`, Jess and Amanda get `role: 'editor'`.

b. Wire FireCMS's built-in permissions API to read `customClaims.role` on the authenticated user. Map `admin` to full CRUD on all collections; map `editor` to CRUD on the six content collections and read-only on `donors`, `gifts`, `grants`.

c. Verify by signing in as each of the four test accounts (or simulated with custom claims in emulator) and confirming the permitted actions.

Verification: editor account cannot see write controls on `donors`; admin account can write to all six content collections and read the three sensitive ones.

### 6. Migrate FALLBACK arrays into Firestore

Use the `cms-migrator` subagent. Invoke proactively for this step.

a. Write a migration script at `scripts/migrate-fallbacks-to-firestore.ts` that reads each page's `FALLBACK_*` array and writes to the corresponding Firestore collection with deterministic doc IDs.

b. Run against the emulator first; verify shape matches FireCMS expectations; iterate until schema and data align.

c. Run against production Firestore. Script must be idempotent (re-running does not duplicate documents).

d. Swap `services/sanityService.ts` from its Phase 1 shim (returns `[]`/`null`) to Firestore queries. Keep the same function signatures so page imports do not change. Wire a 60-second client cache (same pattern as `projectBalancesService.ts`).

e. Delete the `FALLBACK_*` arrays from `pages/About.tsx`, `pages/Board.tsx`, `pages/Programs.tsx`, `pages/Events.tsx`. Firestore is now the single source of truth.

f. Replace `services/sanityClient.ts` `urlFor` stub with a Firebase Storage URL helper that returns the Storage download URL for a given reference. Keep the fluent chainable interface so existing call sites do not change.

Verification: `npm run build` exits 0. Each of the six site routes (`/`, `/about`, `/board`, `/programs`, `/events`, `/blog`) renders from Firestore data; editing a document in FireCMS updates the site within cache TTL (60s).

### 7. Replace Unsplash hero image with original asset

Blocked on founder capturing the asset. When delivered:

a. Upload the asset to Firebase Storage under `public/hero/` with a versioned filename (e.g. `hero-v1.jpg`).

b. Update the hero component to reference the Storage URL (or use the new `urlFor` helper). Drop the Unsplash URL.

c. Verify license is clear (original work by Rebuilt Village, not purchased stock with unclear commercial rights).

Verification: homepage hero loads the new asset; DevTools Network tab shows Firebase Storage origin, not `images.unsplash.com`.

### 8. End-to-end content edit test

Jess or Amanda signs into `admin.rebuiltvillage.org`, edits a test post's title, saves. Within 60 seconds the change appears on `rebuiltvillage.org/blog/<slug>` without any code deploy.

This is the Phase 2 acceptance signal: content can be managed without a developer in the loop.

## Acceptance criteria

- `release/pre-firecms-v1` tag exists on `origin`.
- `firestore.rules` deployed; emulator suite passes; role-based access verified for both admin and editor roles.
- FireCMS admin app deployed at `admin.rebuiltvillage.org`; all four team members can sign in; non-whitelisted accounts are rejected.
- All six content collections (`events`, `teamMembers`, `boardMembers`, `posts`, `programs`, `sponsors`) populated in Firestore.
- `services/sanityService.ts` queries Firestore; Phase 1 shim empty-returns are gone.
- Page-level `FALLBACK_*` arrays deleted from `About.tsx`, `Board.tsx`, `Programs.tsx`, `Events.tsx`.
- `services/sanityClient.ts` `urlFor` returns real Firebase Storage URLs.
- Hero image is an original Rebuilt Village asset in Firebase Storage, not Unsplash (or step 7 explicitly deferred with a dated note in this plan).
- `npm run build` exits 0.
- `cd functions && npm run build` exits 0.
- End-to-end test: editor account edits a document in FireCMS and sees the change on the live site within 60 seconds.

## Rollback

Any step goes wrong: `git reset --hard release/pre-firecms-v1`. Requires explicit user confirmation per CLAUDE.md. Firestore data rollback is separate: keep a dated export (`gcloud firestore export`) right before step 6's production migration; restore from that export if the migration corrupts data.

## Deferred to later phases

- Givebutter CRM integration and nightly sync Cloud Function: Phase 3.
- Stripe nonprofit rate application: Phase 3.
- Real EIN swap across the four canonical locations: Phase 3.
- Ad Grants application (site must be content-complete and policy-compliant first): Phase 4.
- WIF migration for GitHub Actions auth (see Backlog from Phase 1): Phase 3 or Phase 4, before Ad Grants launch.
- Legal review of Terms and Privacy: Phase 6.
- Performance and SEO polish pass: Phase 5 or Phase 6.

## Backlog from Phase 1

Items discovered or deferred during Phase 1 that are not in scope for Phase 2's primary goals but should be tracked:

- **[RVL-1](https://linear.app/321work/issue/RVL-1)**: 9 low-severity `firebase-admin` transitive vulnerabilities. Fixable only via a breaking major downgrade to firebase-admin v10. Revisit when firebase-admin v13 ships or when npm overrides can pin the chain cleanly.
- **[RVL-2](https://linear.app/321work/issue/RVL-2)**: Align Node runtime across local dev (22), Cloud Functions engines (20), and GitHub Actions runner (20). Consolidate on Node 22 when firebase-functions SDK formally recommends it.
- **WIF migration**: Replace the long-lived `FIREBASE_SERVICE_ACCOUNT_REBUILT_VILLAGE_WEB` GitHub secret with Workload Identity Federation before Phase 4 Ad Grants launch. Long-lived service account keys are an audit liability for a nonprofit receiving Google grant program scrutiny.
- **GitHub Actions duplicate preview job**: two `Deploy preview` checks run in parallel on every PR (the Firebase action posts its own check alongside the workflow job). Cosmetic but noisy. Consolidate or suppress the duplicate.
- **Node 20 deprecation on GitHub Actions runners**: GitHub removes Node 20 from runners on September 16, 2026. Covered operationally by RVL-2, but the hard deprecation date makes this a dated backlog item, not an open-ended one.
- **Dead inline code in `App.tsx`**: ~200 lines of inline `Programs` and `Contact` components (pre-existing; live routes already lazy-import from `/pages`). Code-reviewer flagged during Phase 1; deferred because out of strict Phase 1 scope. Phase 2 naturally overlaps since we rewrite those pages against Firestore.
- **`DEPLOYMENT.md` post-deploy EIN checklist lists wrong files**: Lists `DonateSuccess.tsx` and `stripeWebhook.ts`; CLAUDE.md canonical four are `pages/Donate.tsx`, `index.html`, `components/Footer.tsx`, `functions/src/handlers/createCheckoutSession.ts`. Fix during Phase 3 EIN swap session when the operator is actually using the checklist.

## Notes and decisions made this phase

**2026-06-16 — Phase 2 build session (branch `chore/phase-2-firecms`, commit `c988bf7`):**

- FireCMS confirmed over Sanity (founder decision this session). Linear reconciled: Phase 4 milestone + RVL-18/19/20/26/28/36 reworded Sanity→FireCMS. The milestone had encoded a contradictory "stay on Sanity / substantially complete" note; corrected.
- Registered a Firebase **web app** (none existed): appId `1:903273862134:web:e1ac3e7ac248be7364add7`. Public web config committed in `services/firebaseClient.ts` (not secret; `.env*` writes are policy-blocked so config lives in code).
- Frontend reads Firestore via `services/sanityService.ts` (same 7 signatures, 60s cache, try/catch → FALLBACK). Emulator-connected in dev via `import.meta.env.DEV`. Verified end-to-end with a sentinel doc + all six routes.
- Rules: `firestore.rules` + `storage.rules` (role-based, claims `role: admin|editor`). `npm run test:rules` (vitest + @firebase/rules-unit-testing) 10/10 pass. OpenJDK installed (keg-only, `/opt/homebrew/opt/openjdk`) for the emulator.
- **Blog body switched portable-text → Markdown** (rendered by `marked`; dropped `@portabletext/react`). FireCMS authors Markdown; portable-text had no producer left.
- `/admin`: FireCMS v3 self-hosted, Google sign-in, whitelist (`cortez@321work.com`), 9 collections (6 content + donors/gifts/grants read-only), roles from claims. **Live: https://admin-rebuiltvillage.web.app**
- `firebase.json` hosting → array (`main`+`admin` targets); `.firebaserc` targets; CI builds/deploys both via `target:`.
- **Deployed to prod:** `firestore:rules` (this created the project's default Firestore DB — it did not exist before, so prod Firestore was empty), and the admin hosting site.
- **NOT done (blocked/handoff):**
  - Prod Firestore **seed** blocked by the backup gate: `gcloud` (export tool) is denied in the sandbox, so the dated backup could not run. DB is brand-new/empty so the backup protects nothing; awaiting decision to seed without it (`RUN_AGAINST_PRODUCTION=yes npm run migrate:fallbacks`).
  - Console (founder): enable **Storage** (Get Started) + **Google** auth provider, add `admin-rebuiltvillage.web.app` to Authorized domains.
  - Custom claim `role:admin` for Cortez: set AFTER first sign-in (Auth user created on first login).
  - Cloudflare DNS `admin.rebuiltvillage.org` (RVL-19); Jess/Amanda onboarding (RVL-18/36).
  - Main-site Firestore reads are committed but NOT merged — live public site still uses FALLBACK arrays until the PR merges (deliberate, safe).

**2026-06-16 — Phase 2 unblock + ship session (branch `chore/phase-2-firecms`, commit `72f44d5`; PR #4 MERGED to `main`):**

- **Sign-in blocker RESOLVED.** Symptom was the FireCMS Google popup showing "The requested action is invalid." Root cause: the auth handler at the default `authDomain` (`rebuilt-village-web.firebaseapp.com`) is cross-origin to the admin (`admin-rebuiltvillage.web.app`); modern-browser storage partitioning broke both the popup opener handshake AND, after we switched to redirect, the credential handoff on return. Isolated with a controlled `signInWithRedirect` (reached Google fine) vs the failing popup — proved it was popup/cross-origin, not the project's OAuth config. Fix: set `authDomain` to `window.location.hostname` (same-origin first-party handler) and replace FireCMS's built-in popup login with a custom `signInWithRedirect` button + `getRedirectResult` on mount (user flows in via the controller's `onAuthStateChanged`). **Founder added `https://admin-rebuiltvillage.web.app/__/auth/handler` (and `https://admin.rebuiltvillage.org/__/auth/handler`) as Authorized redirect URIs + JS origins on the Google OAuth web client** — required for same-origin authDomain. End-to-end sign-in verified live.
- **Styling blocker RESOLVED.** FireCMS v3 is built on Tailwind v4, which was never wired into the admin build (CSS was 3.3kB, all utilities missing → unstyled, giant logo). Added `tailwindcss`@4 + `@tailwindcss/vite` + `@tailwindcss/typography`, an `admin/src/index.css` with `@source` globs over the `@firecms` packages (canonical CLI-template setup), and switched `DefaultDrawer` → `Drawer` (+ `SideDialogs`) so the sidebar renders as a fixed rail. CSS now ~145kB; dashboard renders correctly.
- **Cortez `role: admin` claim SET** (uid `decXTuXejrQPARA7xQtDSsbiEF53`). Gotcha: the claim script needs `GOOGLE_CLOUD_QUOTA_PROJECT=rebuilt-village-web` (ADC's default quota project was `aridinsights-dev`, where Identity Toolkit is disabled). Must sign out/in for the claim to take effect in the token.
- **`firebase.json`**: added `source: "/"` no-cache header to the admin target (the `**/*.html` glob doesn't match the root request, so `index.html` was served `max-age=3600` and stale builds persisted). `.firebase/` deploy cache gitignored.
- **Founder console (done this session):** registered the admin OAuth redirect URIs/origins (above). Storage + Google provider + authorized domains were already done.
- **Prod Firestore seeded** (prior session's pending item is now confirmed live): public unauth REST reads return boardMembers 7, teamMembers 8, programs 3, events 6, posts 1, sponsors 0; `donors` correctly 403 to public. Rules verified against the live DB.
- **PR #4 merged → `main`.** CI deployed both sites (run 27662153974, success). Public site now reads Firestore (FALLBACK arrays no longer the live source).
- **Still open (Phase 2 tail, not blockers):** Cloudflare/Bluehost DNS for `admin.rebuiltvillage.org` (RVL-19); Jess/Amanda onboarding — add their Google emails to `ALLOWED_EMAILS` in `admin/src/App.tsx` + set `editor` claims (RVL-18/36). NOTE on DNS: `rebuiltvillage.org` is registered at Network Solutions, DNS delegated to Bluehost, currently fronted by Bluehost's bundled Cloudflare (not a self-owned Cloudflare); the domain is NOT yet pointed at Firebase. Founder does not own the domain yet and will add it in Bluehost later.
