# The Librarian
for your library needs.
---
# 🗞️ Read‑It‑Later (Firebase Edition)

**A distraction‑free, AI‑assisted reading haven.**
Save any article with one click, enjoy it in a clean reader view, tag it for later, and let GPT give you a heads‑up on whether it’s worth the deep dive.

---

## Why this repo exists

Pocket is shutting down. Rather than migrate yet again, we’re building a lightweight, open‑source alternative that anyone can run — starting with a **Firebase‑first MVP** for rapid iteration and zero ops.

---

### Core Features

* **One‑click capture** via web UI, browser extension, or Android share sheet
* **Reader Mode** powered by *Mozilla Readability* (no ads, no cruft)
* **Tagging & search‑ready metadata** for painless organisation
* **GPT‑based TL;DR + “Read / Skim / Skip” verdict**
* **Offline‑friendly PWA** that installs on iOS & Android

---

### Tech Snapshot

| Layer    | Stack                                         |
| -------- | --------------------------------------------- |
| Frontend | Next.js 14 · React 18 · TypeScript · Tailwind |
| Backend  | Firebase Cloud Functions (Node 20 TS)         |
| Database | Cloud Firestore (EU‑W3)                       |
| Auth     | Firebase Auth (Email + Google)                |
| Parsing  | `@mozilla/readability` + `jsdom`              |
| AI       | OpenAI Chat Completions (GPT‑3.5‑Turbo)       |

---

## Want to hack?

1. **Read the docs:**

   * 📜 [`architecture.md`](./architecture.md) – big‑picture design
   * 📋 [`requirements.md`](./requirements.md) – functional spec
   * ✅ [`tasks.md`](./tasks.md) – task breakdown & definitions of done
2. `pnpm i`
3. `firebase login && firebase use --add`
4. `pnpm dev` (spins up Next.js + Firebase emulators)

PRs welcome.
If you build something rad on top of this, let us know — and may your reading list finally become manageable!
