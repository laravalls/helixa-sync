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
  const onOnboarding = location.pathname === "/onboarding";

  useEffect(() => {
    if (!isOnboarded && !onOnboarding) {
      navigate("/onboarding", { replace: true });
    }
  }, [isOnboarded, onOnboarding, navigate]);

  if (!isOnboarded && !onOnboarding) return null;

  return <>{children}</>;
};
