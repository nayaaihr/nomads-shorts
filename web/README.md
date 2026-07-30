# Nomads Shorts

A web app that turns long YouTube videos into vertical short clips — AI picks the best moments, reframes to 9:16, and burns in animated captions.

This directory (`web/`) is the Phase 0 foundation: landing page, auth, dashboard shell, DB schema, and Stripe checkout. **The AI video pipeline is not wired up yet** — that's Phase 1.

## What works today

- ✅ Landing page with hero, features, pricing
- ✅ Google sign-in via Supabase (with YouTube read-only scope pre-requested)
- ✅ Protected dashboard with credit balance widget, sidebar, sign-out
- ✅ Submit-a-YouTube-URL form (creates a `videos` row, no processing yet)
- ✅ My Clips library page + per-video detail page
- ✅ Billing page + Stripe Checkout for credit packs
- ✅ Stripe webhook that grants credits idempotently
- ✅ Database schema with RLS policies (Supabase migration `supabase/migrations/0001_init.sql`)

## Phase 1 (video pipeline) — now built

- ✅ Inngest queue + typed pipeline function
- ✅ yt-dlp download (source video into local tmp)
- ✅ Whisper large-v3 transcription via Replicate (English + Hindi, word-level timestamps)
- ✅ Claude Haiku moment detection on transcript (zod-validated, overlap-dedup)
- ✅ ffmpeg centered 9:16 reframe + styled ASS caption burn-in
- ✅ Cloudflare R2 storage + signed download URLs
- ✅ Credit deduction (1 credit / minute of source video)

**Not yet built:** face-tracked reframe (currently centered crop), background music library, Fly.io production worker (dev works fine on Next.js server since `next dev` has no timeout).

---

## Setup: from zero to running locally (~30 minutes)

You need accounts on: **Supabase**, **Google Cloud** (for OAuth), and **Stripe** (test mode is free).

### 1. Install and copy env

```bash
cd web
npm install
cp .env.example .env.local
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Once it's up, go to **Project Settings → API** and copy into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` — the "Project URL"
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the "anon public" key
   - `SUPABASE_SERVICE_ROLE_KEY` — the "service_role secret" key (**never expose this client-side**)
3. Go to **SQL Editor** and paste the contents of `supabase/migrations/0001_init.sql`, then run it.

### 3. Google OAuth (so Google sign-in works)

1. Open the [Google Cloud Console](https://console.cloud.google.com), create or pick a project.
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application**.
3. Add these URLs:
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `https://<YOUR-SUPABASE-PROJECT>.supabase.co/auth/v1/callback`
4. Copy the client id and secret.
5. In the Supabase dashboard: **Authentication → Providers → Google**, paste them in, enable, save.
6. **APIs & Services → Library**, search for **YouTube Data API v3** and click **Enable** (we request its read-only scope at sign-in).

### 4. Stripe (test mode)

1. Sign in at [dashboard.stripe.com](https://dashboard.stripe.com). Stay in **test mode**.
2. Copy your test **secret key** into `.env.local` as `STRIPE_SECRET_KEY`.
3. Create three **Products** with one-time **Prices**:
   - `Starter` — $9 USD one-time
   - `Creator` — $39 USD one-time
   - `Pro` — $99 USD one-time
4. Copy each Price id (starts with `price_...`) into `.env.local`.
5. Set up the webhook forwarder (needs the [Stripe CLI](https://stripe.com/docs/stripe-cli)):
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the `whsec_...` value it prints into `STRIPE_WEBHOOK_SECRET`.

### 5. Run it

```bash
npm run dev
```

Open <http://localhost:3000>. You should see the landing page. Click **Sign in**, complete Google OAuth, and you'll land on the dashboard with 15 free credits.

Try a purchase with Stripe test card `4242 4242 4242 4242` (any future date, any CVC, any ZIP). The webhook should grant credits within a second.

---

## Project layout

```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Landing page
│   │   ├── sign-in/                          # Google OAuth entry
│   │   ├── auth/callback/route.ts            # OAuth code exchange
│   │   ├── sign-out/route.ts
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                    # Sidebar + credit widget
│   │   │   ├── page.tsx                      # "Paste URL" + recent videos
│   │   │   ├── library/                      # All videos
│   │   │   ├── videos/[id]/                  # Per-video detail
│   │   │   └── billing/                      # Credit packs + ledger
│   │   ├── api/
│   │   │   ├── videos/route.ts               # Submit new video
│   │   │   ├── checkout/route.ts             # Create Stripe Checkout session
│   │   │   └── stripe/webhook/route.ts       # Grant credits on payment
│   │   └── legal/                            # Terms + Privacy placeholders
│   ├── components/
│   │   ├── ui/                               # shadcn/ui primitives
│   │   ├── site-header.tsx
│   │   └── site-footer.tsx
│   ├── lib/
│   │   ├── env.ts                            # Env-var accessors
│   │   ├── pricing.ts                        # Credit-pack definitions
│   │   ├── stripe.ts
│   │   └── supabase/
│   │       ├── client.ts                     # Browser client
│   │       ├── server.ts                     # Server Component client
│   │       ├── admin.ts                      # Service-role client (webhooks/worker)
│   │       └── session.ts                    # getUser / getUserOrRedirect helpers
│   └── proxy.ts                              # Session refresh (Next 16 renamed middleware.ts → proxy.ts)
├── supabase/
│   └── migrations/
│       └── 0001_init.sql                     # Schema + RLS + signup trigger
└── .env.example
```

## Running the video pipeline locally

Once Phase 1 accounts are set up (Anthropic, Replicate, R2 keys in `.env.local`; `yt-dlp` and `ffmpeg` on your PATH via `brew install yt-dlp ffmpeg`), you need three terminals:

**Terminal 1 — the app**
```bash
cd web
npm run dev
```

**Terminal 2 — the Inngest dev server** (auto-discovers your app)
```bash
npx inngest-cli@latest dev
```

Dashboard at [http://localhost:8288](http://localhost:8288) — shows every event, every function run, live logs, and lets you retry from any step.

**Terminal 3 — Stripe webhook forwarder** (only if you're testing purchases)
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Then in a browser:
1. Sign in at [http://localhost:3000](http://localhost:3000)
2. Paste a YouTube URL of a video ≤ 30 min
3. Watch the video status advance: `queued → downloading → transcribing → picking → clipping → ready`
4. Refresh the video detail page — you'll see 3–10 clips with download buttons

Rough cost per 30-min video: ~$0.30 (Whisper $0.18, Claude Haiku $0.01, R2 pennies).

## Notes on Next.js 16

This scaffold targets Next 16. A few things that trip up code copied from older tutorials:

- `cookies()`, `headers()`, `params`, `searchParams` are all **async** — you must `await` them.
- The old `middleware.ts` file is now `proxy.ts`. Same purpose.
- Turbopack is the default for `next dev` and `next build`.
