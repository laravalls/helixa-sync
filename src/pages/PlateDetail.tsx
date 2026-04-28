import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, X, UtensilsCrossed, Sparkles, Sunrise, Sun, Moon, Cookie } from "lucide-react";
import { CYCLE_SYNC_DAY_18, TTC_DAY_18, type DayPlan } from "@/data/mockCycle";

type ModeId = "cycle_sync" | "ttc";

const planFor = (mode: string | null): DayPlan =>
  mode === "ttc" ? TTC_DAY_18 : CYCLE_SYNC_DAY_18;

const PlateDetail = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mode = (params.get("mode") as ModeId | null) ?? "cycle_sync";
  const plan = planFor(mode);
  const p = plan.plate;

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const meals = [
    { label: "Breakfast", icon: <Sunrise size={16} strokeWidth={1.5} />, body: p.breakfast },
    { label: "Lunch", icon: <Sun size={16} strokeWidth={1.5} />, body: p.lunch },
    { label: "Dinner", icon: <Moon size={16} strokeWidth={1.5} />, body: p.dinner },
    { label: "Snack", icon: <Cookie size={16} strokeWidth={1.5} />, body: p.snack },
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
          <span className="font-mono-data text-[11px] tracking-[0.32em] uppercase text-cream">Plate</span>
          <button aria-label="Close" onClick={() => navigate("/")} className="text-secondary-dim hover:text-cream transition-colors press">
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        <div className="px-5 space-y-10">
          {/* HERO */}
          <section className="pt-6 flex flex-col items-center text-center">
            <span className="font-mono-data text-[10px] tracking-[0.4em] uppercase text-secondary-dim">
              Today's Plate
            </span>
            <h1 className="font-light text-cream mt-4 leading-[1.05] tracking-tight" style={{ fontSize: 44 }}>
              4 meals, phase-tuned
            </h1>
            <p className="text-secondary-dim text-sm mt-5 max-w-[320px] leading-relaxed">
              {p.phase_reason}
            </p>
          </section>

          {/* KEY NUTRIENTS */}
          <section>
            <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mb-4">
              Key Nutrients Today
            </div>
            <div className="flex flex-wrap gap-2">
              {p.key_nutrients.map((n) => (
                <span
                  key={n}
                  className="font-mono-data text-[11px] tracking-[0.18em] uppercase text-gold border border-accent-soft rounded-full px-3 py-1.5 halo-gold"
                >
                  {n}
                </span>
              ))}
            </div>
          </section>

          {/* TTC NOTE */}
          {p.ttc_note && (
            <section
              className="bg-surface-1 rounded-2xl p-5 border border-white/[0.06]"
              style={{ borderLeft: "2px solid #E07856" }}
            >
              <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase mb-2" style={{ color: "#E07856" }}>
                Avoid Today
              </div>
              <p className="text-sm text-cream leading-relaxed">{p.ttc_note}</p>
            </section>
          )}

          {/* MEALS */}
          <section>
            <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mb-4">
              The Menu
            </div>
            <ul className="border-t border-white/[0.06]">
              {meals.map((meal, i) => (
                <li
                  key={meal.label}
                  className="flex items-start gap-4 py-5 border-b border-white/[0.06]"
                >
                  <span
                    className="font-mono-data text-gold shrink-0 leading-none glow-text-gold"
                    style={{ fontSize: 28, fontWeight: 400, width: 44 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-secondary-dim">
                      {meal.icon}
                      <span className="font-mono-data text-[10px] tracking-[0.32em] uppercase">
                        {meal.label}
                      </span>
                    </div>
                    <div className="text-cream text-base mt-1.5 leading-snug">{meal.body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* SWAPS */}
          <section className="bg-surface-1 rounded-2xl p-5 border border-white/[0.06]">
            <div className="flex items-center gap-2 text-secondary-dim mb-2">
              <Sparkles size={14} strokeWidth={1.5} className="text-gold" />
              <span className="font-mono-data text-[10px] tracking-[0.32em] uppercase">Smart swaps</span>
            </div>
            <p className="text-sm text-cream leading-relaxed">
              No salmon? Try sardines or pasture eggs. No quinoa? Use brown rice or millet. Keep the nutrient targets, swap the vehicle.
            </p>
          </section>
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
            <UtensilsCrossed size={16} strokeWidth={1.5} />
            Add to grocery list
          </button>
        </div>
      </div>
    </main>
  );
};

export default PlateDetail;