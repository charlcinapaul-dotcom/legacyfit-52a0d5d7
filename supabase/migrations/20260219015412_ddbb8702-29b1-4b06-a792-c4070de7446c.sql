-- Restrict teams SELECT to only team members (prevents exposing password hashes to all users)
DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;

CREATE POLICY "Team members can view their teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = teams.id AND tm.user_id = auth.uid()
    )
  );
