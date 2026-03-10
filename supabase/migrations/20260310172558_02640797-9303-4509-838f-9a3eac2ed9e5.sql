
-- 1. Create user_streaks table
CREATE TABLE public.user_streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_active_week integer,
  last_active_year integer,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies
CREATE POLICY "Users can view their own streak"
  ON public.user_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak"
  ON public.user_streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak"
  ON public.user_streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Streak calculation function
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week integer;
  v_year integer;
  v_prev_week integer;
  v_prev_year integer;
  v_current integer;
  v_longest integer;
  v_last_week integer;
  v_last_year integer;
BEGIN
  -- ISO week and year for the new entry
  v_week := EXTRACT(WEEK FROM NEW.logged_at)::integer;
  v_year := EXTRACT(ISOYEAR FROM NEW.logged_at)::integer;

  -- Fetch existing streak row
  SELECT current_streak, longest_streak, last_active_week, last_active_year
  INTO v_current, v_longest, v_last_week, v_last_year
  FROM public.user_streaks
  WHERE user_id = NEW.user_id;

  -- No row yet — insert with streak = 1
  IF NOT FOUND THEN
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_active_week, last_active_year)
    VALUES (NEW.user_id, 1, 1, v_week, v_year);
    RETURN NEW;
  END IF;

  -- Already logged this week — do nothing
  IF v_last_week = v_week AND v_last_year = v_year THEN
    RETURN NEW;
  END IF;

  -- Determine the immediately preceding ISO week
  IF v_week = 1 THEN
    -- Week 1 of current year: preceding week is last week of previous year
    v_prev_week := EXTRACT(WEEK FROM (make_date(v_year, 1, 4) - interval '7 days'))::integer;
    v_prev_year := v_year - 1;
  ELSE
    v_prev_week := v_week - 1;
    v_prev_year := v_year;
  END IF;

  IF v_last_week = v_prev_week AND v_last_year = v_prev_year THEN
    -- Consecutive week — increment streak
    v_current := v_current + 1;
    v_longest := GREATEST(v_longest, v_current);
  ELSE
    -- Streak broken — reset
    v_current := 1;
  END IF;

  UPDATE public.user_streaks
  SET
    current_streak = v_current,
    longest_streak = v_longest,
    last_active_week = v_week,
    last_active_year = v_year,
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- 5. Trigger on mile_entries AFTER INSERT
CREATE TRIGGER trg_update_streak
  AFTER INSERT ON public.mile_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_streak();
