import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, X, Pill, Clock, ShoppingBag } from "lucide-react";
import { CYCLE_SYNC_DAY_18, TTC_DAY_18, type DayPlan } from "@/data/mockCycle";

type ModeId = "cycle_sync" | "ttc";

const planFor = (mode: string | null): DayPlan =>
  mode === "ttc" ? TTC_DAY_18 : CYCLE_SYNC_DAY_18;

const StackDetail = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mode = (params.get("mode") as ModeId | null) ?? "cycle_sync";
  const plan = planFor(mode);
  const stack = plan.stack;

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <span className="font-mono-data text-[11px] tracking-[0.32em] uppercase text-cream">Stack</span>
          <button aria-label="Close" onClick={() => navigate("/")} className="text-secondary-dim hover:text-cream transition-colors press">
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        <div className="px-5 space-y-10">
          {/* HERO */}
          <section className="pt-6 flex flex-col items-center text-center">
            <span className="font-mono-data text-[10px] tracking-[0.4em] uppercase text-secondary-dim">
              Today's Stack
            </span>
            <h1 className="font-light text-cream mt-4 leading-[1.05] tracking-tight" style={{ fontSize: 44 }}>
              {stack.length} supplements, phase-tuned
            </h1>
            <p className="text-secondary-dim text-sm mt-5 max-w-[320px] leading-relaxed">
              Dosing aligned to your current phase. Skip caffeine and alcohol within 2 hours of any of these.
            </p>
          </section>

          {/* SUPPLEMENT LIST */}
          <section>
            <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mb-4">
              The Protocol
            </div>
            <ul className="border-t border-white/[0.06]">
              {stack.map((s, i) => (
                <li
                  key={s.name}
                  className="flex items-start gap-4 py-5 border-b border-white/[0.06]"
                >
                  <span
                    className="font-mono-data text-gold shrink-0 leading-none glow-text-gold"
                    style={{ fontSize: 28, fontWeight: 400, width: 44 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-cream text-base">{s.name}</span>
                      <span
                        className="font-mono-data text-gold"
                        style={{ fontSize: 12, letterSpacing: "0.05em" }}
                      >
                        {s.dose}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-tertiary-dim mt-1.5">
                      <Clock size={11} strokeWidth={1.5} />
                      <span className="font-mono-data text-[10px] tracking-[0.18em] uppercase">
                        {s.timing}
                      </span>
                    </div>
                    <div className="text-xs text-secondary-dim mt-2 leading-relaxed">
                      {s.why}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* INTERACTIONS / NOTES */}
          <section className="bg-surface-1 rounded-2xl p-5 border border-white/[0.06]">
            <div className="flex items-center gap-2 text-secondary-dim mb-2">
              <Pill size={14} strokeWidth={1.5} className="text-gold" />
              <span className="font-mono-data text-[10px] tracking-[0.32em] uppercase">Stacking notes</span>
            </div>
            <ul className="text-sm text-cream leading-relaxed space-y-2 mt-2">
              <li>• Take fat-soluble vitamins (D3, K2, omega-3) with a meal containing fat.</li>
              <li>• Magnesium glycinate at least 30 min before bed for sleep architecture.</li>
              <li>• Iron and calcium compete — separate by 2 hours if both are in your stack.</li>
            </ul>
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
            <ShoppingBag size={16} strokeWidth={1.5} />
            Reorder stack
          </button>
        </div>
      </div>
    </main>
  );
};

export default StackDetail;