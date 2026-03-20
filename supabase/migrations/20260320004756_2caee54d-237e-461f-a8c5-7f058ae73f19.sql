
-- Tighten INSERT on user_milestones:
-- User can only insert for themselves AND must have reached the milestone's miles_required
DROP POLICY IF EXISTS "Users can insert their own milestones" ON public.user_milestones;

CREATE POLICY "Users can insert their own milestones"
ON public.user_milestones
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.milestones m
    WHERE m.id = user_milestones.milestone_id
    AND (
      SELECT COALESCE(SUM(me.miles), 0)
      FROM public.mile_entries me
      WHERE me.user_id = auth.uid()
        AND me.challenge_id = m.challenge_id
    ) >= m.miles_required
  )
);

-- Tighten INSERT on user_passport_stamps:
-- User can only insert for themselves AND must have reached the milestone's miles_required
DROP POLICY IF EXISTS "Users can insert their own stamps" ON public.user_passport_stamps;

CREATE POLICY "Users can insert their own stamps"
ON public.user_passport_stamps
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.milestones m
    WHERE m.id = user_passport_stamps.milestone_id
    AND (
      SELECT COALESCE(SUM(me.miles), 0)
      FROM public.mile_entries me
      WHERE me.user_id = auth.uid()
        AND me.challenge_id = m.challenge_id
    ) >= m.miles_required
  )
);
