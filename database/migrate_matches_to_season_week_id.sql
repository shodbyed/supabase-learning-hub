-- Migration: Convert matches table from round_number to season_week_id
-- This migrates the schema to use proper FK relationship to season_weeks table
-- instead of storing round numbers as plain integers

-- Step 1: Add the new season_week_id column (nullable temporarily)
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS season_week_id UUID REFERENCES season_weeks(id) ON DELETE CASCADE;

-- Step 2: Migrate existing data
-- Map round_number to season_week_id by matching to regular weeks in order
-- Only run if you have existing match data you want to preserve
UPDATE matches m
SET season_week_id = (
  SELECT sw.id
  FROM season_weeks sw
  WHERE sw.season_id = m.season_id
    AND sw.week_type = 'regular'
  ORDER BY sw.scheduled_date ASC
  LIMIT 1 OFFSET (m.round_number - 1)
)
WHERE season_week_id IS NULL;

-- Step 3: Make season_week_id NOT NULL now that data is migrated
ALTER TABLE matches
ALTER COLUMN season_week_id SET NOT NULL;

-- Step 4: Drop the old round_number column
ALTER TABLE matches
DROP COLUMN IF EXISTS round_number;

-- Step 5: Update indexes
DROP INDEX IF EXISTS idx_matches_round_number;
CREATE INDEX IF NOT EXISTS idx_matches_season_week_id ON matches(season_week_id);

-- Verification query - shows match count per week
SELECT
  sw.week_name,
  sw.week_type,
  COUNT(m.id) as match_count
FROM season_weeks sw
LEFT JOIN matches m ON m.season_week_id = sw.id
GROUP BY sw.id, sw.week_name, sw.week_type
ORDER BY sw.scheduled_date;
