-- Fix security linter issues

-- 1. Drop the security definer view and recreate with security_invoker
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard
WITH (security_invoker = on)
AS
SELECT 
  p.id,
  p.user_id,
  p.display_name,
  p.bib_number,
  p.avatar_url,
  COALESCE(SUM(uc.miles_logged), 0) as total_miles,
  COUNT(DISTINCT CASE WHEN uc.is_completed THEN uc.challenge_id END) as challenges_completed
FROM public.profiles p
LEFT JOIN public.user_challenges uc ON p.user_id = uc.user_id
GROUP BY p.id, p.user_id, p.display_name, p.bib_number, p.avatar_url
ORDER BY total_miles DESC;

-- 2. Fix function search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Fix function search_path for handle_new_user (already has it but recreate to be safe)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;