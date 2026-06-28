# moni cockpit

Admin for your web business — clients, invoices, MRR — plus a built-in Lead Gen module and an AI copilot that can read your data and take actions. Next.js 15 + Firebase + Gemini.

## What's inside
- **Dashboard** — MRR, revenue, conversion, leads. Orange line charts, green MRR sparkline. All computed live from your data.
- **Clients** — add clients with monthly retainers; status (active/lead/churned) drives MRR.
- **Invoices** — paid/pending/overdue, totals computed automatically.
- **Lead Gen** — scrape businesses (Google Maps) → AI scores their site + finds the problem → AI writes the outreach → Copy & Open to send yourself. Convert a lead to a client in one click.
- **AI Copilot** (floating, bottom-right) — sees a live snapshot of your data and answers business questions, writes messages, and proposes actions (create invoice, set status). Every action shows a confirm button — nothing is written without your click.

## Run
1. `npm install`
2. Copy `.env.local.example` → `.env.local`, add your **own** Gemini + Maps keys (Firebase values can stay).
3. `npm run dev` → http://localhost:3000
4. If you add keys after the server is running, restart `npm run dev` (Next reads `.env.local` only at startup).

## Data
- Stored in **Firestore** (collections: `clients`, `invoices`, `projects`, `leads`).
- The UI paints instantly from a localStorage cache, then reconciles from Firestore in the background — so it never hangs on a slow connection.
- Server-only keys (`GEMINI_API_KEY`, `GOOGLE_MAPS_API_KEY`) stay in API routes, never reach the browser.
- Firestore rules are open for dev; add Firebase Auth before exposing this anywhere.
- Optional: set `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` to let the server write via Admin SDK; otherwise the client SDK handles writes.

## Note on the look
Built to feel like the SaaSykit admin (light cards, orange charts, sidebar) but it's its own codebase tailored to a web agency — not a copy of their product.



## Lead Gen — Instagram + email
- The scraper now also pulls an Instagram handle and a contact email from each business's OWN website (public contact info), in addition to phone from Google. It does NOT scrape Instagram from Google search results (against Google TOS and fragile).

## Leo (AI copilot)
- The assistant is "leo" — writes lowercase, no diacritics, calls you Seb, sees your live data and proposes confirmable actions.


## Troubleshooting — "GEMINI_API_KEY / GOOGLE_MAPS_API_KEY missing"
This almost always means Next.js isn't reading your env file. Check, in order:
1. The file must be named exactly **`.env.local`** — NOT `.env.local.example`, not `.env.local.txt`. Rename the example file.
2. It must sit in the **project root**, next to `package.json`.
3. **Restart** the dev server after any change: stop it (Ctrl+C) and run `npm run dev` again. Next reads `.env.local` only at startup.
4. Verify what the server actually sees: open **http://localhost:3000/api/health** — it prints whether each key is present. If it says MISSING, it's one of the three points above.
5. No quotes issues: `GEMINI_API_KEY=AIza...` or `GEMINI_API_KEY="AIza..."` both work; no spaces around `=`.

Note: `GEMINI_API_KEY` and `GOOGLE_MAPS_API_KEY` are server-only (no `NEXT_PUBLIC_`). That's correct — they're used only inside `/app/api/*`.


## Auth (firebase)
- Login at `/login`. First run: "Create one" → admin account → sign in. All pages gated, redirect to /login if signed out. Sign out in sidebar.
- Firebase Console → Authentication → Email/Password = ENABLED (done).

## Lead Gen — filters + AI
- No manual typing: pick business TYPE + CITY from chips (AI suggests the best targets on load via /api/suggest).
- Priority sort: leads with no/weak website float to top (biggest opportunity).
- "AI audit" button per lead = Leo writes a short website audit you can send as free value.

## Model
- gemini-2.5-flash across all routes.

## Mobile
- Responsive + hamburger drawer. Works as a phone app (add to home screen).


## AI Sales Brief (leadgen → Open)
Per lead, "Open" → 🧠 AI Brief tab: estimated price range, close chance %, best first-contact channel, what we found, biggest problem, recommended subject line, likely objections + answers, and a full call script (opening/questions/pain/close/CTA). All from gemini. ✉️ Sprava tab = outreach message + AI audit + Copy & Open. The email "Open" uses the AI-recommended subject automatically.

## Login errors
Login now shows human messages (weak password <6 chars, email already in use, wrong credentials, etc.) instead of silent console 400s.
