
-- Replace the permissive WITH CHECK (true) INSERT policy on walk_reminders
-- with one that validates the email field is non-empty
DROP POLICY IF EXISTS "Anyone can insert walk reminders" ON public.walk_reminders;

CREATE POLICY "Anyone can insert walk reminders"
  ON public.walk_reminders
  FOR INSERT
  WITH CHECK (email IS NOT NULL AND char_length(trim(email)) > 0);
