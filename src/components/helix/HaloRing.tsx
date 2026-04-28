import { useEffect, useState } from "react";

interface HaloRingProps {
  value: number; // 0–100
  label?: string;
  size?: number;
  stroke?: number;
  unit?: string;
}

export const HaloRing = ({
  value,
  label = "Readiness",
  size = 240,
  stroke = 1.5,
  unit = "",
}: HaloRingProps) => {
  const radius = (size - stroke * 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setProgress(value), 120);
    return () => clearTimeout(t);
  }, [value]);

  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* radial halo */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(232,193,111,0.18), rgba(232,193,111,0) 70%)",
        }}
      />
      <svg width={size} height={size} className="relative -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E8C16F"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 1400ms cubic-bezier(.2,.7,.2,1)",
            filter: "drop-shadow(0 0 8px rgba(232,193,111,0.55))",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] uppercase tracking-[0.28em] text-secondary-dim">
          {label}
        </span>
        <span className="font-mono-data text-cream glow-text-gold mt-2 text-6xl font-normal">
          {Math.round(progress)}
          {unit && <span className="text-secondary-dim text-2xl ml-1">{unit}</span>}
        </span>
      </div>
    </div>
  );
};

export default HaloRing;