/**
 * @fileoverview Add Position Tracking to Match Games
 *
 * Adds lineup position tracking to match_games table to support 5v5 double duty players.
 * When a player appears in multiple positions (chosen by opponent for double duty),
 * their games in each position are tracked separately for handicap calculations.
 *
 * This ensures handicap calculations count games by position, not by player ID,
 * preventing double-counting when the same player appears twice in a lineup.
 *
 * Example: Player A is in position 1 and position 3 (double duty)
 * - Games 1-6: home_position=1, home_player_id=Player A
 * - Games 13-18: home_position=3, home_player_id=Player A
 * - Handicap calculation can now properly distinguish these games
 */

-- Add position columns to track which lineup position each player is playing from
ALTER TABLE match_games
  ADD COLUMN IF NOT EXISTS home_position INTEGER CHECK (home_position BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS away_position INTEGER CHECK (away_position BETWEEN 1 AND 5);

-- Add indexes for position-based queries (used in handicap calculations)
CREATE INDEX IF NOT EXISTS idx_match_games_home_position_player
  ON match_games(home_position, home_player_id, game_type, created_at DESC)
  WHERE winner_player_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_match_games_away_position_player
  ON match_games(away_position, away_player_id, game_type, created_at DESC)
  WHERE winner_player_id IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN match_games.home_position IS
  'Lineup position (1-5) for home player. Used to differentiate games when same player appears in multiple positions (5v5 double duty).';

COMMENT ON COLUMN match_games.away_position IS
  'Lineup position (1-5) for away player. Used to differentiate games when same player appears in multiple positions (5v5 double duty).';
