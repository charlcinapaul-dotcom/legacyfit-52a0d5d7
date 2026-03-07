-- Enable pg_net extension for making HTTP requests from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Trigger function shell (URL/key injected via INSERT tool below)
CREATE OR REPLACE FUNCTION public.trigger_milestone_audio_generation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when audio_url is NULL (new milestone or audio not yet set)
  IF NEW.audio_url IS NULL THEN
    PERFORM extensions.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/generate-milestone-audio',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', current_setting('app.supabase_anon_key'),
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      ),
      body := jsonb_build_object('milestoneId', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;