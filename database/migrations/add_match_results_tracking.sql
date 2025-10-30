-- Add match results tracking to matches table
-- This supports live scoring, standings calculation, and live scoreboard displays

-- Add lineup references
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS home_lineup_id UUID REFERENCES match_lineups(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS away_lineup_id UUID REFERENCES match_lineups(id) ON DELETE SET NULL;

COMMENT ON COLUMN matches.home_lineup_id IS 'Lineup used by home team for this match (set at lineup lock)';
COMMENT ON COLUMN matches.away_lineup_id IS 'Lineup used by away team for this match (set at lineup lock)';

-- Add match thresholds (calculated at lineup lock based on handicaps)
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS home_games_to_win INTEGER,
ADD COLUMN IF NOT EXISTS away_games_to_win INTEGER,
ADD COLUMN IF NOT EXISTS home_games_to_tie INTEGER,
ADD COLUMN IF NOT EXISTS away_games_to_tie INTEGER;

COMMENT ON COLUMN matches.home_games_to_win IS 'Number of games home team needs to win the match (from handicap chart)';
COMMENT ON COLUMN matches.away_games_to_win IS 'Number of games away team needs to win the match (from handicap chart)';
COMMENT ON COLUMN matches.home_games_to_tie IS 'Number of games home team needs to tie the match (null if ties not allowed)';
COMMENT ON COLUMN matches.away_games_to_tie IS 'Number of games away team needs to tie the match (null if ties not allowed)';

-- Add live match state (updated after each confirmed game)
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS home_games_won INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS away_games_won INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS home_points_earned INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS away_points_earned INTEGER DEFAULT 0 NOT NULL;

COMMENT ON COLUMN matches.home_games_won IS 'Current count of games won by home team (updated live during match)';
COMMENT ON COLUMN matches.away_games_won IS 'Current count of games won by away team (updated live during match)';
COMMENT ON COLUMN matches.home_points_earned IS 'Points earned by home team (games won beyond games_to_win threshold)';
COMMENT ON COLUMN matches.away_points_earned IS 'Points earned by away team (games won beyond games_to_win threshold)';

-- Add match outcome (set when match completes)
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS match_result TEXT CHECK (match_result IN ('home_win', 'away_win', 'tie'));

COMMENT ON COLUMN matches.winner_team_id IS 'Team that won the match (null if tie or not completed)';
COMMENT ON COLUMN matches.match_result IS 'Final result: home_win, away_win, or tie (set when match completes)';

-- Note: Using existing 'status' column for match status tracking
-- Values: 'scheduled' (not started), 'in_progress' (first game scored), 'completed' (reached win threshold)

-- Add timestamps
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

COMMENT ON COLUMN matches.started_at IS 'Timestamp when first game was scored';
COMMENT ON COLUMN matches.completed_at IS 'Timestamp when match was completed (team reached games_to_win)';

-- Create index for live scoreboard queries (find all in-progress matches in a season/week)
CREATE INDEX IF NOT EXISTS idx_matches_status_season_week ON matches(status, season_id, season_week_id)
WHERE status IN ('in_progress', 'scheduled');

-- Create index for standings queries (find all completed matches in a season)
CREATE INDEX IF NOT EXISTS idx_matches_completed_season ON matches(season_id, status)
WHERE status = 'completed';
