CREATE UNIQUE INDEX IF NOT EXISTS mile_entries_health_sync_unique
ON public.mile_entries (user_id, challenge_id, logged_at)
WHERE notes LIKE 'Health Sync%';

CREATE OR REPLACE FUNCTION public.validate_mile_entry()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  daily_total numeric;
  hourly_count integer;
  max_single_entry numeric := 7;
  max_daily_aggregate numeric := 10.5;
  max_entries_per_hour integer := 5;
BEGIN
  IF NEW.miles > max_single_entry THEN
    RAISE EXCEPTION 'Single entry cannot exceed % miles. You logged % miles.', max_single_entry, NEW.miles
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT COALESCE(SUM(miles), 0) INTO daily_total
  FROM public.mile_entries
  WHERE user_id = NEW.user_id
    AND challenge_id = NEW.challenge_id
    AND logged_at::date = NEW.logged_at::date
    AND (TG_OP = 'INSERT' OR id <> NEW.id);

  IF (daily_total + NEW.miles) > max_daily_aggregate THEN
    RAISE EXCEPTION 'Daily limit of % miles exceeded. You have already logged % miles today. Max remaining: % miles.',
      max_daily_aggregate, daily_total, GREATEST(0, max_daily_aggregate - daily_total)
      USING ERRCODE = 'check_violation';
  END IF;

  IF TG_OP = 'INSERT' THEN
    SELECT count(*) INTO hourly_count
    FROM public.mile_entries
    WHERE user_id = NEW.user_id
      AND challenge_id = NEW.challenge_id
      AND logged_at > now() - interval '1 hour';

    IF hourly_count >= max_entries_per_hour THEN
      RAISE EXCEPTION 'Rate limit reached. Maximum % entries per hour. Please wait before logging again.', max_entries_per_hour
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;