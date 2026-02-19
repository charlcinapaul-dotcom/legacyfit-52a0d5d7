import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GroupMember {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  bibNumber: string | null;
  milesLogged: number;
}

export interface GroupInfo {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string | null;
  members: GroupMember[];
}

export function useGroupChallenge(challengeId: string | undefined) {
  const queryClient = useQueryClient();

  const groupQuery = useQuery({
    queryKey: ["group-challenge", challengeId],
    queryFn: async (): Promise<GroupInfo | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !challengeId) return null;

      // Find team membership for this challenge
      const { data: membership } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id)
        .single();

      if (!membership) return null;

      // Get team data via secure RPC (excludes password)
      const { data: teamRows } = await supabase.rpc("get_team_for_member", {
        _team_id: membership.team_id,
        _challenge_id: challengeId,
      });
      const team = teamRows?.[0] ?? null;

      if (!team) return null;

      // Get all members
      const { data: members } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", team.id);

      if (!members) return null;

      const memberIds = members.map((m) => m.user_id);

      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, bib_number")
        .in("user_id", memberIds);

      // Get miles for each member in this challenge
      const { data: userChallenges } = await supabase
        .from("user_challenges")
        .select("user_id, miles_logged")
        .eq("challenge_id", challengeId)
        .in("user_id", memberIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);
      const milesMap = new Map(userChallenges?.map((uc) => [uc.user_id, uc.miles_logged ?? 0]) ?? []);

      return {
        id: team.id,
        name: team.name,
        inviteCode: team.invite_code,
        createdBy: team.created_by,
        members: memberIds.map((uid) => ({
          userId: uid,
          displayName: profileMap.get(uid)?.display_name ?? null,
          avatarUrl: profileMap.get(uid)?.avatar_url ?? null,
          bibNumber: profileMap.get(uid)?.bib_number ?? null,
          milesLogged: milesMap.get(uid) ?? 0,
        })),
      };
    },
    enabled: !!challengeId,
  });

  const createGroup = useMutation({
    mutationFn: async ({ name, password }: { name: string; password: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !challengeId) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("create-team", {
        body: { name, password, challengeId },
      });

      if (error) throw new Error(error.message || "Failed to create group");
      if (data?.error) throw new Error(data.error);
      return data.team;
    },
    onSuccess: () => {
      toast.success("Group created!");
      queryClient.invalidateQueries({ queryKey: ["group-challenge", challengeId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const joinGroup = useMutation({
    mutationFn: async ({ inviteCode, password }: { inviteCode: string; password: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !challengeId) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("join-team", {
        body: { inviteCode, password, challengeId },
      });

      if (error) throw new Error(error.message || "Failed to join group");
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      toast.success("Joined the group!");
      queryClient.invalidateQueries({ queryKey: ["group-challenge", challengeId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { group: groupQuery.data, isLoading: groupQuery.isLoading, createGroup, joinGroup };
}
