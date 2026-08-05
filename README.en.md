# Greek by Ear — online Greek language school

Live site: **https://greek-zoi.com**

A subscription site for Zoi Pavlovska's Greek language school. Students listen to Greek songs
and dialogues with line-by-line transcripts and Russian translations, sorted by CEFR level and
topic. Part of the library is free; the rest opens with a paid subscription. Everything on the
site — materials, levels, topics, prices, texts, contacts — is edited by the school through the
admin area, without a developer.

Built and deployed solo: frontend, backend, database, payments, transactional email, hosting
and DNS.

## Tech stack

**Frontend**

- React 19 — function components, hooks, `lazy` + `Suspense` route splitting
- TypeScript 6
- MUI 9 — component library, theming, responsive breakpoints
- React Router 7 — client-side routing
- Vite 8 — dev server, production bundling, content-hashed assets

**Backend**

- Node.js 22, ES modules
- Express 5 — REST API, static serving, SPA fallback
- `node:sqlite` — Node's built-in SQLite driver, no native build step
- multer 2 — audio uploads filtered by MIME type and extension

**Database**

- SQLite in WAL mode, single-file storage on a persistent disk
- Normalised schema with many-to-many joins (materials ↔ levels, materials ↔ topics)
- Startup migrations driven by `PRAGMA table_info`

**Authentication and security**

- jsonwebtoken 9 — signed JWT sessions in httpOnly, SameSite, secure cookies
- bcryptjs 3 — password hashing
- Server-side authorisation: role checks on admin routes, per-request subscription checks on media
- Response filtering: locked content stripped from API payloads before serialisation
- Login throttling; single-use hashed email tokens with a TTL
- HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, http→https redirect

**Payments**

- Stripe 22 SDK — Checkout Sessions in one-off `payment` mode
- Webhook fulfilment with `constructEvent` signature verification
- Idempotency via payment-id lookup before access is granted
- Inline `price_data` generated from admin-managed plans, no dashboard products

**Email**

- Resend HTTP API, chosen over SMTP because the host blocks outbound SMTP ports
- nodemailer 9 retained as an SMTP fallback transport
- DKIM, SPF and DMARC configured on the sending domain

**Infrastructure**

- Render Web Service with a mounted persistent disk for the database and uploads
- Automatic deploys from GitHub `main`
- Cloudflare — DNS, TLS termination, CDN
- Namecheap — domain and DNS records

**SEO**

- Server-generated `robots.txt` and `sitemap.xml`
- Per-route title, meta description and canonical URL
- Open Graph tags for link previews
- Google Search Console verification and sitemap submission

**Tooling**

- oxlint for linting, `tsc -b` type checking in the build pipeline
- concurrently for parallel dev processes
- Git / GitHub

## Running locally

```bash
npm install
npm run dev      # API on :4000 and the site on :5173
npm run build    # client build into dist/
npm start        # production mode: one process serves both API and the built site
```

Open **http://localhost:5173**. The database is created on first run and filled with demo
content. Configuration lives in `.env` — copy `.env.example` and fill it in.

## Access control, done properly

The point of the project is that paid content is actually protected, not merely hidden in the
interface.

- **Locked material never leaves the server.** Without a subscription the API response carries
  no audio URL and no lyrics — only a "locked" marker. Audio is served through
  `/api/audio/:id`, and access is re-checked on every request, so a shared link is useless.
- **Subscriptions are activated by the server on a Stripe webhook**, never by the browser.
  The signature is verified, a replayed event does not extend a subscription twice.
- **Passwords** are stored as bcrypt hashes only and never reach the client.
- **Sessions** are signed JWTs in httpOnly cookies, invisible to page scripts.
- **Login throttling**: five consecutive failed attempts close that address for fifteen
  minutes; a successful login resets the counter.
- **Email confirmation and password reset** use single-use links; only the token hash is
  stored, and the links expire (24 hours and 1 hour respectively).
- **Admin routes** under `/api/admin/*` require the administrator role.
- **HTTPS** with an http→https redirect, HSTS and `secure` cookies.

## Payments

Stripe Checkout in one-off `payment` mode: paying opens access for N days. Prices come from the
plans in the admin area — no products are created in the Stripe dashboard, the line item is
built on the fly from the plan. Switching to auto-renewal means changing `mode: 'payment'` to
`mode: 'subscription'` in `server/payments.js`.

With no Stripe keys configured, card payment is simply off: the subscription page shows the
school's contacts instead of a checkout button, and the administrator grants access manually.
Access is never granted for free — the server rejects the checkout request outright.

Two things worth knowing, both learned the hard way:

- Stripe **Express** accounts (the kind WooCommerce/WooPayments creates) have no API keys, no
  webhooks and no sandboxes. A custom integration needs a standard account.
- **Managed Payments** is enabled by default on new accounts and demands a tax code on every
  line item, which is impossible when the item is generated from an admin-editable plan. It is
  switched off explicitly in `server/payments.js`.

## Email

Transactional email goes through the Resend HTTP API rather than SMTP, because Render blocks
outbound SMTP ports. Three letters are sent: address confirmation on sign-up, password reset,
and a notice when a subscription starts.

Until email is configured nothing is lost: letters are printed to the server console and the
link is shown right in the sign-up dialog, which makes local testing painless.

The confirmation link points at a normal page of the site rather than straight at the API.
An `/api/auth/verify?token=…` style link was flagged by Google Safe Browsing as deceptive, and
Chrome showed a full-page red warning instead of the site — so the token now travels in a
separate request the link checker never sees.

## Admin area

Five tabs at `/admin`, administrator role only:

- **Materials** — create, edit, duplicate, delete; upload an audio file straight from the
  computer; free/published toggles inline in the table; a line-by-line lyrics editor plus bulk
  paste of a whole text with translation.
- **Levels and topics** — add, rename, reorder, delete (deletion is blocked while a level or
  topic is still in use).
- **Home page and plans** — titles, contacts, both video links with a preview, prices and what
  each plan includes.
- **Students** — who signed up, whose subscription is active, manual activation.
- **Statistics** — page views, audio plays, search queries, and which locked materials people
  bump into most — the best source of ideas for what to open for free.

## Project layout

```
server/
  index.js               API: accounts, audio access, payments, admin operations
  config.js              environment, session signing key, HTTPS settings
  db.js                  SQLite: schema and every query
  payments.js            Stripe: checkout creation and webhook handling
  mailer.js              email: confirmation, password reset, subscription started
  seed.js                demo content (10 materials, 4 levels, 8 topics)
  data/school.db         the database itself (created on first run)
  uploads/               uploaded audio files

src/
  api/client.ts          the single point where the frontend talks to the server
  store/AppContext.tsx   global state: data, current user, actions
  lib/search.ts          query parsing and filtering
  components/            header, footer, search, video block, track card, auth dialog
  pages/                 home, catalog, full list, subscription, account, password reset
  pages/admin/           admin area: materials, levels and topics, settings, students, stats
```

Search normalises alphabets: Cyrillic «А», Latin «A» and Greek «Α» are treated as the same
letter, so a query typed in any of the three layouts finds the same material.

The site is fully responsive — on narrow screens every table turns into a list of cards, so
nothing needs horizontal scrolling.

---

The Russian README, with deployment and operations notes for the school, is in
[README.md](README.md).
