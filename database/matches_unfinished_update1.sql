-- =====================================================
-- MIGRATION: matches_unfinished → matches_complete
-- Update 1: Add round_number, remove season_week_id
-- =====================================================
-- Purpose: Change how matches link to weeks from direct FK
-- to dynamic round-based linking
--
-- BEFORE: matches.season_week_id → season_weeks.id
-- AFTER: matches.round_number (integer 1, 2, 3...)
--
-- This allows inserting/removing blackout weeks without
-- breaking match references
-- =====================================================

-- Step 1: Add round_number column (nullable initially)
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS round_number INTEGER;

-- Step 2: Populate round_number from existing season_week_id
-- Count how many regular weeks come before this match's week
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

-- Step 3: Make round_number NOT NULL (now that it's populated)
ALTER TABLE public.matches
ALTER COLUMN round_number SET NOT NULL;

-- Step 4: Drop the old foreign key constraint
ALTER TABLE public.matches
DROP CONSTRAINT IF EXISTS matches_season_week_id_fkey;

-- Step 5: Drop the season_week_id column
ALTER TABLE public.matches
DROP COLUMN IF EXISTS season_week_id;

-- Step 6: Drop the old index
DROP INDEX IF EXISTS idx_matches_season_week_id;

-- Step 7: Create new composite index for fast queries
CREATE INDEX IF NOT EXISTS idx_matches_round_number
ON public.matches(season_id, round_number);

-- Step 8: Update comments
COMMENT ON COLUMN public.matches.round_number IS 'Which round of round-robin schedule (1, 2, 3...) - dynamically links to Nth regular week in season_weeks';
COMMENT ON COLUMN public.matches.match_number IS 'Order of match within the round (1, 2, 3...) - used for table assignments at venue';

-- =====================================================
-- VERIFICATION (Run these queries after migration)
-- =====================================================

-- Check all matches have round_number
-- SELECT COUNT(*) as missing_round_number FROM public.matches WHERE round_number IS NULL;
-- Expected: 0

-- Check round distribution makes sense
-- SELECT season_id, MIN(round_number) as first_round, MAX(round_number) as last_round, COUNT(*) as total_matches
-- FROM public.matches
-- GROUP BY season_id;

-- Verify no orphaned matches
-- SELECT COUNT(*) FROM public.matches m
-- WHERE NOT EXISTS (SELECT 1 FROM public.seasons s WHERE s.id = m.season_id);
-- Expected: 0

-- =====================================================
-- ROLLBACK (if needed - DO NOT RUN unless rolling back)
-- =====================================================

-- To rollback this migration:
-- ALTER TABLE public.matches ADD COLUMN season_week_id UUID REFERENCES public.season_weeks(id) ON DELETE CASCADE;
-- -- Then manually populate season_week_id from round_number
-- ALTER TABLE public.matches DROP COLUMN round_number;
