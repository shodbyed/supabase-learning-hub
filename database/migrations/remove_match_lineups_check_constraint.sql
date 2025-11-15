-- Remove the overly restrictive check constraint on match_lineups
--
-- The existing constraint required at least 2 of the 3 players to be filled in,
-- but this prevents creating empty lineup records that will be populated later.
--
-- This migration removes the constraint to allow empty lineups during initial creation.

ALTER TABLE public.match_lineups DROP CONSTRAINT IF EXISTS match_lineups_check;

-- Note: The constraint was checking that at most 1 player could be NULL,
-- which meant you needed at least 2 players filled in. This was too restrictive
-- for the lineup creation workflow where we create an empty record first.
