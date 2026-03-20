-- Remove SELECT access from the unauthenticated (anon) role.
-- The anon key maps to the 'anon' pg role, so this blocks
-- any direct query from an unauthenticated Supabase client.
REVOKE SELECT ON public.leaderboard FROM anon;

-- Explicitly ensure the authenticated role retains read access.
GRANT SELECT ON public.leaderboard TO authenticated;