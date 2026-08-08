import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LockedBetaProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
  /** When true the overlay covers the full element; when false just chips appear */
  overlay?: boolean;
}

/**
 * Wraps any UI element that displays data with no real source yet.
 * Dims content, overlays a "Beta" chip + lock, and blocks pointer events.
 */
export const LockedBeta = ({
  children,
  label = "Beta",
  className,
  overlay = true,
}: LockedBetaProps) => (
  <div className={cn("relative", className)}>
    <div className={cn("select-none", overlay && "opacity-30 pointer-events-none")}>
      {children}
    </div>
    {overlay && (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="flex items-center gap-1.5 font-mono-data uppercase text-cream bg-background/80 border border-white/[0.12] rounded-full px-3 py-1.5 backdrop-blur-sm"
          style={{ fontSize: 10, letterSpacing: "0.28em" }}
        >
          <Lock size={10} strokeWidth={1.5} />
          {label}
        </span>
      </div>
    )}
  </div>
);

/** Inline chip only — use on individual metric values inside a card */
export const BetaChip = ({ label = "Beta" }: { label?: string }) => (
  <span
    className="inline-flex items-center gap-1 font-mono-data uppercase text-tertiary-dim border border-white/[0.08] rounded-full px-2 py-0.5 ml-2"
    style={{ fontSize: 9, letterSpacing: "0.24em" }}
  >
    <Lock size={8} strokeWidth={1.5} />
    {label}
  </span>
);

export default LockedBeta;
