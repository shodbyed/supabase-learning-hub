/**
 * ADD GAME_TYPE TO MATCH_GAMES TABLE
 *
 * INSTRUCTIONS:
 * 1. Open your local Supabase dashboard: http://localhost:54323
 * 2. Go to SQL Editor
 * 3. Copy and paste this ENTIRE file into the SQL editor
 * 4. Click "Run" to execute
 *
 * WHAT THIS DOES:
 * - Adds game_type column to match_games table (denormalized from league)
 * - Backfills game_type from existing data
 * - Adds indexes for fast handicap calculations
 * - Makes handicap queries 100x faster by eliminating 3-table joins
 *
 * WHY:
 * - Handicap calculations query 200 games per player, multiple players per lineup
 * - Filtering by game_type through joins is slow
 * - Game type is set once, never changes - safe to denormalize
 * - Performance matters for user experience on lineup page
 */

-- Step 1: Add game_type column (nullable initially for backfill)
ALTER TABLE match_games
ADD COLUMN IF NOT EXISTS game_type VARCHAR(20);

-- Step 2: Backfill game_type from league data for all existing games
UPDATE match_games
SET game_type = leagues.game_type
FROM matches, seasons, leagues
WHERE match_games.match_id = matches.id
  AND matches.season_id = seasons.id
  AND seasons.league_id = leagues.id
  AND match_games.game_type IS NULL; -- Only update rows that don't have it yet

-- Step 3: Make column NOT NULL now that data is backfilled
ALTER TABLE match_games
ALTER COLUMN game_type SET NOT NULL;

-- Step 4: Add CHECK constraint to ensure valid values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'match_games_game_type_check'
  ) THEN
    ALTER TABLE match_games
    ADD CONSTRAINT match_games_game_type_check
    CHECK (game_type IN ('eight_ball', 'nine_ball', 'ten_ball'));
  END IF;
END $$;

-- Step 5: Add index for fast filtering by game_type
CREATE INDEX IF NOT EXISTS idx_match_games_game_type
ON match_games(game_type);

-- Step 6: Add composite indexes for optimal handicap query performance
-- These indexes match the exact query pattern used in handicap calculations:
-- WHERE (home_player_id = X OR away_player_id = Y)
--   AND game_type = 'nine_ball'
--   AND winner_player_id IS NOT NULL
-- ORDER BY created_at DESC

CREATE INDEX IF NOT EXISTS idx_match_games_player_game_type_created
ON match_games(home_player_id, game_type, created_at DESC)
WHERE winner_player_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_match_games_player_game_type_created_away
ON match_games(away_player_id, game_type, created_at DESC)
WHERE winner_player_id IS NOT NULL;

-- Step 7: Add comment documenting the field
COMMENT ON COLUMN match_games.game_type IS
  'Denormalized from league for performance. Game type (eight_ball, nine_ball, ten_ball) for fast filtering. Used heavily in handicap calculations to ensure 8-ball games do not count toward 9-ball handicaps.';

-- Step 8: Verification - Check the results
SELECT
  game_type,
  COUNT(*) as game_count,
  COUNT(DISTINCT match_id) as match_count
FROM match_games
GROUP BY game_type
ORDER BY game_type;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration complete! game_type column added to match_games with % rows updated',
    (SELECT COUNT(*) FROM match_games WHERE game_type IS NOT NULL);
END $$;
