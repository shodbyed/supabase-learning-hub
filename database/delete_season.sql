-- Delete a Season and All Related Data
-- This will cascade delete all related records (season_weeks, matches, etc.)
--
-- USAGE:
-- 1. Find your season ID by running:
--    SELECT id, season_name, league_id, start_date FROM seasons ORDER BY created_at DESC LIMIT 10;
--
-- 2. Replace 'YOUR_SEASON_ID_HERE' below with the actual season ID
-- 3. Run this script in Supabase SQL Editor

-- Step 1: View the season you're about to delete (safety check)
SELECT
  s.id,
  s.season_name,
  s.start_date,
  s.end_date,
  l.league_name,
  (SELECT COUNT(*) FROM season_weeks WHERE season_id = s.id) as week_count,
  (SELECT COUNT(*) FROM matches WHERE season_id = s.id) as match_count
FROM seasons s
LEFT JOIN leagues l ON s.league_id = l.id
WHERE s.id = 'YOUR_SEASON_ID_HERE';

-- Step 2: Delete the season (this will CASCADE delete all related records)
-- UNCOMMENT the line below after verifying the season above is correct:
-- DELETE FROM seasons WHERE id = 'YOUR_SEASON_ID_HERE';

-- Step 3: Verify deletion
-- UNCOMMENT after deletion to confirm:
-- SELECT COUNT(*) FROM seasons WHERE id = 'YOUR_SEASON_ID_HERE';
-- (Should return 0)
