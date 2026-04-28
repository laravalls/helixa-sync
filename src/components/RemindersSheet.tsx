import { useEffect, useMemo, useState } from "react";
import { Bell, Check, Clock, Droplet, Moon, Sparkles, Utensils, X, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

interface RemindersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReminderDef {
  id: string;
  label: string;
  description: string;
  defaultTime: string;
  icon: React.ReactNode;
  color: string;
  premium?: boolean;
}

const REMINDERS: ReminderDef[] = [
  {
    id: "period_window",
    label: "Period Window",
    description: "3 days before your next period starts.",
    defaultTime: "08:00",
    icon: <Droplet size={16} strokeWidth={1.5} />,
    color: "#E07856",
  },
  {
    id: "ovulation",
    label: "Ovulation Day",
    description: "Peak fertility window — morning of.",
    defaultTime: "07:30",
    icon: <Sparkles size={16} strokeWidth={1.5} />,
    color: "#E8C16F",
  },
  {
    id: "phase_transition",
    label: "Phase Transition",
    description: "When you move into a new cycle phase.",
    defaultTime: "08:00",
    icon: <Zap size={16} strokeWidth={1.5} />,
    color: "#A088B5",
  },
  {
    id: "supplements",
    label: "Supplement Stack",
    description: "Daily ping for your phase-tuned stack.",
    defaultTime: "09:00",
    icon: <Bell size={16} strokeWidth={1.5} />,
    color: "#6BBE8E",
  },
  {
    id: "meals",
    label: "Plate Reminder",
    description: "Phase-tuned meal nudges across the day.",
    defaultTime: "12:00",
    icon: <Utensils size={16} strokeWidth={1.5} />,
    color: "#E8C16F",
  },
  {
    id: "wind_down",
    label: "Wind-Down",
    description: "Recovery cues 90 minutes before sleep target.",
    defaultTime: "21:30",
    icon: <Moon size={16} strokeWidth={1.5} />,
    color: "#7BA9C9",
  },
  {
    id: "wearable_alerts",
    label: "Wearable Triggers",
    description: "HRV / sleep deviations from baseline.",
    defaultTime: "Realtime",
    icon: <Clock size={16} strokeWidth={1.5} />,
    color: "#A088B5",
    premium: true,
  },
];

const STORAGE_KEY = "helixa_reminders_v1";

type ReminderState = Record<string, { enabled: boolean; time: string }>;

const loadState = (): ReminderState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const init: ReminderState = {};
  REMINDERS.forEach((r) => {
    init[r.id] = { enabled: r.id === "period_window" || r.id === "ovulation", time: r.defaultTime };
  });
  return init;
};

export const RemindersSheet = ({ open, onOpenChange }: RemindersSheetProps) => {
  const [state, setState] = useState<ReminderState>(() => loadState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const enabledCount = useMemo(
    () => Object.values(state).filter((s) => s.enabled).length,
    [state],
  );

  const toggle = (r: ReminderDef) => {
    if (r.premium) {
      toast("Coming with HelixA Pro", { duration: 2000 });
      return;
    }
    setState((prev) => {
      const next = { ...prev, [r.id]: { ...prev[r.id], enabled: !prev[r.id]?.enabled } };
      if (next[r.id].enabled) {
        toast(`${r.label} reminders on`, { duration: 1600 });
      }
      return next;
    });
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { (navigator as Navigator).vibrate?.(8); } catch {}
    }
  };

  const updateTime = (id: string, time: string) => {
    setState((prev) => ({ ...prev, [id]: { ...prev[id], time } }));
  };

  const enableAll = () => {
    setState((prev) => {
      const next = { ...prev };
      REMINDERS.forEach((r) => {
        if (!r.premium) next[r.id] = { ...next[r.id], enabled: true };
      });
      return next;
    });
    toast("All reminders on", { duration: 1600 });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-background border-t border-white/[0.06] p-0 h-[92vh] max-h-[92vh] overflow-hidden"
      >
        <div className="mx-auto w-full max-w-[420px] h-full flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-6 pb-5">
            <SheetTitle asChild>
              <h2 className="font-mono-data text-[11px] tracking-[0.32em] uppercase text-cream">
                Reminders
              </h2>
            </SheetTitle>
            <button
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="text-secondary-dim hover:text-cream transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Hero copy */}
          <div className="px-5 pb-5">
            <SheetDescription asChild>
              <p className="text-sm text-secondary-dim leading-relaxed">
                Quiet pings for the moments that matter.{" "}
                <span className="text-cream">{enabledCount} active</span> of {REMINDERS.length}.
              </p>
            </SheetDescription>
            <button
              type="button"
              onClick={enableAll}
              className="mt-4 font-mono-data text-[10px] tracking-[0.32em] uppercase text-gold border border-accent-soft rounded-full px-4 py-2 hover:bg-white/[0.02] transition-colors"
            >
              Enable all
            </button>
          </div>

          <div className="h-px bg-white/[0.06]" />

          {/* List */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
            {REMINDERS.map((r) => {
              const s = state[r.id] ?? { enabled: false, time: r.defaultTime };
              return (
                <article
                  key={r.id}
                  className="bg-surface-1 rounded-2xl p-4 border border-white/[0.06]"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full border border-white/[0.06] flex items-center justify-center shrink-0"
                      style={{ color: r.color }}
                    >
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm text-cream font-light">{r.label}</h3>
                        {r.premium && (
                          <span
                            className="font-mono-data uppercase text-gold border border-accent-soft rounded-full px-2 py-0.5"
                            style={{ fontSize: 9, letterSpacing: "0.28em" }}
                          >
                            Pro
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-secondary-dim mt-1 leading-relaxed">
                        {r.description}
                      </p>

                      {s.enabled && !r.premium && r.defaultTime !== "Realtime" && (
                        <div className="mt-3 flex items-center gap-2">
                          <Clock size={12} strokeWidth={1.5} className="text-tertiary-dim" />
                          <input
                            type="time"
                            value={s.time}
                            onChange={(e) => updateTime(r.id, e.target.value)}
                            className="bg-transparent border border-white/[0.06] rounded-md px-2 py-1 font-mono-data text-[11px] text-cream tracking-[0.12em] focus:border-accent-soft focus:outline-none"
                          />
                          <span className="font-mono-data text-[9px] tracking-[0.32em] uppercase text-tertiary-dim">
                            Local
                          </span>
                        </div>
                      )}
                    </div>
                    <Switch
                      checked={s.enabled}
                      onCheckedChange={() => toggle(r)}
                      className="mt-1"
                    />
                  </div>
                </article>
              );
            })}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  toast("Reminders saved", { duration: 1600, icon: <Check size={14} /> });
                  onOpenChange(false);
                }}
                className="w-full h-12 rounded-full bg-gold text-black font-mono-data text-[11px] tracking-[0.32em] uppercase active:scale-[0.97] transition-transform"
                style={{ boxShadow: "0 0 24px rgba(232,193,111,0.3)" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RemindersSheet;