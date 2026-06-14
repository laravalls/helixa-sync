import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  ResponsiveContainer,
} from "recharts";
import { RECOVERY_TREND } from "@/data/mockCycle";

const TODAY = RECOVERY_TREND.hrv.length;

type SeriesKey = "hrv" | "resting_hr" | "sleep_hours";

interface SeriesDef {
  key: SeriesKey;
  letter: string;
  full: string;
  color: string;
}

const SERIES: SeriesDef[] = [
  { key: "hrv", letter: "HRV", full: "HRV", color: "#E8C16F" },
  { key: "resting_hr", letter: "RHR", full: "Resting HR", color: "#E07856" },
  { key: "sleep_hours", letter: "SLEEP", full: "Sleep", color: "#6BBE8E" },
];

const buildData = () =>
  RECOVERY_TREND.hrv.map((_, i) => ({
    day: i + 1,
    hrv: RECOVERY_TREND.hrv[i],
    resting_hr: RECOVERY_TREND.resting_hr[i],
    sleep_hours: RECOVERY_TREND.sleep_hours[i],
  }));

interface TooltipPayload {
  dataKey: SeriesKey;
  value: number;
}

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: number;
}) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="bg-background border rounded-lg px-3 py-2.5 font-mono-data"
      style={{
        borderColor: "rgba(232,193,111,0.6)",
        boxShadow: "0 0 16px rgba(232,193,111,0.20)",
      }}
    >
      <div className="text-[10px] tracking-[0.32em] uppercase text-secondary-dim mb-1.5">
        Day {label}
      </div>
      <div className="space-y-0.5">
        {SERIES.map((s) => {
          const p = payload.find((x) => x.dataKey === s.key);
          if (!p) return null;
          return (
            <div
              key={s.key}
              className="flex items-center gap-2 text-[11px]"
              style={{ color: s.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="uppercase tracking-[0.12em]">{s.letter}</span>
              <span className="ml-auto text-cream tabular-nums">
                {p.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// General-purpose recovery trend chart: HRV, resting heart rate, and sleep
// over the last two weeks. Replaces the cycle-specific hormone chart for
// users in a non-cycle focus area.
export const RecoveryChart = () => {
  const data = useMemo(buildData, []);
  const [hovered, setHovered] = useState<SeriesKey | null>(null);

  const opacityFor = (k: SeriesKey) =>
    hovered === null ? 1 : hovered === k ? 1 : 0.3;

  return (
    <div className="w-full">
      <div style={{ width: "100%", height: 160 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 12, right: 8, bottom: 8, left: 8 }}
          >
            <defs>
              {SERIES.map((s) => (
                <filter
                  key={s.key}
                  id={`recovery-glow-${s.key}`}
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            <XAxis
              dataKey="day"
              ticks={[1, 4, 7, 10, 14]}
              tick={{
                fill: "#5A554E",
                fontSize: 10,
                fontFamily: "JetBrains Mono, monospace",
              }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis hide domain={["auto", "auto"]} />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.10)", strokeWidth: 1 }}
            />

            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={1.5}
                strokeOpacity={opacityFor(s.key)}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: s.color,
                  stroke: "#000",
                  strokeWidth: 1,
                }}
                isAnimationActive
                animationDuration={1200}
                animationEasing="ease-out"
                filter={`url(#recovery-glow-${s.key})`}
              />
            ))}

            {SERIES.map((s) => (
              <ReferenceDot
                key={`today-${s.key}`}
                x={TODAY}
                y={RECOVERY_TREND[s.key][TODAY - 1]}
                r={6}
                fill={s.color}
                stroke="none"
                fillOpacity={opacityFor(s.key)}
                ifOverflow="extendDomain"
                filter={`url(#recovery-glow-${s.key})`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* LEGEND */}
      <div className="mt-4 flex items-center justify-center gap-5">
        {SERIES.map((s) => {
          const dim = hovered !== null && hovered !== s.key;
          return (
            <button
              key={s.key}
              type="button"
              onMouseEnter={() => setHovered(s.key)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(s.key)}
              onBlur={() => setHovered(null)}
              onClick={() =>
                setHovered((h) => (h === s.key ? null : s.key))
              }
              className="flex items-center gap-1.5 transition-opacity duration-300"
              style={{ opacity: dim ? 0.3 : 1 }}
              aria-label={s.full}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: s.color,
                  boxShadow: `0 0 8px ${s.color}99`,
                }}
              />
              <span
                className="font-mono-data uppercase text-cream"
                style={{ fontSize: 12, letterSpacing: "0.05em" }}
              >
                {s.letter}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RecoveryChart;
