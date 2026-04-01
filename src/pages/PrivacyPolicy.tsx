import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Shield, BookOpen } from "lucide-react";
import legacyFitLogo from "@/assets/legacyfit-logo.png";

const PrivacyPolicy = () => (
  <>
    <Helmet>
      <title>Privacy Policy — LegacyFit</title>
      <link rel="canonical" href="https://legacyfitvirtual.com/privacy-policy" />
      <meta
        name="description"
        content="LegacyFit privacy policy — how we collect, use, and protect your personal information."
      />
    </Helmet>
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src={legacyFitLogo} alt="LegacyFit" className="h-10 w-auto" />
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Privacy Policy</h1>
            <p className="text-muted-foreground">Effective Date: March 22, 2026</p>
          </div>

          <div className="mb-8 bg-card rounded-xl border border-border p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              LegacyFit ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you use the LegacyFit mobile application
              and website (legacyfitvirtual.com).
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">
              LegacyFit is a fitness and wellness application that allows users to participate in walking challenges,
              track progress, earn milestone stamps, and access educational and motivational content.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">
              By using the LegacyFit app, you agree to the collection and use of information in accordance with this
              Privacy Policy.
            </p>
          </div>

          <div className="space-y-6">
            {/* Section 1 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">1. Information We Collect</h2>
              <div className="text-sm text-muted-foreground space-y-4">
                <div>
                  <p className="font-medium text-foreground mb-1">Account Information</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Name</li>
                    <li>Email address</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Fitness &amp; Activity Data</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Miles walked</li>
                    <li>Challenge progress</li>
                    <li>Milestone completions</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Location Data</p>
                  <p>
                    LegacyFit uses GPS location data only during active walk tracking to measure distance. We do not
                    store precise location history, and location access can be disabled at any time in your device
                    settings.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Payment Information</p>
                  <p>
                    Payments are processed securely through Stripe. We do not store credit card numbers or payment
                    credentials.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Device &amp; Usage Information</p>
                  <p>We may collect:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                    <li>Device type</li>
                    <li>Operating system</li>
                    <li>App version</li>
                    <li>Crash reports</li>
                    <li>Performance data</li>
                  </ul>
                  <p className="mt-2">
                    This information is used only to maintain app performance and improve reliability.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Create and manage your account</li>
                  <li>Track walking challenge progress</li>
                  <li>Award milestone stamps</li>
                  <li>Process payments and subscriptions</li>
                  <li>Deliver audio narration and educational content</li>
                  <li>Send account-related notifications</li>
                  <li>Improve app performance and reliability</li>
                  <li>Respond to support requests</li>
                </ul>
                <p className="mt-3 font-medium text-foreground">We do not sell your personal information.</p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">3. Legal Basis for Processing</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>We process your information based on:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Your consent</li>
                  <li>The need to provide services you request</li>
                  <li>Compliance with legal obligations</li>
                  <li>Legitimate business interests such as improving the app</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">4. Data Sharing</h2>
              <p className="text-sm text-muted-foreground">
                We do not sell or rent your personal information. We share information only with trusted service
                providers necessary to operate the app.
              </p>
            </section>

            {/* Section 5 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">5. Third-Party Services</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>We work with the following trusted providers:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <span className="font-medium text-foreground">Supabase</span> — secure database and authentication
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Stripe</span> — payment processing
                  </li>
                  <li>
                    <span className="font-medium text-foreground">ElevenLabs</span> — audio narration
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Resend</span> — transactional email
                  </li>
                </ul>
                <p className="mt-2">
                  These providers process data only as necessary to provide services and are required to protect your
                  information.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">6. Data Storage &amp; Security</h2>
              <p className="text-sm text-muted-foreground">
                Your information is stored securely using industry-standard encryption and security practices. While we
                take reasonable steps to protect your data, no method of transmission or storage is completely secure.
              </p>
            </section>

            {/* Section 7 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">7. Data Retention</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>We retain your account data while your account is active.</p>
                <p>If you delete your account:</p>
                <p>
                  Your personal data will be permanently deleted within 30 days, except where retention is required by
                  law.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">8. Your Privacy Rights</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your account</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
                <p className="mt-3">
                  To make a request, contact:{" "}
                  <a href="mailto:support@legacyfitvirtual.com" className="font-medium text-foreground hover:underline">
                    support@legacyfitvirtual.com
                  </a>
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">9. Account Deletion</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Users can delete their account at any time within the LegacyFit app.</p>
                <p>
                  You may also request account deletion by contacting:{" "}
                  <a href="mailto:support@legacyfitvirtual.com" className="font-medium text-foreground hover:underline">
                    support@legacyfitvirtual.com
                  </a>
                </p>
                <p>All personal data will be deleted within 30 days of request.</p>
              </div>
            </section>

            {/* Section 10 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">10. Children's Privacy</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>LegacyFit is intended for individuals 18 years of age or older.</p>
                <p>We do not knowingly collect personal information from children under 13 years old.</p>
                <p>If we learn that a child has provided personal data, we will delete it promptly.</p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">11. Changes to This Policy</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>We may update this Privacy Policy from time to time.</p>
                <p>If significant changes are made, users will be notified via:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Email</li>
                  <li>In-app notification</li>
                </ul>
                <p className="mt-2">
                  Continued use of the app after changes indicates acceptance of the updated policy.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">12. Contact Us</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>For privacy-related questions:</p>
                <p>
                  <span className="font-medium text-foreground">Email: </span>
                  <a href="mailto:support@legacyfitvirtual.com" className="hover:underline">
                    support@legacyfitvirtual.com
                  </a>
                </p>
                <p>
                  <span className="font-medium text-foreground">Website: </span>
                  <a href="https://legacyfitvirtual.com" className="hover:underline">
                    legacyfitvirtual.com
                  </a>
                </p>
              </div>
            </section>
          </div>

          <div className="text-center mt-12 text-xs text-muted-foreground">Last updated: March 22, 2026</div>
        </div>
      </main>
    </div>
  </>
);

export default PrivacyPolicy;
