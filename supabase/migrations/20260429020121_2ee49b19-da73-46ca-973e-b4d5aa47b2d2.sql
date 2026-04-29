CREATE OR REPLACE FUNCTION public.trigger_milestone_audio_generation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_edition text;
BEGIN
  -- Skip auto-generation for the Independence editions (manual control via admin panel)
  SELECT c.edition INTO v_edition
  FROM public.challenges c
  WHERE c.id = NEW.challenge_id;

  IF v_edition IN (
    '250 Years of Independence – Unsung Edition',
    '250 Years of Independence – Patriots Edition'
  ) THEN
    RETURN NEW;
  END IF;

  IF NEW.audio_url IS NULL THEN
    PERFORM net.http_post(
      url := 'https://utfexhdncajccdpvquky.supabase.co/functions/v1/generate-milestone-audio',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0ZmV4aGRuY2FqY2NkcHZxdWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMjgzMjYsImV4cCI6MjA4NDgwNDMyNn0.BkrHTBUX2VgCaJbsNjA-emw4lYrJ4a6Xo8avCDqurx4',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0ZmV4aGRuY2FqY2NkcHZxdWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMjgzMjYsImV4cCI6MjA4NDgwNDMyNn0.BkrHTBUX2VgCaJbsNjA-emw4lYrJ4a6Xo8avCDqurx4'
      ),
      body := jsonb_build_object('milestoneId', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$function$;