import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  X,
  Clock,
  PersonStanding,
  BarChart3,
} from "lucide-react";
import {
  CYCLE_SYNC_DAY_18,
  TTC_DAY_18,
  type DayPlan,
} from "@/data/mockCycle";
import { EvidenceSection } from "@/components/EvidenceSection";

type ModeId = "cycle_sync" | "ttc";

const planFor = (mode: string | null): DayPlan =>
  mode === "ttc" ? TTC_DAY_18 : CYCLE_SYNC_DAY_18;

const StatPill = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="inline-flex items-center gap-2 bg-surface-2 border border-white/[0.06] rounded-full px-3.5 py-2">
    <span className="text-secondary-dim">{icon}</span>
    <span
      className="font-mono-data uppercase text-cream"
      style={{ fontSize: 11, letterSpacing: "0.18em" }}
    >
      {children}
    </span>
  </div>
);

const MovementDetail = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mode = (params.get("mode") as ModeId | null) ?? "cycle_sync";
  const plan = planFor(mode);
  const m = plan.movement;

  const evidence =
    mode === "ttc"
      ? {
          rationale:
            "In the fertile window, moderate-intensity training supports ovulation and uterine perfusion without elevating cortisol enough to suppress the LH surge. Heavy glycolytic work in this window can blunt fertility markers.",
          metrics: [
            { label: "Resting HR", value: "62 bpm", delta: "+3", trend: "down" as const },
            { label: "HRV (RMSSD)", value: "48 ms", delta: "−12%", trend: "down" as const },
            { label: "Cycle Day", value: "18", delta: "Luteal", trend: "flat" as const },
            { label: "BBT", value: "36.7 °C", delta: "+0.3", trend: "up" as const },
          ],
          citations: [
            {
              finding:
                "Moderate aerobic training improves uterine artery blood flow and is associated with higher conception rates per cycle.",
              source: "Fertility & Sterility · 2023",
            },
            {
              finding:
                "High-volume HIIT in the late-luteal/peri-ovulatory window can suppress LH pulse amplitude in some women.",
              source: "Journal of Clinical Endocrinology & Metabolism · 2022",
            },
          ],
        }
      : {
          rationale:
            "Late-luteal physiology lowers VO₂max ceiling and raises perceived exertion at matched workloads. Fat oxidation rises, so Zone-2 endurance and strength tempo work feel sustainable while glycolytic intervals do not.",
          metrics: [
            { label: "HRV (RMSSD)", value: "48 ms", delta: "−12%", trend: "down" as const },
            { label: "Resting HR", value: "62 bpm", delta: "+4", trend: "down" as const },
            { label: "Sleep Score", value: "78", delta: "−6", trend: "down" as const },
            { label: "Fat Ox.", value: "0.42 g/min", delta: "+18%", trend: "up" as const },
          ],
          citations: [
            {
              finding:
                "Fat oxidation rates rise 14–18% during the mid-luteal phase, favoring Zone-2 endurance over high-intensity glycolytic work.",
              source: "Journal of Applied Physiology · 2024",
            },
            {
              finding:
                "RMSSD declines 11–14% from follicular to late luteal in healthy women — calibrate readiness against phase, not a flat baseline.",
              source: "Frontiers in Physiology · 2024",
            },
          ],
        };

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen bg-background text-cream">
      <div className="mx-auto w-full max-w-[420px] pb-32">
        {/* TOP BAR */}
        <header
          className={`sticky top-0 z-30 px-5 py-4 flex items-center justify-between transition-all duration-400 ${
            scrolled
              ? "bg-background/85 backdrop-blur-xl border-b border-white/[0.06]"
              : "bg-transparent border-b border-transparent"
          }`}
        >
          <button
            aria-label="Back"
            onClick={() => navigate(-1)}
            className="text-secondary-dim hover:text-cream transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <span className="font-mono-data text-[11px] tracking-[0.32em] uppercase text-cream">
            Movement
          </span>
          <button
            aria-label="Close"
            onClick={() => navigate("/")}
            className="text-secondary-dim hover:text-cream transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        <div className="px-5 space-y-10">
          {/* HERO */}
          <section className="pt-6 flex flex-col items-center text-center">
            <span className="font-mono-data text-[10px] tracking-[0.4em] uppercase text-secondary-dim">
              Today's Session
            </span>
            <h1
              className="font-light text-cream mt-4 leading-[1.05] tracking-tight"
              style={{ fontSize: 48 }}
            >
              {m.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <StatPill icon={<Clock size={14} strokeWidth={1.5} />}>
                {m.duration_min} MIN
              </StatPill>
              <StatPill icon={<PersonStanding size={14} strokeWidth={1.5} />}>
                {m.type}
              </StatPill>
              <StatPill icon={<BarChart3 size={14} strokeWidth={1.5} />}>
                {m.intensity} Intensity
              </StatPill>
            </div>
          </section>

          {/* ADJUSTMENT BADGE */}
          <section
            className="bg-surface-1 rounded-2xl p-5 border border-white/[0.06]"
            style={{ borderLeft: "2px solid #E07856" }}
          >
            <div
              className="font-mono-data text-[10px] tracking-[0.32em] uppercase mb-2"
              style={{ color: "#E07856" }}
            >
              Adjusted For
            </div>
            <p className="text-sm text-cream leading-relaxed">
              {plan.phase_label} · HRV -12% from baseline
            </p>
          </section>

          {/* WHY THIS TODAY */}
          <section>
            <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mb-4">
              Why This Today
            </div>
            <p className="text-sm text-cream leading-relaxed">
              {m.phase_reason}
            </p>
            <p className="text-sm text-secondary-dim leading-relaxed mt-4">
              {m.wearable_adjustment}
            </p>
          </section>

          {/* EVIDENCE */}
          <EvidenceSection
            rationale={evidence.rationale}
            metrics={evidence.metrics}
            citations={evidence.citations}
          />

          {/* THE FLOW */}
          <section>
            <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mb-4">
              The Flow
            </div>
            <ul className="border-t border-white/[0.06]">
              {m.moves.map((move, i) => (
                <li
                  key={move.name}
                  className="flex items-start gap-4 py-5 border-b border-white/[0.06]"
                >
                  <span
                    className="font-mono-data text-gold shrink-0 leading-none glow-text-gold"
                    style={{ fontSize: 28, fontWeight: 400, width: 44 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-cream text-base">{move.name}</div>
                    <div className="text-xs text-secondary-dim mt-1.5 leading-relaxed">
                      {move.why_today}
                    </div>
                  </div>
                  <span
                    className="font-mono-data text-cream shrink-0 text-right"
                    style={{ fontSize: 12, letterSpacing: "0.05em" }}
                  >
                    {move.reps}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* STICKY CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-gradient-to-t from-black via-black to-transparent pt-8 pb-6 px-5">
        <div className="mx-auto w-full max-w-[420px]">
          <button
            type="button"
            className="w-full bg-gold text-black font-mono-data uppercase rounded-full shadow-halo-gold-strong hover:brightness-110 transition-all duration-400"
            style={{
              height: 56,
              fontSize: 12,
              letterSpacing: "0.32em",
              fontWeight: 500,
            }}
          >
            Begin Session
          </button>
        </div>
      </div>
    </main>
  );
};

export default MovementDetail;