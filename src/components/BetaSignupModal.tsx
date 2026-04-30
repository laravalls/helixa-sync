import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface BetaSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BetaSignupModal = ({ isOpen, onClose }: BetaSignupModalProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("");
  const [currentTools, setCurrentTools] = useState("");
  const [wantMost, setWantMost] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const isFormValid =
    email.trim() !== "" && isValidEmail(email) && interest !== "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;

    setSubmitting(true);
    const { error } = await supabase.from("beta_signups").insert({
      email: email.trim().toLowerCase(),
      name: name.trim() || null,
      interest,
      current_tools: currentTools.trim() || null,
      want_most: wantMost.trim() || null,
      source: "app_modal",
    });
    setSubmitting(false);

    if (error) {
      const isDuplicate =
        error.code === "23505" || /duplicate/i.test(error.message);
      toast({
        title: isDuplicate ? "You're already on the list" : "Something went wrong",
        description: isDuplicate
          ? "This email is already signed up for the beta."
          : error.message,
        variant: isDuplicate ? "default" : "destructive",
      });
      return;
    }

    setSubmitted(true);
    toast({
      title: "You're in!",
      description: "We'll be in touch when the beta opens.",
    });
    setEmail("");
    setName("");
    setInterest("");
    setCurrentTools("");
    setWantMost("");
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Auto-close 4s after successful submission
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [submitted, onClose]);

  // Reset form state shortly after the modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setEmail("");
        setName("");
        setInterest("");
        setCurrentTools("");
        setWantMost("");
        setSubmitting(false);
        setSubmitted(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 animate-fade-in"
        style={{
          backgroundColor: "rgba(0,0,0,0.85)",
          zIndex: 9999,
          animationDuration: "200ms",
        }}
        aria-hidden
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed left-1/2 top-1/2 w-[90%] max-w-[440px] p-6"
        style={{
          backgroundColor: "#14141A",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          boxShadow: "0 0 32px rgba(232,193,111,0.2)",
          zIndex: 10000,
          animation: "beta-modal-in 300ms ease-out forwards",
        }}
      >
        <style>{`
          @keyframes beta-modal-in {
            from { transform: translate(-50%, 100%); opacity: 0; }
            to { transform: translate(-50%, -50%); opacity: 1; }
          }
          @keyframes beta-ring-pulse {
            0%, 100% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 0 0 rgba(232,193,111,0.5); }
            50% { transform: scale(1.08); opacity: 1; box-shadow: 0 0 0 8px rgba(232,193,111,0); }
          }
        `}</style>

        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <span
            className="font-mono uppercase"
            style={{
              fontSize: 10,
              letterSpacing: "0.05em",
              color: "#E8C16F",
              backgroundColor: "#0A0A0C",
              padding: "4px 8px",
              borderRadius: 4,
            }}
          >
            WE WON BETA DASH WOMENBUILD 2025
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center transition-colors"
            style={{
              width: 32,
              height: 32,
              color: "#8B8478",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E8C16F")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8B8478")}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          <div
            className="rounded-full mb-6"
            style={{
              width: 32,
              height: 32,
              border: "1.5px solid #E8C16F",
              animation: "beta-ring-pulse 3s ease-in-out infinite",
            }}
          />
          <h2
            style={{
              fontWeight: 300,
              fontSize: 28,
              color: "#F2EDE4",
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Join the HelixA beta
          </h2>
          <p
            style={{
              color: "#8B8478",
              fontSize: 16,
              maxWidth: 360,
              lineHeight: 1.5,
            }}
          >
            Be among the first to test the app that syncs your health data to your biology.
          </p>
        </div>

        {/* Problem section */}
        <div style={{ marginTop: 24, textAlign: "left" }}>
          <p
            style={{
              fontWeight: 400,
              fontSize: 14,
              lineHeight: 1.6,
              color: "#8B8478",
            }}
          >
            95% of health data is based on male physiology. You've been tracking everything across 15 apps—Oura, Strava, MyFitnessPal, Clue, Google Calendar—but nothing connects them to your cycle.
          </p>
          <p
            style={{
              marginTop: 12,
              fontWeight: 400,
              fontSize: 14,
              lineHeight: 1.6,
              color: "#8B8478",
            }}
          >
            Your hormones swing 400% across 28 days. Every workout plan, recovery protocol, and supplement stack ignores it.
          </p>
        </div>

        {/* Solution section */}
        <div
          style={{
            marginTop: 16,
            marginBottom: 24,
            padding: 16,
            backgroundColor: "rgba(232,193,111,0.05)",
            borderLeft: "2px solid #E8C16F",
            borderRadius: 4,
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontWeight: 400,
              fontSize: 14,
              lineHeight: 1.6,
              color: "#F2EDE4",
            }}
          >
            HelixA is the glue. One app that syncs your wearables, nutrition, calendar, and workouts to your menstrual cycle. Daily guidance on when to train hard, when to rest, when to schedule that board meeting.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <style>{`
            .beta-input, .beta-textarea {
              width: 100%;
              background: #0A0A0C;
              border: 1px solid rgba(255,255,255,0.06);
              border-radius: 8px;
              font-family: Inter, ui-sans-serif, system-ui, sans-serif;
              font-size: 14px;
              color: #F2EDE4;
              outline: none;
              transition: border-color 200ms ease;
            }
            .beta-input { height: 48px; padding: 0 16px; }
            .beta-textarea { height: 72px; padding: 12px 16px; resize: vertical; line-height: 1.5; }
            .beta-input:focus, .beta-textarea:focus { border-color: #E8C16F; }
            .beta-input::placeholder, .beta-textarea::placeholder { color: #5A554E; }
            .beta-submit {
              width: 100%;
              height: 56px;
              background: #E8C16F;
              color: #000000;
              font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              box-shadow: 0 0 24px rgba(232,193,111,0.3);
              transition: all 200ms ease;
            }
            .beta-submit:hover:not(:disabled) {
              box-shadow: 0 0 32px rgba(232,193,111,0.4);
            }
            .beta-submit:active:not(:disabled) {
              transform: scale(0.97);
            }
            .beta-submit:disabled {
              background: rgba(255,255,255,0.1);
              color: #5A554E;
              box-shadow: none;
              cursor: not-allowed;
            }
          `}</style>

          {/* Email */}
          <label className="block" style={{ marginBottom: 16 }}>
            <span
              className="font-mono uppercase block"
              style={{
                fontSize: 11,
                letterSpacing: "0.05em",
                color: "#8B8478",
                marginBottom: 8,
              }}
            >
              Email
            </span>
            <input
              type="email"
              required
              className="beta-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          {/* Name */}
          <label className="block" style={{ marginBottom: 16 }}>
            <span
              className="font-mono uppercase block"
              style={{
                fontSize: 11,
                letterSpacing: "0.05em",
                color: "#8B8478",
                marginBottom: 8,
              }}
            >
              Name
            </span>
            <input
              type="text"
              className="beta-input"
              placeholder="How should we address you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          {/* Interest */}
          <div style={{ marginBottom: 16 }}>
            <span
              className="font-mono uppercase block"
              style={{
                fontSize: 11,
                letterSpacing: "0.05em",
                color: "#8B8478",
                marginBottom: 12,
              }}
            >
              I'm most interested in
            </span>
            <div className="flex flex-col" style={{ gap: 12 }}>
              {[
                { value: "ttc", label: "Trying to Conceive (fertility guidance)" },
                { value: "cycle_sync", label: "Cycle Sync (optimizing workouts and recovery)" },
                { value: "pcos", label: "PCOS Management (irregular cycles, symptom tracking)" },
                { value: "exploring", label: "Just exploring (not sure yet)" },
              ].map((opt) => {
                const selected = interest === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setInterest(opt.value)}
                    role="radio"
                    aria-checked={selected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        setInterest(opt.value);
                      }
                    }}
                    className="flex items-center"
                    style={{
                      gap: 12,
                      padding: 12,
                      backgroundColor: selected
                        ? "rgba(232,193,111,0.1)"
                        : "#0A0A0C",
                      border: selected
                        ? "1px solid #E8C16F"
                        : "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "all 200ms ease",
                    }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{
                        width: 16,
                        height: 16,
                        border: selected
                          ? "1.5px solid #E8C16F"
                          : "1.5px solid #5A554E",
                        transition: "all 200ms ease",
                      }}
                    >
                      {selected && (
                        <div
                          className="rounded-full"
                          style={{
                            width: 8,
                            height: 8,
                            backgroundColor: "#E8C16F",
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 14,
                        color: selected ? "#F2EDE4" : "#8B8478",
                        transition: "color 200ms ease",
                      }}
                    >
                      {opt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current tools */}
          <label className="block" style={{ marginBottom: 16 }}>
            <span
              className="font-mono uppercase block"
              style={{
                fontSize: 11,
                letterSpacing: "0.05em",
                color: "#8B8478",
                marginBottom: 8,
              }}
            >
              What do you currently use for tracking?
            </span>
            <textarea
              className="beta-textarea"
              placeholder="e.g. Oura for HRV, Flo for cycle, MyFitnessPal for food..."
              value={currentTools}
              onChange={(e) => setCurrentTools(e.target.value)}
            />
          </label>

          {/* Want most */}
          <label className="block" style={{ marginBottom: 24 }}>
            <span
              className="font-mono uppercase block"
              style={{
                fontSize: 11,
                letterSpacing: "0.05em",
                color: "#8B8478",
                marginBottom: 8,
              }}
            >
              What feature would you use most?
            </span>
            <textarea
              className="beta-textarea"
              placeholder="e.g. Know when to schedule hard workouts, meal planning by phase..."
              value={wantMost}
              onChange={(e) => setWantMost(e.target.value)}
            />
          </label>

          {/* Beta info callout */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              backgroundColor: "#0A0A0C",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{ flexShrink: 0, marginTop: 2 }}
              aria-hidden
            >
              <circle
                cx="8"
                cy="8"
                r="7"
                stroke="#E8C16F"
                strokeWidth="1.5"
              />
              <path
                d="M8 7v4M8 5.25v.01"
                stroke="#E8C16F"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{
                fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                fontSize: 12,
                lineHeight: 1.5,
                color: "#8B8478",
              }}
            >
              Beta launching Q3 2026. Early testers get lifetime Pro access ($240/year value). Your feedback shapes the product.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid || submitting || submitted}
            className="beta-submit"
          >
            {submitted ? "Submitted ✓" : submitting ? "Submitting…" : "Join the beta"}
          </button>

          {/* Footer */}
          <p
            style={{
              marginTop: 16,
              fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
              fontSize: 11,
              color: "#5A554E",
              textAlign: "center",
            }}
          >
            We respect your privacy. No spam. Unsubscribe anytime.
          </p>
        </form>
      </div>
    </>
  );
};

export default BetaSignupModal;