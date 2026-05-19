import { useAuth } from "@clerk/react";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const PUBLIC_PATHS = ["/sign-in", "/onboarding", "/beta", "/leads"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  // If Clerk hasn't loaded in 4s (domain mismatch, network issue, etc.)
  // stop blocking and render the app so it isn't a white screen.
  useEffect(() => {
    if (isLoaded) return;
    const t = setTimeout(() => setTimedOut(true), 4000);
    return () => clearTimeout(t);
  }, [isLoaded]);

  if (!isLoaded && !timedOut) {
    return (
      <div
        style={{
          backgroundColor: "#0A0A0C",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "1.5px solid #E8C16F",
            borderRadius: "50%",
            borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isPublic = PUBLIC_PATHS.some((p) => location.pathname.startsWith(p));

  if (isLoaded && !isSignedIn && !isPublic) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
