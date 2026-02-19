import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Footprints, ArrowLeft, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TimeFilter = "week" | "month" | "all";

interface LeaderboardUser {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bib_number: string | null;
  total_miles: number;
  has_consistency_star: boolean;
}

const TIERS = [
  { name: "Trailblazer", emoji: "🔥", min: 75, max: Infinity },
  { name: "Steady Stride", emoji: "🔁", min: 25, max: 74 },
  { name: "First Steps", emoji: "🌅", min: 1, max: 24 },
] as const;

function getTier(miles: number) {
  return TIERS.find((t) => miles >= t.min && miles <= t.max) ?? null;
}

function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = day === 0 ? 6 : day - 1; // Monday-based
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

function getStartOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TimeFilter>("all");

  const weekStart = useMemo(() => getStartOfWeek(), []);
  const monthStart = useMemo(() => getStartOfMonth(), []);

  // Fetch all mile entries with profile info
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ["leaderboard-data", filter],
    queryFn: async () => {
      // Get aggregated leaderboard data via secure RPC
      const since = filter === "week" ? weekStart : filter === "month" ? monthStart : null;
      const { data: entries, error } = await supabase.rpc("get_leaderboard_entries", {
        p_since: since,
      });
      if (error) throw error;

      // Build user miles map
      const userMiles: Record<string, number> = {};
      for (const e of entries || []) {
        userMiles[e.user_id] = Number(e.total_miles);
      }

      const userIds = Object.keys(userMiles);
      if (userIds.length === 0) return [];

      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, bib_number")
        .in("user_id", userIds);

      // Check consistency star via secure RPC
      const { data: consistency } = await supabase.rpc("get_weekly_consistency", {
        p_week_start: weekStart,
        p_user_ids: userIds,
      });

      const userDays: Record<string, number> = {};
      for (const c of consistency || []) {
        userDays[c.user_id] = Number(c.distinct_days);
      }

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      const result: LeaderboardUser[] = userIds.map((uid) => {
        const profile = profileMap.get(uid);
        return {
          user_id: uid,
          display_name: profile?.display_name || "Explorer",
          avatar_url: profile?.avatar_url || null,
          bib_number: profile?.bib_number || null,
          total_miles: Math.round(userMiles[uid] * 10) / 10,
          has_consistency_star: (userDays[uid] || 0) >= 3,
        };
      });

      // Sort by miles descending
      result.sort((a, b) => b.total_miles - a.total_miles);
      return result;
    },
  });

  const users = leaderboardData || [];

  // Group by tier
  const grouped = TIERS.map((tier) => ({
    ...tier,
    users: users.filter((u) => {
      const t = getTier(u.total_miles);
      return t?.name === tier.name;
    }),
  })).filter((g) => g.users.length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
              <Footprints className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient-gold">Leaderboard</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Tone message */}
        <p className="text-center text-muted-foreground italic mb-6">
          "Walk at your pace. Every mile matters. Progress over competition."
        </p>

        {/* Time filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as TimeFilter)} className="mb-8">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No miles logged yet. Be the first!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {grouped.map((tier) => (
              <div key={tier.name}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{tier.emoji}</span>
                  <h2 className="text-lg font-semibold text-foreground">{tier.name}</h2>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {tier.min}–{tier.max === Infinity ? "∞" : tier.max} mi
                  </Badge>
                </div>
                <div className="space-y-2">
                  {tier.users.map((user) => (
                    <Card key={user.user_id} className="bg-card border-border">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="bg-secondary text-foreground text-sm">
                            {(user.display_name || "E")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-foreground truncate">
                              {user.display_name}
                            </span>
                            {user.has_consistency_star && (
                              <Star className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
                            )}
                          </div>
                          {user.bib_number && (
                            <p className="text-xs text-muted-foreground">{user.bib_number}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-primary tabular-nums">
                          {user.total_miles} mi
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
