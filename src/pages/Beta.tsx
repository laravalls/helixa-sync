import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const INTEREST_OPTIONS = [
  { value: "ttc", label: "Trying to Conceive (fertility guidance)" },
  { value: "cycle_sync", label: "Cycle Sync (optimizing workouts and recovery)" },
  { value: "pcos", label: "PCOS Management (irregular cycles, symptom tracking)" },
  { value: "exploring", label: "Just exploring (not sure yet)" },
];

const FEATURES = [
  {
    title: "Cycle-aware training",
    body: "Workouts dialed to your follicular surge or luteal slowdown — not a generic 7-day split.",
  },
  {
    title: "Nutrition that follows your hormones",
    body: "Macro and micronutrient targets that shift with each phase, synced from MyFitnessPal or Cronometer.",
  },
  {
    title: "Recovery that actually adapts",
    body: "Pulls HRV, sleep and resting HR from Oura, Whoop and Apple Health — then tells you when to push or pull back.",
  },
  {
    title: "One calendar, one plan",
    body: "Hard meetings, hard workouts and rest days scheduled around your real biology, not a flat week.",
  },
];

export default function Beta() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("");
  const [currentTools, setCurrentTools] = useState("");
  const [wantMost, setWantMost] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    // Safety: clear any stale scroll lock from a previously-open modal
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    window.scrollTo({ top: 0, left: 0 });

    const prevTitle = document.title;
    document.title = "Join the HelixA beta — health that syncs to your cycle";

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      const prev = el.getAttribute("content");
      el.setAttribute("content", content);
      return () => {
        if (prev !== null) el!.setAttribute("content", prev);
        else el!.remove();
      };
    };

    const restoreDesc = setMeta(
      "description",
      "HelixA is the first app that syncs your wearables, nutrition, calendar and workouts to your menstrual cycle. Join the private beta."
    );

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const createdCanonical = !canonical;
    const prevHref = canonical?.href;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.href = "https://helixa-sync.com/beta";

    return () => {
      document.title = prevTitle;
      restoreDesc();
      if (createdCanonical) canonical?.remove();
      else if (canonical && prevHref) canonical.href = prevHref;
    };
  }, []);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isFormValid = email.trim() !== "" && isValidEmail(email) && interest !== "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const { error } = await supabase
        .from("beta_signups")
        .insert({
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
          interest,
          current_tools: currentTools.trim() || null,
          want_most: wantMost.trim() || null,
          source: "beta_page",
        })
        .select();

      if (error) {
        const isDuplicate =
          error.code === "23505" || /duplicate/i.test(error.message);
        if (isDuplicate) {
          setSubmitError("You're already on the list! Check your email.");
        } else {
          setSubmitError("Something went wrong. Try again.");
        }
        return;
      }

      setSubmitted(true);
      setEmail("");
      setName("");
      setInterest("");
      setCurrentTools("");
      setWantMost("");
    } catch (err) {
      setSubmitError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <main
        style={{
          backgroundColor: "#0A0A0C",
          color: "#F2EDE4",
          minHeight: "100vh",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <style>{`
          @keyframes beta-ring-pulse {
            0%, 100% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 0 0 rgba(232,193,111,0.5); }
            50% { transform: scale(1.08); opacity: 1; box-shadow: 0 0 0 10px rgba(232,193,111,0); }
          }
          @keyframes beta-success-pop {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .beta-page-input, .beta-page-textarea {
            width: 100%;
            background: #14141A;
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 8px;
            font-family: Inter, ui-sans-serif, system-ui, sans-serif;
            font-size: 14px;
            color: #F2EDE4;
            outline: none;
            transition: border-color 200ms ease;
          }
          .beta-page-input { height: 48px; padding: 0 16px; }
          .beta-page-textarea { min-height: 88px; padding: 12px 16px; resize: vertical; line-height: 1.5; }
          .beta-page-input:focus, .beta-page-textarea:focus { border-color: #E8C16F; }
          .beta-page-input::placeholder, .beta-page-textarea::placeholder { color: #5A554E; }
          .beta-page-submit {
            width: 100%;
            height: 56px;
            background: #E8C16F;
            color: #000;
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
          .beta-page-submit:hover:not(:disabled) { box-shadow: 0 0 32px rgba(232,193,111,0.4); }
          .beta-page-submit:active:not(:disabled) { transform: scale(0.98); }
          .beta-page-submit:disabled {
            background: rgba(255,255,255,0.08);
            color: #5A554E;
            box-shadow: none;
            cursor: not-allowed;
          }
        `}</style>

        {/* Hero */}
        <section
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "80px 24px 48px",
            textAlign: "center",
          }}
        >
          <span
            className="font-mono uppercase"
            style={{
              display: "inline-block",
              fontSize: 10,
              letterSpacing: "0.08em",
              color: "#E8C16F",
              backgroundColor: "#14141A",
              padding: "6px 10px",
              borderRadius: 4,
              marginBottom: 32,
            }}
          >
            Winner · FemTech Hackathon 2026
          </span>

          <div
            aria-hidden
            style={{
              width: 40,
              height: 40,
              border: "1.5px solid #E8C16F",
              borderRadius: "50%",
              margin: "0 auto 28px",
              animation: "beta-ring-pulse 3s ease-in-out infinite",
            }}
          />

          <h1
            style={{
              fontWeight: 300,
              fontSize: "clamp(36px, 6vw, 56px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: 20,
            }}
          >
            Health that finally syncs<br />to your biology.
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "#8B8478",
              lineHeight: 1.6,
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            Your hormones swing 400% across 28 days. Every wearable, workout app
            and meal tracker ignores it. HelixA is the glue.
          </p>
        </section>

        {/* Problem / Solution */}
        <section
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "0 24px 64px",
          }}
        >
          <div
            style={{
              padding: 24,
              backgroundColor: "#14141A",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
            }}
          >
            <p
              className="font-mono uppercase"
              style={{
                fontSize: 11,
                letterSpacing: "0.05em",
                color: "#E8C16F",
                marginBottom: 12,
              }}
            >
              The problem
            </p>
            <p style={{ fontSize: 15, color: "#8B8478", lineHeight: 1.7 }}>
              95% of health research is based on male physiology. You're tracking
              everything across 15 apps — Oura, Strava, MyFitnessPal, Clue, Google
              Calendar — but nothing connects them to your cycle. So you push hard
              when your body needs rest, and rest when you should be peaking.
            </p>
          </div>

          <div
            style={{
              marginTop: 20,
              padding: 24,
              backgroundColor: "rgba(232,193,111,0.05)",
              borderLeft: "2px solid #E8C16F",
              borderRadius: 8,
            }}
          >
            <p
              className="font-mono uppercase"
              style={{
                fontSize: 11,
                letterSpacing: "0.05em",
                color: "#E8C16F",
                marginBottom: 12,
              }}
            >
              The fix
            </p>
            <p style={{ fontSize: 15, color: "#F2EDE4", lineHeight: 1.7 }}>
              One app that syncs your wearables, nutrition, calendar and workouts
              to your menstrual cycle. Daily guidance on when to train hard, when
              to rest, when to schedule that board meeting.
            </p>
          </div>
        </section>

        {/* Features */}
        <section
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "0 24px 80px",
          }}
        >
          <h2
            style={{
              fontWeight: 300,
              fontSize: 28,
              textAlign: "center",
              marginBottom: 40,
              letterSpacing: "-0.01em",
            }}
          >
            What's in the beta
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  padding: 20,
                  backgroundColor: "#14141A",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#F2EDE4",
                    marginBottom: 8,
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: "#8B8478", lineHeight: 1.6 }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Form */}
        <section
          id="signup"
          style={{
            maxWidth: 520,
            margin: "0 auto",
            padding: "0 24px 96px",
          }}
        >
          <div
            style={{
              padding: 32,
              backgroundColor: "#14141A",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              boxShadow: "0 0 40px rgba(232,193,111,0.12)",
            }}
          >
            {submitted ? (
              <div
                style={{
                  textAlign: "center",
                  animation: "beta-success-pop 400ms ease-out",
                }}
              >
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                  aria-hidden
                  style={{ margin: "0 auto 20px", display: "block" }}
                >
                  <circle cx="32" cy="32" r="30" stroke="#E8C16F" strokeWidth="2" />
                  <path
                    d="M20 33 L29 42 L45 24"
                    stroke="#E8C16F"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
                <h2 style={{ fontWeight: 300, fontSize: 24, marginBottom: 8 }}>
                  You're on the list
                </h2>
                <p style={{ fontSize: 15, color: "#8B8478", lineHeight: 1.5 }}>
                  We'll email you when beta spots open. Expect Q3 2026.
                </p>
              </div>
            ) : (
              <>
                <h2
                  style={{
                    fontWeight: 300,
                    fontSize: 24,
                    marginBottom: 8,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Request beta access
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: "#8B8478",
                    marginBottom: 24,
                    lineHeight: 1.5,
                  }}
                >
                  Limited spots. We're prioritizing folks who'll actually use it daily.
                </p>

                <form onSubmit={handleSubmit}>
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
                      className="beta-page-input"
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
                      className="beta-page-input"
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
                    <div className="flex flex-col" style={{ gap: 10 }}>
                      {INTEREST_OPTIONS.map((opt) => {
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
                              }}
                            >
                              {selected && (
                                <div
                                  className="rounded-full"
                                  style={{ width: 8, height: 8, backgroundColor: "#E8C16F" }}
                                />
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: 14,
                                color: selected ? "#F2EDE4" : "#8B8478",
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
                      What apps do you use today?
                    </span>
                    <textarea
                      className="beta-page-textarea"
                      placeholder="e.g. Oura, Strava, MyFitnessPal, Clue..."
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
                      className="beta-page-textarea"
                      placeholder="e.g. Know when to schedule hard workouts, meal planning by phase..."
                      value={wantMost}
                      onChange={(e) => setWantMost(e.target.value)}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={!isFormValid || submitting}
                    className="beta-page-submit"
                  >
                    {submitting ? "Sending…" : "Request access"}
                  </button>

                  {submitError && (
                    <p
                      style={{
                        marginTop: 12,
                        fontSize: 13,
                        color: "#E85C4A",
                        textAlign: "center",
                      }}
                    >
                      {submitError}
                    </p>
                  )}

                  <p
                    style={{
                      marginTop: 12,
                      fontSize: 11,
                      color: "#5A554E",
                      textAlign: "center",
                    }}
                  >
                    We'll never share your email. Unsubscribe anytime.
                  </p>
                </form>
              </>
            )}
          </div>
        </section>

        <footer
          style={{
            padding: "24px",
            textAlign: "center",
            color: "#5A554E",
            fontSize: 12,
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          © {new Date().getFullYear()} HelixA · helixa-sync.com
        </footer>
      </main>
    </>
  );
}
