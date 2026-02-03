-- Update the bib number generation function to start at 711
CREATE OR REPLACE FUNCTION public.generate_bib_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT GREATEST(711, COALESCE(MAX(CAST(SUBSTRING(bib_number FROM 4) AS INTEGER)), 710) + 1)
  INTO next_number
  FROM public.profiles
  WHERE bib_number IS NOT NULL;
  
  NEW.bib_number := 'LF-' || LPAD(next_number::TEXT, 5, '0');
  RETURN NEW;
END;
$function$;