
## Root Cause

The `create-checkout` edge function is working correctly and returning a valid Stripe URL every time. The network logs confirm `200` responses with valid `checkout.stripe.com` URLs.

The bug is in `ChallengePricing.tsx` line 117:
```ts
window.open(data.url, "_blank");  // ← BLOCKED by popup blocker
```

`window.open()` to a new tab is blocked by browsers when called after an `await` inside an async function, because the browser no longer considers it a direct user gesture. The user's click event context is lost during the async `supabase.functions.invoke()` call.

## Fix

Change line 117 in `src/components/ChallengePricing.tsx`:
```ts
// FROM:
window.open(data.url, "_blank");

// TO:
window.location.href = data.url;
```

This navigates the current tab to Stripe Checkout, which always works regardless of popup blockers. After payment, Stripe redirects back to `/payment-success?session_id=...` as configured in the edge function.

## Files to Change

- `src/components/ChallengePricing.tsx` — line 117 only
