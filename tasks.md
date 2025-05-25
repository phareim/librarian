# Task Breakdown – Firebase # Task Breakdown – Firebase Librarian MVP
_The Librarian_ is a helpful Read-it-later-service, akin to https://getpocket.com/. 
> **Goal:** Deliver a production‑quality web app that fulfils all requirements in `requirements.md`. Tasks are ordered roughly by dependency; parallelise where practical. Each task has a **Definition of Done** (DoD) that an autonomous dev‑agent can validate.

---

## 1  Repository & Tooling

* **Description:** initialise mono‑repo (pnpm workspaces) for *web*, *functions*, *extension*, *scripts*.
* **Steps**

  1. `git init`, create main branch.
  2. Configure ESLint, Prettier, tsconfig base.
  3. Add Husky + lint‑staged pre‑commit.
* **DoD**

  * Repo pushed to GitHub with CI lint job green.
  * `pnpm install && pnpm run lint` exits 0.

## 2  Firebase Project Setup

* **Description:** create Firebase project `<readlater‑mvp>` in *test* workspace.
* **Steps**

  1. Enable Firestore (native mode, europe‑west3).
  2. Enable Email/Password + Google sign‑in.
  3. Initialise `firebase.json` & `.firebaserc`.
* **DoD**

  * `firebase deploy --only firestore:indexes` succeeds.
  * Connection from local emulator works via env vars.

## 3  Database Schema & Security Rules

* **Description:** define collections (`users`, `articles`) and write fine‑grained security rules.
* **DoD**

  * Rules unit‑tested with Firebase Emulator; unauthenticated write attempts fail.
  * `npm run test:rules` passes.

## 4  Auth Flow (Frontend)

* **Description:** implement sign‑up / login UI in Next.js using Firebase Web SDK v10.
* **DoD**

  * User can register & login; token stored in IndexedDB.
  * Page reload keeps session; logout works.

## 5  Save Article Cloud Function

* **Description:** HTTPS callable `saveArticle(url)`.

  * Validate URL.
  * Fetch HTML via `undici`.
  * Parse via Readability → store doc.
* **DoD**

  * Unit test mocks HTTP and stores doc in Firestore.
  * Runtime < 2 s, cold start < 5 s (EU region).

## 6  Reading View UI

* **Description:** Next.js page `/a/[id]` renders `contentHtml`.
* **DoD**

  * Renders title, domain, hero img, dark/light toggle.
  * Lighthouse ≥ 90% for Accessibility & Performance.

## 7  Tagging Service

* **Description:** allow add/remove tags client‑side; persist array in document.
* **DoD**

  * Chip UI with autocomplete.
  * Filtering by tag returns ≤ 100 ms Firestore query.

## 8  AI Summary Function

* **Description:** callable `summarizeArticle(docId)`; uses GPT‑3.5.
* **DoD**

  * Returns JSON `{summary, verdict}`.
  * Error handling for <402> quota.
  * Jest test with nock OpenAI mock.

## 9  List View & Pagination

* **Description:** Infinite scroll article list ordered by `createdAt`.
* **DoD**

  * Uses Firestore `limit + startAfter`.
  * Smooth scroll passes 60fps in Chrome DevTools.

## 10  PWA & Offline

* **Description:** register Service Worker with Workbox; precache shell + article pages.
* **DoD**

  * `npm run build && npm run serve` → app installable, offline list loads.
  * Cypress test toggles airplane‑mode and still reads article.

## 11  Browser Extension (Chrome MV3)

* **Description:** button saves active tab.
* **DoD**

  * `pnpm build:extension` creates `zip` under 250 KB.
  * Manual test: click icon, toast "Saved!" appears in web app within 5 s.

## 12  Android Web Share Target

* **Description:** update `manifest.webmanifest` with `share_target`.
* **DoD**

  * Chrome Android can share URL → app opens → article stored.

## 13  CI/CD Pipeline

* **Description:** GitHub Actions with matrix **(lint, test, build, deploy)**.
* **DoD**

  * Push to `main` triggers deploy to Firebase Hosting & Functions.
  * Badge in README shows last workflow status.

## 14  E2E Tests

* **Description:** Playwright scripts cover happy path.
* **DoD**

  * `pnpm run e2e` green on CI.
  * Coverage > 70% statements.

## 15  Performance & Load Test

* **Description:** k6 script hitting `saveArticle` 1 rps for 15 minutes.
* **DoD**

  * 95th latency < 400 ms; error rate < 1%.

## 16  Accessibility & i18n

* **Description:** implement `@internationalized/react` and axe‑dev.
* **DoD**

  * No critical axe violations.
  * English strings extracted in `en.json`.

## 17  Docs & Onboarding

* **Description:** update README with setup, scripts, architecture diagram.
* **DoD**

  * New dev can run `pnpm dev` in 10 min per instructions.

## 18  MVP Release & Smoke Test

* **Description:** tag `v1.0.0`, deploy to production project.
* **DoD**

  * Smoke checklist passes (login, save, read, tag, AI summary).
  * Changelog and GitHub release notes published.

---

*Version 1.0 – 2025‑05‑24*
 MVP

> **Goal:** Deliver a production‑quality web app that fulfils all requirements in `requirements.md`. Tasks are ordered roughly by dependency; parallelise where practical. Each task has a **Definition of Done** (DoD) that an autonomous dev‑agent can validate.

---

## 1  Repository & Tooling

* **Description:** initialise mono‑repo (pnpm workspaces) for *web*, *functions*, *extension*, *scripts*.
* **Steps**

  1. `git init`, create main branch.
  2. Configure ESLint, Prettier, tsconfig base.
  3. Add Husky + lint‑staged pre‑commit.
* **DoD**

  * Repo pushed to GitHub with CI lint job green.
  * `pnpm install && pnpm run lint` exits 0.

## 2  Firebase Project Setup

* **Description:** create Firebase project `<readlater‑mvp>` in *test* workspace.
* **Steps**

  1. Enable Firestore (native mode, europe‑west3).
  2. Enable Email/Password + Google sign‑in.
  3. Initialise `firebase.json` & `.firebaserc`.
* **DoD**

  * `firebase deploy --only firestore:indexes` succeeds.
  * Connection from local emulator works via env vars.

## 3  Database Schema & Security Rules

* **Description:** define collections (`users`, `articles`) and write fine‑grained security rules.
* **DoD**

  * Rules unit‑tested with Firebase Emulator; unauthenticated write attempts fail.
  * `npm run test:rules` passes.

## 4  Auth Flow (Frontend)

* **Description:** implement sign‑up / login UI in Next.js using Firebase Web SDK v10.
* **DoD**

  * User can register & login; token stored in IndexedDB.
  * Page reload keeps session; logout works.

## 5  Save Article Cloud Function

* **Description:** HTTPS callable `saveArticle(url)`.

  * Validate URL.
  * Fetch HTML via `undici`.
  * Parse via Readability → store doc.
* **DoD**

  * Unit test mocks HTTP and stores doc in Firestore.
  * Runtime < 2 s, cold start < 5 s (EU region).

## 6  Reading View UI

* **Description:** Next.js page `/a/[id]` renders `contentHtml`.
* **DoD**

  * Renders title, domain, hero img, dark/light toggle.
  * Lighthouse ≥ 90% for Accessibility & Performance.

## 7  Tagging Service

* **Description:** allow add/remove tags client‑side; persist array in document.
* **DoD**

  * Chip UI with autocomplete.
  * Filtering by tag returns ≤ 100 ms Firestore query.

## 8  AI Summary Function

* **Description:** callable `summarizeArticle(docId)`; uses GPT‑3.5.
* **DoD**

  * Returns JSON `{summary, verdict}`.
  * Error handling for <402> quota.
  * Jest test with nock OpenAI mock.

## 9  List View & Pagination

* **Description:** Infinite scroll article list ordered by `createdAt`.
* **DoD**

  * Uses Firestore `limit + startAfter`.
  * Smooth scroll passes 60fps in Chrome DevTools.

## 10  PWA & Offline

* **Description:** register Service Worker with Workbox; precache shell + article pages.
* **DoD**

  * `npm run build && npm run serve` → app installable, offline list loads.
  * Cypress test toggles airplane‑mode and still reads article.

## 11  Browser Extension (Chrome MV3)

* **Description:** button saves active tab.
* **DoD**

  * `pnpm build:extension` creates `zip` under 250 KB.
  * Manual test: click icon, toast "Saved!" appears in web app within 5 s.

## 12  Android Web Share Target

* **Description:** update `manifest.webmanifest` with `share_target`.
* **DoD**

  * Chrome Android can share URL → app opens → article stored.

## 13  CI/CD Pipeline

* **Description:** GitHub Actions with matrix **(lint, test, build, deploy)**.
* **DoD**

  * Push to `main` triggers deploy to Firebase Hosting & Functions.
  * Badge in README shows last workflow status.

## 14  E2E Tests

* **Description:** Playwright scripts cover happy path.
* **DoD**

  * `pnpm run e2e` green on CI.
  * Coverage > 70% statements.

## 15  Performance & Load Test

* **Description:** k6 script hitting `saveArticle` 1 rps for 15 minutes.
* **DoD**

  * 95th latency < 400 ms; error rate < 1%.

## 16  Accessibility & i18n

* **Description:** implement `@internationalized/react` and axe‑dev.
* **DoD**

  * No critical axe violations.
  * English strings extracted in `en.json`.

## 17  Docs & Onboarding

* **Description:** update README with setup, scripts, architecture diagram.
* **DoD**

  * New dev can run `pnpm dev` in 10 min per instructions.

## 18  MVP Release & Smoke Test

* **Description:** tag `v1.0.0`, deploy to production project.
* **DoD**

  * Smoke checklist passes (login, save, read, tag, AI summary).
  * Changelog and GitHub release notes published.

---

*Version 1.0 – 2025‑05‑24*
