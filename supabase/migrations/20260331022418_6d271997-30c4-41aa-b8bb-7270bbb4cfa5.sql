CREATE TABLE public.shipping_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
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