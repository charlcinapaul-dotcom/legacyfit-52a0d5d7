
## Root Cause

The STRIPE_SECRET_KEY in Supabase Secrets is still a live key (sk_live_...). The Stripe dashboard "Test mode" toggle only switches what you *see* in the dashboard UI — it does NOT change what secret key the edge function uses.

The edge function logs show the function is booting and running fine, confirming the issue is purely the wrong secret key value.

No code changes are needed. The fix is to update the STRIPE_SECRET_KEY value to the test key (sk_test_...) via the Lovable Stripe connector tool.

## Fix Plan

1. Use the `stripe--update_stripe_secret_key` tool to update the stored STRIPE_SECRET_KEY to the test secret key (`sk_test_51Sw5yS3JzkAB6gcF...` — visible in the Stripe dashboard under Developers > API Keys in test mode)
2. Redeploy both `create-checkout` and `verify-payment` edge functions so they pick up the new key value
3. No frontend or code changes required

## Answer to User's Question

No — Lovable does NOT need to be unpublished to test payments. The preview URL and the published URL both call the same edge functions with the same secrets. The fix is entirely on the secret key value.

## To Proceed

I need the user to share their **test secret key** (`sk_test_...`) from the Stripe dashboard:
- Stripe Dashboard → toggle to "Test mode" → Developers → API keys → Secret key → Reveal

Or I can use the `stripe--update_stripe_secret_key` tool directly if it accepts the key automatically.
