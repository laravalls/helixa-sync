import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, subDays, isAfter } from "date-fns";
import { CalendarIcon, ChevronLeft, Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { saveUserCycle, getUserCycle } from "@/lib/db";
import { saveCycleData } from "@/lib/onboardingCheck";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";

const CYCLE_LENGTH_OPTIONS = [21, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 40, 45];

const computeCycleDay = (lastPeriodDate: string, cycleLength: number): number => {
  const start = new Date(lastPeriodDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / 86_400_000);
  return ((diff % cycleLength) + cycleLength) % cycleLength + 1;
};

const PHASE_LABELS = [
  { label: "Menstrual", days: [1, 5], color: "#9F2D3F" },
  { label: "Follicular", days: [6, 13], color: "#6BBE8E" },
  { label: "Ovulatory", days: [14, 16], color: "#E8C16F" },
  { label: "Luteal", days: [17, 28], color: "#A088B5" },
];

const phaseForDay = (day: number) =>
  PHASE_LABELS.find((p) => day >= p.days[0] && day <= p.days[1]) ?? PHASE_LABELS[3];

const CycleSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [lastPeriod, setLastPeriod] = useState<Date>(subDays(new Date(), 18));
  const [cycleLength, setCycleLength] = useState(28);
  const [trackCycle, setTrackCycle] = useState(true);
  const [calOpen, setCalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const existing = await getUserCycle();
      if (existing) {
        if (existing.last_period_date) {
          setLastPeriod(new Date(existing.last_period_date));
        }
        if (existing.cycle_length) setCycleLength(existing.cycle_length);
        // If active_mode is not cycle-related, default trackCycle to false
        const cycleModes = ["cycle_sync", "ttc", "pregnancy", "postpartum", "perimenopause"];
        setTrackCycle(cycleModes.includes(existing.active_mode ?? ""));
      }
      setLoading(false);
    })();
  }, []);

  const lastPeriodStr = format(lastPeriod, "yyyy-MM-dd");
  const cycleDay = computeCycleDay(lastPeriodStr, cycleLength);
  const phase = phaseForDay(Math.min(cycleDay, 28));

  const handleSave = async () => {
    setSaving(true);
    try {
      const dateStr = format(lastPeriod, "yyyy-MM-dd");
      const mode = trackCycle ? "cycle_sync" : "performance";
      await saveUserCycle({
        last_period_date: dateStr,
        cycle_length: cycleLength,
        active_mode: mode,
      });
      saveCycleData(dateStr, cycleLength, mode);
      toast("Cycle data updated", { duration: 1800 });
      navigate(-1);
    } catch {
      toast("Couldn't save — please try again.", { duration: 2000 });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-cream flex items-center justify-center">
        <span className="font-mono-data text-[11px] tracking-[0.32em] uppercase text-secondary-dim animate-pulse">
          Loading…
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-cream pb-28">
      <div className="mx-auto w-full max-w-[420px]">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md px-5 h-14 flex items-center justify-between border-b border-white/[0.06]">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="text-secondary-dim hover:text-cream transition-colors"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
          <h1 className="font-mono-data text-[11px] tracking-[0.32em] uppercase">Cycle Data</h1>
          <div className="w-6" />
        </header>

        <div className="px-5 pt-8 space-y-6">
          {/* Live preview */}
          <section
            className="rounded-2xl p-5 border"
            style={{ borderColor: `${phase.color}44`, background: `${phase.color}0A` }}
          >
            <div
              className="font-mono-data text-[10px] tracking-[0.32em] uppercase mb-1"
              style={{ color: phase.color }}
            >
              {phase.label} Phase
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className="font-mono-data text-cream"
                style={{ fontSize: 48, fontWeight: 400, lineHeight: 1 }}
              >
                {cycleDay}
              </span>
              <span className="font-mono-data text-[11px] tracking-[0.24em] uppercase text-secondary-dim">
                / {cycleLength} days
              </span>
            </div>
            <p className="text-xs text-secondary-dim mt-2 leading-relaxed">
              Based on your settings below — updates as you change the date or length.
            </p>
          </section>

          {/* Last period date */}
          <section className="space-y-2">
            <label className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim">
              First day of last period
            </label>
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-3 bg-surface-1 border border-white/[0.06] rounded-2xl px-4 py-4 text-left hover:border-accent-soft transition-colors",
                  )}
                >
                  <CalendarIcon size={18} strokeWidth={1.5} className="text-secondary-dim shrink-0" />
                  <span className="text-cream font-light">{format(lastPeriod, "MMMM d, yyyy")}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-surface-1 border border-white/[0.06] rounded-2xl"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={lastPeriod}
                  onSelect={(d) => {
                    if (d && !isAfter(d, new Date())) {
                      setLastPeriod(d);
                      setCalOpen(false);
                    }
                  }}
                  disabled={(d) => isAfter(d, new Date())}
                  initialFocus
                  className="text-cream"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-tertiary-dim px-1">
              Set this to day 1 of your most recent period — the first day of bleeding.
            </p>
          </section>

          {/* Cycle length */}
          <section className="space-y-2">
            <label className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim">
              Average cycle length
            </label>
            <div className="bg-surface-1 border border-white/[0.06] rounded-2xl px-4 py-3 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCycleLength((l) => Math.max(21, l - 1))}
                className="w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-cream hover:border-accent-soft transition-colors text-xl font-light"
                aria-label="Decrease"
              >
                −
              </button>
              <div className="flex-1 text-center">
                <span className="font-mono-data text-3xl text-cream">{cycleLength}</span>
                <span className="font-mono-data text-[11px] tracking-[0.24em] uppercase text-secondary-dim ml-2">
                  days
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCycleLength((l) => Math.min(45, l + 1))}
                className="w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-cream hover:border-accent-soft transition-colors text-xl font-light"
                aria-label="Increase"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {[24, 26, 28, 30, 32, 35].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCycleLength(n)}
                  className={cn(
                    "font-mono-data text-[11px] tracking-[0.2em] uppercase rounded-full px-3 py-1.5 border transition-colors",
                    cycleLength === n
                      ? "bg-gold text-black border-transparent"
                      : "border-white/[0.08] text-secondary-dim hover:text-cream hover:border-accent-soft",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-tertiary-dim px-1">
              Average is 28 days. Anything from 21–35 is considered normal.
            </p>
          </section>

          {/* Track cycle toggle */}
          <section className="rounded-2xl border border-white/[0.06] bg-surface-1 p-5 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-cream font-light">Track menstrual cycle</div>
              <p className="text-xs text-secondary-dim mt-1 leading-relaxed">
                Layers cycle-aware insights onto your protocol — phase-based training, nutrition, and recovery guidance.
              </p>
            </div>
            <Switch
              checked={trackCycle}
              onCheckedChange={setTrackCycle}
              aria-label="Track menstrual cycle"
            />
          </section>

          {/* Phase reference */}
          <section className="space-y-2">
            <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim">
              Your current phase
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PHASE_LABELS.map((p) => {
                const active = cycleDay >= p.days[0] && cycleDay <= Math.min(p.days[1], cycleLength);
                return (
                  <div
                    key={p.label}
                    className="rounded-xl p-3 border"
                    style={{
                      borderColor: active ? `${p.color}66` : "rgba(255,255,255,0.06)",
                      background: active ? `${p.color}12` : "transparent",
                    }}
                  >
                    <div
                      className="font-mono-data text-[10px] tracking-[0.24em] uppercase font-light"
                      style={{ color: active ? p.color : "#5A554E" }}
                    >
                      {p.label}
                    </div>
                    <div className="text-xs text-secondary-dim mt-1">
                      Days {p.days[0]}–{Math.min(p.days[1], cycleLength)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full h-14 rounded-full bg-gold text-black font-mono-data uppercase flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-60"
            style={{
              fontSize: 11,
              letterSpacing: "0.32em",
              boxShadow: "0 0 24px rgba(232,193,111,0.3)",
            }}
          >
            {saving ? (
              "Saving…"
            ) : (
              <>
                <Check size={14} strokeWidth={2} />
                Save cycle data
              </>
            )}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default CycleSettings;
