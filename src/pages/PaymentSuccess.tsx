import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const challengeId = searchParams.get("challenge_id");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [challengeSlug, setChallengeSlug] = useState<string>("");

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { sessionId },
        });

        if (error || !data?.success) {
          setStatus("error");
          return;
        }

        // Fetch challenge slug for navigation
        if (challengeId) {
          const { data: challenge } = await supabase
            .from("challenges")
            .select("slug")
            .eq("id", challengeId)
            .maybeSingle();
          if (challenge?.slug) setChallengeSlug(challenge.slug);
        }

        setStatus("success");
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [sessionId, challengeId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "verifying" && (
          <>
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Confirming your payment...</h1>
            <p className="text-muted-foreground">Please wait while we verify your enrollment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">You're Enrolled! 🎉</h1>
            <p className="text-muted-foreground">
              Your challenge enrollment is confirmed. Start logging miles and collecting stamps!
            </p>
            <div className="flex flex-col gap-3">
              {challengeSlug && (
                <Link to={`/challenge/${challengeSlug}`}>
                  <Button size="lg" className="w-full">Go to Your Challenge</Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="w-full">View Dashboard</Button>
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground">
              We couldn't verify your payment. If you were charged, please contact support.
            </p>
            <Link to="/challenges">
              <Button size="lg" variant="outline">Back to Challenges</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
