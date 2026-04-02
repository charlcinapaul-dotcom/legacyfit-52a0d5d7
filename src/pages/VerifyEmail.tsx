import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Footprints, Mail, ArrowLeft, Loader2 } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const emailAddress = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!emailAddress) {
      toast.error("No email address found. Please sign up again.");
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailAddress,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification email sent! Check your inbox.");
        setCooldown(60);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to sign in</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center glow-gold">
                <Footprints className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="text-3xl font-bold text-gradient-gold">LegacyFit</span>
            </div>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-foreground">
                Check your email
              </CardTitle>
              <CardDescription className="mt-2">
                Please check your email to verify your account before continuing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {emailAddress && (
                <p className="text-center text-sm text-muted-foreground">
                  We sent a verification link to{" "}
                  <span className="font-medium text-foreground">{emailAddress}</span>
                </p>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleResend}
                  disabled={resending || cooldown > 0}
                  variant="outline"
                  className="w-full"
                >
                  {resending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : cooldown > 0 ? (
                    `Resend in ${cooldown}s`
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>

                <Button asChild variant="default" className="w-full">
                  <Link to="/auth">Back to Sign In</Link>
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Didn't receive the email? Check your spam folder or try resending.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;
