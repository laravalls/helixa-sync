import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  Search,
  Share2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { BottomNav } from "@/components/BottomNav";

type CategoryId =
  | "all"
  | "saved"
  | "hormones"
  | "performance"
  | "ttc"
  | "pcos"
  | "nutrition"
  | "recovery"
  | "mental"
  | "contraception";

interface Category {
  id: CategoryId;
  label: string;
  color: string;
}

const CATEGORIES: Category[] = [
  { id: "all", label: "All", color: "#E8C16F" },
  { id: "saved", label: "Saved", color: "#E8C16F" },
  { id: "hormones", label: "Hormones", color: "#A088B5" },
  { id: "performance", label: "Performance", color: "#E8C16F" },
  { id: "ttc", label: "TTC & Fertility", color: "#6BBE8E" },
  { id: "pcos", label: "PCOS", color: "#E07856" },
  { id: "nutrition", label: "Nutrition", color: "#7BA9C9" },
  { id: "recovery", label: "Recovery & Sleep", color: "#9D8BC1" },
  { id: "mental", label: "Mental Health", color: "#D88FB5" },
  { id: "contraception", label: "Contraception", color: "#A088B5" },
];

interface Study {
  id: string;
  title: string;
  source: string;
  finding: string;
  tags: string[];
  category: Exclude<CategoryId, "all" | "saved">;
  featured?: boolean;
  keyFindings: string[];
  whyMatters: string;
  methodology: string;
  url: string;
}

const STUDIES: Study[] = [
  {
    id: "metabolic-fuel",
    title:
      "Menstrual cycle effects on metabolic fuel utilization during endurance exercise",
    source: "Journal of Applied Physiology · 2024",
    finding:
      "Women oxidize more fat during the luteal phase, suggesting phase-specific training protocols could optimize performance.",
    tags: ["Performance", "Metabolism", "Training"],
    category: "performance",
    featured: true,
    keyFindings: [
      "Fat oxidation rates were 14–18% higher during the mid-luteal phase vs. early follicular.",
      "Carbohydrate sparing was significant during low-intensity steady-state efforts (Zone 2).",
      "RPE at matched workloads rose ~1 point during late luteal, even with no fitness change.",
      "Performance in glycolytic intervals dipped in late luteal but recovered post-period.",
    ],
    whyMatters:
      "Train aerobic base and long endurance during luteal. Schedule glycolytic intervals and PRs in the follicular phase. Match fueling to phase: more carbs around ovulation, more fats and protein in luteal.",
    methodology:
      "Crossover trial, n=42 eumenorrheic women aged 22–35, indirect calorimetry across 4 cycle phases over 2 cycles.",
    url: "https://journals.physiology.org/journal/jappl",
  },
  {
    id: "progesterone-recovery",
    title: "Progesterone's role in post-exercise recovery",
    source: "Sports Medicine · 2023",
    finding:
      "Elevated progesterone in luteal phase increases muscle breakdown. Protein needs rise 15–20%.",
    tags: ["Recovery", "Nutrition", "Luteal"],
    category: "performance",
    keyFindings: [
      "Whole-body protein breakdown increased ~17% during the mid-luteal phase.",
      "Leucine oxidation was elevated, suggesting higher amino acid turnover.",
      "Protein intake of 1.6–2.0 g/kg/day attenuated the breakdown.",
    ],
    whyMatters:
      "Front-load protein in luteal. Aim for 30–40g per meal. Don't undereat in the days before your period — your body is doing more work at rest.",
    methodology: "Stable isotope tracer study, n=18 trained women, 2 cycle phases.",
    url: "https://link.springer.com/journal/40279",
  },
  {
    id: "hrv-cycle",
    title: "HRV variability across the menstrual cycle",
    source: "Frontiers in Physiology · 2024",
    finding:
      "HRV drops 10–15% in late luteal phase even in healthy women. Not a sign of overtraining.",
    tags: ["HRV", "Wearables", "Cycle Tracking"],
    category: "recovery",
    keyFindings: [
      "RMSSD declined 11–14% from follicular to late luteal in healthy controls.",
      "Resting heart rate rose 4–7 bpm in luteal.",
      "Sleep efficiency dipped 3–6% in the 5 days pre-period.",
    ],
    whyMatters:
      "Don't panic when your wearable flashes red in late luteal. Calibrate readiness scores against your phase, not a flat baseline.",
    methodology: "Observational, n=124 women wearing chest-strap HRV monitors across 3 cycles.",
    url: "https://www.frontiersin.org/journals/physiology",
  },
  {
    id: "insulin-cycle",
    title: "Insulin sensitivity and cycle phase",
    source: "Diabetes Care · 2023",
    finding:
      "Follicular phase shows 20% higher insulin sensitivity. Time carb intake accordingly.",
    tags: ["Metabolism", "Nutrition", "CGM"],
    category: "nutrition",
    keyFindings: [
      "Insulin sensitivity peaked in the late follicular phase (≈+20% vs. luteal).",
      "Postprandial glucose excursions were 15–25% higher in mid-luteal at matched meals.",
      "Effect was strongest for refined carbohydrates.",
    ],
    whyMatters:
      "Eat your carbs in the first half of your cycle. Lean toward fats, protein, and fibrous carbs in luteal. CGM data will look noticeably different — that's biology, not a broken diet.",
    methodology: "Hyperinsulinemic-euglycemic clamp, n=30 healthy women across 4 cycle visits.",
    url: "https://diabetesjournals.org/care",
  },
  {
    id: "acne-hormones",
    title: "Acne flares and hormonal fluctuations",
    source: "Journal of Clinical Dermatology · 2024",
    finding:
      "67% of women report cycle-related acne. Testosterone spike in late luteal triggers sebum production.",
    tags: ["PCOS", "Acne", "Hormones"],
    category: "pcos",
    keyFindings: [
      "67% of surveyed women reported predictable premenstrual breakouts.",
      "Sebum production rose 20–25% in late luteal.",
      "Women with PCOS showed amplified flares with smaller androgen shifts.",
    ],
    whyMatters:
      "Pre-empt the flare. Adjust skincare 5–7 days before your period — not after the breakout. Track patterns to flag possible androgen excess.",
    methodology: "Mixed-methods, n=412 survey + n=58 sebum measurements across cycle.",
    url: "https://jcadonline.com",
  },
  {
    id: "conception-window",
    title: "Conception probability by cycle day",
    source: "Human Reproduction · 2023",
    finding:
      "Intercourse on ovulation day: 33% conception rate. Days -2 to -1: 30%. Peak fertility window is 5 days.",
    tags: ["TTC", "Ovulation", "Fertility"],
    category: "ttc",
    keyFindings: [
      "Day of ovulation: ~33% per-cycle conception probability.",
      "Two days before ovulation: ~30%.",
      "Fertile window spans ~5 days, dropping sharply after ovulation.",
      "Sperm survival in fertile cervical mucus extended the window backward, not forward.",
    ],
    whyMatters:
      "Don't wait for the LH surge to start trying. The two days before ovulation are nearly as fertile as the day itself. Target the window, not the day.",
    methodology: "Prospective cohort, n=696 couples trying to conceive, daily hormone tracking.",
    url: "https://academic.oup.com/humrep",
  },
  {
    id: "estrogen-serotonin",
    title: "Estrogen and serotonin pathways",
    source: "Psychoneuroendocrinology · 2024",
    finding:
      "Estrogen drop in late luteal reduces serotonin production by 30%. Explains mood crashes pre-period.",
    tags: ["Mental Health", "Mood", "Luteal"],
    category: "mental",
    keyFindings: [
      "Serotonin synthesis rates fell ~30% as estradiol dropped pre-menses.",
      "Tryptophan availability also decreased.",
      "Light therapy and aerobic exercise blunted the dip in clinical trials.",
    ],
    whyMatters:
      "PMS mood crashes are neurochemistry, not weakness. Pre-load with sunlight, omega-3s, and movement in the 5 days before your period — they measurably help.",
    methodology: "PET imaging, n=24 women across 2 cycle phases.",
    url: "https://www.sciencedirect.com/journal/psychoneuroendocrinology",
  },
];

const SAVED_KEY = "helixa_saved_studies_v1";

const loadSaved = (): string[] => {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

const colorForCategory = (id: Study["category"]) =>
  CATEGORIES.find((c) => c.id === id)?.color ?? "#E8C16F";

const labelForCategory = (id: Study["category"]) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? "";

interface TagPillProps {
  label: string;
}
const TagPill = ({ label }: TagPillProps) => (
  <span
    className="font-mono-data uppercase bg-surface-1 border border-white/[0.06] rounded-full px-2.5 py-1 text-secondary-dim"
    style={{ fontSize: 10, letterSpacing: "0.05em" }}
  >
    {label}
  </span>
);

interface CategoryBadgeProps {
  category: Study["category"];
}
const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const color = colorForCategory(category);
  return (
    <span
      className="font-mono-data uppercase rounded-full px-2 py-0.5 border"
      style={{
        fontSize: 9,
        letterSpacing: "0.28em",
        color,
        borderColor: `${color}55`,
      }}
    >
      {labelForCategory(category)}
    </span>
  );
};

const Research = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeCat, setActiveCat] = useState<CategoryId>("all");
  const [saved, setSaved] = useState<string[]>(() => loadSaved());
  const [openStudy, setOpenStudy] = useState<Study | null>(null);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    } catch {}
  }, [saved]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const featured = STUDIES.find((s) => s.featured);
  const others = STUDIES.filter((s) => !s.featured);

  const filtered = useMemo(() => {
    let list = others;
    if (activeCat === "saved") {
      list = list.filter((s) => saved.includes(s.id));
    } else if (activeCat !== "all") {
      list = list.filter((s) => s.category === activeCat);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.finding.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [activeCat, saved, query, others]);

  const showFeatured =
    !!featured &&
    (activeCat === "all" ||
      (activeCat === "saved" && saved.includes(featured.id)) ||
      activeCat === featured.category) &&
    (!query.trim() ||
      featured.title.toLowerCase().includes(query.toLowerCase()) ||
      featured.finding.toLowerCase().includes(query.toLowerCase()));

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      toast(prev.includes(id) ? "Removed from Saved" : "Saved to your collection", {
        duration: 1400,
      });
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          (navigator as Navigator).vibrate?.(8);
        } catch {}
      }
      return next;
    });
  };

  const handleShare = async (s: Study) => {
    const text = `${s.title} — ${s.source}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: s.title, text, url: s.url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${s.url}`);
        toast("Link copied", { duration: 1400 });
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background text-cream pb-28">
      <div className="mx-auto w-full max-w-[420px]">
        {/* Header */}
        <header
          className={`sticky top-0 z-30 bg-background/85 backdrop-blur-md px-5 h-14 flex items-center justify-between transition-colors ${
            scrolled ? "border-b border-white/[0.06]" : "border-b border-transparent"
          }`}
        >
          <h1 className="font-mono-data text-[11px] tracking-[0.32em] uppercase">
            Research
          </h1>
          <div className="flex items-center gap-4 text-secondary-dim">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
              className="hover:text-cream transition-colors"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <button
              aria-label="Filter"
              onClick={() =>
                document
                  .getElementById("research-categories")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="hover:text-cream transition-colors"
            >
              <Filter size={18} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {searchOpen && (
          <div className="px-5 pt-4 animate-fade-in" style={{ animationDuration: "300ms" }}>
            <div className="flex items-center gap-2 bg-surface-1 border border-white/[0.06] rounded-full px-4 py-2.5">
              <Search size={14} strokeWidth={1.5} className="text-tertiary-dim" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles, findings, tags…"
                className="flex-1 bg-transparent text-sm text-cream placeholder:text-tertiary-dim focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-tertiary-dim hover:text-cream"
                  aria-label="Clear"
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hero */}
        <section className="px-5 pt-8 pb-6">
          <h2 className="font-light text-cream" style={{ fontSize: 28, lineHeight: 1.2 }}>
            The science behind your biology
          </h2>
          <p className="text-sm text-secondary-dim mt-3 max-w-[340px] leading-relaxed">
            Curated studies on hormones, performance, and female physiology. Because most
            research was done on men.
          </p>
        </section>

        {/* Featured */}
        {showFeatured && featured && (
          <section className="px-5 mb-6">
            <button
              type="button"
              onClick={() => {
                setOpenStudy(featured);
                setMethodologyOpen(false);
              }}
              className="w-full text-left bg-surface-2 rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden hover:border-accent-soft transition-colors"
              style={{
                borderLeft: "3px solid hsl(var(--gold))",
                boxShadow: "0 0 24px rgba(232,193,111,0.18)",
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span
                  className="font-mono-data uppercase text-gold"
                  style={{ fontSize: 10, letterSpacing: "0.32em" }}
                >
                  Featured Study
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(featured.id);
                  }}
                  className="text-secondary-dim hover:text-gold transition-transform active:scale-90"
                  aria-label="Save"
                >
                  <Bookmark
                    size={18}
                    strokeWidth={1.5}
                    fill={saved.includes(featured.id) ? "currentColor" : "none"}
                    className={saved.includes(featured.id) ? "text-gold" : ""}
                  />
                </button>
              </div>
              <h3
                className="text-cream"
                style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.35 }}
              >
                {featured.title}
              </h3>
              <p className="text-tertiary-dim text-xs mt-2">{featured.source}</p>
              <p className="text-sm text-secondary-dim mt-3 leading-relaxed">
                {featured.finding}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {featured.tags.map((t) => (
                  <TagPill key={t} label={t} />
                ))}
              </div>
            </button>
          </section>
        )}

        {/* Category chips */}
        <section
          id="research-categories"
          className="px-5 mb-6 overflow-x-auto no-scrollbar"
        >
          <div className="flex items-center gap-2 min-w-max">
            {CATEGORIES.map((c) => {
              const active = activeCat === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCat(c.id)}
                  className={`font-mono-data uppercase rounded-full px-3.5 py-2 border transition-colors ${
                    active
                      ? "bg-gold text-black border-transparent"
                      : "bg-surface-1 text-secondary-dim border-white/[0.06] hover:text-cream"
                  }`}
                  style={{ fontSize: 11, letterSpacing: "0.2em" }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Study list */}
        <section className="px-5 space-y-3">
          {filtered.length === 0 && (
            <div className="bg-surface-1 border border-white/[0.06] rounded-2xl p-6 text-center">
              <p className="text-sm text-secondary-dim leading-relaxed">
                {activeCat === "saved"
                  ? "No saved studies yet. Tap the bookmark icon on any study to save it."
                  : "No studies match this filter."}
              </p>
            </div>
          )}
          {filtered.map((s) => (
            <article
              key={s.id}
              className="bg-surface-1 border border-white/[0.06] rounded-2xl p-4 relative hover:border-accent-soft transition-colors"
            >
              <button
                type="button"
                onClick={() => {
                  setOpenStudy(s);
                  setMethodologyOpen(false);
                }}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <CategoryBadge category={s.category} />
                </div>
                <h3
                  className="text-cream pr-8"
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    lineHeight: 1.35,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {s.title}
                </h3>
                <p className="text-tertiary-dim mt-1.5" style={{ fontSize: 11 }}>
                  {s.source}
                </p>
                <p className="text-secondary-dim mt-2.5 leading-relaxed" style={{ fontSize: 13 }}>
                  {s.finding}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {s.tags.map((t) => (
                    <TagPill key={t} label={t} />
                  ))}
                </div>
              </button>
              <button
                type="button"
                onClick={() => toggleSave(s.id)}
                className="absolute top-4 right-4 text-secondary-dim hover:text-gold transition-transform active:scale-90"
                aria-label="Save"
              >
                <Bookmark
                  size={16}
                  strokeWidth={1.5}
                  fill={saved.includes(s.id) ? "currentColor" : "none"}
                  className={saved.includes(s.id) ? "text-gold" : ""}
                />
              </button>
            </article>
          ))}
        </section>

        {/* Footer request */}
        <section className="px-5 mt-10 text-center">
          <p className="text-sm text-secondary-dim">Want to see a specific topic covered?</p>
          <button
            type="button"
            onClick={() => toast("Thanks — we'll log your request.", { duration: 1800 })}
            className="mt-3 font-mono-data text-[10px] tracking-[0.32em] uppercase text-gold border border-accent-soft rounded-full px-4 py-2 hover:bg-white/[0.02] transition-colors"
          >
            Request research
          </button>
        </section>
      </div>

      {/* Detail modal */}
      <Sheet open={!!openStudy} onOpenChange={(o) => !o && setOpenStudy(null)}>
        <SheetContent
          side="bottom"
          className="bg-background border-t border-white/[0.06] p-0 h-[95vh] max-h-[95vh] overflow-hidden"
        >
          {openStudy && (
            <div className="mx-auto w-full max-w-[420px] h-full flex flex-col">
              <div className="flex items-center justify-between px-5 pt-6 pb-4">
                <CategoryBadge category={openStudy.category} />
                <div className="flex items-center gap-4 text-secondary-dim">
                  <button
                    type="button"
                    onClick={() => handleShare(openStudy)}
                    className="hover:text-cream transition-colors"
                    aria-label="Share"
                  >
                    <Share2 size={18} strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSave(openStudy.id)}
                    className="hover:text-gold transition-colors"
                    aria-label="Save"
                  >
                    <Bookmark
                      size={18}
                      strokeWidth={1.5}
                      fill={saved.includes(openStudy.id) ? "currentColor" : "none"}
                      className={saved.includes(openStudy.id) ? "text-gold" : ""}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenStudy(null)}
                    className="hover:text-cream transition-colors"
                    aria-label="Close"
                  >
                    <X size={20} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-10">
                <SheetTitle asChild>
                  <h2
                    className="text-cream font-light"
                    style={{ fontSize: 24, lineHeight: 1.25 }}
                  >
                    {openStudy.title}
                  </h2>
                </SheetTitle>
                <SheetDescription asChild>
                  <p className="text-tertiary-dim text-xs mt-2">{openStudy.source}</p>
                </SheetDescription>

                <div className="h-px bg-white/[0.06] my-6" />

                <h3
                  className="font-mono-data uppercase text-gold"
                  style={{ fontSize: 10, letterSpacing: "0.32em" }}
                >
                  Key Findings
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {openStudy.keyFindings.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm text-secondary-dim leading-relaxed">
                      <span className="text-gold mt-1.5 shrink-0" style={{ fontSize: 6 }}>
                        ●
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="h-px bg-white/[0.06] my-6" />

                <h3
                  className="font-mono-data uppercase text-gold"
                  style={{ fontSize: 10, letterSpacing: "0.32em" }}
                >
                  Why This Matters
                </h3>
                <p className="mt-3 text-sm text-cream leading-relaxed">
                  {openStudy.whyMatters}
                </p>

                <div className="h-px bg-white/[0.06] my-6" />

                <button
                  type="button"
                  onClick={() => setMethodologyOpen((v) => !v)}
                  className="w-full flex items-center justify-between"
                >
                  <span
                    className="font-mono-data uppercase text-gold"
                    style={{ fontSize: 10, letterSpacing: "0.32em" }}
                  >
                    Methodology
                  </span>
                  {methodologyOpen ? (
                    <ChevronUp size={16} strokeWidth={1.5} className="text-secondary-dim" />
                  ) : (
                    <ChevronDown size={16} strokeWidth={1.5} className="text-secondary-dim" />
                  )}
                </button>
                {methodologyOpen && (
                  <p className="mt-3 text-sm text-secondary-dim leading-relaxed animate-fade-in" style={{ animationDuration: "300ms" }}>
                    {openStudy.methodology}
                  </p>
                )}

                <a
                  href={openStudy.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 w-full h-12 rounded-full bg-gold text-black font-mono-data uppercase flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.32em",
                    boxShadow: "0 0 24px rgba(232,193,111,0.3)",
                  }}
                >
                  Read full study
                  <ExternalLink size={14} strokeWidth={1.5} />
                </a>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <BottomNav />
    </div>
  );
};

export default Research;