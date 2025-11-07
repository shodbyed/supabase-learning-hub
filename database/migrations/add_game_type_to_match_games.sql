/**
 * @fileoverview Add game_type to match_games table
 *
 * RATIONALE: Denormalization for performance
 * - Handicap calculations query 200 games per player, multiple players per lineup
 * - Filtering by game_type through 3 joins (match_games → matches → seasons → leagues) is slow
 * - Adding game_type directly to match_games enables fast indexed lookups
 * - Data integrity risk is low: game_type is set once when game is created, never changes
 * - Storage cost is minimal: ~20 bytes per row
 *
 * BACKFILL STRATEGY:
 * - Sets game_type from league data for all existing games
 * - Makes column NOT NULL after backfill
 * - Adds CHECK constraint to ensure valid values
 * - Adds index for fast filtering
 *
 * Usage:
 * psql -h localhost -p 54322 -U postgres -d postgres -f database/migrations/add_game_type_to_match_games.sql
 */

-- Step 1: Add game_type column (nullable initially for backfill)
ALTER TABLE match_games
ADD COLUMN game_type VARCHAR(20);

-- Step 2: Backfill game_type from league data for all existing games
UPDATE match_games
SET game_type = leagues.game_type
FROM matches, seasons, leagues
WHERE match_games.match_id = matches.id
  AND matches.season_id = seasons.id
  AND seasons.league_id = leagues.id;

-- Step 3: Make column NOT NULL now that data is backfilled
ALTER TABLE match_games
ALTER COLUMN game_type SET NOT NULL;

-- Step 4: Add CHECK constraint to ensure valid values
ALTER TABLE match_games
ADD CONSTRAINT match_games_game_type_check
CHECK (game_type IN ('eight_ball', 'nine_ball', 'ten_ball'));

-- Step 5: Add index for fast filtering by game_type
CREATE INDEX idx_match_games_game_type ON match_games(game_type);

-- Step 6: Add composite index for common handicap query pattern
-- (player + game_type + created_at for optimal handicap calculation performance)
CREATE INDEX idx_match_games_player_game_type_created
ON match_games(home_player_id, game_type, created_at DESC)
WHERE winner_player_id IS NOT NULL;

CREATE INDEX idx_match_games_player_game_type_created_away
ON match_games(away_player_id, game_type, created_at DESC)
WHERE winner_player_id IS NOT NULL;

-- Step 7: Add comment documenting the field
COMMENT ON COLUMN match_games.game_type IS
  'Denormalized from league for performance. Game type (eight_ball, nine_ball, ten_ball) for fast filtering. Used heavily in handicap calculations to ensure 8-ball games do not count toward 9-ball handicaps.';

-- Verification query (optional - uncomment to run)
-- SELECT
--   game_type,
--   COUNT(*) as game_count,
--   COUNT(DISTINCT match_id) as match_count
-- FROM match_games
-- GROUP BY game_type
-- ORDER BY game_type;

COMMENT ON INDEX idx_match_games_game_type IS
  'Fast filtering by game type for handicap calculations and statistics';

COMMENT ON INDEX idx_match_games_player_game_type_created IS
  'Optimized index for handicap calculations - home player + game type + date ordering';

COMMENT ON INDEX idx_match_games_player_game_type_created_away IS
  'Optimized index for handicap calculations - away player + game type + date ordering';
