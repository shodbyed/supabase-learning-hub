-- Post Nov 5th Schema Updates
-- Combines all schema changes made between Nov 5th and Nov 11th
-- These were previously run as individual SQL files

-- ============================================================================
-- Nov 7: Add game_type column to match_games (for performance)
-- ============================================================================

ALTER TABLE match_games
ADD COLUMN IF NOT EXISTS game_type VARCHAR(20);

-- Backfill game_type from league data
UPDATE match_games
SET game_type = leagues.game_type
FROM matches, seasons, leagues
WHERE match_games.match_id = matches.id
  AND matches.season_id = seasons.id
  AND seasons.league_id = leagues.id
  AND match_games.game_type IS NULL;

-- Make column NOT NULL
ALTER TABLE match_games
ALTER COLUMN game_type SET NOT NULL;

-- Add CHECK constraint
ALTER TABLE match_games
DROP CONSTRAINT IF EXISTS match_games_game_type_check;

ALTER TABLE match_games
ADD CONSTRAINT match_games_game_type_check
CHECK (game_type IN ('eight_ball', 'nine_ball', 'ten_ball'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_match_games_game_type
ON match_games(game_type);

CREATE INDEX IF NOT EXISTS idx_match_games_player_game_type_created
ON match_games(home_player_id, game_type, created_at DESC)
WHERE winner_player_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_match_games_player_game_type_created_away
ON match_games(away_player_id, game_type, created_at DESC)
WHERE winner_player_id IS NOT NULL;

COMMENT ON COLUMN match_games.game_type IS
  'Denormalized from league for performance. Game type (eight_ball, nine_ball, ten_ball) for fast filtering.';


-- ============================================================================
-- Nov 8: Add match verification columns
-- ============================================================================

ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS home_team_verified_by UUID REFERENCES public.members(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS away_team_verified_by UUID REFERENCES public.members(id) ON DELETE SET NULL;

-- Update match_status constraint
ALTER TABLE public.matches
DROP CONSTRAINT IF EXISTS matches_status_check;

ALTER TABLE public.matches
ADD CONSTRAINT matches_status_check
CHECK (status IN ('scheduled', 'in_progress', 'awaiting_verification', 'completed', 'forfeited', 'postponed'));

COMMENT ON COLUMN public.matches.home_team_verified_by IS 'Member ID of home team player who verified final scores';
COMMENT ON COLUMN public.matches.away_team_verified_by IS 'Member ID of away team player who verified final scores';


-- ============================================================================
-- Nov 8: Enable realtime for matches table
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  END IF;
END $$;


-- ============================================================================
-- Nov 10: Change game confirmations from boolean to member IDs
-- ============================================================================

-- Add new UUID columns
ALTER TABLE match_games
ADD COLUMN IF NOT EXISTS confirmed_by_home_member UUID REFERENCES members(id),
ADD COLUMN IF NOT EXISTS confirmed_by_away_member UUID REFERENCES members(id);

-- Drop old boolean columns (only if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='match_games' AND column_name='confirmed_by_home'
             AND data_type='boolean') THEN
    ALTER TABLE match_games DROP COLUMN confirmed_by_home;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='match_games' AND column_name='confirmed_by_away'
             AND data_type='boolean') THEN
    ALTER TABLE match_games DROP COLUMN confirmed_by_away;
  END IF;
END $$;

-- Rename new columns
ALTER TABLE match_games
RENAME COLUMN confirmed_by_home_member TO confirmed_by_home;

ALTER TABLE match_games
RENAME COLUMN confirmed_by_away_member TO confirmed_by_away;

COMMENT ON COLUMN match_games.confirmed_by_home IS 'Member ID who confirmed this game result for home team';
COMMENT ON COLUMN match_games.confirmed_by_away IS 'Member ID who confirmed this game result for away team';

-- Add games_to_lose columns to matches
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS home_games_to_lose INTEGER,
ADD COLUMN IF NOT EXISTS away_games_to_lose INTEGER;

COMMENT ON COLUMN matches.home_games_to_lose IS 'Number of games home team needs to lose the match (based on handicap thresholds)';
COMMENT ON COLUMN matches.away_games_to_lose IS 'Number of games away team needs to lose the match (based on handicap thresholds)';


-- ============================================================================
-- Nov 10: Add 5v5 lineup support
-- ============================================================================

-- Rename team_handicap to home_team_modifier (if it exists with old name)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='match_lineups' AND column_name='team_handicap') THEN
    ALTER TABLE match_lineups RENAME COLUMN team_handicap TO home_team_modifier;
  END IF;
END $$;

COMMENT ON COLUMN match_lineups.home_team_modifier IS 'Home team standings modifier (bonus/penalty based on season record)';

-- Add player4 and player5 columns
ALTER TABLE match_lineups
ADD COLUMN IF NOT EXISTS player4_id UUID REFERENCES members(id),
ADD COLUMN IF NOT EXISTS player4_handicap DECIMAL(3,1),
ADD COLUMN IF NOT EXISTS player5_id UUID REFERENCES members(id),
ADD COLUMN IF NOT EXISTS player5_handicap DECIMAL(3,1);

COMMENT ON COLUMN match_lineups.player4_id IS 'Fourth player ID (used for 5v5 matches in 8-man team format)';
COMMENT ON COLUMN match_lineups.player4_handicap IS 'Fourth player handicap at time of lineup lock (used for 5v5 matches)';
COMMENT ON COLUMN match_lineups.player5_id IS 'Fifth player ID (used for 5v5 matches in 8-man team format)';
COMMENT ON COLUMN match_lineups.player5_handicap IS 'Fifth player handicap at time of lineup lock (used for 5v5 matches)';
