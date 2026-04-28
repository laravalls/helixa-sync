import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Settings,
  ChevronRight,
  Lock,
  Activity,
  UtensilsCrossed,
  Pill,
  Moon,
} from "lucide-react";
import {
  CYCLE_SYNC_DAY_18,
  TTC_DAY_18,
  WEARABLE_DATA,
  type DayPlan,
} from "@/data/mockCycle";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { HormoneChart } from "@/components/HormoneChart";

const CYCLE_DAY = 18;
const CYCLE_LENGTH = 28;

type ModeId =
  | "cycle_sync"
  | "ttc"
  | "pregnancy"
  | "postpartum"
  | "perimenopause";

interface ModeDef {
  id: ModeId;
  label: string;
  locked: boolean;
  teaser?: string;
}

const MODES: ModeDef[] = [
  { id: "cycle_sync", label: "Cycle Sync", locked: false },
  { id: "ttc", label: "TTC", locked: false },
  {
    id: "pregnancy",
    label: "Pregnancy",
    locked: true,
    teaser:
      "Trimester-aware movement, plate, and supplementation. Daily fetal-development context, contraindication checks on every recommendation, and a recovery surface tuned for the body that's growing another one.",
  },
  {
    id: "postpartum",
    label: "Postpartum",
    locked: true,
    teaser:
      "A non-bounce-back recovery layer. Pelvic floor and core re-coordination, lactation-aware nutrition, and sleep architecture rebuilt around feeds. Hormone shifts tracked with the same precision as the cycle.",
  },
  {
    id: "perimenopause",
    label: "Perimenopause",
    locked: true,
    teaser:
      "Variable-cycle intelligence for the years your rhythm starts to drift. HRT-aware protocols, bone and metabolic protection, and symptom pattern detection that respects how non-linear this phase actually is.",
  },
];

const PLAN_BY_MODE: Partial<Record<ModeId, DayPlan>> = {
  cycle_sync: CYCLE_SYNC_DAY_18,
  ttc: TTC_DAY_18,
};

const COLOR_BY_MODE: Record<"cycle_sync" | "ttc", string> = {
  cycle_sync: "#A088B5", // Luteal
  ttc: "#E8C16F", // Bioluminescent gold
};

interface HeroRingProps {
  color: string;
  phaseLabel: string;
}

const HeroRing = ({ color, phaseLabel }: HeroRingProps) => {
  const size = 240;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = CYCLE_DAY / CYCLE_LENGTH; // ~0.643
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setProgress(target), 150);
    return () => clearTimeout(t);
  }, [target]);

  const dashOffset = circumference - progress * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* radial halo */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(closest-side, ${color}33, ${color}00 70%)`,
          filter: "blur(8px)",
          transition: "background 600ms ease",
        }}
      />
      <svg
        width={size}
        height={size}
        className="relative -rotate-90"
        style={{
          filter: `drop-shadow(0 0 24px ${color}4D)`,
          transition: "filter 600ms ease",
        }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition:
              "stroke-dashoffset 1600ms cubic-bezier(.2,.7,.2,1), stroke 600ms ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono-data text-cream"
          style={{ fontSize: 64, fontWeight: 400, lineHeight: 1 }}
        >
          {CYCLE_DAY}
        </span>
        <span className="font-mono-data text-[10px] tracking-[0.4em] uppercase text-secondary-dim mt-2">
          Day
        </span>
        <span
          key={phaseLabel}
          className="font-light text-base text-cream mt-3 tracking-wide animate-fade-in"
          style={{ animationDuration: "400ms" }}
        >
          {phaseLabel}
        </span>
      </div>
    </div>
  );
};

interface DataCardProps {
  label: string;
  metric: string;
  description: string;
  icon: React.ReactNode;
}

const DataCard = ({ label, metric, description, icon }: DataCardProps) => (
  <button
    type="button"
    className="w-full text-left bg-surface-1 border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4 hover:border-accent-soft transition-colors duration-400"
  >
    <div className="w-10 h-10 rounded-full border border-white/[0.06] flex items-center justify-center text-secondary-dim shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim">
        {label}
      </div>
      <div className="font-mono-data text-2xl text-cream mt-1 leading-none">
        {metric}
      </div>
      <div className="text-xs text-secondary-dim mt-2 truncate">
        {description}
      </div>
    </div>
    <ChevronRight
      className="text-tertiary-dim shrink-0"
      size={18}
      strokeWidth={1.5}
    />
  </button>
);

const Today = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeMode, setActiveMode] = useState<ModeId>("cycle_sync");
  const [lockedSheet, setLockedSheet] = useState<ModeDef | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const data = useMemo<DayPlan>(
    () => PLAN_BY_MODE[activeMode] ?? CYCLE_SYNC_DAY_18,
    [activeMode],
  );
  const ringColor =
    activeMode === "ttc" ? COLOR_BY_MODE.ttc : COLOR_BY_MODE.cycle_sync;

  const handleModeTap = (mode: ModeDef) => {
    if (mode.locked) {
      setLockedSheet(mode);
      return;
    }
    setActiveMode(mode.id);
  };

  return (
    <main className="min-h-screen bg-background text-cream">
      <div className="mx-auto w-full max-w-[420px]">
        {/* HEADER */}
        <header
          className={`sticky top-0 z-30 px-5 py-4 flex items-center justify-between transition-colors duration-400 ${
            scrolled
              ? "bg-background/85 backdrop-blur-xl border-b border-white/[0.06]"
              : "bg-transparent"
          }`}
        >
          <div className="flex items-baseline">
            <span className="font-light text-xl tracking-wide text-cream">
              HelixA
            </span>
            <span
              className="ml-1 w-1.5 h-1.5 rounded-full bg-gold inline-block"
              style={{
                boxShadow: "0 0 12px rgba(232,193,111,0.7)",
                transform: "translateY(-2px)",
              }}
            />
          </div>
          <div className="flex items-center gap-5 text-secondary-dim">
            <button aria-label="Notifications" className="hover:text-cream transition-colors">
              <Bell size={18} strokeWidth={1.5} />
            </button>
            <button aria-label="Settings" className="hover:text-cream transition-colors">
              <Settings size={18} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <div className="px-5 pb-20 space-y-8">
          {/* HERO RING */}
          <section className="pt-8 flex flex-col items-center">
            <HeroRing color={ringColor} phaseLabel={data.phase_label} />

            <p
              key={`summary-${activeMode}`}
              className="text-secondary-dim text-sm text-center mt-8 max-w-[320px] leading-relaxed animate-fade-in"
              style={{ animationDuration: "400ms" }}
            >
              {data.phase_summary}
            </p>

            {/* Wearable badge */}
            <div className="mt-5 inline-flex items-center gap-3 bg-surface-2 border border-white/[0.06] rounded-full pl-3 pr-4 py-2">
              <span className="relative flex items-center justify-center w-2 h-2">
                <span
                  className="absolute inset-0 rounded-full bg-gold opacity-60 animate-ping"
                  style={{ animationDuration: "2s" }}
                />
                <span
                  className="relative w-2 h-2 rounded-full bg-gold"
                  style={{ boxShadow: "0 0 10px rgba(232,193,111,0.7)" }}
                />
              </span>
              <span
                className="font-mono-data uppercase text-cream"
                style={{ fontSize: 12, letterSpacing: "0.05em" }}
              >
                {WEARABLE_DATA.device} · HRV {WEARABLE_DATA.hrv} · RECOVERY{" "}
                {WEARABLE_DATA.recovery_score}
              </span>
            </div>
          </section>

          {/* MODE PILLS */}
          <section className="-mx-5 px-5 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2 min-w-max pb-1">
              {MODES.map((m) => {
                const isActive = !m.locked && m.id === activeMode;
                if (isActive) {
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleModeTap(m)}
                      className="font-mono-data text-[11px] tracking-[0.18em] uppercase px-4 py-2 rounded-full bg-gold text-black shadow-halo-gold-strong"
                    >
                      {m.label}
                    </button>
                  );
                }
                if (m.locked) {
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleModeTap(m)}
                      className="font-mono-data text-[11px] tracking-[0.18em] uppercase px-4 py-2 rounded-full border border-dashed border-white/10 text-cream opacity-40 flex items-center gap-1.5 hover:opacity-60 transition-opacity"
                    >
                      <Lock size={11} strokeWidth={1.5} />
                      {m.label}
                    </button>
                  );
                }
                return (
                  <button
                    key={m.id}
                    onClick={() => handleModeTap(m)}
                    className="font-mono-data text-[11px] tracking-[0.18em] uppercase px-4 py-2 rounded-full border border-white/[0.08] text-cream hover:border-accent-soft transition-colors"
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ALERT */}
          <section
            key={`alert-${activeMode}`}
            className="bg-surface-1 rounded-2xl p-5 border border-white/[0.06]"
            style={{ borderLeft: "2px solid #E07856", animationDuration: "400ms" }}
          >
            <div
              className="font-mono-data text-[10px] tracking-[0.32em] uppercase mb-2"
              style={{ color: "#E07856" }}
            >
              Alert
            </div>
            <p className="text-sm text-cream leading-relaxed">{data.alert}</p>
          </section>

          {/* HORMONE CHART placeholder */}
          <section className="bg-surface-1 rounded-2xl p-5 border border-white/[0.06]">
            <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim">
              Hormone Status
            </div>
            <div className="mt-4">
              <HormoneChart />
            </div>
            <p
              key={`hormone-${activeMode}`}
              className="text-xs text-secondary-dim mt-5 leading-relaxed animate-fade-in"
              style={{ animationDuration: "400ms" }}
            >
              {data.hormone_readout}
            </p>
          </section>

          {/* DATA CARDS */}
          <section key={`cards-${activeMode}`} className="space-y-3 animate-fade-in" style={{ animationDuration: "400ms" }}>
            <DataCard
              label="Movement"
              metric={`${data.movement.duration_min} MIN`}
              description={data.movement.name}
              icon={<Activity size={18} strokeWidth={1.5} />}
            />
            <DataCard
              label="Plate"
              metric="4 MEALS"
              description={data.plate.key_nutrients.join(" · ")}
              icon={<UtensilsCrossed size={18} strokeWidth={1.5} />}
            />
            <DataCard
              label="Stack"
              metric={`${data.stack.length} SUPPS`}
              description={data.stack.map((s) => s.name).join(", ")}
              icon={<Pill size={18} strokeWidth={1.5} />}
            />
            <DataCard
              label="Recovery"
              metric={`${data.recovery.sleep_target_h} HRS`}
              description={`Wind down by ${data.recovery.wind_down_time}`}
              icon={<Moon size={18} strokeWidth={1.5} />}
            />
          </section>

          {/* CYCLE HELIX placeholder */}
          <section>
            <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mb-4">
              Your Cycle
            </div>
            <div
              className="rounded-2xl border border-dashed border-white/[0.06] bg-surface-1 flex items-center justify-center"
              style={{ height: 320 }}
            >
              <span className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-tertiary-dim">
                Helix · Prompt 6
              </span>
            </div>
          </section>
        </div>
      </div>

      {/* LOCKED MODE SHEET */}
      <Sheet
        open={lockedSheet !== null}
        onOpenChange={(open) => !open && setLockedSheet(null)}
      >
        <SheetContent
          side="bottom"
          className="bg-background border-t border-white/[0.06] p-0 max-h-[92vh] overflow-y-auto"
        >
          {lockedSheet && (
            <div className="mx-auto w-full max-w-[420px] px-6 pt-8 pb-10">
              <div
                aria-hidden
                className="mx-auto mb-8 h-1 w-10 rounded-full bg-white/10"
              />
              <SheetTitle asChild>
                <h2 className="font-light text-4xl tracking-tight text-cream">
                  {lockedSheet.label}
                </h2>
              </SheetTitle>
              <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-gold mt-3">
                Available Q3 2026
              </div>
              <SheetDescription asChild>
                <p className="text-secondary-dim text-sm leading-relaxed mt-6">
                  {lockedSheet.teaser}
                </p>
              </SheetDescription>

              <div
                className="mt-8 rounded-2xl border border-white/[0.06] bg-surface-1 flex items-center justify-center"
                style={{ height: 200 }}
              >
                <span className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-tertiary-dim">
                  Preview
                </span>
              </div>

              <button
                type="button"
                className="mt-8 w-full font-mono-data text-[11px] tracking-[0.32em] uppercase text-gold border border-accent-soft rounded-full py-4 hover:shadow-halo-gold transition-shadow duration-400"
              >
                Notify me
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
};

export default Today;