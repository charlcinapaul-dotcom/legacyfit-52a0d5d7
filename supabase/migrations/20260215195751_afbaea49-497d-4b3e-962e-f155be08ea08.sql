
-- Add password column to teams table (simple text, not security-critical)
ALTER TABLE public.teams ADD COLUMN password text NOT NULL DEFAULT '';

-- Allow team members to view mile entries for their challenge teammates
-- (already have "Authenticated users can view all mile entries" so this is covered)

-- Allow authenticated users to read teams by invite_code for joining
-- Update existing SELECT policy to allow anyone authenticated to view teams
-- (already has "Anyone can view teams" policy)
