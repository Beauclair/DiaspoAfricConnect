# Plan: Seed US Immigration Data

## Approach
Create a Node.js seed script (`scripts/seedImmigration.js`) that uses the Firebase web SDK to write immigration guides and lawyers directly to Firestore. The script will use the project's Firebase config from `app.json`.

Since Firestore rules now allow `read: true` but still require `auth != null` for writes, the script will use **anonymous auth** or we sign in with a test account. Actually, the simplest: we'll temporarily use the Firebase web SDK's `connectFirestoreEmulator` or just call the REST API... 

Better approach: Create the seed as an **in-app screen** at `app/dev/seed.tsx` with a button to run it. This way it uses the already-authenticated user's credentials. Simple and clean.

Even simpler: just a standalone script using `firebase-admin` is not available. Let me just create a **seed function** in `scripts/seedImmigration.ts` and a small runner that imports Firebase directly with `compat` mode for Node. 

**Simplest approach**: Create `scripts/seedImmigration.js` as a plain Node.js script that uses the Firebase web SDK (compat version) to:
1. Sign in with email/password (the user's own account)
2. Write all the seed data

## Data to seed

### Immigration Guides (US) — 7 guides covering all US immigration categories:
1. **Visa** — Understanding US Visa Types (B-1/B-2, H-1B, L-1, O-1, etc.)
2. **Green Card** — Pathways to Permanent Residence
3. **Asylum** — Applying for Asylum in the US
4. **Citizenship** — Naturalization Process
5. **Work Permit** — Employment Authorization Document (EAD)
6. **Family** — Family-Based Immigration
7. **Student** — Student Visa (F-1/M-1) Guide

### Lawyers (US) — 5 sample immigration lawyers

## Files
1. `scripts/seedImmigration.js` — Standalone Node.js seed script

Run with: `node scripts/seedImmigration.js`
