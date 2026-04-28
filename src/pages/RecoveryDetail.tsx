import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, X, Moon, Wind, Coffee, Bed, Bell } from "lucide-react";
import { CYCLE_SYNC_DAY_18, TTC_DAY_18, type DayPlan } from "@/data/mockCycle";
import { EvidenceSection } from "@/components/EvidenceSection";

type ModeId = "cycle_sync" | "ttc";

const planFor = (mode: string | null): DayPlan =>
  mode === "ttc" ? TTC_DAY_18 : CYCLE_SYNC_DAY_18;

const RecoveryDetail = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mode = (params.get("mode") as ModeId | null) ?? "cycle_sync";
  const plan = planFor(mode);
  const r = plan.recovery;
  const practice = plan.practice;

  const evidence =
    mode === "ttc"
      ? {
          rationale:
            "Sleep is upstream of every fertility metric. Sub-7-hour nights blunt LH amplitude and lower implantation odds. Tonight's wind-down protects deep sleep where GnRH pulses regulate.",
          metrics: [
            { label: "Sleep target", value: `${r.sleep_target_h} h`, delta: "Tonight", trend: "up" as const },
            { label: "HRV (RMSSD)", value: "48 ms", delta: "−12%", trend: "down" as const },
            { label: "Resting HR", value: "62 bpm", delta: "+3", trend: "down" as const },
            { label: "Sleep eff.", value: "89%", delta: "Target 90%", trend: "flat" as const },
          ],
          citations: [
            {
              finding:
                "Women sleeping <7h/night had ~15% lower odds of implantation per IVF cycle vs. 7–9h.",
              source: "Fertility & Sterility · 2023",
            },
            {
              finding:
                "Sleep restriction acutely lowers LH pulse amplitude and prolongs follicular phase length.",
              source: "Journal of Clinical Endocrinology & Metabolism · 2022",
            },
          ],
        }
      : {
          rationale:
            "Late-luteal sleep is biologically harder: progesterone raises core temperature ~0.3 °C, fragmenting deep sleep. Cooling, dim light, and wind-down breathing measurably restore architecture.",
          metrics: [
            { label: "Sleep target", value: `${r.sleep_target_h} h`, delta: "Tonight", trend: "up" as const },
            { label: "Core temp", value: "+0.3 °C", delta: "Luteal", trend: "down" as const },
            { label: "HRV (RMSSD)", value: "48 ms", delta: "−12%", trend: "down" as const },
            { label: "Sleep eff.", value: "84%", delta: "−6%", trend: "down" as const },
          ],
          citations: [
            {
              finding:
                "Sleep efficiency drops 3–6% in the 5 days pre-period; bedroom cooling to 18 °C restores it in trials.",
              source: "Frontiers in Physiology · 2024",
            },
            {
              finding:
                "Slow-paced breathing (4–6 breaths/min) raises HRV by 15–25% within a single 10-min session.",
              source: "Applied Psychophysiology and Biofeedback · 2023",
            },
          ],
        };

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Build a wind-down timeline from wind_down_time
  const [hh, mm] = r.wind_down_time.split(":").map((s) => parseInt(s, 10));
  const fmt = (h: number, m: number) =>
    `${String((h + 24) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const cutoff = fmt(hh - 6, mm);     // last caffeine
  const dimLights = fmt(hh - 1, mm);  // dim lights
  const noScreens = fmt(hh, mm);      // no screens / wind down start
  const inBed = fmt(hh + 1, mm);      // lights out

  const timeline = [
    { time: cutoff, icon: <Coffee size={14} strokeWidth={1.5} />, label: "Last caffeine", body: "Cortisol clearance window starts." },
    { time: dimLights, icon: <Wind size={14} strokeWidth={1.5} />, label: "Dim lights", body: "Drop overhead lights to <50 lux for melatonin." },
    { time: noScreens, icon: <Moon size={14} strokeWidth={1.5} />, label: "Wind down", body: "Screens off, magnesium, breath practice." },
    { time: inBed, icon: <Bed size={14} strokeWidth={1.5} />, label: "Lights out", body: `Targeting ${r.sleep_target_h}h tonight.` },
  ];

  return (
    <main className="min-h-screen bg-background text-cream page-fade">
      <div className="mx-auto w-full max-w-[420px] pb-32">
        <header
          className={`sticky top-0 z-30 px-5 py-4 flex items-center justify-between transition-all duration-400 ${
            scrolled
              ? "bg-background/85 backdrop-blur-xl border-b border-white/[0.06]"
              : "bg-transparent border-b border-transparent"
          }`}
        >
          <button aria-label="Back" onClick={() => navigate(-1)} className="text-secondary-dim hover:text-cream transition-colors press">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <span className="font-mono-data text-[11px] tracking-[0.32em] uppercase text-cream">Recovery</span>
          <button aria-label="Close" onClick={() => navigate("/")} className="text-secondary-dim hover:text-cream transition-colors press">
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        <div className="px-5 space-y-10">
          {/* HERO */}
          <section className="pt-6 flex flex-col items-center text-center">
            <span className="font-mono-data text-[10px] tracking-[0.4em] uppercase text-secondary-dim">
              Tonight's Recovery
            </span>
            <h1 className="font-light text-cream mt-4 leading-[1.05] tracking-tight" style={{ fontSize: 64 }}>
              {r.sleep_target_h}<span className="text-secondary-dim text-3xl ml-1">h</span>
            </h1>
            <p className="font-mono-data text-[11px] tracking-[0.32em] uppercase text-secondary-dim mt-2">
              Wind down by {r.wind_down_time}
            </p>
          </section>

          {/* WEARABLE INSIGHT */}
          <section
            className="bg-surface-1 rounded-2xl p-5 border border-white/[0.06]"
            style={{ borderLeft: "2px solid #E07856" }}
          >
            <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase mb-2" style={{ color: "#E07856" }}>
              Wearable insight
            </div>
            <p className="text-sm text-cream leading-relaxed">{r.wearable_insight}</p>
          </section>

          {/* TIMELINE */}
          <section>
            <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mb-4">
              Tonight's wind-down
            </div>
            <ul className="border-t border-white/[0.06]">
              {timeline.map((step) => (
                <li
                  key={step.label}
                  className="flex items-start gap-4 py-5 border-b border-white/[0.06]"
                >
                  <span
                    className="font-mono-data text-gold shrink-0 leading-none glow-text-gold tabular-nums"
                    style={{ fontSize: 22, fontWeight: 400, width: 64 }}
                  >
                    {step.time}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-secondary-dim">
                      {step.icon}
                      <span className="font-mono-data text-[10px] tracking-[0.32em] uppercase">
                        {step.label}
                      </span>
                    </div>
                    <div className="text-sm text-cream mt-1.5 leading-snug">{step.body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* PRACTICE */}
          <section className="bg-surface-1 rounded-2xl p-5 border border-white/[0.06]">
            <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mb-2">
              Tonight's practice
            </div>
            <h3 className="font-light text-2xl text-cream leading-tight">{practice.title}</h3>
            <div className="font-mono-data text-[10px] tracking-[0.28em] uppercase text-tertiary-dim mt-2">
              {practice.duration_min} MIN · {practice.breath_pattern}
            </div>
            <p className="text-sm text-secondary-dim leading-relaxed mt-4">{practice.script}</p>
          </section>

          {/* EVIDENCE */}
          <EvidenceSection
            rationale={evidence.rationale}
            metrics={evidence.metrics}
            citations={evidence.citations}
          />
        </div>
      </div>

      {/* STICKY CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-gradient-to-t from-black via-black to-transparent pt-8 pb-6 px-5">
        <div className="mx-auto w-full max-w-[420px]">
          <button
            type="button"
            className="w-full bg-gold text-black font-mono-data uppercase rounded-full halo-gold-strong hover:brightness-110 transition-all duration-400 press flex items-center justify-center gap-2"
            style={{ height: 56, fontSize: 12, letterSpacing: "0.32em", fontWeight: 500 }}
          >
            <Bell size={16} strokeWidth={1.5} />
            Set wind-down reminder
          </button>
        </div>
      </div>
    </main>
  );
};

export default RecoveryDetail;