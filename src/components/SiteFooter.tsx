import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export const SiteFooter = () => (
  <footer className="py-12 px-4 border-t border-border">
    <div className="container mx-auto">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-cyan">LegacyFit</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Movement with meaning for women 45+.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm">Explore</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/challenges" className="hover:text-foreground transition-colors">Challenges</Link>
            <Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
            <Link to="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link>
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm">Company</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm">Legal</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/legal" className="hover:text-foreground transition-colors">Terms & Privacy</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Support</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} LegacyFit. All rights reserved.
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
          LegacyFit is an educational platform. All historical figures, events, and references are included
          solely for educational and informational purposes. We are not affiliated with, endorsed by, or
          associated with any individual, organization, or estate referenced.
        </p>
      </div>
    </div>
  </footer>
);
