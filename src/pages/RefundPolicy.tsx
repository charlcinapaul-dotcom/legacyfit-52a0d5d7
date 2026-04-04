import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Shield, ShoppingBag, Smartphone, CreditCard, AlertTriangle, Globe, Mail } from "lucide-react";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden">
      <Helmet>
        <title>Refund Policy — LegacyFit Virtual Challenge</title>
        <meta name="description" content="LegacyFit refund policy. All sales are final. Review our policies on lost shipments, billing errors, and App Store purchases." />
        <meta property="og:title" content="Refund Policy — LegacyFit" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://legacyfitvirtual.com/refund-policy" />
      </Helmet>

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
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Refund Policy</h1>
            <p className="text-muted-foreground">LegacyFit Virtual Challenge — Effective Date: April 4, 2026</p>
          </div>

          {/* Intro */}
          <section className="bg-card rounded-xl border border-border p-6 mb-8">
            <div className="text-sm text-muted-foreground space-y-3">
              <p>LegacyFit Virtual Challenge ("LegacyFit," "we," "us," or "our") provides access to a virtual fitness challenge experience that includes digital participation and a commemorative passport-style booklet.</p>
              <p>The $29 LegacyFit Challenge is a <strong className="text-foreground">single bundled product</strong> that includes both digital access and physical materials associated with the virtual challenge.</p>
              <p>Because this is a virtual challenge and materials are prepared and shipped specifically for each participant, the following policy applies.</p>
            </div>
          </section>

          <div className="space-y-8">
            {/* All Sales Are Final */}
            <section className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">All Sales Are Final</h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>All LegacyFit challenge purchases are <strong className="text-foreground">non-refundable</strong> once an order is completed.</p>
                <p>This includes:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Digital challenge access</li>
                  <li>Virtual challenge participation</li>
                  <li>Passport booklets</li>
                  <li>Printed materials</li>
                  <li>Challenge merchandise</li>
                  <li>Bundle purchases</li>
                </ul>
                <p>Refunds are not provided for:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Change of mind</li>
                  <li>Scheduling conflicts</li>
                  <li>Inability to complete the challenge</li>
                  <li>Device compatibility issues</li>
                  <li>Unused participation</li>
                  <li>Failure to meet fitness goals</li>
                  <li>User error during purchase</li>
                </ul>
                <p>Digital challenge access is delivered immediately upon successful purchase. Preparation and fulfillment of challenge materials begin promptly after order confirmation.</p>
              </div>
            </section>

            {/* Lost Shipments */}
            <section className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Lost Shipments — Replacement Policy</h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>The only circumstance in which a replacement may be issued is when a shipment is verified as lost during delivery.</p>
                <p>If your package does not arrive, contact us within <strong className="text-foreground">14 days of the expected delivery date</strong>.</p>
                <p>We will:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Investigate with the shipping carrier</li>
                  <li>Provide a replacement shipment at no cost</li>
                </ul>
                <p>LegacyFit is not responsible for:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Incorrect shipping addresses provided at checkout</li>
                  <li>Packages marked as delivered by the carrier</li>
                  <li>Delays caused by weather or carrier issues</li>
                </ul>
              </div>
            </section>

            {/* App Store Purchases */}
            <section className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Apple App Store and Google Play Purchases</h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>If your purchase was made through the Apple App Store or Google Play, refund requests must be submitted directly to the platform.</p>
                <p>Apple and Google manage all refund decisions for purchases made through their systems.</p>
                <p>LegacyFit cannot issue refunds for App Store or Google Play transactions and cannot override platform decisions.</p>
              </div>
            </section>

            {/* Billing Errors */}
            <section className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Billing Errors</h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>If you believe you were charged incorrectly, contact us immediately.</p>
                <p>Examples include:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Duplicate charges</li>
                  <li>Incorrect billing amounts</li>
                  <li>Technical billing errors</li>
                </ul>
                <p>Verified billing errors will be corrected promptly.</p>
              </div>
            </section>

            {/* Fraud & Abuse */}
            <section className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Fraud, Abuse, and Policy Misuse</h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>LegacyFit reserves the right to deny refunds, replacements, or participation in cases of:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Fraud</li>
                  <li>Abuse of the refund process</li>
                  <li>Chargeback misuse</li>
                  <li>Violation of the Terms of Service</li>
                </ul>
                <p>This protection helps ensure fairness for all participants.</p>
              </div>
            </section>

            {/* Regional Rights */}
            <section className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Regional Consumer Rights</h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>Nothing in this policy limits rights you may have under applicable consumer protection laws.</p>
                <p>If local law provides additional protections, those rights apply.</p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Contact</h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>For support regarding your order or shipment, contact:</p>
                <p className="font-medium text-foreground">
                  <a href="mailto:support@legacyfitvirtual.com" className="hover:underline">support@legacyfitvirtual.com</a>
                </p>
                <p>Please include:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Full name</li>
                  <li>Email used for purchase</li>
                  <li>Order confirmation number</li>
                  <li>Description of the issue</li>
                </ul>
                <p>We respond within <strong className="text-foreground">2 business days</strong>.</p>
              </div>
            </section>
          </div>

          {/* Final Statement */}
          <div className="mt-12 bg-card rounded-xl border border-border p-6 text-center">
            <p className="text-sm text-muted-foreground font-medium">All LegacyFit challenge purchases are final. Refunds are not provided except in cases of billing errors.</p>
            <p className="text-xs text-muted-foreground/60 mt-2">Continued participation in the LegacyFit Virtual Challenge constitutes acceptance of this policy.</p>
          </div>

          <div className="text-center mt-8 text-xs text-muted-foreground">
            Last updated: April 2026
          </div>
        </div>
      </main>
    </div>
  );
};

export default RefundPolicy;
