import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import { ScrollToTop } from "./components/ScrollToTop";

const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ChallengeRoute = lazy(() => import("./pages/ChallengeRoute"));
const ChallengePassport = lazy(() => import("./pages/ChallengePassport"));
const Passport = lazy(() => import("./pages/Passport"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Legal = lazy(() => import("./pages/Legal"));
const About = lazy(() => import("./pages/About"));
const WhyWeGive = lazy(() => import("./pages/WhyWeGive"));
const Challenges = lazy(() => import("./pages/Challenges"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const FreeWalk = lazy(() => import("./pages/FreeWalk"));
const AdminValidate = lazy(() => import("./pages/AdminValidate"));
const Export = lazy(() => import("./pages/Export"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient-gold mb-2">LegacyFit</div>
              <div className="text-muted-foreground text-sm">Loading...</div>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/challenge/:slug" element={<ChallengeRoute />} />
            <Route path="/challenge/:slug/passport" element={<ChallengePassport />} />
            <Route path="/passport" element={<Passport />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/about" element={<About />} />
            <Route path="/why-we-give" element={<WhyWeGive />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/free-walk" element={<FreeWalk />} />
            <Route path="/admin/validate" element={<AdminValidate />} />
            <Route path="/export" element={<Export />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
