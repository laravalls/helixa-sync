import { Lock, X } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AlertItem {
  label: string;
  color: string;
  body: string;
  time: string;
}

const ALERTS: AlertItem[] = [
  {
    label: "Phase Transition",
    color: "#E07856",
    body: "Late luteal dip incoming. Energy down for 3-4 days. Front-load your week.",
    time: "2H Ago",
  },
  {
    label: "Wearable Insight",
    color: "#E8C16F",
    body: "HRV down 12% from baseline. Ease today's workout to zone 1-2.",
    time: "This Morning",
  },
  {
    label: "Cycle Window",
    color: "#6BBE8E",
    body: "5 days until your next period. Stock up on iron-rich foods.",
    time: "Yesterday",
  },
];

export const NotificationsPanel = ({
  open,
  onOpenChange,
}: NotificationsPanelProps) => {
  const handlePremiumTap = () => {
    toast("Coming with HelixA Pro", { duration: 2000 });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-background border-t border-white/[0.06] p-0 h-[90vh] max-h-[90vh] overflow-hidden"
      >
        <div className="mx-auto w-full max-w-[420px] h-full flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-6 pb-5">
            <SheetTitle asChild>
              <h2 className="font-mono-data text-[11px] tracking-[0.32em] uppercase text-cream">
                Alerts
              </h2>
            </SheetTitle>
            <button
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="text-secondary-dim hover:text-cream transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 pb-10">
            <div className="space-y-4">
              {ALERTS.map((a) => (
                <article
                  key={a.label}
                  className="bg-surface-1 rounded-2xl p-5 border border-white/[0.06]"
                  style={{ borderLeft: `2px solid ${a.color}` }}
                >
                  <div
                    className="font-mono-data text-[10px] tracking-[0.32em] uppercase mb-2"
                    style={{ color: a.color }}
                  >
                    {a.label}
                  </div>
                  <p className="text-sm text-cream leading-relaxed">{a.body}</p>
                  <div className="font-mono-data text-[10px] tracking-[0.28em] uppercase text-tertiary-dim mt-3">
                    {a.time}
                  </div>
                </article>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.06] my-8" />

            {/* Locked row */}
            <button
              type="button"
              onClick={handlePremiumTap}
              className="w-full flex items-center gap-3 py-2 text-left hover:opacity-90 transition-opacity"
            >
              <Lock
                size={16}
                strokeWidth={1.5}
                className="text-secondary-dim shrink-0"
              />
              <span className="flex-1 text-sm text-cream">
                Daily phase alerts and wearable triggers
              </span>
              <span
                className="font-mono-data uppercase text-gold border border-accent-soft rounded-full px-3 py-1 shrink-0"
                style={{ fontSize: 10, letterSpacing: "0.28em" }}
              >
                Premium
              </span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsPanel;