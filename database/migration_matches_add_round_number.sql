-- =====================================================
-- MIGRATION: Add round_number to matches table
-- =====================================================
-- This migration changes how matches link to weeks:
--
-- BEFORE: matches.season_week_id → season_weeks.id
--   Problem: Inserting blackout weeks breaks all references
--
-- AFTER: matches.round_number (1, 2, 3...)
--   Solution: Matches just track round number, dynamically
--   linked to season_weeks at display time
--
-- Benefits:
-- - Can insert/remove blackout weeks without touching matches
-- - Round number never changes (it's just the sequence)
-- - Dynamic linking: "5th regular week" maps to "round 5 matches"
-- =====================================================

-- Step 1: Add round_number column (nullable for now, will populate below)
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS round_number INTEGER;

-- Step 2: Populate round_number from existing data
-- This finds which round each match belongs to by counting
-- preceding regular weeks
UPDATE public.matches m
SET round_number = (
  SELECT COUNT(*)
  FROM public.season_weeks sw
  WHERE sw.season_id = m.season_id
    AND sw.week_type = 'regular'
    AND sw.scheduled_date <= (
      SELECT scheduled_date
      FROM public.season_weeks
      WHERE id = m.season_week_id
    )
)
WHERE m.round_number IS NULL;

-- Step 3: Make round_number NOT NULL now that it's populated
ALTER TABLE public.matches
ALTER COLUMN round_number SET NOT NULL;

-- Step 4: Drop the old season_week_id foreign key constraint
ALTER TABLE public.matches
DROP CONSTRAINT IF EXISTS matches_season_week_id_fkey;

-- Step 5: Drop the season_week_id column
ALTER TABLE public.matches
DROP COLUMN IF EXISTS season_week_id;

-- Step 6: Drop the old index on season_week_id
DROP INDEX IF EXISTS idx_matches_season_week_id;

-- Step 7: Create new index on round_number for fast queries
CREATE INDEX IF NOT EXISTS idx_matches_round_number
ON public.matches(season_id, round_number);

-- Step 8: Update the comment on match_number column for clarity
COMMENT ON COLUMN public.matches.match_number IS 'Order of match within the round (1, 2, 3...) - used for table assignments at venue';

-- Step 9: Add comment on new round_number column
COMMENT ON COLUMN public.matches.round_number IS 'Which round of round-robin schedule (1, 2, 3...) - dynamically links to Nth regular week in season_weeks';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these after migration to verify data integrity:

-- 1. Check all matches have round_number
-- SELECT COUNT(*) as matches_without_round_number
-- FROM public.matches
-- WHERE round_number IS NULL;
-- Expected: 0

-- 2. Check round_number distribution
-- SELECT season_id, round_number, COUNT(*) as match_count
-- FROM public.matches
-- GROUP BY season_id, round_number
-- ORDER BY season_id, round_number;
-- Expected: Even distribution based on team count

-- 3. Verify no orphaned matches
-- SELECT COUNT(*)
-- FROM public.matches m
-- WHERE NOT EXISTS (
--   SELECT 1 FROM public.seasons s WHERE s.id = m.season_id
-- );
-- Expected: 0
