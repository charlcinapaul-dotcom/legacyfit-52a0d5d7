
-- 1. Unique constraint on payments so both verify-payment and stripe-webhook
--    can safely upsert without creating duplicate payment records.
ALTER TABLE public.payments
  ADD CONSTRAINT payments_stripe_checkout_session_id_key
  UNIQUE (stripe_checkout_session_id);

-- 2. Unique constraint on user_challenges(user_id, challenge_id) so a user
--    can never accidentally have two enrollment rows for the same challenge,
--    regardless of which path (verify-payment vs webhook) writes it first.
ALTER TABLE public.user_challenges
  ADD CONSTRAINT user_challenges_user_challenge_unique
  UNIQUE (user_id, challenge_id);
