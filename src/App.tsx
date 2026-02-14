import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ChallengeRoute from "./pages/ChallengeRoute";
import ChallengePassport from "./pages/ChallengePassport";
import Passport from "./pages/Passport";
import Leaderboard from "./pages/Leaderboard";
import Legal from "./pages/Legal";
import About from "./pages/About";
import WhyWeGive from "./pages/WhyWeGive";
import Challenges from "./pages/Challenges";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
