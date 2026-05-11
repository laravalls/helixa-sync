# HelixA Architecture Context

## Stack

- Frontend: Vite + React + TypeScript
- UI: shadcn/Radix-style components, Tailwind CSS, lucide-react
- Routing: React Router
- Data fetching/state: TanStack Query is installed
- Backend: Supabase
- Hosting: Vercel
- Domain: `helixa-sync.com`

## Frontend Structure

Important app files:

- `src/App.tsx`: route definitions and providers.
- `src/pages/Onboarding.tsx`: onboarding flow.
- `src/pages/Today.tsx`: likely primary daily view.
- `src/pages/Profile.tsx`: profile/settings area.
- `src/pages/Connections.tsx`: integrations/connections area.
- `src/components/helix/HaloRing.tsx`: visual ring component.
- `src/components/CycleRing.tsx`: cycle visualization.
- `src/integrations/supabase/client.ts`: Supabase client.
- `src/integrations/supabase/types.ts`: generated Supabase types.
- `src/lib/db.ts`: local database helper logic.
- `src/lib/onboardingCheck.ts`: onboarding guard/helper logic.

Current routes include:

- `/`
- `/onboarding`
- `/movement`
- `/plate`
- `/stack`
- `/recovery`
- `/connections`
- `/research`
- `/profile`
- `/premium`
- `/beta`
- `/leads`
- `/styleguide`

## Current Supabase Schema

The local generated types currently include these public tables:

- `user_cycles`
- `cached_plans`
- `wearable_readings`
- `beta_signups`
- `email_send_log`
- `email_send_state`
- `email_unsubscribe_tokens`
- `suppressed_emails`

Current user health data is mostly keyed by `device_id`.

## Desired Core Schema

The agreed product direction mentions four core tables:

- `user_cycles`
- `daily_scores`
- `hrv_entries`
- `beta_signups`

`daily_scores` and `hrv_entries` are not currently present in the generated Supabase types. Add migrations before using them in code.

## Current Edge Functions

Current checkout contains:

- `supabase/functions/auth-email-hook`
- `supabase/functions/process-email-queue`

The planned product function:

- `supabase/functions/calculate-score`

does not currently exist in this checkout.

## Auth Direction

Current state:

- No full user auth layer for app data.
- Public-ish policies exist in older migrations for some `device_id` keyed tables.

Target state:

- Supabase magic link auth first.
- Google OAuth second.
- All sensitive user data tied to `auth.uid()`.
- RLS policies must prevent cross-user reads/writes.
- Migrate away from `device_id` for authenticated user-owned records.

## Edge Function Direction

`calculate-score` should be a Supabase Edge Function that:

- Authenticates the user.
- Reads cycle and recovery inputs.
- Computes the deterministic score.
- Calls Claude with server-side API credentials.
- Returns daily guidance.
- Stores generated output in `daily_scores` if needed.

Never expose Claude/Anthropic secrets to frontend code.

