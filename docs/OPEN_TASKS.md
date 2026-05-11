# HelixA Open Tasks

## Immediate

- Commit and push the refreshed `package-lock.json`.
- Add Vercel environment variables.
- Migrate `helixa-sync.com` DNS from Lovable to Cloudflare.
- Point Cloudflare DNS to Vercel.
- Decide whether to fix lint before or after auth work.

## Auth And Security

- Add Supabase magic-link auth.
- Add Google OAuth.
- Add protected routes/session handling.
- Add `user_id` ownership fields.
- Replace `device_id` ownership for private health data.
- Add strict RLS policies.
- Keep `beta_signups` public insert-only if beta capture remains public.

## Backend

- Create migrations for `daily_scores` and `hrv_entries` if those remain the canonical table names.
- Add `calculate-score` Edge Function.
- Add server-side Claude API integration.
- Store generated daily guidance safely.
- Add score calculation tests/fixtures.

## Frontend

- Align onboarding with auth.
- Build or refine main daily score ring.
- Add score explanation and daily guidance.
- Add settings/account screen.
- Add manual HRV/sleep entry if no wearable integration is available at launch.

## Later

- HealthKit integration.
- Oura integration.
- Historical trends.
- More robust analytics and observability.

