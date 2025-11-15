-- Add unique constraint to match_lineups to prevent duplicate lineups for same team in same match
-- This ensures that only one lineup record exists per (match_id, team_id) combination
-- Prevents race conditions when multiple team members access the lineup page simultaneously

-- First, check if there are any duplicate records (cleanup if needed)
-- This query will show any duplicates that need to be resolved before adding the constraint
SELECT match_id, team_id, COUNT(*) as duplicate_count
FROM match_lineups
GROUP BY match_id, team_id
HAVING COUNT(*) > 1;

-- If duplicates exist, you'll need to manually delete the extras before running the constraint
-- Example: Keep the most recent one, delete older ones
-- DELETE FROM match_lineups WHERE id IN (
--   SELECT id FROM match_lineups
--   WHERE (match_id, team_id) IN (SELECT match_id, team_id FROM match_lineups GROUP BY match_id, team_id HAVING COUNT(*) > 1)
--   AND id NOT IN (
--     SELECT DISTINCT ON (match_id, team_id) id
--     FROM match_lineups
--     ORDER BY match_id, team_id, locked_at DESC NULLS LAST
--   )
-- );

-- Add unique constraint
-- This will prevent INSERT statements from creating duplicates
-- Use ON CONFLICT to handle race conditions gracefully
ALTER TABLE match_lineups
ADD CONSTRAINT match_lineups_match_team_unique UNIQUE (match_id, team_id);

-- Add index for performance (unique constraint creates this automatically, but being explicit)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_match_lineups_match_team ON match_lineups(match_id, team_id);

COMMENT ON CONSTRAINT match_lineups_match_team_unique ON match_lineups IS
'Ensures only one lineup record exists per team per match. Prevents duplicate lineups when multiple team members access the lineup page simultaneously.';
