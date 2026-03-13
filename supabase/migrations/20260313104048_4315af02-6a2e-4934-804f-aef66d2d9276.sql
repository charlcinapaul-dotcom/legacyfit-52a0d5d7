-- Add unique index on display_name (case-insensitive) to prevent duplicate usernames
CREATE UNIQUE INDEX IF NOT EXISTS profiles_display_name_unique 
  ON public.profiles (lower(display_name))
  WHERE display_name IS NOT NULL;