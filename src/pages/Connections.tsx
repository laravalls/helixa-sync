import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  X,
  Lock,
  Activity,
  Watch,
  HeartPulse,
  Bike,
  Droplet,
  Dumbbell,
  Apple,
  Brain,
  Calendar as CalIcon,
  Stethoscope,
  NotebookPen,
  Heart,
  Music2,
  Sparkles,
  Check,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Status = "connected" | "available" | "premium";

interface Integration {
  id: string;
  name: string;
  status: Status;
  Icon: any;
  description: string;
  lastSynced?: string;
  dataPoints?: string[];
}

interface Category {
  id: string;
  label: string;
  toggleLabel: string;
  defaultOn: boolean;
  items: Integration[];
}

const CATEGORIES: Category[] = [
  {
    id: "wearables",
    label: "Wearables",
    toggleLabel: "Show wearables",
    defaultOn: true,
    items: [
      {
        id: "oura",
        name: "Oura Ring",
        status: "connected",
        Icon: Activity,
        description: "HRV · Recovery · Sleep · Resting HR",
        lastSynced: "2 min ago",
        dataPoints: [
          "HRV and recovery score",
          "Sleep duration and quality",
          "Resting heart rate",
          "Activity and movement",
        ],
      },
      {
        id: "apple_watch",
        name: "Apple Watch",
        status: "available",
        Icon: Watch,
        description: "Sync heart rate, workouts, and sleep data",
        dataPoints: ["Heart rate", "Workouts", "Sleep stages", "Activity rings"],
      },
      {
        id: "whoop",
        name: "Whoop",
        status: "premium",
        Icon: HeartPulse,
        description: "Strain, recovery, and respiratory rate",
        dataPoints: ["Strain score", "Recovery", "Respiratory rate", "Sleep performance"],
      },
      {
        id: "garmin",
        name: "Garmin",
        status: "available",
        Icon: Watch,
        description: "Training load, VO2 max, and body battery",
        dataPoints: ["Training load", "VO2 max", "Body battery", "Stress score"],
      },
    ],
  },
  {
    id: "cycle",
    label: "Cycle Tracking",
    toggleLabel: "Show cycle apps",
    defaultOn: true,
    items: [
      {
        id: "flo",
        name: "Flo / Clue",
        status: "available",
        Icon: Droplet,
        description: "Import your cycle history and symptom logs",
        dataPoints: ["Cycle length history", "Symptom logs", "Period dates", "Mood entries"],
      },
    ],
  },
  {
    id: "fitness",
    label: "Fitness & Movement",
    toggleLabel: "Show fitness apps",
    defaultOn: true,
    items: [
      {
        id: "strava",
        name: "Strava",
        status: "available",
        Icon: Bike,
        description: "Sync runs, rides, and workout intensity",
        dataPoints: ["Activities", "Heart rate zones", "Pace and power", "Effort score"],
      },
      {
        id: "peloton",
        name: "Peloton",
        status: "available",
        Icon: Dumbbell,
        description: "Class history and output metrics",
        dataPoints: ["Class history", "Output", "Heart rate", "Strive score"],
      },
      {
        id: "classpass",
        name: "ClassPass",
        status: "available",
        Icon: Dumbbell,
        description: "Booked classes and workout schedule",
        dataPoints: ["Booked classes", "Workout types", "Schedule", "Studio history"],
      },
    ],
  },
  {
    id: "nutrition",
    label: "Nutrition & Metabolic",
    toggleLabel: "Show nutrition apps",
    defaultOn: false,
    items: [
      {
        id: "mfp",
        name: "MyFitnessPal",
        status: "available",
        Icon: Apple,
        description: "Daily nutrition and macro tracking",
        dataPoints: ["Calories", "Macros", "Meal logs", "Water intake"],
      },
      {
        id: "cronometer",
        name: "Cronometer",
        status: "available",
        Icon: Apple,
        description: "Micronutrient tracking and meal logs",
        dataPoints: ["Micronutrients", "Macros", "Meal logs", "Biometric tracking"],
      },
      {
        id: "levels",
        name: "Levels (CGM)",
        status: "premium",
        Icon: Activity,
        description: "Continuous glucose data and meal responses",
        dataPoints: ["Glucose curves", "Meal scores", "Metabolic fitness", "Time in range"],
      },
    ],
  },
  {
    id: "mind",
    label: "Mindfulness & Mental Health",
    toggleLabel: "Show mindfulness apps",
    defaultOn: true,
    items: [
      {
        id: "calm",
        name: "Calm",
        status: "available",
        Icon: Brain,
        description: "Meditation sessions and sleep stories",
        dataPoints: ["Meditation minutes", "Session types", "Sleep stories", "Daily mood"],
      },
      {
        id: "headspace",
        name: "Headspace",
        status: "available",
        Icon: Brain,
        description: "Mindfulness practice and mood tracking",
        dataPoints: ["Practice streak", "Session types", "Mood check-ins", "Stress levels"],
      },
      {
        id: "dayone",
        name: "Day One",
        status: "available",
        Icon: NotebookPen,
        description: "Journal entries and mood correlation",
        dataPoints: ["Journal entries", "Mood tags", "Activity context", "Location"],
      },
    ],
  },
  {
    id: "productivity",
    label: "Productivity & Scheduling",
    toggleLabel: "Show calendar apps",
    defaultOn: true,
    items: [
      {
        id: "gcal",
        name: "Google Calendar",
        status: "available",
        Icon: CalIcon,
        description: "Meeting schedule and event planning",
        dataPoints: ["Meetings", "Event density", "Travel blocks", "Focus time"],
      },
      {
        id: "outlook",
        name: "Outlook Calendar",
        status: "available",
        Icon: CalIcon,
        description: "Work calendar and time blocks",
        dataPoints: ["Work meetings", "Time blocks", "Travel", "Recurring events"],
      },
      {
        id: "icloud_cal",
        name: "Apple Calendar",
        status: "available",
        Icon: CalIcon,
        description: "Personal events and reminders",
        dataPoints: ["Personal events", "Reminders", "Family calendars", "Birthdays"],
      },
    ],
  },
  {
    id: "clinical",
    label: "Clinical & Health Records",
    toggleLabel: "Show clinical apps",
    defaultOn: false,
    items: [
      {
        id: "mychart",
        name: "MyChart / Epic",
        status: "premium",
        Icon: Stethoscope,
        description: "Lab results, bloodwork, and medical records",
        dataPoints: ["Lab results", "Bloodwork trends", "Medical history", "Provider notes"],
      },
      {
        id: "labcorp",
        name: "LabCorp / Quest",
        status: "premium",
        Icon: Stethoscope,
        description: "Direct lab integration and test results",
        dataPoints: ["Test results", "Hormone panels", "Vitamin levels", "Trend tracking"],
      },
      {
        id: "apple_health",
        name: "Apple Health",
        status: "available",
        Icon: Heart,
        description: "Centralized health data from all sources",
        dataPoints: ["All health metrics", "Medical ID", "Cycle data", "Mindful minutes"],
      },
    ],
  },
];

const COMING_SOON = [
  { name: "Notion", Icon: NotebookPen },
  { name: "Superhuman", Icon: Sparkles },
  { name: "Linear", Icon: Activity },
  { name: "Spotify", Icon: Music2 },
];

const TOGGLES_KEY = "helixa_connection_toggles";

const StatusBadge = ({ status }: { status: Status }) => {
  if (status === "connected") {
    return (
      <span className="font-mono-data text-[9px] tracking-[0.28em] uppercase text-primary border border-accent-soft rounded-full pl-2 pr-2.5 py-1 flex items-center gap-1.5 shrink-0">
        <span className="relative flex w-1.5 h-1.5">
          <span
            className="absolute inset-0 rounded-full bg-primary opacity-60 animate-ping"
            style={{ animationDuration: "2s" }}
          />
          <span className="relative w-1.5 h-1.5 rounded-full bg-primary" />
        </span>
        Connected
      </span>
    );
  }
  if (status === "premium") {
    return (
      <span className="font-mono-data text-[9px] tracking-[0.28em] uppercase text-primary border border-accent-soft rounded-full px-2.5 py-1 flex items-center gap-1.5 shrink-0">
        <Lock size={9} strokeWidth={1.5} />
        Premium
      </span>
    );
  }
  return (
    <span className="font-mono-data text-[9px] tracking-[0.28em] uppercase text-tertiary-dim border border-white/[0.08] rounded-full px-2.5 py-1 shrink-0">
      Available
    </span>
  );
};

const Connections = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [connections, setConnections] = useState<Record<string, Status>>({});
  const [active, setActive] = useState<Integration | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(TOGGLES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return Object.fromEntries(CATEGORIES.map((c) => [c.id, c.defaultOn]));
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TOGGLES_KEY, JSON.stringify(toggles));
    } catch {}
  }, [toggles]);

  const visibleCategories = useMemo(
    () => CATEGORIES.filter((c) => toggles[c.id] !== false),
    [toggles],
  );

  const getStatus = (it: Integration): Status =>
    connections[it.id] ?? it.status;

  const handleConnect = (it: Integration) => {
    setConnections((prev) => ({ ...prev, [it.id]: "connected" }));
    setActive(null);
    setTimeout(() => {
      toast({ description: `${it.name} connected to HelixA.` });
    }, 200);
  };

  const handleDisconnect = (it: Integration) => {
    setConnections((prev) => ({ ...prev, [it.id]: "available" }));
    setActive(null);
    setTimeout(() => {
      toast({ description: `${it.name} disconnected.` });
    }, 200);
  };

  const activeStatus = active ? getStatus(active) : null;

  return (
    <main className="min-h-screen bg-background text-cream page-fade pb-24">
      {/* HEADER */}
      <header
        className={cn(
          "sticky top-0 z-30 px-5 py-4 transition-colors duration-400",
          scrolled
            ? "bg-background/85 backdrop-blur-xl border-b border-white/[0.06]"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto w-full max-w-[460px] grid grid-cols-3 items-center">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="text-secondary-dim hover:text-cream transition-colors justify-self-start press"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
          <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-cream text-center">
            Connections
          </div>
          <button
            onClick={() => navigate("/")}
            aria-label="Close"
            className="text-secondary-dim hover:text-cream transition-colors justify-self-end press"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[460px] px-5 pb-24">
        {/* HERO */}
        <section className="pt-6 pb-8 flex flex-col items-center text-center">
          <div className="relative w-8 h-8 flex items-center justify-center mb-5">
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
            <span
              className="relative w-1.5 h-1.5 rounded-full bg-primary"
              style={{ boxShadow: "0 0 12px rgba(232,193,111,0.7)" }}
            />
          </div>
          <h1 className="font-light text-[32px] leading-tight text-cream">
            Your health stack
          </h1>
          <p className="mt-3 text-sm text-secondary-dim leading-relaxed max-w-[340px]">
            HelixA connects the apps you already use and turns fragmented data into a coherent biological picture.
          </p>
        </section>

        {/* CATEGORIES */}
        {visibleCategories.length === 0 ? (
          <div className="bg-surface-1 border border-white/[0.06] rounded-2xl p-8 text-center">
            <p className="text-sm text-secondary-dim leading-relaxed">
              No integrations selected. Turn on categories below to see available connections.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {visibleCategories.map((cat) => (
              <section key={cat.id}>
                <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mb-3">
                  {cat.label}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {cat.items.map((it) => {
                    const status = getStatus(it);
                    const Icon = it.Icon;
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => setActive(it)}
                        className={cn(
                          "press text-left bg-surface-1 rounded-2xl p-4 border transition-all duration-400 flex flex-col gap-3 min-h-[148px]",
                          status === "connected"
                            ? "border-accent-soft halo-gold"
                            : "border-white/[0.06] hover:border-accent-soft",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full bg-surface-2 border border-white/[0.06] flex items-center justify-center",
                              status !== "connected" && "opacity-60",
                            )}
                          >
                            <Icon
                              size={18}
                              strokeWidth={1.5}
                              className={cn(
                                status === "connected" ? "text-primary" : "text-cream",
                              )}
                            />
                          </div>
                          <StatusBadge status={status} />
                        </div>
                        <div className="flex-1">
                          <div
                            className={cn(
                              "font-normal text-sm leading-tight",
                              status === "connected" ? "text-cream" : "text-secondary-dim",
                            )}
                          >
                            {it.name}
                          </div>
                          {status === "connected" ? (
                            <>
                              <div className="font-mono-data text-[9px] tracking-[0.2em] uppercase text-tertiary-dim mt-1.5">
                                Last synced {it.lastSynced ?? "just now"}
                              </div>
                              <div className="text-[11px] text-secondary-dim mt-1.5 leading-snug line-clamp-2">
                                {it.description}
                              </div>
                            </>
                          ) : (
                            <div className="text-[11px] text-tertiary-dim mt-1.5 leading-snug line-clamp-2">
                              {it.description}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* PERSONALIZE */}
        <section className="mt-10 pt-6 border-t border-white/[0.06]">
          <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim">
            Personalize your stack
          </div>
          <p className="mt-2 text-xs text-secondary-dim">
            Show only the integrations you use.
          </p>
          <div className="mt-5 space-y-1">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-b-0"
              >
                <span className="text-sm text-cream">{cat.toggleLabel}</span>
                <Switch
                  checked={toggles[cat.id] !== false}
                  onCheckedChange={(v) =>
                    setToggles((prev) => ({ ...prev, [cat.id]: v }))
                  }
                />
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <section className="mt-10 pt-6 border-t border-white/[0.06] text-center">
          <p className="text-[11px] text-tertiary-dim">
            More integrations coming Q3 2026
          </p>
          <div className="mt-5 flex items-center justify-center gap-5 opacity-40">
            {COMING_SOON.map(({ name, Icon }) => (
              <div key={name} className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-surface-1 border border-white/[0.06] flex items-center justify-center">
                  <Icon size={16} strokeWidth={1.5} className="text-cream" />
                </div>
                <span className="text-[9px] text-secondary-dim">{name}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setRequestOpen(true)}
            className="mt-6 font-mono-data text-[10px] tracking-[0.32em] uppercase text-primary hover:text-cream transition-colors press"
          >
            Request an integration
          </button>
        </section>
      </div>

      {/* DETAIL / CONNECT / UPSELL SHEET */}
      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent
          side="bottom"
          className="bg-background border-t border-white/[0.06] p-0 max-h-[92vh] overflow-y-auto"
        >
          {active && (
            <div className="mx-auto w-full max-w-[460px] px-6 pt-6 pb-10">
              <div
                aria-hidden
                className="mx-auto mb-6 h-1 w-10 rounded-full bg-white/10"
              />

              <div className="flex items-center gap-4 mb-5">
                <div
                  className={cn(
                    "w-14 h-14 rounded-full bg-surface-2 border flex items-center justify-center",
                    activeStatus === "connected"
                      ? "border-accent-soft halo-gold"
                      : "border-white/[0.06]",
                  )}
                >
                  <active.Icon
                    size={24}
                    strokeWidth={1.5}
                    className={
                      activeStatus === "connected"
                        ? "text-primary"
                        : "text-cream"
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <SheetTitle asChild>
                    <h2 className="font-light text-2xl text-cream leading-tight">
                      {active.name}
                    </h2>
                  </SheetTitle>
                  <div className="mt-1.5">
                    <StatusBadge status={activeStatus!} />
                  </div>
                </div>
              </div>

              {activeStatus === "connected" && (
                <>
                  <div className="font-mono-data text-[10px] tracking-[0.28em] uppercase text-tertiary-dim mb-2">
                    Last synced {active.lastSynced ?? "just now"}
                  </div>
                  <SheetDescription asChild>
                    <p className="text-sm text-secondary-dim leading-relaxed">
                      Data being synced into your HelixA picture:
                    </p>
                  </SheetDescription>
                  <ul className="mt-4 space-y-2">
                    {active.dataPoints?.map((dp) => (
                      <li key={dp} className="flex items-start gap-2 text-sm text-cream">
                        <Check size={14} strokeWidth={1.5} className="text-primary mt-1 shrink-0" />
                        <span>{dp}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() =>
                      toast({ description: "Opening manage flow…" })
                    }
                    className="press mt-8 w-full font-mono-data text-[11px] tracking-[0.32em] uppercase text-cream border border-white/[0.08] rounded-full py-4 hover:border-accent-soft transition-colors"
                  >
                    Manage connection
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDisconnect(active)}
                    className="press mt-3 w-full font-mono-data text-[11px] tracking-[0.32em] uppercase text-critical hover:opacity-80 transition-opacity py-3"
                  >
                    Disconnect
                  </button>
                </>
              )}

              {activeStatus === "available" && (
                <>
                  <h3 className="font-light text-xl text-cream mt-2">
                    Connect {active.name}
                  </h3>
                  <SheetDescription asChild>
                    <p className="text-sm text-secondary-dim leading-relaxed mt-3">
                      What HelixA will sync:
                    </p>
                  </SheetDescription>
                  <ul className="mt-4 space-y-2">
                    {active.dataPoints?.map((dp) => (
                      <li key={dp} className="flex items-start gap-2 text-sm text-cream">
                        <Check size={14} strokeWidth={1.5} className="text-primary mt-1 shrink-0" />
                        <span>{dp}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-tertiary-dim mt-6 leading-relaxed">
                    HelixA only reads data. We never write to {active.name} or share your data.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleConnect(active)}
                    className="press mt-6 w-full h-12 font-mono-data text-[12px] tracking-[0.32em] uppercase bg-primary text-primary-foreground rounded-full halo-gold hover:opacity-95 transition-opacity"
                  >
                    Connect
                  </button>
                </>
              )}

              {activeStatus === "premium" && (
                <>
                  <div className="flex items-center gap-2 mt-2">
                    <Lock size={14} strokeWidth={1.5} className="text-primary" />
                    <h3 className="font-light text-xl text-cream">
                      Available with HelixA Pro
                    </h3>
                  </div>
                  <SheetDescription asChild>
                    <p className="text-sm text-secondary-dim leading-relaxed mt-3">
                      What this unlocks:
                    </p>
                  </SheetDescription>
                  <ul className="mt-4 space-y-2">
                    {active.dataPoints?.map((dp) => (
                      <li key={dp} className="flex items-start gap-2 text-sm text-cream">
                        <Sparkles size={14} strokeWidth={1.5} className="text-primary mt-1 shrink-0" />
                        <span>{dp}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-secondary-dim mt-6 leading-relaxed">
                    HelixA Pro includes: All premium integrations, clinician export, partner mode, and priority support.
                  </p>
                  <div className="font-mono-data text-sm text-cream mt-4">
                    $25/month <span className="text-tertiary-dim">or</span> $240/year
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toast({ description: "HelixA Pro launches Q3 2026." })
                    }
                    className="press mt-6 w-full h-12 font-mono-data text-[12px] tracking-[0.32em] uppercase bg-primary text-primary-foreground rounded-full halo-gold hover:opacity-95 transition-opacity"
                  >
                    Upgrade to Pro
                  </button>
                  <button
                    type="button"
                    onClick={() => setActive(null)}
                    className="press mt-3 w-full font-mono-data text-[11px] tracking-[0.32em] uppercase text-tertiary-dim hover:text-cream transition-colors py-3"
                  >
                    Not now
                  </button>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* REQUEST INTEGRATION SHEET */}
      <Sheet open={requestOpen} onOpenChange={setRequestOpen}>
        <SheetContent
          side="bottom"
          className="bg-background border-t border-white/[0.06] p-0"
        >
          <div className="mx-auto w-full max-w-[460px] px-6 pt-6 pb-10">
            <div
              aria-hidden
              className="mx-auto mb-6 h-1 w-10 rounded-full bg-white/10"
            />
            <SheetTitle asChild>
              <h2 className="font-light text-2xl text-cream">Request an integration</h2>
            </SheetTitle>
            <SheetDescription asChild>
              <p className="text-sm text-secondary-dim leading-relaxed mt-2">
                Tell us which app you'd like HelixA to sync with.
              </p>
            </SheetDescription>
            <textarea
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder="e.g. Garmin Connect, Lumen, Eight Sleep…"
              rows={3}
              className="mt-5 w-full bg-surface-1 border border-white/[0.06] rounded-2xl p-4 text-sm text-cream placeholder:text-tertiary-dim outline-none focus:border-accent-soft transition-colors resize-none"
            />
            <button
              type="button"
              onClick={() => {
                setRequestOpen(false);
                setRequestText("");
                toast({ description: "Request received. Thanks for the signal." });
              }}
              disabled={!requestText.trim()}
              className="press mt-5 w-full h-12 font-mono-data text-[12px] tracking-[0.32em] uppercase bg-primary text-primary-foreground rounded-full halo-gold hover:opacity-95 transition-opacity disabled:opacity-40"
            >
              Submit request
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
};

export default Connections;