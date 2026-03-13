import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Footprints, User, Loader2 } from "lucide-react";
import { z } from "zod";

const usernameSchema = z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be 50 characters or less");

const Onboarding = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // If user already has a display_name, skip onboarding
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profile?.display_name) {
        navigate("/dashboard");
        return;
      }

      setCheckingSession(false);
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = usernameSchema.safeParse(username.trim());
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check uniqueness
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .ilike("display_name", username.trim())
        .maybeSingle();

      if (existing) {
        setError("This name is already taken. Please choose a different one.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ display_name: username.trim() })
        .eq("user_id", session.user.id);

      if (updateError) {
        toast.error("Failed to save your name. Please try again.");
        return;
      }

      toast.success("Welcome to LegacyFit!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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
            <CardTitle className="text-2xl text-foreground">Create your LegacyFit name</CardTitle>
            <CardDescription>Choose the name other explorers will see</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Your name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g. FreedomWalker"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError(null);
                    }}
                    className="pl-10"
                    disabled={loading}
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading || !username.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Continue Journey"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
