
-- 1. Drop overly permissive storage policies (service_role bypasses RLS, so these are unnecessary and dangerous)
DROP POLICY IF EXISTS "Service role can upload challenge images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update challenge images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete challenge images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload milestone audio" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update milestone audio" ON storage.objects;

-- 2. Update milestone audio trigger to call the edge function with the service role key
CREATE OR REPLACE FUNCTION public.trigger_milestone_audio_generation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_edition text;
  v_service_key text;
BEGIN
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
    -- Read service role key from Vault if available, else fall back to a configured GUC
    BEGIN
      SELECT decrypted_secret INTO v_service_key
      FROM vault.decrypted_secrets
      WHERE name = 'SERVICE_ROLE_KEY'
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      v_service_key := NULL;
    END;

    IF v_service_key IS NULL THEN
      v_service_key := current_setting('app.service_role_key', true);
    END IF;

    -- Only fire if we have a service role key configured
    IF v_service_key IS NOT NULL AND length(v_service_key) > 0 THEN
      PERFORM net.http_post(
        url := 'https://utfexhdncajccdpvquky.supabase.co/functions/v1/generate-milestone-audio',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := jsonb_build_object('milestoneId', NEW.id)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
