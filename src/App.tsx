import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Today from "./pages/Today.tsx";
import MovementDetail from "./pages/MovementDetail.tsx";
import PlateDetail from "./pages/PlateDetail.tsx";
import StackDetail from "./pages/StackDetail.tsx";
import RecoveryDetail from "./pages/RecoveryDetail.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Connections from "./pages/Connections.tsx";
import Research from "./pages/Research.tsx";
import Profile from "./pages/Profile.tsx";
import Premium from "./pages/Premium.tsx";
import Beta from "./pages/Beta.tsx";
import Leads from "./pages/Leads.tsx";
import NotFound from "./pages/NotFound.tsx";
import { OnboardingGuard } from "./components/OnboardingGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <OnboardingGuard>
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/movement" element={<MovementDetail />} />
          <Route path="/plate" element={<PlateDetail />} />
          <Route path="/stack" element={<StackDetail />} />
          <Route path="/recovery" element={<RecoveryDetail />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/research" element={<Research />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/beta" element={<Beta />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/styleguide" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </OnboardingGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
