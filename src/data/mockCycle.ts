// Mock cycle, TTC, wearable, and hormone data for HelixA prototypes.

export interface Move {
  name: string;
  reps: string;
  why_today: string;
}

export interface Movement {
  name: string;
  duration_min: number;
  type: string;
  intensity: "low" | "moderate" | "high";
  moves: Move[];
  phase_reason: string;
  wearable_adjustment: string;
}

export interface Plate {
  key_nutrients: string[];
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
  phase_reason: string;
  ttc_note: string | null;
}

export interface StackItem {
  name: string;
  dose: string;
  timing: string;
  why: string;
}

export interface Practice {
  title: string;
  duration_min: number;
  theme: string;
  script: string;
  breath_pattern: string;
}

export interface Recovery {
  sleep_target_h: number;
  wind_down_time: string;
  wearable_insight: string;
}

export interface DayPlan {
  phase_label: string;
  phase_summary: string;
  alert: string;
  hormone_readout: string;
  movement: Movement;
  plate: Plate;
  stack: StackItem[];
  practice: Practice;
  recovery: Recovery;
}

export const CYCLE_SYNC_DAY_18: DayPlan = {
  phase_label: "Late Luteal",
  phase_summary:
    "Progesterone peaking and starting to drop. Energy low, focus inward.",
  alert:
    "Late luteal dip incoming. Energy down for 3-4 days. Front-load your week.",
  hormone_readout: "Progesterone peak passing, estrogen on its second rise.",
  movement: {
    name: "Restorative Pilates Flow",
    duration_min: 25,
    type: "pilates",
    intensity: "low",
    moves: [
      { name: "Cat-cow", reps: "10 slow", why_today: "Spinal mobility eases luteal back tension" },
      { name: "Glute bridge", reps: "12 reps", why_today: "Pelvic stability without core strain" },
      { name: "Side-lying leg lifts", reps: "15 each side", why_today: "Low intensity, hip strength" },
      { name: "Child's pose", reps: "60 sec hold", why_today: "Nervous system downregulation" },
      { name: "Supine twist", reps: "30 sec each side", why_today: "Releases luteal tension" },
    ],
    phase_reason: "Late luteal raises cortisol baseline. HIIT now spikes it further.",
    wearable_adjustment: "Your HRV is 12 below baseline. Stay in zone 1-2 today.",
  },
  plate: {
    key_nutrients: ["Magnesium", "B6", "Complex carbs", "Tryptophan"],
    breakfast: "Steel-cut oats, walnuts, banana, dark chocolate shavings",
    lunch: "Roasted salmon, sweet potato, sauteed spinach with garlic",
    dinner: "Turkey and quinoa bowl, roasted squash, tahini drizzle",
    snack: "Pumpkin seeds and a square of 85% dark chocolate",
    phase_reason: "Late luteal needs serotonin precursors and stable blood sugar.",
    ttc_note: null,
  },
  stack: [
    { name: "Magnesium glycinate", dose: "400mg", timing: "Evening", why: "Eases luteal tension and supports sleep" },
    { name: "Vitamin B6", dose: "50mg", timing: "Morning", why: "Modulates progesterone metabolism" },
    { name: "Omega-3", dose: "2g EPA/DHA", timing: "With lunch", why: "Anti-inflammatory through luteal" },
    { name: "Vitamin D3 + K2", dose: "2000 IU / 100mcg", timing: "Morning", why: "Hormone synthesis baseline" },
  ],
  practice: {
    title: "Release Breath",
    duration_min: 8,
    theme: "Letting go of the week's grip",
    script:
      "Sit comfortably. Notice where you're holding tension. Breathe into it. Each exhale is twice as long as the inhale. Your body is asking you to soften, not to push.",
    breath_pattern: "4-second inhale, 8-second exhale",
  },
  recovery: {
    sleep_target_h: 8.5,
    wind_down_time: "22:00",
    wearable_insight:
      "Your HRV dropped 12% from luteal baseline. Add 30 min sleep, skip the second coffee.",
  },
};

export const TTC_DAY_18: DayPlan = {
  phase_label: "Implantation Window",
  phase_summary:
    "Progesterone supporting potential implantation. Body needs warmth and rest.",
  alert: "Implantation window. No HIIT, no raw fish, no alcohol for the next 5 days.",
  hormone_readout: "Progesterone high, supporting potential implantation.",
  movement: {
    name: "Gentle Mobility Flow",
    duration_min: 20,
    type: "yoga",
    intensity: "low",
    moves: [
      { name: "Seated cat-cow", reps: "10 slow", why_today: "Mobility without core engagement" },
      { name: "Standing forward fold", reps: "60 sec", why_today: "Gentle blood flow to pelvis" },
      { name: "Supported child's pose", reps: "90 sec", why_today: "Restorative, no abdominal pressure" },
      { name: "Legs up the wall", reps: "5 min", why_today: "Circulation and nervous system rest" },
    ],
    phase_reason:
      "Implantation window: avoid abdominal compression, jumping, or core work.",
    wearable_adjustment: "HRV slightly low. Stick to restorative only today.",
  },
  plate: {
    key_nutrients: ["Folate", "Iron", "Healthy fats", "Warming foods"],
    breakfast: "Warm porridge, almond butter, stewed apple, cinnamon",
    lunch: "Cooked salmon (no raw), quinoa, roasted vegetables, avocado",
    dinner: "Slow-cooked chicken, sweet potato, leafy greens",
    snack: "Brazil nuts, dates, warm herbal tea",
    phase_reason: "Warming, blood-supporting foods aid implantation conditions.",
    ttc_note:
      "Avoid raw fish, unpasteurized dairy, deli meats, alcohol, and excess caffeine.",
  },
  stack: [
    { name: "Methylfolate", dose: "800mcg", timing: "Morning", why: "Critical for early embryo development" },
    { name: "CoQ10", dose: "200mg", timing: "Morning", why: "Egg quality and mitochondrial support" },
    { name: "Vitamin D3", dose: "2000 IU", timing: "Morning", why: "Implantation and immune balance" },
    { name: "Magnesium glycinate", dose: "400mg", timing: "Evening", why: "Sleep and uterine relaxation" },
    { name: "Prenatal multivitamin", dose: "1 capsule", timing: "With breakfast", why: "Baseline coverage for TTC stack" },
  ],
  practice: {
    title: "Receptive Breath",
    duration_min: 10,
    theme: "Creating space, not forcing",
    script:
      "Lie down. Place one hand on your low belly. Breathe softly into that space. There's nothing to do. Your body knows how to receive. Trust it.",
    breath_pattern: "5-second inhale, 5-second exhale",
  },
  recovery: {
    sleep_target_h: 9,
    wind_down_time: "21:30",
    wearable_insight:
      "Recovery 72%. Prioritize 9 hours tonight. Implantation needs deep sleep.",
  },
};

export interface WearableData {
  device: string;
  last_synced_min_ago: number;
  hrv: number;
  hrv_baseline_delta_pct: number;
  recovery_score: number;
  sleep_hours: number;
  resting_hr: number;
}

export const WEARABLE_DATA: WearableData = {
  device: "Oura",
  last_synced_min_ago: 2,
  hrv: 38,
  hrv_baseline_delta_pct: -12,
  recovery_score: 72,
  sleep_hours: 7.2,
  resting_hr: 58,
};

export interface HormoneCurves {
  estrogen: number[];
  progesterone: number[];
  lh: number[];
  fsh: number[];
}

export const HORMONE_CURVES: HormoneCurves = {
  estrogen: [10, 12, 15, 20, 28, 40, 55, 70, 82, 85, 80, 55, 40, 38, 42, 45, 48, 50, 48, 42, 35, 28, 22, 18, 15, 12, 11, 10],
  progesterone: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 8, 12, 15, 20, 30, 45, 58, 68, 72, 70, 60, 45, 30, 20, 12, 8, 6, 5],
  lh: [10, 10, 10, 10, 12, 12, 15, 18, 22, 30, 55, 85, 95, 80, 30, 15, 12, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  fsh: [25, 30, 28, 22, 18, 15, 15, 15, 14, 14, 16, 18, 22, 20, 15, 15, 15, 15, 15, 15, 15, 15, 15, 18, 22, 25, 28, 28],
};