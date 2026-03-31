

## Add Shipping Address Modal for Collector's Edition Checkout

### 1. Create `shipping_orders` table (database migration)

```sql
CREATE TABLE public.shipping_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  country text NOT NULL DEFAULT 'United States',
  stripe_session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own shipping orders"
  ON public.shipping_orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own shipping orders"
  ON public.shipping_orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
```

### 2. Update `ChallengePricing.tsx`

- Add `showAddressModal` state and address form state (`fullName`, `addressLine1`, `addressLine2`, `city`, `state`, `zipCode`, `country` defaulting to "United States").
- Import `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` from UI components, plus `Input` and `Label`.
- Change the Collector's Edition button `onClick`: instead of calling `handleCollectorCheckout`, set `showAddressModal = true` (after checking auth — move the auth check to a shared helper).
- Update `handleCheckout` to accept an optional `shippingOrderId` parameter, passed in the `body` to `create-checkout`.
- Add a `handleAddressSubmit` function: validates required fields, inserts into `shipping_orders`, then calls `handleCollectorCheckout` with the new record id, then closes the modal.
- Render a `<Dialog>` modal with the address form fields, "Continue to Payment" submit button (styled with `accent.primaryBtn`), and a Cancel button.

### 3. Update `create-checkout` Edge Function

- Accept optional `shippingOrderId` from the request body.
- Pass it as `shipping_order_id` in the Stripe session `metadata` object (for both subscription and one-time payment paths, though it will only be set for collector tiers).

### Files modified
| File | Change |
|---|---|
| Migration (new) | Create `shipping_orders` table with RLS |
| `src/components/ChallengePricing.tsx` | Add address modal, form state, validation, DB insert, pass `shippingOrderId` to checkout |
| `supabase/functions/create-checkout/index.ts` | Accept and forward `shippingOrderId` in Stripe metadata |

