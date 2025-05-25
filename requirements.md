# The Librarian: A Read‑It‑Later Service – Firebase MVP Requirements

## Purpose

A minimalist, open‑source "read‑it‑later" web application that lets users save articles, view them in a distraction‑free reader mode, tag & filter them, and (optionally) receive an AI‑generated summary.
This document captures **developer‑facing requirements** for the first production‑quality release, targeting **Firebase** as the back‑end platform.

---

## Functional Requirements

### 1  Save Article

* **Input sources**

  * Web UI (Paste/Enter URL)
  * Browser extension → POSTs URL & auth‑token to API
  * Mobile share sheet (Android Web‑Share Target; iOS via copy/paste for MVP)
* **Server action** (Cloud Function `saveArticle`)

  1. Validate URL & user auth (Firebase Auth JWT)
  2. Fetch raw HTML (server‑side HTTP request)
  3. Parse with **Mozilla Readability** to extract:

     * `title`, `content` (HTML), `textContent`, `excerpt`, `heroImage`
  4. Persist to **Cloud Firestore** in collection `articles/{uid}/{docId}` with fields:

     ```jsonc
     {
       "url": "https://…",
       "title": "…",
       "contentHtml": "…",
       "excerpt": "…",
       "tags": [],
       "createdAt": serverTimestamp,
       "readTimeWords": 690,
       "aiSummary": null
     }
     ```
  5. Return `docId` to client.

### 2  Reader‑Mode View

* Render `contentHtml` in a clean template (max‑width column, serif font, light/dark theme toggle).
* Display metadata (title, domain favicon, estimated read‑time).
* **Offline**: Use Firestore SDK offline cache + Service Worker precache `contentHtml`.

### 3  Tagging & Organisation

* Users can **add, remove, and list tags** on an article.
* Tag list autocomplete (distinct values in user’s scope).
* Filter list view by single tag (Firestore `array‑contains` query).

### 4  AI Summary (Optional)

* Cloud Function `summarizeArticle` (Node 20) triggered **on‑demand** by client or via nightly batch.
* Uses **OpenAI Chat Completions API** (GPT‑3.5 for MVP) with a fixed prompt to return:

  ```jsonc
  {
    "summary": "Two‑sentence TL;DR …",
    "verdict": "Read | Skim | Skip"
  }
  ```
* Persist to `aiSummary` field; surface in UI under article header.

### 5  Authentication & Accounts

* Firebase Auth (Email+Password & Google OIDC).
* All documents are keyed by `uid`; security rules enforce isolation.

### 6  Browser Extension (Chrome MV3 baseline)

* Button: *Save to Read‑Later* → message background script.
* Background script grabs `tab.url`, reads `tab.title`, calls REST endpoint `/save` with bearer token stored in `chrome.storage`.

### 7  Progressive Web App

* Installable on Android & iOS (Safari PWA).
* Registers as Web Share Target on Android to receive URLs.

---

## Non‑Functional Requirements

| Category          | Target                                                                           |
| ----------------- | -------------------------------------------------------------------------------- |
| **Performance**   | <300 ms server processing per save (excluding AI request)                        |
| **Availability**  | 99.9 % (leverages Firebase automatic multi‑AZ)                                   |
| **Scalability**   | Tested to 1 k saves/hour without warm‑up                                         |
| **Security**      | OWASP Top‑10 hardened; rules restrict reads/writes to `uid === request.auth.uid` |
| **Privacy**       | No article data shared with third parties except OpenAI (opt‑in)                 |
| **International** | UI i18n ready (English default; Norwegian planned)                               |
| **Accessibility** | WCAG 2.1 AA for reader view                                                      |

---

## Tech Stack

* **Frontend**   Next.js 14 + React 18 + TypeScript + TailwindCSS
* **Backend**    Firebase Cloud Functions (Node 20 TS)
* **Database**   Cloud Firestore (NoSQL)
* **Auth**       Firebase Auth
* **Hosting**    Firebase Hosting (CDN, HTTPS)
* **Storage**    Firestore docs (HTML inline) • optional Cloud Storage for hero images
* **AI**         OpenAI Chat Completions (`gpt‑3.5‑turbo`) via official `openai` NPM SDK
* **Parsing**    `@mozilla/readability` + `jsdom`
* **Testing**    Vitest + Testing Library + Playwright (e2e)
* **CI/CD**      GitHub Actions → Firebase Hosting & Functions deploy

---

## Out of Scope (MVP)

* Native iOS / Android app (beyond PWA shell)
* Multi‑user sharing or collaborative lists
* Full‑text multi‑tag boolean search (only single‑tag filter MVP)
* Import from Pocket/Instapaper (CSV/HTML importer backlog)

---

## Future‑Roadmap Snippets

1. **Native iOS Share Extension** & SwiftUI reader.
2. **Bulk import/export** incl. Pocket HTML export.
3. **Background AI summarization queue** for unread > 7 days.
4. **Bookmarklet** for browsers without extension support.
5. **Image caching** into Cloud Storage with signed URLs.
6. **Offline first-class**: pre‑download hero images, fonts.

---

## Acceptance Criteria (Happy Path)

1. User is signed in → enters URL → article appears in list within ≤ 5 s.
2. Opening article renders clean reader view with accurate title/body.
3. Adding tag syncs across devices instantly (Firestore real‑time).
4. Clicking *Generate Summary* returns AI result in ≤ 8 s.
5. Browser extension saves current tab with 1 click → snackbar confirmation.

---

*Document version 1.0 – 2025‑05‑24 – drafted by ChatGPT*
