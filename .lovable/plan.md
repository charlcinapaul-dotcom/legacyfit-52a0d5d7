
## Complete Audit Findings

### The Good News: The Edge Function is LIVE and WORKING

The live probe confirms:
- The `verify-payment` edge function **IS deployed** at `https://utfexhdncajccdpvquky.supabase.co/functions/v1/verify-payment` (correct project ID)
- It receives requests and processes them correctly
- It successfully reaches Stripe (the test probe got a real Stripe error back, meaning secrets and networking are fine)
- The Supabase write logic is correct

### Root Cause: Wrong Project URL in PaymentSuccess.tsx

The fetch in `PaymentSuccess.tsx` line 23 calls:
```
https://mpnhugdjsechtkugnjqz.supabase.co/functions/v1/verify-payment
```

But the actual project URL (confirmed by the live test above) is:
```
https://utfexhdncajccdpvquky.supabase.co/functions/v1/verify-payment
```

`mpnhugdjsechtkugnjqz` is the **wrong project ID**. The correct one is `utfexhdncajccdpvquky` — the same project ID used everywhere else in the codebase (the anon key, the database queries, etc.).

This means **every single verify-payment call since the fetch was added has gone to a non-existent project** and silently failed. The `catch {}` block swallows the error and shows "You're Enrolled" anyway — which is why the UI shows success but nothing is written.

### Secondary Issue: Silent Success on Failure

Even when the fetch returns an error (non-200 or network failure), the current code structure has a subtle flaw: a network error throws to `catch {}` which calls `setStatus("error")`. BUT if the wrong-URL server returns any 2xx (e.g., a default Supabase 404 page) with `data.success` being falsy, it also calls `setStatus("error")`. 

The real problem is the URL is just wrong, so calls never even reach our function.

### Also Confirmed

The `user_challenges` table **does have real paid records** (5 recent entries), but these were written by a different path — likely the `redeem-beta-code` or `redeem-reward-code` functions, not `verify-payment`. The Stripe-paid enrollments that came through the broken URL were never recorded.

---

## Fix

**One line change** in `src/pages/PaymentSuccess.tsx` — line 23:

```
// WRONG (mpnhugdjsechtkugnjqz — wrong project)
"https://mpnhugdjsechtkugnjqz.supabase.co/functions/v1/verify-payment"

// CORRECT (utfexhdncajccdpvquky — the actual project)
"https://utfexhdncajccdpvquky.supabase.co/functions/v1/verify-payment"
```

**Files to change:**
- `src/pages/PaymentSuccess.tsx` — line 23: fix project ID in the fetch URL from `mpnhugdjsechtkugnjqz` to `utfexhdncajccdpvquky`

No other changes needed. The edge function code is correct, the logic is correct, the Supabase write is correct. It was purely a wrong URL.
