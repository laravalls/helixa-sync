import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Activity,
  Watch,
  Heart,
  Droplet,
  Dumbbell,
  Bike,
  Apple,
  Brain,
  Calendar as CalIcon,
  Stethoscope,
  NotebookPen,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { saveUserCycle, getUserCycle } from "@/lib/db";
import { saveCycleData, hasCompletedOnboarding } from "@/lib/onboardingCheck";
import { useToast } from "@/hooks/use-toast";

type Mode =
  | "cycle_sync"
  | "ttc"
  | "pcos"
  | "acne"
  | "pregnancy"
  | "perimenopause";

interface ModeCard {
  id: Mode;
  name: string;
  description: string;
  available: boolean;
}

const MODE_CARDS: ModeCard[] = [
  { id: "ttc", name: "Trying to Conceive", description: "Conception windows, implantation guidance, partner mode.", available: true },
  { id: "cycle_sync", name: "Cycle Sync", description: "Optimize workouts, nutrition, and recovery across 28 days.", available: true },
  { id: "pcos", name: "PCOS Management", description: "Irregular cycles, insulin resistance, symptom tracking, acne flares.", available: false },
  { id: "acne", name: "Acne Control", description: "Track flares by phase, targeted supplement stacks, skin barrier support.", available: false },
  { id: "pregnancy", name: "Pregnancy", description: "Trimester-specific guidance, symptom tracking, prep for postpartum.", available: false },
  { id: "perimenopause", name: "Perimenopause", description: "Irregular cycles, hormone shifts, HRT tracking, symptom management.", available: false },
];

const OUTCOMES: { label: string; body: string }[] = [
  { label: "Workouts", body: "Train when your hormones peak, recover when they dip." },
  { label: "Supplements", body: "Phase-specific stacks. Magnesium in luteal, iron in menstrual." },
  { label: "Sleep", body: "Know why you need 9 hours today and 7 tomorrow." },
  { label: "Mood", body: "Predict the luteal crash. Adjust your week accordingly." },
  { label: "Calendar", body: "Front-load big meetings to follicular. Protect luteal for deep work." },
  { label: "Events", body: "Plan launches, travel, and presentations around your biology." },
];

const INTEGRATIONS: { name: string; Icon: any }[] = [
  { name: "Oura", Icon: Activity },
  { name: "Apple Watch", Icon: Watch },
  { name: "Whoop", Icon: HeartPulse },
  { name: "Flo", Icon: Droplet },
  { name: "ClassPass", Icon: Dumbbell },
  { name: "Strava", Icon: Bike },
  { name: "Cronometer", Icon: Apple },
  { name: "Calm", Icon: Brain },
  { name: "Calendar", Icon: CalIcon },
  { name: "MyChart", Icon: Stethoscope },
  { name: "Day One", Icon: NotebookPen },
  { name: "Apple Health", Icon: Heart },
];

const TOTAL_BASE_STEPS = 4; // Welcome, Integrations, Outcomes, Mode

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [checking, setChecking] = useState(true);
  const [lastPeriod, setLastPeriod] = useState<Date>(() => subDays(new Date(), 18));
  const [cycleLength, setCycleLength] = useState(28);
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [syncPhase, setSyncPhase] = useState<"in" | "converge" | "settle">("in");

  const needsCycleStep = selectedMode === "cycle_sync" || selectedMode === "ttc";
  const totalSteps = needsCycleStep ? TOTAL_BASE_STEPS + 1 : TOTAL_BASE_STEPS;

  // Skip if data exists
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // localStorage source of truth for the guard
      if (hasCompletedOnboarding()) {
        navigate("/", { replace: true });
        return;
      }
      const existing = await getUserCycle();
      if (cancelled) return;
      if (existing && existing.last_period_date) {
        // Backfill localStorage from remote so guard agrees
        saveCycleData(existing.last_period_date, existing.cycle_length ?? 28, existing.active_mode ?? "ttc");
        navigate("/", { replace: true });
      } else {
        setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Run sync animation when entering step 1
  useEffect(() => {
    if (step !== 1) return;
    setSyncPhase("in");
    const t1 = setTimeout(() => setSyncPhase("converge"), INTEGRATIONS.length * 100 + 250);
    const t2 = setTimeout(() => setSyncPhase("settle"), INTEGRATIONS.length * 100 + 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [step]);

  const goNext = () => setStep((s) => Math.min(totalSteps - 1, s + 1));
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  // Swipe support
  const [touchX, setTouchX] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (dx < -60 && step < totalSteps - 1 && canAdvance()) goNext();
    if (dx > 60 && step > 0) goBack();
    setTouchX(null);
  };

  const canAdvance = () => {
    if (step === 3) return !!selectedMode;
    return true;
  };

  const handlePrimary = () => {
    if (step === 3) {
      if (!selectedMode) return;
      if (needsCycleStep) {
        goNext();
      } else {
        finish();
      }
      return;
    }
    if (step === totalSteps - 1) {
      finish();
      return;
    }
    goNext();
  };

  const finish = async () => {
    if (!selectedMode) return;
    setSubmitting(true);
    try {
      const lastPeriodStr = format(lastPeriod, "yyyy-MM-dd");
      await saveUserCycle({
        last_period_date: lastPeriodStr,
        cycle_length: cycleLength,
        active_mode: selectedMode,
      });
      saveCycleData(lastPeriodStr, cycleLength, selectedMode);
      navigate("/", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const dots = useMemo(
    () => Array.from({ length: totalSteps }, (_, i) => i),
    [totalSteps],
  );

  if (checking) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse-live" />
      </main>
    );
  }

  const primaryLabel =
    step === 0
      ? "Begin"
      : step === 3
        ? needsCycleStep
          ? "Enter HelixA"
          : submitting
            ? "Entering…"
            : "Enter HelixA"
        : step === totalSteps - 1
          ? submitting
            ? "Launching…"
            : "Launch HelixA"
          : "Continue";

  return (
    <main
      className="min-h-screen bg-background text-cream relative overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* back arrow */}
      {step > 0 && (
        <button
          onClick={goBack}
          className="absolute top-5 left-5 z-10 text-secondary-dim hover:text-cream transition-colors"
          aria-label="Back"
        >
          <ChevronLeft size={22} strokeWidth={1.5} />
        </button>
      )}

      <div className="mx-auto w-full max-w-[460px] min-h-screen flex flex-col px-6 pt-16 pb-28">
        {/* STEP 1 — Welcome */}
        {step === 0 && (
          <section
            key="s1"
            className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in"
            style={{ animationDuration: "300ms" }}
          >
            <div className="flex items-baseline">
              <span className="font-light text-5xl tracking-tight text-cream">HelixA</span>
              <span
                className="ml-2 w-2 h-2 rounded-full bg-primary inline-block"
                style={{ boxShadow: "0 0 14px rgba(232,193,111,0.8)", transform: "translateY(-6px)" }}
              />
            </div>

            <div className="my-12 relative w-44 h-44 flex items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(232,193,111,0.18), rgba(232,193,111,0) 70%)",
                  filter: "blur(8px)",
                }}
              />
              <span className="absolute inset-0 rounded-full border border-accent-soft animate-pulse-slow" />
              <span
                className="absolute rounded-full border border-accent-soft animate-pulse-slow"
                style={{ inset: "14%", animationDelay: "1s" }}
              />
              <span
                className="absolute rounded-full bg-primary/80"
                style={{ width: 8, height: 8, boxShadow: "0 0 20px rgba(232,193,111,0.9)" }}
              />
            </div>

            <h1 className="font-light text-3xl leading-snug text-cream max-w-[340px]">
              The one app that syncs them all.
            </h1>
            <p className="mt-4 text-sm text-secondary-dim leading-relaxed max-w-[340px]">
              Biohacking, decoded for women. One body. Five life stages. Twenty-eight days at a time.
            </p>
          </section>
        )}

        {/* STEP 2 — Integrations */}
        {step === 1 && (
          <section
            key="s2"
            className="flex-1 flex flex-col animate-fade-in"
            style={{ animationDuration: "300ms" }}
          >
            <div className="text-center mb-2">
              <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim">
                Connect your health stack
              </div>
              <p className="mt-3 text-xs text-secondary-dim leading-relaxed max-w-[360px] mx-auto">
                HelixA is the glue. We take fragmented data and turn it into a coherent biological picture.
              </p>
            </div>

            {/* Sync stage */}
            <div className="relative mt-6 mb-4 h-[340px]">
              {/* Center HelixA mark */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(closest-side, rgba(232,193,111,0.35), rgba(232,193,111,0) 70%)",
                      filter: "blur(6px)",
                    }}
                  />
                  <span className="absolute inset-0 rounded-full border border-accent-soft animate-pulse-slow" />
                  <span className="font-mono-data text-[10px] tracking-[0.28em] uppercase text-cream">
                    HxA
                  </span>
                </div>
              </div>

              {/* Icon grid */}
              <div className="grid grid-cols-3 gap-y-5 gap-x-2 h-full content-center">
                {INTEGRATIONS.map((it, i) => {
                  const { Icon } = it;
                  // Compute translation toward center for converge phase
                  const col = i % 3;
                  const row = Math.floor(i / 3);
                  const dx = (1 - col) * 70; // toward center col
                  const dy = (1.5 - row) * 50;
                  const styleTransform =
                    syncPhase === "converge"
                      ? `translate(${dx}px, ${dy}px) scale(0.4)`
                      : "translate(0,0) scale(1)";
                  const opacity =
                    syncPhase === "in"
                      ? 0
                      : syncPhase === "converge"
                        ? 0.2
                        : 1;
                  return (
                    <div
                      key={it.name}
                      className="flex flex-col items-center gap-2"
                      style={{
                        transition: "transform 700ms cubic-bezier(.5,.1,.2,1), opacity 500ms ease",
                        transitionDelay:
                          syncPhase === "in" ? `${i * 100}ms` : "0ms",
                        transform: styleTransform,
                        opacity,
                      }}
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full bg-surface-1 border flex items-center justify-center",
                          syncPhase === "settle"
                            ? "border-accent-soft halo-gold"
                            : "border-white/[0.06]",
                        )}
                      >
                        <Icon size={20} strokeWidth={1.5} className="text-cream" />
                      </div>
                      <span className="text-[10px] text-secondary-dim text-center leading-tight">
                        {it.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="mt-2 text-xs text-secondary-dim text-center leading-relaxed">
              15 apps. One brain. Your hormones are the missing link.
            </p>
          </section>
        )}

        {/* STEP 3 — What you'll optimize */}
        {step === 2 && (
          <section
            key="s3"
            className="flex-1 flex flex-col animate-fade-in"
            style={{ animationDuration: "300ms" }}
          >
            <div className="text-center mb-6">
              <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim">
                What you'll optimize
              </div>
              <p className="mt-3 text-xs text-secondary-dim leading-relaxed max-w-[340px] mx-auto">
                HelixA syncs your cycle to everything you already track.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {OUTCOMES.map((o) => (
                <div
                  key={o.label}
                  className="bg-surface-1 border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono-data text-[10px] tracking-[0.28em] uppercase text-cream">
                      {o.label}
                    </div>
                    <ChevronRight size={14} strokeWidth={1.5} className="text-tertiary-dim" />
                  </div>
                  <p className="text-[11px] text-secondary-dim leading-relaxed">{o.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* STEP 4 — Mode */}
        {step === 3 && (
          <section
            key="s4"
            className="flex-1 flex flex-col animate-fade-in"
            style={{ animationDuration: "300ms" }}
          >
            <div className="text-center mb-5">
              <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim">
                What's your focus right now?
              </div>
              <p className="mt-3 text-xs text-secondary-dim leading-relaxed max-w-[340px] mx-auto">
                HelixA adapts to your life stage. Switch modes anytime.
              </p>
            </div>

            <div className="space-y-2.5">
              {MODE_CARDS.map((card) => {
                const isSelected = card.available && selectedMode === card.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => card.available && setSelectedMode(card.id)}
                    className={cn(
                      "rounded-2xl p-4 border bg-surface-1 transition-all duration-300 cursor-pointer",
                      isSelected
                        ? "border-primary halo-gold"
                        : card.available
                          ? "border-white/[0.06] hover:border-accent-soft"
                          : "border-dashed border-white/[0.08] opacity-60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-light text-[20px] text-cream leading-tight">
                          {card.name}
                        </div>
                        <div className="text-[11px] text-secondary-dim mt-1.5 leading-relaxed">
                          {card.description}
                        </div>
                      </div>
                      {card.available ? (
                        <span className="font-mono-data text-[9px] tracking-[0.28em] uppercase text-primary border border-accent-soft rounded-full px-2.5 py-1 shrink-0">
                          Available
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast({ description: `We'll notify you when ${card.name} launches.` });
                          }}
                          className="font-mono-data text-[9px] tracking-[0.28em] uppercase text-tertiary-dim border border-dashed border-white/[0.10] rounded-full px-2.5 py-1 shrink-0 hover:text-cream hover:border-white/[0.2] transition-colors"
                        >
                          Notify me
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-5 text-[10px] text-tertiary-dim text-center leading-relaxed">
              More modes in development: Postpartum, Menopause, Athlete Performance.
            </p>
          </section>
        )}

        {/* STEP 5 — Cycle data */}
        {step === 4 && needsCycleStep && (
          <section
            key="s5"
            className="flex-1 flex flex-col animate-fade-in"
            style={{ animationDuration: "300ms" }}
          >
            <div className="mt-2 space-y-8">
              <div>
                <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mb-4">
                  When did your last period start?
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-light text-lg h-14 rounded-2xl bg-surface-1 border-white/[0.06] hover:border-accent-soft text-cream",
                      )}
                    >
                      <CalendarIcon className="mr-3 text-secondary-dim" size={18} strokeWidth={1.5} />
                      {format(lastPeriod, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-surface-2 border-white/[0.06]" align="start">
                    <Calendar
                      mode="single"
                      selected={lastPeriod}
                      onSelect={(d) => d && setLastPeriod(d)}
                      disabled={(d) => d > new Date() || d < subDays(new Date(), 90)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mb-4">
                  Cycle length
                </div>
                <div className="flex items-center gap-4 bg-surface-1 border border-white/[0.06] rounded-2xl px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setCycleLength((n) => Math.max(20, n - 1))}
                    className="w-10 h-10 rounded-full border border-white/[0.08] text-cream hover:border-accent-soft transition-colors text-lg font-light"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={cycleLength}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!Number.isNaN(v)) setCycleLength(Math.max(20, Math.min(40, v)));
                    }}
                    className="flex-1 bg-transparent text-center font-mono-data text-3xl text-cream outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setCycleLength((n) => Math.min(40, n + 1))}
                    className="w-10 h-10 rounded-full border border-white/[0.08] text-cream hover:border-accent-soft transition-colors text-lg font-light"
                  >
                    +
                  </button>
                </div>
                <div className="font-mono-data text-[10px] tracking-[0.28em] uppercase text-tertiary-dim mt-2 text-center">
                  Days
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Sticky footer: dots + CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-md border-t border-white/[0.04]">
        <div className="mx-auto max-w-[460px] px-6 py-4 flex flex-col gap-3">
          <div className="flex justify-center gap-1.5">
            {dots.map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === step ? "w-6 bg-primary" : "w-3 bg-white/10",
                )}
              />
            ))}
          </div>
          <button
            onClick={handlePrimary}
            disabled={!canAdvance() || submitting}
            className={cn(
              "w-full h-12 font-mono-data text-[12px] tracking-[0.32em] uppercase bg-primary text-primary-foreground rounded-full halo-gold-strong hover:opacity-95 transition-opacity",
              (!canAdvance() || submitting) && "opacity-40 halo-gold",
            )}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Onboarding;