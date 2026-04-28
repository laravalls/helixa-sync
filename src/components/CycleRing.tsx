import { useEffect, useState } from "react";

const CYCLE_LENGTH = 28;
const TODAY = 18;
const SIZE = 320;
const CENTER = SIZE / 2;
const OUTER_R = 130;
const INNER_R = 100;
const SEG_DEG = 12;
const GAP_DEG = 1;

interface PhaseDef {
  name: string;
  short: string;
  color: string;
  range: [number, number];
  rangeLabel: string;
}

const PHASES: PhaseDef[] = [
  { name: "Menstrual", short: "Mens", color: "#9F2D3F", range: [1, 5], rangeLabel: "1–5" },
  { name: "Follicular", short: "Foll", color: "#6BBE8E", range: [6, 13], rangeLabel: "6–13" },
  { name: "Ovulatory", short: "Ovul", color: "#E8C16F", range: [14, 15], rangeLabel: "14–15" },
  { name: "Luteal", short: "Lut", color: "#A088B5", range: [16, 28], rangeLabel: "16–28" },
];

const colorForDay = (day: number) =>
  PHASES.find((p) => day >= p.range[0] && day <= p.range[1])!.color;

// Convert polar (degrees, 0 = 12 o'clock, clockwise) to cartesian
const polar = (deg: number, r: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
};

const arcPath = (startDeg: number, endDeg: number, r: number) => {
  const start = polar(startDeg, r);
  const end = polar(endDeg, r);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
};

interface CycleRingProps {
  today?: number;
}

export const CycleRing = ({ today = TODAY }: CycleRingProps) => {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const total = 1500;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / total);
      // ease-out
      const eased = 1 - Math.pow(1 - t, 3);
      setRevealed(Math.floor(eased * CYCLE_LENGTH));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setRevealed(CYCLE_LENGTH);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const segments = Array.from({ length: CYCLE_LENGTH }, (_, i) => {
    const day = i + 1;
    const startDeg = i * SEG_DEG + GAP_DEG / 2;
    const endDeg = (i + 1) * SEG_DEG - GAP_DEG / 2;
    const color = colorForDay(day);
    const isToday = day === today;
    const isPast = day < today;
    const visible = day <= revealed;

    let opacity = 0.4; // future
    if (isPast) opacity = 1;
    if (isToday) opacity = 1;
    if (!visible) opacity = 0;

    return {
      day,
      d: arcPath(startDeg, endDeg, OUTER_R),
      color,
      isToday,
      opacity,
    };
  });

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Cycle day ${today} of ${CYCLE_LENGTH}`}
      >
        <defs>
          {PHASES.map((p) => (
            <filter
              key={p.color}
              id={`seg-glow-${p.color.slice(1)}`}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="12" />
            </filter>
          ))}
        </defs>

        {/* Inner concentric ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={INNER_R}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
        />

        {/* Today halo glow (rendered behind the segment) */}
        {segments
          .filter((s) => s.isToday && s.opacity > 0)
          .map((s) => (
            <path
              key={`halo-${s.day}`}
              d={s.d}
              fill="none"
              stroke={s.color}
              strokeWidth={8}
              strokeLinecap="round"
              filter={`url(#seg-glow-${s.color.slice(1)})`}
              opacity={0.9}
            />
          ))}

        {/* Segments */}
        {segments.map((s) => (
          <path
            key={s.day}
            d={s.d}
            fill="none"
            stroke={s.color}
            strokeWidth={s.isToday ? 9 : 8}
            strokeLinecap="round"
            opacity={s.opacity}
            style={{ transition: "opacity 200ms ease-out" }}
          />
        ))}

        {/* Center labels */}
        <text
          x={CENTER}
          y={CENTER - 28}
          textAnchor="middle"
          fill="#8B8478"
          fontFamily="JetBrains Mono, monospace"
          fontSize={10}
          letterSpacing={4}
        >
          DAY
        </text>
        <text
          x={CENTER}
          y={CENTER + 18}
          textAnchor="middle"
          fill="#F2EDE4"
          fontFamily="JetBrains Mono, monospace"
          fontSize={56}
          fontWeight={400}
          style={{ filter: "drop-shadow(0 0 14px rgba(232,193,111,0.35))" }}
        >
          {today}
        </text>
        <text
          x={CENTER}
          y={CENTER + 44}
          textAnchor="middle"
          fill="#5A554E"
          fontFamily="JetBrains Mono, monospace"
          fontSize={12}
          letterSpacing={2}
        >
          / {CYCLE_LENGTH}
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-4 gap-3">
        {PHASES.map((p) => (
          <div key={p.name} className="flex flex-col gap-1.5">
            <div className="font-mono-data text-[9px] tracking-[0.28em] uppercase text-tertiary-dim">
              {p.short}
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  backgroundColor: p.color,
                  boxShadow: `0 0 8px ${p.color}99`,
                }}
              />
              <span className="font-light text-xs text-cream truncate">
                {p.name}
              </span>
            </div>
            <div className="font-mono-data text-[10px] text-tertiary-dim">
              Day {p.rangeLabel}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CycleRing;