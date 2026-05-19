import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyToken } from "@clerk/backend";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function getVerifiedUserId(req: VercelRequest): Promise<string | null> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const { sub } = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
    return sub;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await getVerifiedUserId(req);
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  // GET — fetch the current user's profile
  if (req.method === "GET") {
    const rows = await sql`
      SELECT clerk_user_id, email, name, date_of_birth, timezone,
             last_period_date, cycle_length, period_duration_days,
             active_mode, has_irregular_cycles,
             onboarding_completed, onboarding_completed_at,
             preferences, created_at
      FROM user_profiles
      WHERE clerk_user_id = ${userId}
      LIMIT 1
    `;
    return res.json(rows[0] ?? null);
  }

  // POST — create or update profile (upsert)
  if (req.method === "POST") {
    const {
      email,
      name,
      date_of_birth,
      timezone,
      last_period_date,
      cycle_length,
      period_duration_days,
      active_mode,
      has_irregular_cycles,
      onboarding_completed,
      preferences,
    } = req.body ?? {};

    if (!last_period_date) {
      return res.status(400).json({ error: "last_period_date is required" });
    }

    const now = new Date().toISOString();

    const rows = await sql`
      INSERT INTO user_profiles (
        clerk_user_id, email, name, date_of_birth, timezone,
        last_period_date, cycle_length, period_duration_days,
        active_mode, has_irregular_cycles,
        onboarding_completed, onboarding_completed_at,
        preferences
      )
      VALUES (
        ${userId},
        ${email ?? null},
        ${name ?? null},
        ${date_of_birth ?? null},
        ${timezone ?? "UTC"},
        ${last_period_date},
        ${Number(cycle_length ?? 28)},
        ${Number(period_duration_days ?? 5)},
        ${active_mode ?? "cycle_sync"},
        ${has_irregular_cycles ?? false},
        ${onboarding_completed ?? false},
        ${onboarding_completed ? now : null},
        ${JSON.stringify(preferences ?? {})}
      )
      ON CONFLICT (clerk_user_id) DO UPDATE SET
        email                   = COALESCE(EXCLUDED.email,                user_profiles.email),
        name                    = COALESCE(EXCLUDED.name,                 user_profiles.name),
        date_of_birth           = COALESCE(EXCLUDED.date_of_birth,        user_profiles.date_of_birth),
        timezone                = EXCLUDED.timezone,
        last_period_date        = EXCLUDED.last_period_date,
        cycle_length            = EXCLUDED.cycle_length,
        period_duration_days    = EXCLUDED.period_duration_days,
        active_mode             = EXCLUDED.active_mode,
        has_irregular_cycles    = EXCLUDED.has_irregular_cycles,
        onboarding_completed    = EXCLUDED.onboarding_completed,
        onboarding_completed_at = CASE
          WHEN EXCLUDED.onboarding_completed AND user_profiles.onboarding_completed_at IS NULL
          THEN NOW() ELSE user_profiles.onboarding_completed_at END,
        preferences             = user_profiles.preferences || EXCLUDED.preferences,
        updated_at              = NOW()
      RETURNING clerk_user_id, email, name, last_period_date, cycle_length,
                active_mode, onboarding_completed
    `;
    return res.status(200).json(rows[0]);
  }

  return res.status(405).json({ error: "method not allowed" });
}
