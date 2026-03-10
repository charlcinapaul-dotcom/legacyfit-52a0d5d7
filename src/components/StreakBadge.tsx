import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flame } from "lucide-react";

interface StreakData {
  current_streak: number;
  longest_streak: number;
}

export function StreakBadge() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("user_streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", user.id)
        .maybeSingle();

      setStreak(data ?? { current_streak: 0, longest_streak: 0 });
      setLoading(false);
    };

    fetchStreak();
  }, []);

  if (loading) {
    return (
      <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border animate-pulse">
        <div className="h-4 w-20 bg-muted rounded mb-2" />
        <div className="h-7 w-10 bg-muted rounded" />
      </div>
    );
  }

  const current = streak?.current_streak ?? 0;
  const longest = streak?.longest_streak ?? 0;
  const hasStreak = current > 0;

  return (
    <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Flame
          className="w-4 h-4"
          style={{ color: hasStreak ? "hsl(var(--primary))" : undefined }}
        />
        <span className="text-xs uppercase tracking-wide">Streak</span>
      </div>

      {hasStreak ? (
        <>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{current}</span>
            <span className="text-xs text-muted-foreground">week{current !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Best: {longest} wk{longest !== 1 ? "s" : ""}
          </p>
        </>
      ) : (
        <>
          <div className="text-sm font-semibold text-foreground leading-tight">
            Start your streak!
          </div>
          <p className="text-xs text-muted-foreground">Log miles this week</p>
        </>
      )}
    </div>
  );
}
