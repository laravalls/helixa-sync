import { sql } from "../api/_db";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScoreInputs {
  cycle_day: number;
  mode?: "cycle_sync" | "ttc";
  hrv?: number;          // today's HRV reading (ms)
  hrv_baseline?: number; // 30-day rolling average HRV (ms)
  sleep_hours?: number;  // last night's sleep duration
}

export interface ScoreResult {
  score: number;
  phase: string;
  cycle_day: number;
  plan_json: Record<string, unknown>;
  adjustments: {
    base: number;
    hrv: number;
    sleep: number;
  };
}

// ─── Base score curve ─────────────────────────────────────────────────────────
// Maps cycle day 1–28 to a 40–93 base score that tracks the energy/hormone arc.
// Menstrual dip → follicular climb → ovulatory peak → luteal taper.

function baseScore(day: number): number {
  const d = Math.max(1, Math.min(28, day));
  if (d <= 2)  return 40 + (d - 1) * 3;       // Days 1–2:  40–43  (heavy flow, lowest)
  if (d <= 5)  return 46 + (d - 3) * 4;       // Days 3–5:  46–54  (menstrual, improving)
  if (d <= 8)  return 58 + (d - 6) * 4;       // Days 6–8:  58–66  (early follicular)
  if (d <= 13) return 68 + (d - 9) * 3;       // Days 9–13: 68–80  (late follicular, rising)
  if (d <= 16) return 85 + (d - 14) * 4;      // Days 14–16:85–93  (ovulatory peak)
  if (d <= 21) return 78 - (d - 17) * 3;      // Days 17–21:78–63  (early luteal, tapering)
  if (d <= 25) return 60 - (d - 22) * 4;      // Days 22–25:60–48  (late luteal, dropping)
  return 46 - (d - 26) * 2;                   // Days 26–28:46–42  (pre-menstrual low)
}

// ─── HRV adjustment (±10 pts) ─────────────────────────────────────────────────
// Compares today's HRV to the 30-day baseline.
// ±20% from baseline → ±10 pts. Clamped.

function hrvAdjustment(hrv?: number, baseline?: number): number {
  if (!hrv || !baseline || baseline <= 0) return 0;
  const deltaPct = (hrv - baseline) / baseline; // e.g. 0.12 = 12% above baseline
  const raw = Math.round(deltaPct * 50);         // 20% delta → 10 pts
  return Math.max(-10, Math.min(10, raw));
}

// ─── Sleep adjustment (±10 pts) ───────────────────────────────────────────────
// Compares last night's sleep to the phase target from the plan.
// Under target: up to –10. Over target: up to +5 (diminishing return).

function sleepAdjustment(sleepHours?: number, targetHours?: number): number {
  if (!sleepHours) return 0;
  const target = targetHours ?? 8;
  const delta = sleepHours - target;
  if (delta >= 0) {
    return Math.min(5, Math.round(delta * 3));
  }
  return Math.max(-10, Math.round(delta * 5));
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function calculateScore(inputs: ScoreInputs): Promise<ScoreResult> {
  const { cycle_day, mode = "cycle_sync", hrv, hrv_baseline, sleep_hours } = inputs;

  // Fetch the day plan from Neon
  const rows = (await sql`
    SELECT plan_json
    FROM cycle_day_plans
    WHERE cycle_day = ${cycle_day}
      AND mode      = ${mode}
    LIMIT 1
  `) as { plan_json: Record<string, unknown> }[];

  if (rows.length === 0) {
    throw new Error(`No plan found for cycle_day=${cycle_day} mode=${mode}`);
  }

  const plan_json = rows[0].plan_json;
  const phase = (plan_json.phase_label as string) ?? "Unknown";

  // Pull the sleep target from the plan (used for sleep adjustment)
  const recovery = plan_json.recovery as { sleep_target_h?: number } | undefined;
  const sleepTarget = recovery?.sleep_target_h;

  // Calculate component scores
  const adjBase  = baseScore(cycle_day);
  const adjHrv   = hrvAdjustment(hrv, hrv_baseline);
  const adjSleep = sleepAdjustment(sleep_hours, sleepTarget);

  const score = Math.max(0, Math.min(100, adjBase + adjHrv + adjSleep));

  return {
    score,
    phase,
    cycle_day,
    plan_json,
    adjustments: { base: adjBase, hrv: adjHrv, sleep: adjSleep },
  };
}
