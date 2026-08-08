import { useState } from "react";
import { BellRing, Upload, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { RemindersSheet } from "@/components/RemindersSheet";
import { useNavigate } from "react-router-dom";

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationsPanel = ({
  open,
  onOpenChange,
}: NotificationsPanelProps) => {
  const [remindersOpen, setRemindersOpen] = useState(false);
  const navigate = useNavigate();

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

          <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-4">
            {/* Manage reminders CTA */}
            <button
              type="button"
              onClick={() => setRemindersOpen(true)}
              className="w-full bg-surface-1 rounded-2xl p-4 border border-white/[0.06] flex items-center gap-3 hover:border-accent-soft transition-colors text-left"
            >
              <div
                className="w-9 h-9 rounded-full border border-accent-soft flex items-center justify-center text-gold shrink-0"
                style={{ boxShadow: "0 0 24px rgba(232,193,111,0.3)" }}
              >
                <BellRing size={16} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono-data text-[10px] tracking-[0.32em] uppercase text-gold">
                  Manage Reminders
                </div>
                <p className="text-xs text-secondary-dim mt-1 leading-relaxed">
                  Set up pings for recovery dips, supplement timing, and wind-down.
                </p>
              </div>
            </button>

            {/* Empty state — no real alert pipeline yet */}
            <div className="rounded-2xl border border-white/[0.06] bg-surface-1 p-6 flex flex-col items-center text-center gap-4">
              <div className="w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-tertiary-dim">
                <BellRing size={18} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-cream font-light">No alerts yet</p>
                <p className="text-xs text-secondary-dim mt-2 leading-relaxed max-w-[260px]">
                  Alerts appear once your wearable data is synced. Upload your Apple Health export from Connections to get started.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  navigate("/connections");
                }}
                className="flex items-center gap-2 font-mono-data text-[10px] tracking-[0.28em] uppercase text-gold border border-accent-soft rounded-full px-4 py-2 hover:bg-white/[0.02] transition-colors"
              >
                <Upload size={12} strokeWidth={1.5} />
                Sync health data
              </button>
            </div>
          </div>
        </div>
        <RemindersSheet open={remindersOpen} onOpenChange={setRemindersOpen} />
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsPanel;
