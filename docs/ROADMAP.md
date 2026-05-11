# HelixA Build Roadmap

## Phase 0: Stabilize Current App

- Keep Vercel deployment green.
- Keep `npm test` and `npm run build` passing.
- Fix stale dependency lockfile issues.
- Document current architecture and desired direction.
- Triage lint failures separately.

## Phase 1: Auth

Goal: replace anonymous `device_id` ownership with real users.

Tasks:

- Add Supabase magic-link sign-in.
- Add auth callback route if needed.
- Add session provider or hook.
- Gate private app screens behind auth.
- Keep onboarding after auth, not before auth.
- Add Google OAuth after magic link works.

## Phase 2: Data Model And RLS

Goal: make user health data private by default.

Tasks:

- Add `user_id uuid references auth.users(id)` to user-owned tables.
- Create or migrate desired core tables:
  - `user_cycles`
  - `daily_scores`
  - `hrv_entries`
  - `beta_signups`
- Write RLS policies using `auth.uid()`.
- Remove broad public read/write policies from sensitive tables.
- Preserve public insert for beta signup only if needed.

## Phase 3: Score Engine

Goal: create the daily score and guidance backend.

Tasks:

- Add `supabase/functions/calculate-score`.
- Implement deterministic 0-100 score from:
  - cycle phase
  - HRV
  - sleep
  - recovery inputs
- Add Claude API call for daily guidance.
- Store output in `daily_scores`.
- Add local tests or fixture-driven validation for score behavior.

## Phase 4: Frontend Product Screens

Goal: ship the core user experience.

Tasks:

- Auth screens.
- Onboarding flow.
- Main daily score ring.
- Daily guidance module.
- Cycle phase explanation.
- Manual HRV/sleep input if wearable integrations are not ready.
- Settings/profile screen.
- Sign out/account controls.

## Phase 5: Post-Launch Integrations

v1.1 candidates:

- HealthKit.
- Oura.
- Better automated wearable ingestion.
- Historical trend views.

