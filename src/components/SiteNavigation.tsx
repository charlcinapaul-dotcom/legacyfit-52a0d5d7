import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import legacyFitLogo from "@/assets/legacyfit-logo.png";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "Challenges", to: "/challenges" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Leaderboard", to: "/leaderboard" },
  { label: "About", to: "/about" },
  { label: "Why We Give", to: "/why-we-give" },
];

const mobileNavItems = [
  ...navItems,
  { label: "Why We Give", to: "/why-we-give" },
];

interface SiteNavigationProps {
  variant?: 'default' | 'dashboard';
  bibNumber?: string | null;
}

export const SiteNavigation = ({ variant = 'default', bibNumber }: SiteNavigationProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Home */}
        <div className="flex items-center gap-2">
          <Link to="/" className="shrink-0">
            <img src={legacyFitLogo} alt="LegacyFit" className="h-14 w-auto" />
          </Link>
          {location.pathname !== "/" && (
            <Link
              to="/"
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-primary hover:text-primary/80 hover:bg-secondary/50"
            >
              Home
            </Link>
          )}
        </div>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.to
                  ? "text-primary bg-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {variant === 'dashboard' ? (
            <>
              {bibNumber && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border">
                  <span className="text-xs text-muted-foreground">BIB</span>
                  <span className="text-sm font-mono text-primary">{bibNumber}</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Join
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {location.pathname !== "/" && (
              <Link
                to="/"
                className="px-4 py-3 rounded-md text-sm font-medium transition-colors text-primary hover:text-primary/80 hover:bg-secondary/50"
              >
                Home
              </Link>
            )}
            {mobileNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.to
                    ? "text-primary bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-border mt-2 pt-3 flex flex-col gap-2">
              {variant === 'dashboard' ? (
                <>
                  {bibNumber && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border w-fit">
                      <span className="text-xs text-muted-foreground">BIB</span>
                      <span className="text-sm font-mono text-primary">{bibNumber}</span>
                    </div>
                  )}
                  <Button variant="outline" className="w-full" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              ) : user ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                  </Link>
                  <Link to="/auth?mode=signup">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Join
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
