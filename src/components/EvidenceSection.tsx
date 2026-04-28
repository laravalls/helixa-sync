import { BookOpen, TrendingDown, TrendingUp } from "lucide-react";

export interface EvidenceMetric {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
}

export interface EvidenceCitation {
  finding: string;
  source: string;
}

interface EvidenceSectionProps {
  title?: string;
  rationale: string;
  metrics: EvidenceMetric[];
  citations: EvidenceCitation[];
}

export const EvidenceSection = ({
  title = "Why we recommend this",
  rationale,
  metrics,
  citations,
}: EvidenceSectionProps) => {
  return (
    <section className="space-y-5">
      <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-secondary-dim">
        {title}
      </div>

      {/* Rationale */}
      <p className="text-sm text-cream leading-relaxed">{rationale}</p>

      {/* Health data row */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => {
            const color =
              m.trend === "down"
                ? "#E07856"
                : m.trend === "up"
                ? "#6BBE8E"
                : "#E8C16F";
            const TrendIcon =
              m.trend === "down"
                ? TrendingDown
                : m.trend === "up"
                ? TrendingUp
                : null;
            return (
              <div
                key={m.label}
                className="bg-surface-1 rounded-2xl p-4 border border-white/[0.06]"
              >
                <div className="font-mono-data text-[9px] tracking-[0.32em] uppercase text-secondary-dim">
                  {m.label}
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span
                    className="font-mono-data text-cream"
                    style={{ fontSize: 22, fontWeight: 400, lineHeight: 1 }}
                  >
                    {m.value}
                  </span>
                  {m.delta && (
                    <span
                      className="font-mono-data inline-flex items-center gap-1"
                      style={{
                        color,
                        fontSize: 11,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {TrendIcon && <TrendIcon size={11} strokeWidth={1.5} />}
                      {m.delta}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Citations */}
      <div className="bg-surface-1 rounded-2xl p-4 border border-white/[0.06]">
        <div className="flex items-center gap-2 text-secondary-dim mb-3">
          <BookOpen size={12} strokeWidth={1.5} className="text-gold" />
          <span
            className="font-mono-data uppercase"
            style={{ fontSize: 10, letterSpacing: "0.32em" }}
          >
            Evidence
          </span>
        </div>
        <ul className="space-y-3">
          {citations.map((c, i) => (
            <li key={i} className="text-xs leading-relaxed">
              <p className="text-cream">{c.finding}</p>
              <p className="text-tertiary-dim mt-1">{c.source}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default EvidenceSection;