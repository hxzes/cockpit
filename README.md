# moni cockpit

Private admin for my web agency. Clients, invoices, MRR, lead gen, and an AI copilot. Next.js 15 + Firebase + Gemini.

## Features

**Dashboard**
- MRR, total revenue, conversion, leads — all computed live from the data
- Line charts (MRR + revenue) with animated draw-in, MRR sparkline
- Tasks widget and recent invoices

**Clients**
- Add clients with monthly retainers
- Status (active / lead / churned) drives MRR
- Add / edit / delete, status changes inline

**Invoices**
- Paid / pending / overdue, totals computed automatically
- Paid + outstanding stat cards

**Lead Gen**
- One command bar: pick type · city · country · count from dropdowns
- Custom city and custom lead count (type your own)
- AI suggested searches under the bar (one click fills the bar)
- Scrape pulls businesses from Google Maps
- Pulls phone (Google) + Instagram handle + email from the business's own site
- AI scores each site, finds the main problem
- Priority sort: weak / no website floats to top (biggest opportunity)
- AI writes the outreach + a short website audit you can send as free value
- Copy & Open straight into IG / email (email uses the AI subject line)
- Convert a lead to a client in one click

**AI Brief** (per lead, "Open")
- Estimated price range, close chance %, best first-contact channel
- What we found, biggest problem, recommended subject line
- Likely objections + answers, full call script (opening / questions / pain / close / CTA)

**Leo** (copilot, bottom-right)
- Sees a live snapshot of the data, answers business questions, writes messages
- Proposes actions (create invoice, set status) — every action needs a confirm click, nothing writes on its own

**Design**
- Monochrome + lime accent, Geist / Geist Mono
- Floating pill top nav, account menu (sign out is there)
- Responsive + works as a phone app (add to home screen)

## Stack
- Next.js 15 (App Router), Firebase (Auth + Firestore), Gemini `gemini-2.5-flash`
- Data in Firestore: `clients`, `invoices`, `projects`, `leads`
- UI paints from a localStorage cache first, reconciles from Firestore in the background
- Server-only keys (`GEMINI_API_KEY`, `GOOGLE_MAPS_API_KEY`) stay in `/app/api/*`, never reach the browser

## Run
1. `npm install`
2. Copy `.env.local.example` → `.env.local`, add your own Gemini + Maps keys (Firebase values can stay)
3. `npm run dev` → http://localhost:3000
4. Added keys while the server was running? Restart it. Next only reads `.env.local` at startup.

## Auth
- Login at `/login`. First run: create the admin account, then sign in. All pages gated.
- Firebase Console → Authentication → Email/Password must be enabled.

## "GEMINI_API_KEY / GOOGLE_MAPS_API_KEY missing"
Means Next isn't reading the env file. Check in order:
1. File named exactly `.env.local` (not `.env.local.example`, not `.txt`)
2. Sits in the project root, next to `package.json`
3. Restart the dev server after any change
4. Open http://localhost:3000/api/health — it prints whether each key is present
5. No spaces around `=`. Quotes optional.

Both keys are server-only (no `NEXT_PUBLIC_`) — correct, they're used only inside `/app/api/*`.
