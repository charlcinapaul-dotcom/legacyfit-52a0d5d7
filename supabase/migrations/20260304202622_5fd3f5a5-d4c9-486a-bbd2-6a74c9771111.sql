
-- Drop and recreate the leaderboard view to avoid type conflict
DROP VIEW IF EXISTS public.leaderboard;

-- Create payment_status enum if not exists
DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.mile_source AS ENUM ('manual', 'apple_health', 'google_fit');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.fulfillment_status AS ENUM ('pending', 'processing', 'shipped', 'delivered');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  edition TEXT NOT NULL,
  slug TEXT UNIQUE,
  total_miles NUMERIC NOT NULL,
  image_url TEXT,
  price_cents INTEGER,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can view active challenges" ON public.challenges FOR SELECT USING (is_active = true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user'::app_role,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

DO $$ BEGIN CREATE POLICY "Admins can manage challenges" ON public.challenges FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id),
  payment_status public.payment_status DEFAULT 'pending'::payment_status,
  stripe_payment_id TEXT,
  miles_logged NUMERIC DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view their own challenges" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert their own challenges" ON public.user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update their own challenges" ON public.user_challenges FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id),
  amount_cents INTEGER NOT NULL,
  status public.payment_status DEFAULT 'pending'::payment_status,
  stripe_payment_id TEXT,
  stripe_checkout_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bib_number TEXT,
  total_miles NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Authenticated users can view profiles" ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id),
  title TEXT NOT NULL,
  description TEXT,
  historical_event TEXT,
  location_name TEXT,
  miles_required NUMERIC NOT NULL,
  order_index INTEGER NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  stamp_title VARCHAR,
  stamp_copy TEXT,
  stamp_mileage_display VARCHAR,
  stamp_image_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can view milestones" ON public.milestones FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admins can manage milestones" ON public.milestones FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.mile_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id),
  miles NUMERIC NOT NULL,
  notes TEXT,
  source public.mile_source NOT NULL DEFAULT 'manual'::mile_source,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.mile_entries ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view their own mile entries" ON public.mile_entries FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert miles for paid challenges" ON public.mile_entries FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.user_challenges uc WHERE uc.user_id = auth.uid() AND uc.challenge_id = mile_entries.challenge_id AND uc.payment_status = 'paid'::payment_status)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update their own mile entries" ON public.mile_entries FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can delete their own mile entries" ON public.mile_entries FOR DELETE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  milestone_id UUID NOT NULL REFERENCES public.milestones(id),
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view their own milestones" ON public.user_milestones FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert their own milestones" ON public.user_milestones FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_passport_stamps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  milestone_id UUID NOT NULL REFERENCES public.milestones(id),
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_passport_stamps ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view their own stamps" ON public.user_passport_stamps FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert their own stamps" ON public.user_passport_stamps FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.passport_stamp_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID UNIQUE REFERENCES public.milestones(id),
  image_url TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.passport_stamp_images ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can view stamp images" ON public.passport_stamp_images FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admins can manage stamp images" ON public.passport_stamp_images FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view their own referral code" ON public.referral_codes FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert their own referral code" ON public.referral_codes FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.referral_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id),
  referred_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_redemptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can insert their own redemption" ON public.referral_redemptions FOR INSERT WITH CHECK (auth.uid() = referred_user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can view redemptions of their own code" ON public.referral_redemptions FOR SELECT USING (EXISTS (SELECT 1 FROM public.referral_codes rc WHERE rc.id = referral_redemptions.referral_code_id AND rc.user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.reward_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(8), 'hex'),
  is_redeemed BOOLEAN NOT NULL DEFAULT false,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  redeemed_for_challenge_id UUID REFERENCES public.challenges(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.reward_codes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view their own reward codes" ON public.reward_codes FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admins can manage reward codes" ON public.reward_codes FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.beta_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER NOT NULL DEFAULT 50,
  times_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.beta_codes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Admins can manage beta codes" ON public.beta_codes FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.legacy_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL UNIQUE REFERENCES public.challenges(id),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.legacy_coins ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can view coins" ON public.legacy_coins FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admins can manage coins" ON public.legacy_coins FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  coin_id UUID NOT NULL REFERENCES public.legacy_coins(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view their own coins" ON public.user_coins FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert their own coins" ON public.user_coins FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.coin_fulfillment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  coin_id UUID NOT NULL REFERENCES public.legacy_coins(id),
  shipping_name TEXT NOT NULL,
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT NOT NULL DEFAULT 'US',
  status public.fulfillment_status DEFAULT 'pending'::fulfillment_status,
  tracking_number TEXT,
  flagged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shipped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.coin_fulfillment ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view their own fulfillment" ON public.coin_fulfillment FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert their own fulfillment" ON public.coin_fulfillment FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update their own fulfillment" ON public.coin_fulfillment FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admins can manage all fulfillment" ON public.coin_fulfillment FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id),
  name TEXT NOT NULL,
  password TEXT NOT NULL DEFAULT '',
  invite_code TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(6), 'hex'),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Authenticated users can create teams" ON public.teams FOR INSERT WITH CHECK (auth.uid() = created_by); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Team creators can update their teams" ON public.teams FOR UPDATE USING (auth.uid() = created_by); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid, _team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.team_members WHERE user_id = _user_id AND team_id = _team_id); $$;

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id),
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view their team memberships" ON public.team_members FOR SELECT USING (auth.uid() = user_id OR is_team_member(auth.uid(), team_id)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can join teams" ON public.team_members FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can leave teams" ON public.team_members FOR DELETE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view their own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert their own certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admins can manage certificates" ON public.certificates FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type TEXT,
  status TEXT DEFAULT 'inactive',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view their own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert their own subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update their own subscription" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Recreate leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.id,
  p.user_id,
  p.display_name,
  p.bib_number,
  p.avatar_url,
  p.total_miles,
  (SELECT COUNT(*) FROM public.user_challenges uc WHERE uc.user_id = p.user_id AND uc.is_completed = true)::bigint AS challenges_completed
FROM public.profiles p;

-- Helper functions
CREATE OR REPLACE FUNCTION public.get_leaderboard_entries(p_since timestamp with time zone DEFAULT NULL)
RETURNS TABLE(user_id uuid, total_miles numeric) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT me.user_id, SUM(me.miles)::numeric as total_miles FROM public.mile_entries me WHERE (p_since IS NULL OR me.logged_at >= p_since) GROUP BY me.user_id HAVING SUM(me.miles) > 0; $$;

CREATE OR REPLACE FUNCTION public.get_weekly_consistency(p_week_start timestamp with time zone, p_user_ids uuid[])
RETURNS TABLE(user_id uuid, distinct_days bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT me.user_id, COUNT(DISTINCT me.logged_at::date)::bigint as distinct_days FROM public.mile_entries me WHERE me.logged_at >= p_week_start AND me.user_id = ANY(p_user_ids) GROUP BY me.user_id; $$;

CREATE OR REPLACE FUNCTION public.get_team_for_member(_team_id uuid, _challenge_id uuid)
RETURNS TABLE(id uuid, name text, invite_code text, created_by uuid, challenge_id uuid) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT t.id, t.name, t.invite_code, t.created_by, t.challenge_id FROM public.teams t JOIN public.team_members tm ON tm.team_id = t.id WHERE t.id = _team_id AND t.challenge_id = _challenge_id AND tm.user_id = auth.uid(); $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN INSERT INTO public.profiles (user_id, display_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name'); INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user'); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.generate_bib_number()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ DECLARE next_number INTEGER; BEGIN SELECT GREATEST(711, COALESCE(MAX(CAST(SUBSTRING(bib_number FROM 4) AS INTEGER)), 710) + 1) INTO next_number FROM public.profiles WHERE bib_number IS NOT NULL; NEW.bib_number := 'LF-' || LPAD(next_number::TEXT, 5, '0'); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN INSERT INTO public.referral_codes (user_id, code) VALUES (NEW.user_id, upper(substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 8))) ON CONFLICT (user_id) DO NOTHING; RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.check_referral_reward()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ DECLARE v_referrer_id uuid; v_redemption_count int; BEGIN SELECT rc.user_id INTO v_referrer_id FROM public.referral_codes rc WHERE rc.id = NEW.referral_code_id; SELECT count(*) INTO v_redemption_count FROM public.referral_redemptions rr WHERE rr.referral_code_id = NEW.referral_code_id; IF v_redemption_count > 0 AND (v_redemption_count % 3) = 0 THEN INSERT INTO public.reward_codes (user_id) VALUES (v_referrer_id); END IF; RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.validate_mile_entry()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ DECLARE daily_total numeric; hourly_count integer; max_single_entry numeric := 7; max_daily_aggregate numeric := 10.5; max_entries_per_hour integer := 5; BEGIN IF NEW.miles > max_single_entry THEN RAISE EXCEPTION 'Single entry cannot exceed % miles. You logged % miles.', max_single_entry, NEW.miles USING ERRCODE = 'check_violation'; END IF; SELECT COALESCE(SUM(miles), 0) INTO daily_total FROM public.mile_entries WHERE user_id = NEW.user_id AND challenge_id = NEW.challenge_id AND logged_at::date = now()::date; IF (daily_total + NEW.miles) > max_daily_aggregate THEN RAISE EXCEPTION 'Daily limit of % miles exceeded. You have already logged % miles today. Max remaining: % miles.', max_daily_aggregate, daily_total, GREATEST(0, max_daily_aggregate - daily_total) USING ERRCODE = 'check_violation'; END IF; SELECT count(*) INTO hourly_count FROM public.mile_entries WHERE user_id = NEW.user_id AND challenge_id = NEW.challenge_id AND logged_at > now() - interval '1 hour'; IF hourly_count >= max_entries_per_hour THEN RAISE EXCEPTION 'Rate limit reached. Maximum % entries per hour. Please wait before logging again.', max_entries_per_hour USING ERRCODE = 'check_violation'; END IF; RETURN NEW; END; $$;

CREATE OR REPLACE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE TRIGGER generate_bib_on_profile_insert BEFORE INSERT ON public.profiles FOR EACH ROW WHEN (NEW.bib_number IS NULL) EXECUTE FUNCTION public.generate_bib_number();

CREATE OR REPLACE TRIGGER on_profile_created_generate_referral AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

CREATE OR REPLACE TRIGGER on_referral_redeemed_check_reward AFTER INSERT ON public.referral_redemptions FOR EACH ROW EXECUTE FUNCTION public.check_referral_reward();

CREATE OR REPLACE TRIGGER validate_mile_entry_trigger BEFORE INSERT OR UPDATE ON public.mile_entries FOR EACH ROW EXECUTE FUNCTION public.validate_mile_entry();

CREATE OR REPLACE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_challenges_updated_at BEFORE UPDATE ON public.user_challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
