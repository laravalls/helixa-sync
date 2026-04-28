import { NavLink } from "react-router-dom";
import { Home, Plug, BookOpen, User } from "lucide-react";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/connections", label: "Connections", icon: Plug },
  { to: "/research", label: "Research", icon: BookOpen },
  { to: "/profile", label: "Profile", icon: User },
];

export const BottomNav = () => {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-background/85 backdrop-blur-md border-t border-white/[0.06]"
      aria-label="Primary"
    >
      <div className="mx-auto max-w-[420px] px-2">
        <ul className="flex items-stretch justify-between">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <li key={tab.to} className="flex-1">
                <NavLink
                  to={tab.to}
                  end={tab.to === "/"}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 py-3 transition-colors ${
                      isActive ? "text-gold" : "text-secondary-dim hover:text-cream"
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { filter: "drop-shadow(0 0 12px rgba(232,193,111,0.4))" }
                      : undefined
                  }
                >
                  <Icon size={18} strokeWidth={1.5} />
                  <span
                    className="font-mono-data uppercase"
                    style={{ fontSize: 9, letterSpacing: "0.28em" }}
                  >
                    {tab.label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
        <div style={{ height: "env(safe-area-inset-bottom)" }} />
      </div>
    </nav>
  );
};

export default BottomNav;