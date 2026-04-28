import { useNavigate } from "react-router-dom";
import { ChevronRight, Plug, Bell, Shield, Crown, LogOut, Settings as SettingsIcon } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

const Profile = () => {
  const navigate = useNavigate();

  const ROWS = [
    { label: "Cycle data", hint: "Last period · Day 18", onClick: () => navigate("/onboarding") },
    { label: "Connections", hint: "3 connected", icon: Plug, onClick: () => navigate("/connections") },
    { label: "Reminders", hint: "Manage popups", icon: Bell, onClick: () => navigate("/") },
    { label: "Subscription", hint: "Free plan", icon: Crown, onClick: () => navigate("/") },
    { label: "Privacy", hint: "Data & sharing", icon: Shield, onClick: () => navigate("/") },
  ];

  return (
    <div className="min-h-screen bg-background text-cream pb-24">
      <div className="mx-auto w-full max-w-[420px]">
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md px-5 h-14 flex items-center justify-between border-b border-white/[0.06]">
          <h1 className="font-mono-data text-[11px] tracking-[0.32em] uppercase">Profile</h1>
          <SettingsIcon size={18} strokeWidth={1.5} className="text-secondary-dim" />
        </header>

        <section className="px-5 pt-8 pb-6 flex flex-col items-center text-center">
          <div
            className="w-20 h-20 rounded-full border border-accent-soft flex items-center justify-center text-gold"
            style={{ boxShadow: "0 0 24px rgba(232,193,111,0.3)" }}
          >
            <span className="font-mono-data text-2xl">H</span>
          </div>
          <h2 className="text-xl font-light mt-4">Hello there</h2>
          <p className="text-sm text-secondary-dim mt-1">Cycle Sync · Day 18</p>
        </section>

        <section className="px-5 space-y-3">
          {ROWS.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={r.onClick}
              className="w-full bg-surface-1 border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3 hover:border-accent-soft transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-cream font-light">{r.label}</div>
                <div className="text-xs text-secondary-dim mt-1">{r.hint}</div>
              </div>
              <ChevronRight size={18} strokeWidth={1.5} className="text-tertiary-dim" />
            </button>
          ))}

          <button
            type="button"
            className="w-full mt-6 flex items-center justify-center gap-2 text-sm text-secondary-dim hover:text-cream transition-colors py-3"
          >
            <LogOut size={14} strokeWidth={1.5} />
            Sign out
          </button>
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;