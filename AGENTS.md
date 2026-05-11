# HelixA Agent Context

HelixA is a biohacking web app for women. It helps users align training, recovery, nutrition, and daily decisions with menstrual cycle phase, HRV, sleep, and recovery signals.

This repo is a hackathon-stage Vite + React + TypeScript app hosted on Vercel with Supabase as the backend.

## Canonical Links

- GitHub repo: `laravalls/helixa-sync`
- Local working path: `/Users/enterclawdbotrunner/Documents/GitHub/helixa-sync`
- Domain: `helixa-sync.com`
- Hosting: Vercel
- Domain registrar: Lovable
- Planned DNS provider: Cloudflare

## Current Status

- The app is deployed to Vercel.
- Local dev server runs with `npm run dev`.
- Production build passes with `npm run build`.
- Tests pass with `npm test`.
- Lint currently fails on pre-existing issues.
- There is no full auth layer yet.
- Current data model mostly keys user data by `device_id`.
- `package-lock.json` was refreshed with `npm install` because `npm ci` failed due to a stale lockfile.

## Product Build Order

1. Supabase auth with magic link.
2. Google OAuth.
3. RLS policies tied to `auth.uid()`.
4. `calculate-score` Supabase Edge Function.
5. Frontend screens: onboarding, main score ring, settings.
6. Post-launch v1.1: HealthKit and Oura integrations.

## Important Repo Reality Check

The desired backend includes four core tables:

- `user_cycles`
- `daily_scores`
- `hrv_entries`
- `beta_signups`

The current checked-out Supabase schema includes:

- `user_cycles`
- `cached_plans`
- `wearable_readings`
- `beta_signups`
- email infrastructure tables

The desired `calculate-score` Edge Function is part of the planned build, but this checkout currently contains email-related Edge Functions instead:

- `supabase/functions/auth-email-hook`
- `supabase/functions/process-email-queue`

Do not assume `calculate-score`, `daily_scores`, or `hrv_entries` exist locally until migrations/functions are added.

## Development Commands

```bash
npm install
npm run dev
npm test
npm run build
npm run lint
```

## Environment Variables

Vercel and local development need:

```txt
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_URL
```

Future Edge Functions will also need server-side secrets such as Anthropic/Claude API credentials. Do not expose those as `VITE_` variables.

## Implementation Principles

- Preserve the existing Vite + React + TypeScript + shadcn/Radix patterns.
- Treat health data as sensitive.
- Move away from `device_id` once auth is implemented.
- Add RLS before storing private user health data under authenticated accounts.
- Keep HealthKit and Oura out of MVP unless explicitly reprioritized.
- Prefer small, verifiable changes with tests/build checks.

