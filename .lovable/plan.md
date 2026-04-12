

## Switch Stripe from Test Mode to Live Mode

### What you need to do in Stripe Dashboard (your side)

1. **Toggle to Live mode** in your Stripe Dashboard (top-right switch)

2. **Create live-mode products and prices** that mirror your test ones:
   - Digital Collection — $12.99 one-time
   - Collector's Edition — $29.00 one-time
   - Collector's Edition Subscriber — $19.00 one-time
   - LegacyFit Digital Pass — $9.99/month recurring

3. **Copy each new live price ID** (they'll start with `price_` but be different from your test IDs)

4. **Get your live API keys:**
   - Go to Developers → API Keys (in live mode)
   - Copy your **Live Secret Key** (`sk_live_...`)

5. **Create a live webhook endpoint:**
   - Go to Developers → Webhooks (in live mode)
   - Add endpoint URL: `https://utfexhdncajccdpvquky.supabase.co/functions/v1/stripe-webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`, `invoice.payment_failed`
   - Copy the **Webhook Signing Secret** (`whsec_...`)

### What I will update in the codebase

Once you provide the live price IDs, I will:

1. **Update `STRIPE_SECRET_KEY`** — replace test key with your live secret key
2. **Update `STRIPE_WEBHOOK_SECRET`** — replace test webhook secret with your live webhook signing secret
3. **Update `supabase/functions/create-checkout/index.ts`** — replace all 4 test price IDs with the live ones

### Files changed

| File | Change |
|---|---|
| `supabase/functions/create-checkout/index.ts` | Replace 4 test-mode price IDs with live-mode price IDs |
| Secrets: `STRIPE_SECRET_KEY` | Replace with live secret key |
| Secrets: `STRIPE_WEBHOOK_SECRET` | Replace with live webhook signing secret |

### What I need from you

1. Your 4 live price IDs (one for each tier)
2. Confirmation to update the secret key (I'll prompt you securely)
3. Confirmation to update the webhook secret

No code logic changes are needed — the checkout, webhook, and verify-payment functions all work identically in live mode. Only the keys and price IDs change.

