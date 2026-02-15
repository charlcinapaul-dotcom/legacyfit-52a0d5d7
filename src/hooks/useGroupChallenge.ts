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

      // Get the team (must be for this challenge)
      const { data: team } = await supabase
        .from("teams")
        .select("*")
        .eq("id", membership.team_id)
        .eq("challenge_id", challengeId)
        .single();

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

      const { data: team, error } = await supabase
        .from("teams")
        .insert({ name, challenge_id: challengeId, created_by: user.id, password })
        .select()
        .single();

      if (error) throw error;

      // Add creator as member
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({ team_id: team.id, user_id: user.id });

      if (memberError) throw memberError;
      return team;
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

      // Find team by invite code and challenge
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("id, password")
        .eq("invite_code", inviteCode)
        .eq("challenge_id", challengeId)
        .single();

      if (teamError || !team) throw new Error("Group not found. Check the invite code.");
      if (team.password !== password) throw new Error("Incorrect group password.");

      const { error } = await supabase
        .from("team_members")
        .insert({ team_id: team.id, user_id: user.id });

      if (error) {
        if (error.code === "23505") throw new Error("You're already in this group.");
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Joined the group!");
      queryClient.invalidateQueries({ queryKey: ["group-challenge", challengeId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { group: groupQuery.data, isLoading: groupQuery.isLoading, createGroup, joinGroup };
}
