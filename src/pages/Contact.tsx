import { PageLayout } from "@/components/PageLayout";
import { Link } from "react-router-dom";
import { Mail, MessageCircle, FileText } from "lucide-react";

const Contact = () => (
  <PageLayout>
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get in <span className="text-gradient-gold">Touch</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            We're here to help. Reach out anytime.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <a
            href="mailto:support@legacyfitvirtual.com"
            className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <Mail className="w-8 h-8 text-primary shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Email Support</h3>
              <p className="text-sm text-muted-foreground">support@legacyfitvirtual.com</p>
            </div>
          </a>

          <Link
            to="/faq"
            className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <MessageCircle className="w-8 h-8 text-accent shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">FAQ</h3>
              <p className="text-sm text-muted-foreground">Find quick answers to common questions.</p>
            </div>
          </Link>
        </div>

        {/* Legal links */}
        <div className="border-t border-border pt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Legal & Policies
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              to="/legal"
              className="p-4 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service & Privacy Policy
            </Link>
            <Link
              to="/legal"
              className="p-4 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default Contact;
