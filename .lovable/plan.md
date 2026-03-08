
## Problem

The two Stripe price IDs hardcoded in `create-checkout` have wrong amounts:

- `price_1T7Lkx3JzkAB6gcFE36jisal` → currently **$29.00** in Stripe, should be **$12.99** (Digital)
- `price_1T7LlN3JzkAB6gcFh30dV0Ex` → currently **$39.00** in Stripe, should be **$29.00** (Collector's Edition)

Stripe prices are immutable once created — their `unit_amount` cannot be changed. The only fix is to create two new prices at the correct amounts and swap the IDs in the edge function.

## Plan

### Step 1 — Create two new Stripe prices
- New Digital price: **$12.99** (1299 cents) on existing product `prod_U5WoBl6A79aAeo`
- New Collector's Edition price: **$29.00** (2900 cents) on existing product `prod_U5WpDfZGIetoV2`

### Step 2 — Update `create-checkout` edge function
Replace the two hardcoded price IDs in the `PRICE_IDS` map with the newly created ones:

```text
// Before
digital:       "price_1T7Lkx3JzkAB6gcFE36jisal"   ($29.00 — wrong)
boarding_pass: "price_1T7LlN3JzkAB6gcFh30dV0Ex"   ($39.00 — wrong)

// After
digital:       "<new_price_id>"   ($12.99 — correct)
boarding_pass: "<new_price_id>"   ($29.00 — correct)
```

No database changes, no UI changes, no other files touched. The app already displays the correct prices — only the Stripe checkout session needs to charge the right amounts.
