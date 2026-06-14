import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import {
  aggregateMetrics,
  recomputeDailyScore,
  type HealthAutoExportPayload,
} from "../src/server/healthScoring";

const sql = neon(process.env.DATABASE_URL!);

// Ingest endpoint for Apple Health data. Authenticated via a per-user opaque
// sync token (see health-sync-token.ts), not Clerk directly — the request
// can come from the browser (manual export upload) or, in future, a device.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const token = (req.query.token as string) || req.headers["x-sync-token"];
  if (!token || typeof token !== "string") {
    return res.status(401).json({ error: "missing sync token" });
  }

  const tokenRows = await sql`
    SELECT clerk_user_id FROM health_sync_tokens WHERE token = ${token}
  `;
  const clerkUserId = (tokenRows[0] as { clerk_user_id: string } | undefined)?.clerk_user_id;
  if (!clerkUserId) {
    return res.status(401).json({ error: "invalid sync token" });
  }

  const payload = req.body as HealthAutoExportPayload;
  const aggregated = aggregateMetrics(payload);

  const affectedDates = new Set<string>();
  for (const [metric, byDate] of aggregated) {
    for (const [date, { value, unit }] of byDate) {
      await sql`
        INSERT INTO health_metrics (clerk_user_id, date, metric, value, unit, source)
        VALUES (${clerkUserId}, ${date}, ${metric}, ${value}, ${unit}, 'apple_health')
        ON CONFLICT (clerk_user_id, date, metric, source) DO UPDATE SET
          value = EXCLUDED.value,
          unit = EXCLUDED.unit,
          updated_at = NOW()
      `;
      affectedDates.add(date);
    }
  }

  const scoresByDate = new Map<string, { score: number; guidance: string }>();
  for (const date of affectedDates) {
    scoresByDate.set(date, await recomputeDailyScore(sql, clerkUserId, date));
  }

  const latestDate = [...affectedDates].sort().pop();
  const latest = latestDate
    ? { date: latestDate, ...scoresByDate.get(latestDate)! }
    : null;

  return res.status(200).json({ ok: true, days: affectedDates.size, latest });
}
