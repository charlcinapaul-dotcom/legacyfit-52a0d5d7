-- Allow authenticated users to read all mile entries for leaderboard aggregation
-- Currently only users can see their own; we need cross-user reads for leaderboard
DROP POLICY IF EXISTS "Users can view their own mile entries" ON public.mile_entries;

CREATE POLICY "Authenticated users can view all mile entries"
ON public.mile_entries
FOR SELECT
TO authenticated
USING (true);
