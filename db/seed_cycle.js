// Run: node --env-file=.env.local db/seed_cycle.js
// Seeds hormone_curves and cycle_day_plans (28 days, cycle_sync mode)

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// ─── Hormone reference curves (28 values, index = day-1) ─────────────────────
const HORMONE_CURVES = {
  estrogen:     [10,12,15,20,28,40,55,70,82,85,80,55,40,38,42,45,48,50,48,42,35,28,22,18,15,12,11,10],
  progesterone: [ 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 8,12,15,20,30,45,58,68,72,70,60,45,30,20,12, 8, 6, 5],
  lh:           [10,10,10,10,12,12,15,18,22,30,55,85,95,80,30,15,12,10,10,10,10,10,10,10,10,10,10,10],
  fsh:          [25,30,28,22,18,15,15,15,14,14,16,18,22,20,15,15,15,15,15,15,15,15,15,18,22,25,28,28],
};

// ─── Phase templates ──────────────────────────────────────────────────────────

const MENSTRUAL = (day) => ({
  phase_label: "Menstrual",
  phase_summary: "Estrogen and progesterone at their lowest. Your body is shedding and resetting.",
  alert: day <= 2
    ? "First two days — highest prostaglandins. Rest is productive today."
    : "Bleeding tapering. Gentle movement is fine. Listen to your body.",
  hormone_readout: "Estrogen and progesterone both low. FSH beginning its slow climb.",
  movement: {
    name: "Gentle Yoga & Walking",
    duration_min: 20,
    type: "yoga",
    intensity: "low",
    moves: [
      { name: "Supine knees-to-chest", reps: "60 sec hold", why_today: "Releases lower back and uterine tension" },
      { name: "Seated forward fold", reps: "60 sec", why_today: "Calms the nervous system" },
      { name: "Legs up the wall", reps: "5 min", why_today: "Reduces pelvic congestion and fatigue" },
      { name: "Child's pose", reps: "90 sec", why_today: "Pressure relief for the lower abdomen" },
      { name: "Slow diaphragmatic breaths", reps: "10 breaths", why_today: "Downregulates prostaglandin-driven cramping" },
    ],
    phase_reason: "Prostaglandins peak in the first 1–2 days. High intensity raises cortisol and can worsen cramps.",
    wearable_adjustment: "HRV typically dips on days 1–3. Honour the low score — this is not underperformance.",
  },
  plate: {
    key_nutrients: ["Iron", "Vitamin C", "Omega-3", "Magnesium"],
    breakfast: "Warm oatmeal with blackstrap molasses, chia seeds, and sliced kiwi",
    lunch: "Lentil soup, leafy greens salad with lemon-tahini dressing",
    dinner: "Grass-fed beef or tofu stir-fry with spinach, broccoli, and brown rice",
    snack: "Pumpkin seeds, a square of 85% dark chocolate",
    phase_reason: "Iron is lost through blood. Pair with vitamin C for absorption. Omega-3 competes with prostaglandins.",
    ttc_note: null,
  },
  stack: [
    { name: "Iron (ferrous bisglycinate)", dose: "25mg", timing: "Morning with vitamin C", why: "Replenish iron lost in menstruation" },
    { name: "Magnesium glycinate", dose: "400mg", timing: "Evening", why: "Reduces cramping and supports sleep" },
    { name: "Omega-3 EPA/DHA", dose: "2g", timing: "With lunch", why: "Anti-prostaglandin, reduces pain intensity" },
    { name: "Vitamin D3 + K2", dose: "2000 IU / 100mcg", timing: "Morning", why: "Hormone synthesis baseline" },
  ],
  practice: {
    title: "Body Scan Rest",
    duration_min: 10,
    theme: "Permission to slow down",
    script: "Lie flat. Start at the crown of your head and move slowly downward. Notice without changing. When you reach your abdomen, breathe into it. Soften. Your body is doing the work — you just need to stay out of its way.",
    breath_pattern: "4-second inhale, 6-second exhale",
  },
  recovery: {
    sleep_target_h: 9,
    wind_down_time: "21:30",
    wearable_insight: "HRV dips in the early menstrual phase. Prioritise 9 hours and avoid late screens.",
  },
});

const FOLLICULAR = (day) => ({
  phase_label: "Follicular",
  phase_summary: "Estrogen rising steadily. Energy, mood, and cognition all climbing.",
  alert: day <= 9
    ? "Early follicular — energy building. Good time to restart progressive training."
    : "Late follicular peak. Your capacity for high-effort work is at its highest before ovulation.",
  hormone_readout: "Estrogen rising fast. FSH stimulating follicle maturation. Progesterone still low.",
  movement: {
    name: day <= 9 ? "Progressive Strength" : "High-Intensity Interval Training",
    duration_min: day <= 9 ? 35 : 40,
    type: day <= 9 ? "strength" : "hiit",
    intensity: day <= 9 ? "moderate" : "high",
    moves: day <= 9 ? [
      { name: "Goblet squat", reps: "3×12", why_today: "Estrogen aids muscle protein synthesis — load it" },
      { name: "Romanian deadlift", reps: "3×10", why_today: "Posterior chain strength in your best recovery window" },
      { name: "Push-up", reps: "3×12", why_today: "Upper body power while nervous system is primed" },
      { name: "Plank", reps: "3×45 sec", why_today: "Core stability — injury risk lowest now" },
      { name: "Jump squat", reps: "2×10", why_today: "Power output peaks in follicular" },
    ] : [
      { name: "Sprint intervals", reps: "8×30 sec on / 30 sec off", why_today: "Peak testosterone and estrogen = max power output" },
      { name: "Burpees", reps: "3×12", why_today: "Full-body power at estrogen peak" },
      { name: "Box jumps", reps: "3×8", why_today: "Explosive work when fast-twitch is most responsive" },
      { name: "Battle ropes", reps: "3×30 sec", why_today: "Cardiovascular capacity is highest now" },
      { name: "Cool-down walk", reps: "5 min", why_today: "Active recovery keeps cortisol in check post-HIIT" },
    ],
    phase_reason: "Estrogen drives muscle protein synthesis and lowers perceived effort. This is your highest training stimulus window.",
    wearable_adjustment: "If HRV is at or above baseline, push hard. If it's 10%+ below, drop to moderate.",
  },
  plate: {
    key_nutrients: ["Lean protein", "Phytoestrogens", "B vitamins", "Zinc"],
    breakfast: "Scrambled eggs with spinach, smoked salmon, wholegrain toast",
    lunch: "Quinoa bowl with grilled chicken, edamame, cucumber, sesame dressing",
    dinner: "Baked salmon, roasted asparagus, wild rice",
    snack: "Flaxseed smoothie with berries and oat milk",
    phase_reason: "Rising estrogen is supported by phytoestrogens and B vitamins for methylation. High protein maximises follicular muscle gains.",
    ttc_note: null,
  },
  stack: [
    { name: "B-complex", dose: "1 capsule", timing: "Morning with food", why: "Supports estrogen methylation and energy metabolism" },
    { name: "Zinc", dose: "15mg", timing: "Evening", why: "Follicle development and immune function" },
    { name: "Omega-3 EPA/DHA", dose: "2g", timing: "With lunch", why: "Anti-inflammatory, supports mood" },
    { name: "Vitamin D3 + K2", dose: "2000 IU / 100mcg", timing: "Morning", why: "Hormone synthesis baseline" },
  ],
  practice: {
    title: "Intention Setting",
    duration_min: 8,
    theme: "Building momentum",
    script: "Sit upright. Feel the energy in your body starting to build — it's real, not imagined. What do you want to grow this cycle? Name it clearly. See yourself doing it, not just wanting it. This phase gives you the clearest thinking of the month.",
    breath_pattern: "4-second inhale, 4-second hold, 4-second exhale",
  },
  recovery: {
    sleep_target_h: 7.5,
    wind_down_time: "22:30",
    wearable_insight: "Recovery typically peaks in follicular. If HRV is high, you can push harder and recover faster.",
  },
});

const OVULATORY = (day) => ({
  phase_label: "Ovulatory",
  phase_summary: "LH surge triggering ovulation. Peak energy, confidence, and social drive.",
  alert: "LH surging. Ovulation window open. Peak performance day — use it.",
  hormone_readout: "LH surging to trigger ovulation. Estrogen at second peak. FSH elevated.",
  movement: {
    name: "Peak Performance Training",
    duration_min: 45,
    type: "hiit",
    intensity: "high",
    moves: [
      { name: "Heavy compound lifts or sprints", reps: "Work to your top set", why_today: "Testosterone peaks at ovulation — max strength output" },
      { name: "Plyometric jumps", reps: "3×10", why_today: "Explosive power at its cycle high" },
      { name: "Group or social sport", reps: "As long as desired", why_today: "Oxytocin high — social training feels best now" },
      { name: "Dynamic warm-up", reps: "10 min", why_today: "Joint laxity increases at ovulation — warm up thoroughly" },
      { name: "Cool-down stretch", reps: "10 min", why_today: "Relaxin rises — don't push flexibility limits today" },
    ],
    phase_reason: "Testosterone and estrogen peak simultaneously at ovulation. Strength, speed, and power output are at their cycle high. Note: relaxin also rises, increasing joint laxity — warm up properly.",
    wearable_adjustment: "HRV typically strong. If it's low despite feeling good, trust the data and reduce volume by 20%.",
  },
  plate: {
    key_nutrients: ["Antioxidants", "Fibre", "Liver-supporting foods", "Light protein"],
    breakfast: "Smoothie bowl: mixed berries, flaxseed, hemp seeds, almond butter",
    lunch: "Large salad: mixed greens, grilled chicken, avocado, sunflower seeds, balsamic",
    dinner: "Grilled sea bass, steamed broccoli and cauliflower, lemon-herb quinoa",
    snack: "Carrot sticks with hummus, a handful of walnuts",
    phase_reason: "The liver processes the estrogen surge at ovulation. Cruciferous veg and fibre support healthy estrogen clearance.",
    ttc_note: null,
  },
  stack: [
    { name: "Zinc", dose: "25mg", timing: "Morning", why: "Critical for ovulation and egg quality" },
    { name: "Vitamin C", dose: "500mg", timing: "Morning", why: "Supports ovarian follicle rupture and progesterone production" },
    { name: "Omega-3 EPA/DHA", dose: "2g", timing: "With lunch", why: "Anti-inflammatory, supports healthy ovulation" },
    { name: "B6", dose: "50mg", timing: "Morning", why: "Supports LH surge and progesterone transition" },
  ],
  practice: {
    title: "Expression Breath",
    duration_min: 8,
    theme: "Speaking and connecting",
    script: "Stand up if you can. Feel the energy moving upward. You're at your most articulate, persuasive, and magnetic right now. Take three big expansive breaths. Think of the conversation you've been avoiding. You're ready for it.",
    breath_pattern: "5-second inhale, 2-second hold, 5-second exhale through the mouth",
  },
  recovery: {
    sleep_target_h: 7.5,
    wind_down_time: "22:30",
    wearable_insight: "Peak HRV window. Schedule your hardest workouts and most demanding meetings here.",
  },
});

const EARLY_LUTEAL = (day) => ({
  phase_label: "Early Luteal",
  phase_summary: "Progesterone rising. Warmth, focus, and steady energy — but don't max out.",
  alert: "Progesterone building. Body temperature up 0.2–0.5°C. Hydrate more, reduce HIIT volume.",
  hormone_readout: "Progesterone rising steadily. Estrogen holding at moderate levels. LH declining.",
  movement: {
    name: "Moderate Strength & Pilates",
    duration_min: 35,
    type: "strength",
    intensity: "moderate",
    moves: [
      { name: "Dumbbell squat", reps: "3×10 moderate load", why_today: "Maintain strength without maxing — progesterone raises injury risk slightly" },
      { name: "Hip thrust", reps: "3×12", why_today: "Glute and posterior chain work in stable range" },
      { name: "Lat pulldown or row", reps: "3×10", why_today: "Upper back strength, controlled" },
      { name: "Pilates roll-up", reps: "10 slow", why_today: "Core activation without compressing the spine" },
      { name: "Foam roll", reps: "5 min", why_today: "Early luteal tissue can feel tighter — rolling helps recovery" },
    ],
    phase_reason: "Progesterone increases basal body temperature and slightly blunts carbohydrate use. Volume over intensity — don't chase new PRs.",
    wearable_adjustment: "Resting HR typically 1–3 BPM higher in luteal due to temperature. Don't panic — it's normal.",
  },
  plate: {
    key_nutrients: ["Complex carbs", "Magnesium", "Calcium", "Vitamin B6"],
    breakfast: "Sweet potato hash with poached eggs, avocado, and hot sauce",
    lunch: "Turkey and brown rice bowl with roasted vegetables and tahini",
    dinner: "Slow-cooked lentil dal, cauliflower rice, natural yogurt",
    snack: "Banana with almond butter, a small handful of pumpkin seeds",
    phase_reason: "Progesterone drives carbohydrate cravings. Feed them with complex sources — not sugar — to stabilise mood and energy.",
    ttc_note: null,
  },
  stack: [
    { name: "Magnesium glycinate", dose: "400mg", timing: "Evening", why: "Pre-empts luteal tension, supports sleep" },
    { name: "Vitamin B6", dose: "50mg", timing: "Morning", why: "Progesterone metabolism and mood regulation" },
    { name: "Calcium", dose: "500mg", timing: "Evening", why: "Reduces PMS symptoms when started in early luteal" },
    { name: "Omega-3 EPA/DHA", dose: "2g", timing: "With lunch", why: "Anti-inflammatory through the luteal build" },
  ],
  practice: {
    title: "Grounding Breath",
    duration_min: 8,
    theme: "Steadiness over speed",
    script: "Sit with your feet flat on the floor. Feel the weight of your body. Progesterone is slowing you down — let it. Not every moment needs to be optimised. Breathe into your belly, not your chest. Three slow rounds.",
    breath_pattern: "4-second inhale, 4-second hold, 6-second exhale",
  },
  recovery: {
    sleep_target_h: 8,
    wind_down_time: "22:00",
    wearable_insight: "HRV may start dipping. If recovery score drops below 70, reduce training intensity the next day.",
  },
});

const LATE_LUTEAL = (day) => ({
  phase_label: "Late Luteal",
  phase_summary: "Progesterone peaking then dropping. Energy low, PMS risk high. Inward focus.",
  alert: day >= 26
    ? "Period incoming within 48 hours. Front-load your week from day 6 onward."
    : "Late luteal window. Energy dip is real. Reduce load, increase sleep and magnesium.",
  hormone_readout: day <= 24
    ? "Progesterone near peak. Estrogen making a small second rise."
    : "Both hormones dropping toward baseline. PMS symptoms most likely now.",
  movement: {
    name: "Restorative Movement",
    duration_min: 25,
    type: day <= 24 ? "pilates" : "yoga",
    intensity: "low",
    moves: [
      { name: "Cat-cow", reps: "10 slow", why_today: "Spinal mobility eases luteal back tension" },
      { name: "Glute bridge", reps: "12 reps bodyweight", why_today: "Pelvic stability without cortisol spike" },
      { name: "Side-lying leg lifts", reps: "15 each side", why_today: "Low intensity hip strength" },
      { name: "Supported child's pose", reps: "90 sec", why_today: "Nervous system downregulation" },
      { name: "Supine twist", reps: "30 sec each side", why_today: "Releases luteal tension and bloating" },
    ],
    phase_reason: "Late luteal raises cortisol baseline. HIIT now spikes it further, worsening PMS symptoms and disrupting sleep.",
    wearable_adjustment: "HRV likely below baseline. If it's 15%+ down, skip structured training entirely — walk instead.",
  },
  plate: {
    key_nutrients: ["Magnesium", "B6", "Complex carbs", "Tryptophan", "Calcium"],
    breakfast: "Steel-cut oats, walnuts, banana, dark chocolate shavings",
    lunch: "Roasted salmon, sweet potato, sautéed spinach with garlic",
    dinner: "Turkey and quinoa bowl, roasted squash, tahini drizzle",
    snack: "Pumpkin seeds and a square of 85% dark chocolate",
    phase_reason: "Late luteal needs serotonin precursors (tryptophan), stable blood sugar, and anti-inflammatory foods to reduce PMS severity.",
    ttc_note: null,
  },
  stack: [
    { name: "Magnesium glycinate", dose: "400mg", timing: "Evening", why: "Eases tension, reduces PMS severity, supports sleep" },
    { name: "Vitamin B6", dose: "50mg", timing: "Morning", why: "Modulates progesterone metabolism and serotonin production" },
    { name: "Omega-3 EPA/DHA", dose: "2g", timing: "With lunch", why: "Anti-inflammatory through the late luteal drop" },
    { name: "Chasteberry (Vitex)", dose: "400mg", timing: "Morning", why: "Modulates LH and reduces PMS symptoms over 2–3 cycles" },
  ],
  practice: {
    title: "Release Breath",
    duration_min: 8,
    theme: "Letting go of the week's grip",
    script: "Sit comfortably. Notice where you're holding tension — jaw, shoulders, belly. Breathe into it. Each exhale is twice as long as the inhale. Your body is asking you to soften, not to push. This phase ends. It always does.",
    breath_pattern: "4-second inhale, 8-second exhale",
  },
  recovery: {
    sleep_target_h: 8.5,
    wind_down_time: "22:00",
    wearable_insight: "HRV drop of 10–15% is normal in late luteal. Add 30 min sleep and cut your second coffee.",
  },
});

// ─── Map each cycle day to its phase template ─────────────────────────────────
function planForDay(day) {
  if (day >= 1 && day <= 5)  return MENSTRUAL(day);
  if (day >= 6 && day <= 13) return FOLLICULAR(day);
  if (day >= 14 && day <= 16) return OVULATORY(day);
  if (day >= 17 && day <= 21) return EARLY_LUTEAL(day);
  return LATE_LUTEAL(day); // 22–28
}

// ─── Run ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Creating tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS hormone_curves (
      id           SERIAL      PRIMARY KEY,
      cycle_length INT         NOT NULL DEFAULT 28,
      estrogen     NUMERIC[]   NOT NULL,
      progesterone NUMERIC[]   NOT NULL,
      lh           NUMERIC[]   NOT NULL,
      fsh          NUMERIC[]   NOT NULL,
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cycle_day_plans (
      cycle_day  INT  NOT NULL CHECK (cycle_day BETWEEN 1 AND 35),
      mode       TEXT NOT NULL CHECK (mode IN ('cycle_sync', 'ttc')),
      plan_json  JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (cycle_day, mode)
    )
  `;

  console.log("Tables ready. Seeding hormone curves...");

  await sql`
    INSERT INTO hormone_curves (cycle_length, estrogen, progesterone, lh, fsh)
    VALUES (
      28,
      ${HORMONE_CURVES.estrogen},
      ${HORMONE_CURVES.progesterone},
      ${HORMONE_CURVES.lh},
      ${HORMONE_CURVES.fsh}
    )
    ON CONFLICT DO NOTHING
  `;

  console.log("Seeding 28 days of cycle_sync plans...");

  for (let day = 1; day <= 28; day++) {
    const plan = planForDay(day);
    await sql`
      INSERT INTO cycle_day_plans (cycle_day, mode, plan_json)
      VALUES (${day}, 'cycle_sync', ${JSON.stringify(plan)})
      ON CONFLICT (cycle_day, mode) DO UPDATE SET
        plan_json  = EXCLUDED.plan_json,
        updated_at = NOW()
    `;
    process.stdout.write(`  day ${day} ✓\n`);
  }

  console.log("\nDone. 28 rows seeded.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
