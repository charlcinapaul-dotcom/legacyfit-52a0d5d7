CREATE POLICY "Admins can view all shipping orders"
  ON public.shipping_orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));