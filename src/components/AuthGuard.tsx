import { useAuth } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";

const PUBLIC_PATHS = ["/sign-in", "/onboarding", "/beta", "/leads"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
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

  if (!isSignedIn && !isPublic) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
