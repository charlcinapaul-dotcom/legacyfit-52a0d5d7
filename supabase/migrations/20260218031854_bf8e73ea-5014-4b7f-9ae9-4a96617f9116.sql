
-- Anti-cheat validation function for mile entries
-- Enforces: 7mi max per entry, 10.5mi max daily aggregate
CREATE OR REPLACE FUNCTION public.validate_mile_entry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  daily_total numeric;
  max_single_entry numeric := 7;
  max_daily_aggregate numeric := 10.5;
BEGIN
  -- Reject single entries exceeding cap
  IF NEW.miles > max_single_entry THEN
    RAISE EXCEPTION 'Single entry cannot exceed % miles. You logged % miles.', max_single_entry, NEW.miles
      USING ERRCODE = 'check_violation';
  END IF;

  -- Check daily aggregate (all entries for this user+challenge today)
  SELECT COALESCE(SUM(miles), 0) INTO daily_total
  FROM public.mile_entries
  WHERE user_id = NEW.user_id
    AND challenge_id = NEW.challenge_id
    AND logged_at::date = now()::date;

  IF (daily_total + NEW.miles) > max_daily_aggregate THEN
    RAISE EXCEPTION 'Daily limit of % miles exceeded. You have already logged % miles today. Max remaining: % miles.', 
      max_daily_aggregate, daily_total, GREATEST(0, max_daily_aggregate - daily_total)
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger before insert
CREATE TRIGGER validate_mile_entry_trigger
BEFORE INSERT ON public.mile_entries
FOR EACH ROW
EXECUTE FUNCTION public.validate_mile_entry();
