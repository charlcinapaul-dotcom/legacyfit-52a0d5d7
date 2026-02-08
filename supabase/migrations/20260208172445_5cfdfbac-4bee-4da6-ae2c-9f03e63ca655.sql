-- Delete milestones for the umbrella edition challenges first (foreign key constraint)
DELETE FROM public.milestones 
WHERE challenge_id IN (
  SELECT id FROM public.challenges 
  WHERE slug IN ('womens-history-courage', 'womens-history-voice', 'womens-history-strength')
);

-- Delete the umbrella edition challenges
DELETE FROM public.challenges 
WHERE slug IN ('womens-history-courage', 'womens-history-voice', 'womens-history-strength');