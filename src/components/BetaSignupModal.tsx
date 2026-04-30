import { useEffect } from "react";
import { X } from "lucide-react";

interface BetaSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BetaSignupModal = ({ isOpen, onClose }: BetaSignupModalProps) => {
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
      </div>
    </>
  );
};

export default BetaSignupModal;