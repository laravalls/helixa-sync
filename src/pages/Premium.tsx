import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Check,
  CreditCard,
  FileText,
  Headphones,
  Infinity as InfinityIcon,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type PlanId = "monthly" | "annual";

interface FeatureCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  badge?: string;
}

const FEATURES: FeatureCard[] = [
  {
    id: "integrations",
    icon: <Zap size={20} strokeWidth={1.5} />,
    title: "CGM + Clinical Data",
    body: "Levels glucose tracking, LabCorp/Quest results, MyChart integration.",
  },
  {
    id: "partner",
    icon: <Users size={20} strokeWidth={1.5} />,
    title: "Share Your Cycle",
    body: "Send your partner phase context so they understand your biology.",
  },
  {
    id: "clinician",
    icon: <FileText size={20} strokeWidth={1.5} />,
    title: "Medical Reports",
    body: "3-month cycle + symptom reports for your doctor or fertility specialist.",
  },
  {
    id: "support",
    icon: <Headphones size={20} strokeWidth={1.5} />,
    title: "Expert Guidance",
    body: "Direct access to HelixA's hormone optimization team.",
  },
  {
    id: "pcos",
    icon: <Sparkles size={20} strokeWidth={1.5} />,
    title: "PCOS Management",
    body: "Irregular cycles, insulin resistance, acne tracking.",
    badge: "Q3 2026",
  },
  {
    id: "modes",
    icon: <InfinityIcon size={20} strokeWidth={1.5} />,
    title: "Lifetime Access",
    body: "Pregnancy, postpartum, perimenopause as they launch.",
  },
];

const INCLUDED = [
  "All premium integrations",
  "Partner mode",
  "Clinician export",
  "Priority support",
  "Early access to new modes",
  "Advanced analytics",
  "Custom phase notifications",
  "Unlimited data history",
];

const Premium = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fromFeature = params.get("from") || "";

  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [card, setCard] = useState("");
  const [cardName, setCardName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pickPlan = (id: PlanId) => {
    setSelectedPlan(id);
    setPaymentOpen(true);
  };

  const planMeta = useMemo(() => {
    if (selectedPlan === "annual")
      return { label: "Annual Plan", price: "$240/year" };
    if (selectedPlan === "monthly")
      return { label: "Monthly Plan", price: "$25/month" };
    return null;
  }, [selectedPlan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !card || !cardName) return;
    setSubmitting(true);
    setTimeout(() => {
      try {
        localStorage.setItem("helixa_premium", "true");
        localStorage.setItem(
          "helixa_premium_plan",
          selectedPlan === "annual" ? "annual" : "monthly",
        );
      } catch {}
      setSubmitting(false);
      setPaymentOpen(false);
      setSuccess(true);
      toast("Welcome to HelixA Pro", { duration: 1800 });
    }, 900);
  };

  // Auto-redirect after success
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => {
      if (fromFeature) navigate(fromFeature);
      else navigate("/");
    }, 3200);
    return () => clearTimeout(t);
  }, [success, fromFeature, navigate]);

  // SUCCESS STATE
  if (success) {
    return (
      <main className="min-h-screen bg-background text-cream flex items-center justify-center px-5">
        <div className="mx-auto w-full max-w-[420px] text-center">
          <div
            className="mx-auto w-24 h-24 rounded-full border border-accent-soft flex items-center justify-center text-gold animate-breath"
            style={{ boxShadow: "0 0 24px rgba(232,193,111,0.3)" }}
          >
            <Check size={40} strokeWidth={1.5} />
          </div>
          <h1
            className="font-light text-cream mt-8"
            style={{ fontSize: 32, lineHeight: 1.15 }}
          >
            Welcome to HelixA Pro
          </h1>
          <p className="text-sm text-secondary-dim mt-3 leading-relaxed">
            Your premium integrations are now unlocked.
          </p>
          <button
            type="button"
            onClick={() => navigate(fromFeature || "/")}
            className="mt-8 w-full h-12 rounded-full bg-gold text-black font-mono-data uppercase active:scale-[0.97] transition-transform"
            style={{
              fontSize: 11,
              letterSpacing: "0.32em",
              boxShadow: "0 0 24px rgba(232,193,111,0.3)",
            }}
          >
            Return {fromFeature ? "to feature" : "home"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-cream pb-16">
      <div className="mx-auto w-full max-w-[420px]">
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md px-5 h-14 flex items-center justify-between border-b border-white/[0.06]">
          <div className="w-6" />
          <span
            className="font-mono-data uppercase text-gold"
            style={{ fontSize: 11, letterSpacing: "0.32em" }}
          >
            HelixA Pro
          </span>
          <button
            aria-label="Close"
            onClick={() => navigate(-1)}
            className="text-secondary-dim hover:text-cream transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        {/* HERO */}
        <section className="pt-10 pb-8 flex flex-col items-center text-center px-5">
          <div
            className="relative w-36 h-36 rounded-full border border-accent-soft flex items-center justify-center animate-breath"
            style={{
              boxShadow:
                "0 0 24px rgba(232,193,111,0.3), inset 0 0 24px rgba(232,193,111,0.08)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(232,193,111,0.18), rgba(232,193,111,0) 70%)",
              }}
            />
            <Sparkles size={28} strokeWidth={1.5} className="text-gold relative" />
          </div>
          <h1
            className="font-light text-cream mt-8"
            style={{ fontSize: 32, lineHeight: 1.15 }}
          >
            Unlock your full biology
          </h1>
          <p className="text-sm text-secondary-dim mt-4 max-w-[320px] leading-relaxed">
            Pro members get advanced integrations, clinician tools, and partner mode.
          </p>
        </section>

        {/* FEATURE GRID */}
        <section className="px-5 grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <article
              key={f.id}
              className="bg-surface-1 border border-white/[0.06] rounded-2xl p-4 relative"
            >
              <div className="text-gold">{f.icon}</div>
              <h3 className="text-sm text-cream font-light mt-3">{f.title}</h3>
              <p className="text-xs text-secondary-dim mt-1.5 leading-relaxed">
                {f.body}
              </p>
              {f.badge && (
                <span
                  className="absolute top-3 right-3 font-mono-data uppercase text-gold border border-accent-soft rounded-full px-2 py-0.5"
                  style={{ fontSize: 9, letterSpacing: "0.28em" }}
                >
                  {f.badge}
                </span>
              )}
            </article>
          ))}
        </section>

        {/* PRICING */}
        <section className="px-5 mt-10 grid grid-cols-2 gap-3">
          {/* Monthly */}
          <button
            type="button"
            onClick={() => pickPlan("monthly")}
            className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5 text-left hover:border-accent-soft transition-colors active:scale-[0.98]"
          >
            <span
              className="font-mono-data uppercase text-secondary-dim"
              style={{ fontSize: 9, letterSpacing: "0.32em" }}
            >
              Monthly
            </span>
            <div className="mt-3 flex items-baseline gap-1">
              <span
                className="font-mono-data text-cream"
                style={{ fontSize: 32, fontWeight: 400, lineHeight: 1 }}
              >
                $25
              </span>
              <span className="text-secondary-dim text-xs">/month</span>
            </div>
            <p className="text-xs text-secondary-dim mt-3">Cancel anytime</p>
            <div
              className="mt-5 h-10 rounded-full border border-accent-soft text-gold font-mono-data uppercase flex items-center justify-center"
              style={{ fontSize: 10, letterSpacing: "0.28em" }}
            >
              Choose monthly
            </div>
          </button>

          {/* Annual */}
          <button
            type="button"
            onClick={() => pickPlan("annual")}
            className="relative bg-surface-2 rounded-2xl p-5 text-left active:scale-[0.98] transition-transform"
            style={{
              border: "1px solid rgba(232,193,111,0.45)",
              boxShadow: "0 0 24px rgba(232,193,111,0.2)",
            }}
          >
            <span
              className="absolute -top-2.5 right-4 bg-gold text-black font-mono-data uppercase rounded-full px-2.5 py-1"
              style={{ fontSize: 8, letterSpacing: "0.28em" }}
            >
              Recommended
            </span>
            <span
              className="font-mono-data uppercase text-gold"
              style={{ fontSize: 9, letterSpacing: "0.32em" }}
            >
              Annual · Save $60
            </span>
            <div className="mt-3 flex items-baseline gap-1">
              <span
                className="font-mono-data text-cream"
                style={{ fontSize: 32, fontWeight: 400, lineHeight: 1 }}
              >
                $240
              </span>
              <span className="text-secondary-dim text-xs">/year</span>
            </div>
            <p className="text-xs text-secondary-dim mt-1">$20/month</p>
            <p className="text-xs text-cream mt-2">Best value</p>
            <div
              className="mt-3 h-10 rounded-full bg-gold text-black font-mono-data uppercase flex items-center justify-center"
              style={{ fontSize: 10, letterSpacing: "0.28em" }}
            >
              Choose annual
            </div>
          </button>
        </section>

        {/* WHAT'S INCLUDED */}
        <section className="px-5 mt-12">
          <h2
            className="font-mono-data uppercase text-secondary-dim"
            style={{ fontSize: 10, letterSpacing: "0.32em" }}
          >
            What's Included
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-cream">
                <Check size={12} strokeWidth={2} className="text-gold mt-0.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FOOTER */}
        <section className="px-5 mt-14 text-center space-y-3">
          <p className="text-sm text-secondary-dim">Not ready to upgrade?</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="font-mono-data uppercase text-gold hover:opacity-80 transition-opacity"
            style={{ fontSize: 10, letterSpacing: "0.32em" }}
          >
            Continue with free plan
          </button>
          <p className="text-tertiary-dim text-[11px] pt-2">
            Have questions? support@helixa.app
          </p>
        </section>
      </div>

      {/* PAYMENT SHEET */}
      <Sheet open={paymentOpen} onOpenChange={setPaymentOpen}>
        <SheetContent
          side="bottom"
          className="bg-background border-t border-white/[0.06] p-0 h-[92vh] max-h-[92vh] overflow-hidden"
        >
          <div className="mx-auto w-full max-w-[420px] h-full flex flex-col">
            <div className="flex items-center justify-between px-5 pt-6 pb-4">
              <SheetTitle asChild>
                <h2
                  className="font-mono-data uppercase text-cream"
                  style={{ fontSize: 11, letterSpacing: "0.32em" }}
                >
                  Complete Purchase
                </h2>
              </SheetTitle>
              <button
                aria-label="Close"
                onClick={() => setPaymentOpen(false)}
                className="text-secondary-dim hover:text-cream transition-colors"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <SheetDescription asChild>
              <div className="px-5">
                {planMeta && (
                  <div className="bg-surface-1 border border-accent-soft rounded-full px-4 py-2 inline-flex items-center gap-2">
                    <span
                      className="font-mono-data uppercase text-gold"
                      style={{ fontSize: 10, letterSpacing: "0.28em" }}
                    >
                      {planMeta.label} · {planMeta.price}
                    </span>
                  </div>
                )}
              </div>
            </SheetDescription>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-5 pt-6 pb-10 space-y-5"
            >
              <div>
                <label
                  className="font-mono-data uppercase text-secondary-dim block mb-2"
                  style={{ fontSize: 10, letterSpacing: "0.32em" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-12 bg-surface-1 border border-white/[0.06] rounded-xl px-4 text-sm text-cream placeholder:text-tertiary-dim focus:border-accent-soft focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label
                  className="font-mono-data uppercase text-secondary-dim block mb-2"
                  style={{ fontSize: 10, letterSpacing: "0.32em" }}
                >
                  Card Details
                </label>
                <div className="relative">
                  <CreditCard
                    size={14}
                    strokeWidth={1.5}
                    className="text-tertiary-dim absolute left-4 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={card}
                    onChange={(e) => setCard(e.target.value)}
                    placeholder="1234 1234 1234 1234   MM/YY   CVC"
                    className="w-full h-12 bg-surface-1 border border-white/[0.06] rounded-xl pl-10 pr-4 text-sm text-cream placeholder:text-tertiary-dim focus:border-accent-soft focus:outline-none transition-colors font-mono-data tracking-wider"
                  />
                </div>
              </div>

              <div>
                <label
                  className="font-mono-data uppercase text-secondary-dim block mb-2"
                  style={{ fontSize: 10, letterSpacing: "0.32em" }}
                >
                  Name on Card
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Full name"
                  className="w-full h-12 bg-surface-1 border border-white/[0.06] rounded-xl px-4 text-sm text-cream placeholder:text-tertiary-dim focus:border-accent-soft focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-14 rounded-full bg-gold text-black font-mono-data uppercase active:scale-[0.97] transition-transform disabled:opacity-60"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.32em",
                  boxShadow: "0 0 24px rgba(232,193,111,0.3)",
                }}
              >
                {submitting ? "Processing…" : "Subscribe to HelixA Pro"}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-tertiary-dim">
                <ShieldCheck size={11} strokeWidth={1.5} />
                <span style={{ fontSize: 11 }}>Secure payment via Stripe</span>
              </div>

              <div className="text-center text-tertiary-dim space-y-1.5 pt-2">
                <p style={{ fontSize: 10, lineHeight: 1.5 }}>
                  Cancel anytime. Annual plan billed once per year. Monthly plan billed monthly.
                </p>
                <p style={{ fontSize: 10, lineHeight: 1.5 }}>
                  By subscribing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
};

export default Premium;