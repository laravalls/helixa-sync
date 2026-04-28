import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import { CalendarIcon, Lock, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { saveUserCycle, getUserCycle } from "@/lib/db";

type Mode = "cycle_sync" | "ttc";

interface ModeCard {
  id: string;
  name: string;
  description: string;
  locked: boolean;
}

const MODE_CARDS: ModeCard[] = [
  {
    id: "cycle_sync",
    name: "Cycle Sync",
    description: "Align movement, food, and recovery to your phase.",
    locked: false,
  },
  {
    id: "ttc",
    name: "Trying to Conceive",
    description: "Optimize the fertile window. Track signals that matter.",
    locked: false,
  },
  {
    id: "pregnancy",
    name: "Pregnancy",
    description: "Trimester-aware protocols. Coming Q3 2026.",
    locked: true,
  },
  {
    id: "postpartum",
    name: "Postpartum",
    description: "Recovery, lactation, sleep architecture rebuilt.",
    locked: true,
  },
  {
    id: "perimenopause",
    name: "Perimenopause",
    description: "Variable-cycle intelligence and HRT-aware protocols.",
    locked: true,
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [checking, setChecking] = useState(true);
  const [lastPeriod, setLastPeriod] = useState<Date>(() => subDays(new Date(), 18));
  const [cycleLength, setCycleLength] = useState(28);
  const [selectedMode, setSelectedMode] = useState<Mode>("cycle_sync");
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Skip if data exists
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const existing = await getUserCycle();
      if (cancelled) return;
      if (existing && existing.last_period_date) {
        navigate("/", { replace: true });
      } else {
        setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(2, s + 1));
  };
  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  // Swipe support
  const [touchX, setTouchX] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (dx < -60 && step < 2) goNext();
    if (dx > 60 && step > 0) goBack();
    setTouchX(null);
  };

  const finish = async () => {
    setSubmitting(true);
    try {
      await saveUserCycle({
        last_period_date: format(lastPeriod, "yyyy-MM-dd"),
        cycle_length: cycleLength,
        active_mode: selectedMode,
      });
      navigate("/", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const dots = useMemo(() => [0, 1, 2], []);

  if (checking) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-gold animate-pulse-live" />
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-background text-cream relative overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* progress dots */}
      <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 z-10">
        {dots.map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-400",
              i === step ? "w-8 bg-gold" : "w-4 bg-white/10",
            )}
          />
        ))}
      </div>

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

      <div className="mx-auto w-full max-w-[420px] min-h-screen flex flex-col px-6 pt-20 pb-10">
        {/* STEP 1 — Welcome */}
        {step === 0 && (
          <section
            key="s1"
            className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in"
            style={{ animationDuration: "500ms" }}
          >
            <div className="flex items-baseline">
              <span className="font-light text-5xl tracking-tight text-cream">
                HelixA
              </span>
              <span
                className="ml-2 w-2 h-2 rounded-full bg-gold inline-block"
                style={{
                  boxShadow: "0 0 14px rgba(232,193,111,0.8)",
                  transform: "translateY(-6px)",
                }}
              />
            </div>

            <div className="my-14 relative w-48 h-48 flex items-center justify-center">
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
                style={{
                  inset: "12%",
                  animationDelay: "1s",
                }}
              />
              <span
                className="absolute rounded-full bg-gold/80"
                style={{
                  width: 8,
                  height: 8,
                  boxShadow: "0 0 20px rgba(232,193,111,0.9)",
                }}
              />
            </div>

            <h1 className="font-light text-3xl leading-snug text-cream max-w-[300px]">
              Biohacking, decoded for women.
            </h1>
            <p className="mt-4 text-sm text-secondary-dim leading-relaxed max-w-[300px]">
              One body. Five life stages. Twenty-eight days at a time.
            </p>

            <div className="mt-auto pt-16 w-full">
              <button
                onClick={goNext}
                className="w-full font-mono-data text-[12px] tracking-[0.32em] uppercase bg-gold text-black rounded-full py-4 halo-gold-strong hover:opacity-95 transition-opacity"
              >
                Begin
              </button>
            </div>
          </section>
        )}

        {/* STEP 2 — Cycle data */}
        {step === 1 && (
          <section
            key="s2"
            className="flex-1 flex flex-col animate-fade-in"
            style={{ animationDuration: "400ms" }}
          >
            <div className="mt-6 space-y-10">
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

            <div className="mt-auto pt-12">
              <button
                onClick={goNext}
                className="w-full font-mono-data text-[12px] tracking-[0.32em] uppercase bg-gold text-black rounded-full py-4 halo-gold-strong hover:opacity-95 transition-opacity"
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* STEP 3 — Mode */}
        {step === 2 && (
          <section
            key="s3"
            className="flex-1 flex flex-col animate-fade-in"
            style={{ animationDuration: "400ms" }}
          >
            <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mt-2 mb-6">
              What's your focus?
            </div>

            <div className="space-y-3">
              {MODE_CARDS.map((card) => {
                const isSelected = !card.locked && selectedMode === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    disabled={card.locked}
                    onClick={() => !card.locked && setSelectedMode(card.id as Mode)}
                    className={cn(
                      "w-full text-left rounded-2xl p-5 border transition-all duration-300 bg-surface-1",
                      isSelected
                        ? "border-gold halo-gold"
                        : "border-white/[0.06]",
                      card.locked ? "opacity-50" : "hover:border-accent-soft",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-light text-xl text-cream">{card.name}</div>
                        <div className="text-xs text-secondary-dim mt-1.5 leading-relaxed">
                          {card.description}
                        </div>
                      </div>
                      {card.locked ? (
                        <span className="font-mono-data text-[9px] tracking-[0.28em] uppercase text-tertiary-dim border border-white/[0.08] rounded-full px-2.5 py-1 flex items-center gap-1.5 shrink-0">
                          <Lock size={9} strokeWidth={1.5} />
                          Q3 2026
                        </span>
                      ) : isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-gold shrink-0 mt-1" style={{ boxShadow: "0 0 12px rgba(232,193,111,0.6)" }} />
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-white/15 shrink-0 mt-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-10">
              <button
                onClick={finish}
                disabled={submitting}
                className="w-full font-mono-data text-[12px] tracking-[0.32em] uppercase bg-gold text-black rounded-full py-4 halo-gold-strong hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                {submitting ? "Entering…" : "Enter HelixA"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default Onboarding;
