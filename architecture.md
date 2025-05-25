# The Librarian. A Read‑It‑Later Service — Firebase‑First Architecture (v1.1)

## 1  Purpose

Build a minimalist, open‑source *read‑it‑later* application that lets users **save any web article**, view it in a clean reader‑mode, organise it with tags, and optionally receive an **AI summary & reading recommendation**. The system should work smoothly on mobile via a responsive web app (PWA) and offer ultra‑low‑friction capture through a browser extension and Android Share Target.

---

## 2  Core Features

| # | Capability             | Short Description                                                                   |
| - | ---------------------- | ----------------------------------------------------------------------------------- |
| 1 | **Save Article**       | Accept a URL from web UI / extension / share sheet, fetch & store readable content. |
| 2 | **Reader Mode**        | Present distraction‑free article HTML with light/dark theme & offline support.      |
| 3 | **Tagging**            | Add / remove / filter by tags; autocomplete common tags.                            |
| 4 | **AI Summary**         | On demand (or scheduled) GPT‑based TL;DR + *Read / Skim / Skip* verdict.            |
| 5 | **Auth & Sync**        | Firebase Auth (email + Google) keeps data private and synchronised across devices.  |
| 6 | **Browser Extension**  | One‑click save from Chrome/Firefox/Safari (MV3).                                    |
| 7 | **PWA & Share Target** | Installable app; receives shared URLs on Android.                                   |

---

## 3  High‑Level System Overview

```
┌───────────────┐        HTTPS callable        ┌─────────────────────┐
│  Web / PWA    │  ─────────────────────────▶  │  Cloud Function     │
│  Next.js      │  saveArticle(url)            │  saveArticle        │
└───────────────┘                              │  ├─ fetch HTML      │
        ▲                                     │  ├─ Readability     │
        │ Firestore SDK (online / offline)    │  ├─ Firestore write │
┌───────────────┐                              └─────────────────────┘
│  Browser      │                                    │
│  Extension    │  ───────────────────────────────────┘
└───────────────┘                                    ▼
                                           ┌───────────────────┐
                                           │   Firestore DB    │
                                           │  articles/{uid}   │
                                           └───────────────────┘
                                                   ▲
                                                   │ callable
                                           ┌─────────────────────┐
                                           │ Cloud Function      │
                                           │ summarizeArticle    │
                                           └─────────────────────┘
                                                   │
                                                   ▼
                                           OpenAI Chat API (GPT‑3.5)
```

*Figure 1 – Simplified data flow.*

### 3.1  Client (Next.js 14 + React 18)

* Server‑side rendering for first load, then SPA navigation.
* Uses Firebase Web SDK for Auth + Firestore (with offline persistence).
* Service Worker (Workbox) pre‑caches shell & visited article HTML.

### 3.2  Backend Functions (Node 20 + TypeScript)

| Function                 | Trigger                    | Responsibilities                                                                                          |
| ------------------------ | -------------------------- | --------------------------------------------------------------------------------------------------------- |
| `saveArticle`            | HTTPS callable             | Validate user & URL → fetch HTML → parse via *@mozilla/readability* → write document in `articles/{uid}`. |
| `summarizeArticle`       | HTTPS callable / scheduled | Retrieve article text → invoke OpenAI → store `{summary, verdict}` in document.                           |
| *(future)* nightly batch | Cloud Scheduler            | Summarise unread articles > 7 days old.                                                                   |

### 3.3  Data Model (Firestore)

```jsonc
// Collection: users
{ uid, displayName, settings }

// Sub‑collection: articles/{uid}/{docId}
{
  url: "https://…",
  title: "…",
  contentHtml: "…",
  excerpt: "…",
  tags: ["ai", "climate"],
  readTimeWords: 875,
  createdAt: Timestamp,
  aiSummary: {
    summary: "…",
    verdict: "Read"
  }
}
```

Indexes: compound index on `(uid, tags, createdAt)` for tag‑filtered queries.

---

## 4  External Integrations

### 4.1  Browser Extension

* **MV3** background script, TS + Vite.
* Saves current tab via authenticated POST to `saveArticle` endpoint.
* Shows Snackbar on success.

### 4.2  Android Web Share Target

`manifest.webmanifest` includes:

```json
"share_target": {
  "action": "/share",
  "method": "GET",
  "params": {
    "url": "url"
  }
}
```

Route `/share` invokes the same saveArticle logic and redirects home.

### 4.3  AI (OpenAI GPT‑3.5‑Turbo)

Prompt skeleton:

```
You are an expert content assistant. Summarise the article below in 2‑3 concise
sentences and state whether a busy professional should Read, Skim, or Skip it.
### BEGIN ARTICLE
{content}
### END ARTICLE
```

Returned JSON is parsed & stored in `aiSummary`.

---

## 5  Non‑Functional Qualities

| Attribute     | Target                                       | Rationale                   |
| ------------- | -------------------------------------------- | --------------------------- |
| Performance   | `saveArticle` ≤ 300 ms avg                   | Quick capture UX.           |
| Offline       | Reader view & list cached                    | Mobile commuters / flights. |
| Security      | Firestore rules isolate data; HTTPS enforced | Privacy.                    |
| Cost          | Free tier viable for <10 k saves/month       | Personal use.               |
| Scalability   | Cloud Functions auto‑scale to 1 k rph        | Gradual public roll‑out.    |
| Accessibility | WCAG 2.1 AA                                  | Inclusive design.           |

---

## 6  Tech Stack

| Layer    | Choice                                        |
| -------- | --------------------------------------------- |
| Frontend | Next.js 14, React 18, TypeScript, TailwindCSS |
| Backend  | Firebase Cloud Functions (Node 20 TS)         |
| Database | Cloud Firestore (EU‑W3)                       |
| Auth     | Firebase Auth                                 |
| Parsing  | `@mozilla/readability` + `jsdom`              |
| AI       | OpenAI Chat Completions (`gpt‑3.5‑turbo`)     |
| CI/CD    | GitHub Actions → `firebase deploy`            |

---

## 7  Roadmap Glimpse

1. **iOS Share Extension** (native SwiftUI, CloudKit offline cache).
2. Bulk **Pocket/Instapaper Importer** (HTML → Firestore).
3. Global **Full‑Text Search** via Algolia or Firestore Aggregations.
4. **Image caching** in Cloud Storage for complete offline reading.
5. Community‑driven **Open‑source plugin system** for custom AI prompts.

---

## 8  Revision History

| Version | Date (UTC) | Author  | Notes                                  |
| ------- | ---------- | ------- | -------------------------------------- |
| 1.0     | 2025‑05‑24 | ChatGPT | Initial Norwegian draft.               |
| 1.1     | 2025‑05‑25 | ChatGPT | English rewrite; Firebase‑first focus. |

---

*End of document.*
