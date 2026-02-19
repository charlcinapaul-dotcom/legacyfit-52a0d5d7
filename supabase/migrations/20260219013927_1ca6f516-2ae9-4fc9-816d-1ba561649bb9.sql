
-- 1. Add BEFORE UPDATE trigger for mile validation (reuses existing function)
CREATE TRIGGER validate_mile_entry_update_trigger
BEFORE UPDATE ON public.mile_entries
FOR EACH ROW
EXECUTE FUNCTION public.validate_mile_entry();

-- 2. Remove public beta code SELECT policy
DROP POLICY IF EXISTS "Anyone can view active beta codes" ON public.beta_codes;
