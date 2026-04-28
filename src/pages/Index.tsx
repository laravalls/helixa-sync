import { HaloRing } from "@/components/helix/HaloRing";

const palette = [
  { name: "Background", hex: "#000000", swatch: "#000000", border: true },
  { name: "Surface 1", hex: "#0A0A0C", swatch: "#0A0A0C", border: true },
  { name: "Surface 2", hex: "#14141A", swatch: "#14141A", border: true },
  { name: "Text Primary", hex: "#F2EDE4", swatch: "#F2EDE4" },
  { name: "Text Secondary", hex: "#8B8478", swatch: "#8B8478" },
  { name: "Text Tertiary", hex: "#5A554E", swatch: "#5A554E" },
  { name: "Accent Gold", hex: "#E8C16F", swatch: "#E8C16F", glow: true },
  { name: "Critical", hex: "#E07856", swatch: "#E07856" },
];

const phases = [
  { name: "Menstrual", hex: "#9F2D3F" },
  { name: "Follicular", hex: "#6BBE8E" },
  { name: "Ovulatory", hex: "#E8C16F" },
  { name: "Luteal", hex: "#A088B5" },
];

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-4 mb-10">
    <span className="font-mono-data text-[10px] tracking-[0.4em] text-secondary-dim uppercase">
      {children}
    </span>
    <div className="h-px flex-1 bg-white/[0.06]" />
  </div>
);

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-cream">
      {/* Top bar */}
      <header className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse-live" />
            <span className="font-mono-data text-xs tracking-[0.32em] uppercase text-cream">
              HelixA
            </span>
          </div>
          <span className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-tertiary-dim">
            Design System / v0.1
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-20 space-y-28">
        {/* HERO */}
        <section>
          <span className="font-mono-data text-[10px] tracking-[0.4em] uppercase text-secondary-dim">
            Bio-futurism / Calibration Surface
          </span>
          <h1 className="font-light text-6xl md:text-7xl mt-6 leading-[1.05] tracking-tight text-cream">
            A signal-clear interface for<br />
            <span className="text-gold glow-text-gold">women's biology.</span>
          </h1>
          <p className="text-secondary-dim mt-6 max-w-xl text-base leading-relaxed">
            Pure black canvas. Bioluminescent gold. No softness, no pastel — only
            data, rhythm, and the contour of a body in motion.
          </p>
        </section>

        {/* PALETTE */}
        <section>
          <SectionLabel>01 — Palette</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {palette.map((c) => (
              <div
                key={c.name}
                className="bg-surface-1 rounded-2xl p-5 border border-white/[0.06]"
              >
                <div
                  className={`aspect-square rounded-xl mb-4 ${
                    c.border ? "border border-white/[0.06]" : ""
                  } ${c.glow ? "halo-gold-strong" : ""}`}
                  style={{ backgroundColor: c.swatch }}
                />
                <div className="text-cream text-sm">{c.name}</div>
                <div className="font-mono-data text-[11px] text-secondary-dim mt-1">
                  {c.hex}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5">
            {phases.map((p) => (
              <div
                key={p.name}
                className="bg-surface-1 rounded-2xl p-5 border border-white/[0.06]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: p.hex,
                      boxShadow: `0 0 14px ${p.hex}66`,
                    }}
                  />
                  <span className="text-cream text-sm">{p.name}</span>
                </div>
                <div className="font-mono-data text-[11px] text-secondary-dim">
                  {p.hex}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TYPOGRAPHY */}
        <section>
          <SectionLabel>02 — Typography</SectionLabel>
          <div className="bg-surface-1 rounded-2xl p-10 border border-white/[0.06] space-y-10">
            <div>
              <span className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-tertiary-dim">
                Display / Inter Light
              </span>
              <p className="font-light text-7xl mt-3 tracking-tight text-cream">
                Calibrated.
              </p>
              <p className="font-light text-5xl mt-2 tracking-tight text-cream">
                Calibrated.
              </p>
              <p className="font-light text-3xl mt-2 tracking-tight text-cream">
                Calibrated.
              </p>
            </div>

            <div>
              <span className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-tertiary-dim">
                Body / Inter 400 & 500
              </span>
              <p className="text-base mt-3 text-cream">
                Your follicular phase begins in 36 hours. Energy windows open
                across morning and late afternoon.
              </p>
              <p className="text-sm mt-2 text-secondary-dim">
                Secondary copy uses #8B8478 — present but quiet.
              </p>
              <p className="text-xs mt-2 text-tertiary-dim">
                Tertiary metadata uses #5A554E.
              </p>
            </div>

            <div>
              <span className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-tertiary-dim">
                Data / JetBrains Mono
              </span>
              <div className="flex items-end gap-10 mt-4">
                <div>
                  <div className="font-mono-data text-7xl text-cream glow-text-gold">
                    72
                  </div>
                  <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mt-2">
                    HRV
                  </div>
                </div>
                <div>
                  <div className="font-mono-data text-5xl text-cream">36.4°</div>
                  <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mt-2">
                    BBT
                  </div>
                </div>
                <div>
                  <div className="font-mono-data text-3xl text-cream">
                    07:42:18
                  </div>
                  <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mt-2">
                    Window
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RING + CARD */}
        <section>
          <SectionLabel>03 — Ring & Data Card</SectionLabel>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-surface-1 rounded-2xl p-10 border border-white/[0.06] flex flex-col items-center justify-center">
              <HaloRing value={78} label="Readiness" />
              <div className="mt-8 grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="font-mono-data text-2xl text-cream">62</div>
                  <div className="font-mono-data text-[10px] tracking-[0.28em] uppercase text-secondary-dim mt-1">
                    HRV
                  </div>
                </div>
                <div>
                  <div className="font-mono-data text-2xl text-cream">54</div>
                  <div className="font-mono-data text-[10px] tracking-[0.28em] uppercase text-secondary-dim mt-1">
                    RHR
                  </div>
                </div>
                <div>
                  <div className="font-mono-data text-2xl text-cream">7h 12m</div>
                  <div className="font-mono-data text-[10px] tracking-[0.28em] uppercase text-secondary-dim mt-1">
                    Sleep
                  </div>
                </div>
              </div>
            </div>

            {/* Data card */}
            <div className="bg-surface-1 rounded-2xl p-8 border border-white/[0.06] relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-live" />
                  <span className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim">
                    Live Signal
                  </span>
                </div>
                <span className="font-mono-data text-[10px] tracking-[0.28em] uppercase text-tertiary-dim">
                  Day 14 / Ovulatory
                </span>
              </div>

              <div className="mt-10">
                <div className="font-mono-data text-7xl text-cream glow-text-gold leading-none">
                  98.4
                  <span className="text-secondary-dim text-2xl ml-2">°F</span>
                </div>
                <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim mt-3">
                  Basal Body Temperature
                </div>
              </div>

              {/* Sparkline */}
              <div className="mt-10">
                <svg viewBox="0 0 320 80" className="w-full h-20">
                  <defs>
                    <radialGradient id="pt" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#E8C16F" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#E8C16F" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="rgba(255,255,255,0.10)"
                    strokeWidth="1"
                    points="0,60 40,55 80,62 120,48 160,40 200,35 240,30 280,22 320,18"
                  />
                  <polyline
                    fill="none"
                    stroke="#E8C16F"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,60 40,55 80,62 120,48 160,40 200,35 240,30 280,22 320,18"
                    style={{ filter: "drop-shadow(0 0 6px rgba(232,193,111,0.55))" }}
                  />
                  <circle cx="320" cy="18" r="14" fill="url(#pt)" />
                  <circle cx="320" cy="18" r="3" fill="#E8C16F" />
                </svg>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="font-mono-data text-sm text-cream">+0.6°F</div>
                  <div className="font-mono-data text-[10px] tracking-[0.28em] uppercase text-secondary-dim mt-1">
                    7-day shift
                  </div>
                </div>
                <button className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-gold border border-accent-soft px-5 py-3 rounded-full hover:halo-gold transition-shadow duration-400">
                  View detail
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className="pt-10 border-t border-white/[0.06] flex items-center justify-between">
          <span className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-tertiary-dim">
            HelixA — Internal Calibration Build
          </span>
          <span className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-tertiary-dim">
            04 / 28 / 2026
          </span>
        </footer>
      </div>
    </main>
  );
};

export default Index;
