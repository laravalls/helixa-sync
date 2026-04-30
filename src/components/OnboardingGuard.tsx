import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { hasCompletedOnboarding } from "@/lib/onboardingCheck";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnboarded = hasCompletedOnboarding();
  const PUBLIC_PATHS = ["/onboarding", "/beta"];
  const onPublicPath = PUBLIC_PATHS.includes(location.pathname);

  useEffect(() => {
    if (!isOnboarded && !onPublicPath) {
      navigate("/onboarding", { replace: true });
    }
  }, [isOnboarded, onPublicPath, navigate]);

  if (!isOnboarded && !onPublicPath) return null;

  return <>{children}</>;
};
