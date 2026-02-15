
-- Table: referral_codes - each user gets one unique referral code
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral code"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referral code"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Table: referral_redemptions - tracks who signed up using whose code
CREATE TABLE public.referral_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id uuid NOT NULL REFERENCES public.referral_codes(id),
  referred_user_id uuid NOT NULL UNIQUE, -- each user can only be referred once
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_redemptions ENABLE ROW LEVEL SECURITY;

-- Referrers can see their own redemptions (via join to their code)
CREATE POLICY "Users can view redemptions of their own code"
  ON public.referral_redemptions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.referral_codes rc
    WHERE rc.id = referral_code_id AND rc.user_id = auth.uid()
  ));

-- The referred user inserts the redemption at signup
CREATE POLICY "Users can insert their own redemption"
  ON public.referral_redemptions FOR INSERT
  WITH CHECK (auth.uid() = referred_user_id);

-- Table: reward_codes - free challenge codes earned by referring 3 people
CREATE TABLE public.reward_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(8), 'hex'),
  is_redeemed boolean NOT NULL DEFAULT false,
  redeemed_at timestamptz,
  redeemed_for_challenge_id uuid REFERENCES public.challenges(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reward_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reward codes"
  ON public.reward_codes FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage reward codes
CREATE POLICY "Admins can manage reward codes"
  ON public.reward_codes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function: auto-generate referral code on profile creation
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.user_id, upper(substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 8)))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profile_created_generate_referral
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- Function: check if referrer has hit 3 redemptions and grant reward
CREATE OR REPLACE FUNCTION public.check_referral_reward()
RETURNS TRIGGER AS $$
DECLARE
  v_referrer_id uuid;
  v_redemption_count int;
  v_existing_rewards int;
BEGIN
  -- Get the referrer's user_id
  SELECT rc.user_id INTO v_referrer_id
  FROM public.referral_codes rc
  WHERE rc.id = NEW.referral_code_id;

  -- Count total redemptions for this referral code
  SELECT count(*) INTO v_redemption_count
  FROM public.referral_redemptions rr
  WHERE rr.referral_code_id = NEW.referral_code_id;

  -- Count existing rewards for this user
  SELECT count(*) INTO v_existing_rewards
  FROM public.reward_codes rw
  WHERE rw.user_id = v_referrer_id;

  -- Grant a reward for every 3 referrals
  IF v_redemption_count > 0 AND (v_redemption_count % 3) = 0 THEN
    INSERT INTO public.reward_codes (user_id)
    VALUES (v_referrer_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_referral_redeemed_check_reward
  AFTER INSERT ON public.referral_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_referral_reward();

-- Backfill referral codes for existing users
INSERT INTO public.referral_codes (user_id, code)
SELECT p.user_id, upper(substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 8))
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.referral_codes rc WHERE rc.user_id = p.user_id
);
