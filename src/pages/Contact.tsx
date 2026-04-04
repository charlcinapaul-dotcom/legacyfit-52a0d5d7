import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { PageLayout } from "@/components/PageLayout";
import { Link } from "react-router-dom";
import { Mail, MessageCircle, FileText, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("contact-form", {
        body: { name: name.trim(), email: email.trim(), message: message.trim() },
      });

      if (error) throw error;

      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
      toast.success("Message sent successfully!");
    } catch {
      toast.error("Something went wrong. Please email us directly at support@legacyfitvirtual.com");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageLayout>
      <Helmet>
        <title>Contact LegacyFit — Get Support</title>
        <meta name="description" content="Reach out to the LegacyFit team for support, questions about challenges, or content inquiries. We're here to help." />
        <meta property="og:title" content="Contact LegacyFit — Get Support" />
        <meta property="og:description" content="Get in touch with the LegacyFit team for support, billing questions, or general inquiries." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact LegacyFit — Get Support" />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : "https://legacyfitvirtual.com/contact"} />
      </Helmet>
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
                <p className="text-xs text-muted-foreground/60 mt-1 select-all">
                  support@legacyfitvirtual.com
                </p>
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

          {/* Contact Form */}
          <div className="mb-12 rounded-xl bg-card border border-border p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-[#D4AF37]" />
              Send Us a Message
            </h2>

            {sent ? (
              <div className="text-center py-8">
                <p className="text-foreground font-medium mb-2">Your message has been sent!</p>
                <p className="text-sm text-muted-foreground">
                  We'll get back to you within 1–2 business days.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  onClick={() => setSent(false)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-foreground">Name</Label>
                  <Input
                    id="contact-name"
                    type="text"
                    required
                    maxLength={200}
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background border-border focus-visible:ring-[#D4AF37]/50 focus-visible:border-[#D4AF37]/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-foreground">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    required
                    maxLength={255}
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background border-border focus-visible:ring-[#D4AF37]/50 focus-visible:border-[#D4AF37]/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="text-foreground">Message</Label>
                  <Textarea
                    id="contact-message"
                    required
                    maxLength={5000}
                    rows={5}
                    placeholder="How can we help?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-background border-border focus-visible:ring-[#D4AF37]/50 focus-visible:border-[#D4AF37]/50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={sending || !name.trim() || !email.trim() || !message.trim()}
                  className="w-full bg-[#D4AF37] text-black font-semibold hover:bg-[#D4AF37]/90 disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send Message"}
                </Button>
              </form>
            )}
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
};

export default Contact;
