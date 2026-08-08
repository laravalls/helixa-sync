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

// GET /api/health-metrics?days=14
// Returns the last N days of health_metrics rows for the authenticated user,
// plus the latest daily_score.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });

  const userId = await getVerifiedUserId(req);
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  const days = Math.min(parseInt((req.query.days as string) ?? "14", 10) || 14, 90);

  try {
    const [metrics, scores] = await Promise.all([
      sql`
        SELECT date, metric, value, unit
        FROM health_metrics
        WHERE clerk_user_id = ${userId}
          AND metric IN ('hrv', 'resting_hr', 'sleep_hours', 'steps', 'active_energy', 'vo2_max', 'sleep_deep', 'sleep_rem')
          AND date >= CURRENT_DATE - INTERVAL '1 day' * ${days}
        ORDER BY date ASC
      `,
      sql`
        SELECT date, score, guidance
        FROM daily_scores
        WHERE clerk_user_id = ${userId}
        ORDER BY date DESC
        LIMIT 1
      `,
    ]);

    return res.status(200).json({
      metrics,
      latestScore: scores[0] ?? null,
    });
  } catch (err) {
    console.error("[health-metrics]", err);
    return res.status(500).json({ error: "db_error", detail: String(err) });
  }
}
