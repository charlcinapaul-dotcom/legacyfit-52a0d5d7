
CREATE TABLE public.user_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  distance_miles numeric NOT NULL,
  steps integer NULL,
  activity_type text NOT NULL DEFAULT 'walk' CHECK (activity_type IN ('walk', 'run', 'bike', 'manual')),
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'apple_health', 'health_connect', 'wearable')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own activity"
  ON public.user_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_activity.user_id));

CREATE POLICY "Users can view their own activity"
  ON public.user_activity FOR SELECT
  TO authenticated
  USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_activity.user_id));

CREATE POLICY "Users can delete their own activity"
  ON public.user_activity FOR DELETE
  TO authenticated
  USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_activity.user_id));

CREATE POLICY "Admins can manage all activity"
  ON public.user_activity FOR ALL
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));
