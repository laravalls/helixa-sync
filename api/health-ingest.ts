import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Maps Health Auto Export metric names to the internal metric keys we store
// in `health_metrics`. Covers the "core recovery set" plus the additional
// columns available from a manual CSV export (VO2 max, exercise time, and
// per-stage sleep breakdown).
const METRIC_MAP: Record<string, { metric: string; unit: string; agg: "avg" | "sum" }> = {
  heart_rate_variability: { metric: "hrv", unit: "ms", agg: "avg" },
  resting_heart_rate: { metric: "resting_hr", unit: "bpm", agg: "avg" },
  step_count: { metric: "steps", unit: "count", agg: "sum" },
  active_energy: { metric: "active_energy", unit: "kcal", agg: "sum" },
  sleep_analysis: { metric: "sleep_hours", unit: "hr", agg: "sum" },
  sleep_analysis_total: { metric: "sleep_hours", unit: "hr", agg: "avg" },
  sleep_analysis_deep: { metric: "sleep_deep", unit: "hr", agg: "avg" },
  sleep_analysis_rem: { metric: "sleep_rem", unit: "hr", agg: "avg" },
  sleep_analysis_core: { metric: "sleep_core", unit: "hr", agg: "avg" },
  vo2_max: { metric: "vo2_max", unit: "ml/kg/min", agg: "avg" },
  apple_exercise_time: { metric: "exercise_time", unit: "min", agg: "avg" },
};

interface HealthAutoExportEntry {
  date?: string;
  qty?: number;
  asleep?: number;
  inBed?: number;
  value?: number;
}

interface HealthAutoExportMetric {
  name: string;
  units?: string;
  data: HealthAutoExportEntry[];
}

interface HealthAutoExportPayload {
  data?: {
    metrics?: HealthAutoExportMetric[];
  };
}

// Health Auto Export dates look like "2026-06-12 07:30:00 +0000".
// We only care about the calendar day they fall on.
const dateOnly = (raw?: string): string | null => {
  if (!raw) return null;
  const match = raw.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
};

const entryValue = (entry: HealthAutoExportEntry): number | null => {
  if (typeof entry.asleep === "number") return entry.asleep;
  if (typeof entry.qty === "number") return entry.qty;
  if (typeof entry.value === "number") return entry.value;
  return null;
};

// Aggregates a Health Auto Export payload into per-day values for the
// metrics we care about: Map<metric, Map<date, value>>
const aggregateMetrics = (
  payload: HealthAutoExportPayload,
): Map<string, Map<string, { value: number; unit: string }>> => {
  const result = new Map<string, Map<string, { value: number; unit: string }>>();

  for (const metric of payload.data?.metrics ?? []) {
    const mapping = METRIC_MAP[metric.name];
    if (!mapping) continue;

    const byDate = new Map<string, { sum: number; count: number; unit: string }>();
    for (const entry of metric.data ?? []) {
      const day = dateOnly(entry.date);
      const value = entryValue(entry);
      if (!day || value === null) continue;

      const existing = byDate.get(day) ?? { sum: 0, count: 0, unit: metric.units ?? mapping.unit };
      existing.sum += value;
      existing.count += 1;
      byDate.set(day, existing);
    }

    const out = result.get(mapping.metric) ?? new Map<string, { value: number; unit: string }>();
    for (const [day, agg] of byDate) {
      const value = mapping.agg === "avg" ? agg.sum / agg.count : agg.sum;
      out.set(day, { value, unit: agg.unit });
    }
    result.set(mapping.metric, out);
  }

  return result;
};

interface DailyMetrics {
  hrv?: number;
  resting_hr?: number;
  sleep_hours?: number;
  steps?: number;
  active_energy?: number;
}

interface Baseline {
  hrv?: number;
  resting_hr?: number;
}

const clampScore = (n: number): number => Math.min(100, Math.max(0, n));

const guidanceFor = (score: number): string => {
  if (score >= 75) return "Your body is well recovered. Good day for higher-intensity training or demanding work.";
  if (score >= 50) return "Moderate recovery. Keep training at a steady, sustainable intensity today.";
  if (score >= 30) return "Recovery is low. Favor lighter movement, prioritize sleep, and reduce stress where you can.";
  return "Recovery is significantly reduced. Consider a rest or active recovery day and an early night.";
};

// Deterministic 0-100 readiness score from a day's metrics against the
// user's rolling baseline. Weighted: HRV 40%, sleep 35%, resting HR 25%.
// Falls back to a neutral 50 for any input that's missing.
const calculateScore = (
  today: DailyMetrics,
  baseline: Baseline,
): { score: number; guidance: string } => {
  const components: number[] = [];

  if (today.hrv != null && baseline.hrv) {
    const ratio = today.hrv / baseline.hrv;
    components.push(clampScore(50 + (ratio - 1) * 100));
  }

  if (today.sleep_hours != null) {
    const ratio = today.sleep_hours / 8;
    components.push(clampScore(ratio * 100));
  }

  if (today.resting_hr != null && baseline.resting_hr) {
    const ratio = baseline.resting_hr / today.resting_hr;
    components.push(clampScore(50 + (ratio - 1) * 100));
  }

  const score = components.length
    ? Math.round(components.reduce((a, b) => a + b, 0) / components.length)
    : 50;

  return { score, guidance: guidanceFor(score) };
};

const addDays = (date: string, delta: number): string => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
};

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

  // Flatten into parallel arrays for a single bulk upsert.
  const dates: string[] = [];
  const metrics: string[] = [];
  const values: number[] = [];
  const units: string[] = [];
  const affectedDates = new Set<string>();

  for (const [metric, byDate] of aggregated) {
    for (const [date, { value, unit }] of byDate) {
      dates.push(date);
      metrics.push(metric);
      values.push(value);
      units.push(unit);
      affectedDates.add(date);
    }
  }

  if (dates.length > 0) {
    await sql`
      INSERT INTO health_metrics (clerk_user_id, date, metric, value, unit, source)
      SELECT ${clerkUserId}, d, m, v, u, 'apple_health'
      FROM unnest(${dates}::date[], ${metrics}::text[], ${values}::numeric[], ${units}::text[])
        AS t(d, m, v, u)
      ON CONFLICT (clerk_user_id, date, metric, source) DO UPDATE SET
        value = EXCLUDED.value,
        unit = EXCLUDED.unit,
        updated_at = NOW()
    `;
  }

  let latest: { date: string; score: number; guidance: string } | null = null;

  if (affectedDates.size > 0) {
    const sortedDates = [...affectedDates].sort();
    const minDate = addDays(sortedDates[0], -7);
    const maxDate = sortedDates[sortedDates.length - 1];

    // One query covers both "today's" metrics for every affected date and
    // the 7-day trailing baseline window for each of them.
    const rows = await sql`
      SELECT date, metric, value FROM health_metrics
      WHERE clerk_user_id = ${clerkUserId}
        AND metric IN ('hrv', 'resting_hr', 'sleep_hours')
        AND date >= ${minDate}::date
        AND date <= ${maxDate}::date
    `;

    const byDate = new Map<string, DailyMetrics>();
    for (const row of rows as { date: string; metric: string; value: string }[]) {
      const day = String(row.date).slice(0, 10);
      const entry = byDate.get(day) ?? {};
      entry[row.metric as keyof DailyMetrics] = Number(row.value);
      byDate.set(day, entry);
    }

    const scoreDates: string[] = [];
    const scores: number[] = [];
    const guidances: string[] = [];
    const inputsJson: string[] = [];
    const scoresByDate = new Map<string, { score: number; guidance: string }>();

    for (const date of sortedDates) {
      const today = byDate.get(date) ?? {};

      const baseline: Baseline = { hrv: undefined, resting_hr: undefined };
      const hrvVals: number[] = [];
      const restingVals: number[] = [];
      for (let i = 1; i <= 7; i++) {
        const day = byDate.get(addDays(date, -i));
        if (day?.hrv != null) hrvVals.push(day.hrv);
        if (day?.resting_hr != null) restingVals.push(day.resting_hr);
      }
      if (hrvVals.length) baseline.hrv = hrvVals.reduce((a, b) => a + b, 0) / hrvVals.length;
      if (restingVals.length) baseline.resting_hr = restingVals.reduce((a, b) => a + b, 0) / restingVals.length;

      const { score, guidance } = calculateScore(today, baseline);
      scoresByDate.set(date, { score, guidance });

      scoreDates.push(date);
      scores.push(score);
      guidances.push(guidance);
      inputsJson.push(JSON.stringify({ today, baseline }));
    }

    if (scoreDates.length > 0) {
      await sql`
        INSERT INTO daily_scores (clerk_user_id, date, score, guidance, inputs, computed_at)
        SELECT ${clerkUserId}, d, s, g, i::jsonb, NOW()
        FROM unnest(${scoreDates}::date[], ${scores}::int[], ${guidances}::text[], ${inputsJson}::text[])
          AS t(d, s, g, i)
        ON CONFLICT (clerk_user_id, date) DO UPDATE SET
          score = EXCLUDED.score,
          guidance = EXCLUDED.guidance,
          inputs = EXCLUDED.inputs,
          computed_at = NOW()
      `;
    }

    const latestDate = sortedDates[sortedDates.length - 1];
    const latestScore = scoresByDate.get(latestDate);
    latest = latestScore ? { date: latestDate, ...latestScore } : null;
  }

  return res.status(200).json({ ok: true, days: affectedDates.size, latest });
}
