# Rebuilt Village — Agent Guidance

## Project

Rebuilt Village is a 501(c)(3) nonprofit in Ocoee, FL offering film education to youth. This repository is the public website (React 19 + Vite + Tailwind v4) plus Firebase Cloud Functions and a self-hosted FireCMS admin UI.

Full PRD: @docs/PRD_v2.docx
Active phase plan: @.claude/plans/active-plan.md
Architectural decisions: @.claude/memory/decisions.md

## Stack (locked decisions)

- **Frontend**: React 19, Vite, Tailwind v4, React Router v7, Framer Motion with `useReducedMotion`.
- **Hosting**: Firebase Hosting only. Vercel is being removed.
- **Backend**: Cloud Functions v2 on Node 20, Firestore (Native mode) as the single data store.
- **Admin UI / CMS**: FireCMS self-hosted at admin.rebuiltvillage.org. Sanity is being deleted.
- **CI/CD**: GitHub Actions. Cloud Build is being deleted.
- **Payments**: Stripe Checkout (nonprofit rate 2.2% + 30c) plus Givebutter for CRM layered on top.
- **Email**: Resend for transactional, Brevo for marketing.
- **Analytics**: GA4 via Google Tag Manager. Required for Google Ad Grants compliance.
- **CDN**: Cloudflare Free in front of Firebase Hosting.

## Writing and communication style

These apply to Claude's output in chat, code comments, commit messages, and PR descriptions.

- Technical founder audience. Skip beginner explanations unless asked.
- Prose paragraphs over bullet points unless a list genuinely aids comprehension.
- No em dashes anywhere.
- Search the web before citing any current rate, regulation, price, or grant detail. Do not rely on training data for present-day facts.
- When uncertain, say so. Never fabricate.

## Workflow rules

- Use Plan Mode for any change that touches three or more files. Single-file typo fixes can skip planning.
- Run `npm run build` after any code change that touches TypeScript, JSX, or config. Paste the exit code in the session.
- Never introduce references to: Vercel, Sanity, StorySpark, `cloudbuild.yaml`, or `/api/` Vercel serverless routes. These are being removed.
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.
- One phase equals one session. Run `/clear` between PRD phases.
- When you correct yourself twice in a session, stop and `/clear`. Start a fresh session with a better prompt.

## Repository conventions

- Pages live in `/pages`. Do not inline page components in `App.tsx`. If you find inline components there, extract them.
- Shared components live in `/components`. Navigation lives in `/src/components/ViewfinderNav.tsx`.
- Brand tokens live in `/src/brand.ts`. Do not hardcode colors, fonts, or donor tier values elsewhere.
- Firestore collections (canonical list): `events`, `teamMembers`, `boardMembers`, `posts`, `programs`, `sponsors`, `documents`, `donors`, `gifts`, `grants`, `donorProjects`.
- Cloud Functions live in `/functions/src/handlers`. Each handler is a named export from `/functions/src/index.ts`.
- Real EIN must appear in exactly four locations: `pages/Donate.tsx` (transparency panel), `index.html` (schema.org `taxID`), `components/Footer.tsx`, and `functions/src/handlers/createCheckoutSession.ts` (Stripe metadata). When the EIN changes, grep for the old value and replace everywhere.

## Known gotchas

- `firebase.json` rewrites map kebab-case `/api/*` URLs to camelCase Cloud Function exports: `/api/send-email` → `sendEmail`, `/api/create-checkout-session` → `createCheckoutSession`, `/api/stripe-webhook` → `stripeWebhook`, `/api/project-balances` → `getProjectBalances`. See ADR-007 for the URL/export naming convention. Keep the catch-all `**` → `/index.html` rewrite last; order matters.
- Sanity is shimmed: `services/sanityClient.ts` and `services/sanityService.ts` return empty/null. Pages render from their hardcoded FALLBACK arrays. Phase 2 swaps the shim for Firestore queries when FireCMS ships.
- The hero image is currently an Unsplash URL, which is a copyright and brand risk. It must be replaced with an original Rebuilt Village asset before launch.
- The hero video path `/assets/video/village-story-v1.mp4` points to a file that does not exist. Either add the real file or remove the reference.

## Verification expectations

Claude must give itself a way to verify every non-trivial change. Minimum verifications:

- Any change touching build config, routing, or TypeScript types: `npm run build` passes with exit code 0.
- Any change to Cloud Functions: `cd functions && npm run build` passes.
- Any change to FireCMS schema: admin UI loads without console errors.
- Any change to Firestore security rules: emulator suite test passes.
- Any change to a page component: Playwright or browser screenshot of the rendered page, compared to the prior state.

If Claude cannot verify a change, Claude must flag that it cannot verify and ask whether to proceed or stop.

## Permissions and safety

- Never commit secrets or API keys. Secrets live in Google Secret Manager or GitHub Actions secrets.
- Never write to `.env`, `.env.local`, `.env.production`, or `functions/.env*`.
- Never run `firebase deploy --only functions` without explicit confirmation in chat.
- Never modify Firestore security rules without running the emulator test suite first.
- Never delete a file that is referenced elsewhere in the repo without a `grep` confirming zero references.

## When in doubt

Read the PRD. If the PRD and this file disagree, flag the conflict and ask. Do not silently choose one over the other.
