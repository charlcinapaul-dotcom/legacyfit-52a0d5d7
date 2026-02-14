import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Shield, FileText, Mail } from "lucide-react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

const Legal = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-cyan">LegacyFit</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Page Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Legal Information</h1>
            <p className="text-muted-foreground">Important information about our platform and content usage</p>
          </div>

          {/* Educational Disclaimer Section */}
          <section className="mb-12">
            <DisclaimerBanner variant="full" />
          </section>

          {/* Additional Legal Sections */}
          <div className="space-y-8">
            {/* Terms of Use */}
            <section className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Terms of Use</h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  By using LegacyFit, you agree to use the platform for personal, non-commercial purposes. 
                  All content, including historical narratives and milestone descriptions, is provided for 
                  educational and motivational purposes.
                </p>
                <p>
                  Users are responsible for ensuring their physical fitness before participating in any 
                  walking, running, or jogging challenges. Always consult with a healthcare professional 
                  before beginning any new exercise program.
                </p>
              </div>
            </section>

            {/* Content Attribution */}
            <section className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Content Attribution</h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Historical information presented in LegacyFit challenges is compiled from publicly 
                  available educational sources. We strive for accuracy and respect in all portrayals.
                </p>
                <p>
                  If you are a rights holder or representative and have concerns about any content, 
                  please contact us using the information below.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  For questions, concerns, or inquiries regarding legal matters, content usage, or 
                  attribution, please reach out to our team at:
                </p>
                <p className="mt-2 font-medium text-foreground">
                  legal@legacyfitvirtual.com
                </p>
              </div>
            </section>
          </div>

          {/* Last Updated */}
          <div className="text-center mt-12 text-xs text-muted-foreground">
            Last updated: January 2025
          </div>
        </div>
      </main>
    </div>
  );
};

export default Legal;
