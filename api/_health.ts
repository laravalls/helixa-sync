import { sql } from "./_db";

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

export interface HealthAutoExportPayload {
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
export const aggregateMetrics = (
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

// Deterministic 0-100 readiness score from a day's metrics against the
// user's rolling baseline. Weighted: HRV 40%, sleep 35%, resting HR 25%.
// Falls back to a neutral 50 for any input that's missing.
export const calculateScore = (
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

const clampScore = (n: number): number => Math.min(100, Math.max(0, n));

const guidanceFor = (score: number): string => {
  if (score >= 75) return "Your body is well recovered. Good day for higher-intensity training or demanding work.";
  if (score >= 50) return "Moderate recovery. Keep training at a steady, sustainable intensity today.";
  if (score >= 30) return "Recovery is low. Favor lighter movement, prioritize sleep, and reduce stress where you can.";
  return "Recovery is significantly reduced. Consider a rest or active recovery day and an early night.";
};

// Recomputes and stores the daily score for a user/date using health_metrics
// for that day plus a 7-day trailing baseline (excluding that day).
export const recomputeDailyScore = async (clerkUserId: string, date: string) => {
  const dayRows = await sql`
    SELECT metric, value FROM health_metrics
    WHERE clerk_user_id = ${clerkUserId} AND date = ${date}
  `;
  const today: DailyMetrics = {};
  for (const row of dayRows as { metric: string; value: string }[]) {
    today[row.metric as keyof DailyMetrics] = Number(row.value);
  }

  const baselineRows = await sql`
    SELECT metric, AVG(value) AS avg_value FROM health_metrics
    WHERE clerk_user_id = ${clerkUserId}
      AND metric IN ('hrv', 'resting_hr')
      AND date >= (${date}::date - INTERVAL '7 days')
      AND date < ${date}::date
    GROUP BY metric
  `;
  const baseline: Baseline = {};
  for (const row of baselineRows as { metric: string; avg_value: string }[]) {
    baseline[row.metric as keyof Baseline] = Number(row.avg_value);
  }

  const { score, guidance } = calculateScore(today, baseline);

  await sql`
    INSERT INTO daily_scores (clerk_user_id, date, score, guidance, inputs, computed_at)
    VALUES (${clerkUserId}, ${date}, ${score}, ${guidance}, ${JSON.stringify({ today, baseline })}, NOW())
    ON CONFLICT (clerk_user_id, date) DO UPDATE SET
      score = EXCLUDED.score,
      guidance = EXCLUDED.guidance,
      inputs = EXCLUDED.inputs,
      computed_at = NOW()
  `;

  return { score, guidance };
};
