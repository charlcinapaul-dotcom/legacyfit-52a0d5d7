import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Footprints, Loader2, LogIn } from "lucide-react";
import { useMileLogging } from "@/hooks/useMileLogging";
import { StampUnlockModal } from "./StampUnlockModal";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface MileLoggerProps {
  challengeId: string;
}

const QUICK_MILES = [1, 3, 5, 10];

export function MileLogger({ challengeId }: MileLoggerProps) {
  const [miles, setMiles] = useState<number>(1);
  const [notes, setNotes] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const {
    totalMiles,
    logMiles,
    isLogging,
    newlyUnlockedStamps,
    clearUnlockedStamps,
  } = useMileLogging(challengeId);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleQuickLog = (quickMiles: number) => {
    logMiles({
      miles: quickMiles,
      challengeId,
      notes: notes || undefined,
    });
    setNotes("");
  };

  const handleCustomLog = () => {
    logMiles({
      miles,
      challengeId,
      notes: notes || undefined,
    });
    setMiles(1);
    setNotes("");
    setShowCustom(false);
  };

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Footprints className="w-5 h-5 text-primary" />
            Log Miles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Sign in to start logging your miles and earning stamps.
          </p>
          <Link to="/auth">
            <Button className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to Log Miles
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Footprints className="w-5 h-5 text-primary" />
            Log Miles
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Total logged: <span className="font-semibold text-primary">{totalMiles} miles</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick buttons */}
          <div className="grid grid-cols-4 gap-2">
            {QUICK_MILES.map((quickMiles) => (
              <Button
                key={quickMiles}
                variant="outline"
                size="sm"
                onClick={() => handleQuickLog(quickMiles)}
                disabled={isLogging}
                className="h-12 text-lg font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {isLogging ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  `+${quickMiles}`
                )}
              </Button>
            ))}
          </div>

          {/* Custom entry toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCustom(!showCustom)}
            className="w-full text-muted-foreground"
          >
            {showCustom ? "Hide custom entry" : "Custom amount..."}
          </Button>

          {/* Custom entry form */}
          {showCustom && (
            <div className="space-y-4 pt-2 border-t">
              <div className="space-y-2">
                <Label htmlFor="miles" className="flex justify-between">
                  <span>Miles</span>
                  <span className="font-bold text-primary">{miles}</span>
                </Label>
                <Slider
                  id="miles-slider"
                  value={[miles]}
                  onValueChange={([v]) => setMiles(v)}
                  min={0.5}
                  max={26.2}
                  step={0.5}
                  className="py-2"
                />
                <Input
                  id="miles"
                  type="number"
                  value={miles}
                  onChange={(e) => setMiles(Number(e.target.value))}
                  min={0.1}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Morning run, evening walk..."
                  rows={2}
                />
              </div>

              <Button
                onClick={handleCustomLog}
                disabled={isLogging || miles <= 0}
                className="w-full"
              >
                {isLogging ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging...
                  </>
                ) : (
                  `Log ${miles} miles`
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stamp unlock modal */}
      <StampUnlockModal
        stamps={newlyUnlockedStamps}
        onClose={clearUnlockedStamps}
      />
    </>
  );
}
