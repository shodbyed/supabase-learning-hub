/**
 * @fileoverview Match Games Table
 *
 * Stores individual game results within a 3v3 match.
 * Tracks player matchups, winners, special achievements (B&R, golden breaks),
 * and confirmation status from both teams.
 *
 * Usage:
 * - Each match has 18 regular games + up to 3 tiebreaker games
 * - Games can be played out of order
 * - Both teams must confirm each game result
 * - Special achievements always tracked: B&R (break and run), golden break (8BB/9BB)
 * - Whether golden break counts as win depends on league.golden_break_counts_as_win
 *
 * Real-time usage:
 * - Subscribe to this table filtered by match_id to watch game updates
 * - When opponent scores/confirms a game, both teams see updates in real-time
 */

CREATE TABLE IF NOT EXISTS match_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  game_number INTEGER NOT NULL, -- 1-18 for regular, 19-21 for tiebreaker

  -- Players involved
  home_player_id UUID REFERENCES members(id) ON DELETE SET NULL,
  away_player_id UUID REFERENCES members(id) ON DELETE SET NULL,

  -- Game result
  winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  winner_player_id UUID REFERENCES members(id) ON DELETE SET NULL,

  -- Who breaks/racks (for display)
  home_action TEXT CHECK (home_action IN ('breaks', 'racks')) NOT NULL,
  away_action TEXT CHECK (away_action IN ('breaks', 'racks')) NOT NULL,

  -- Special achievements (ALWAYS tracked)
  break_and_run BOOLEAN DEFAULT false NOT NULL,  -- B&R: Player runs the table from break
  golden_break BOOLEAN DEFAULT false NOT NULL,   -- 8BB/9BB: Game ball sunk on break

  -- Confirmation tracking
  confirmed_by_home BOOLEAN DEFAULT false NOT NULL,
  confirmed_by_away BOOLEAN DEFAULT false NOT NULL,
  confirmed_at TIMESTAMPTZ,

  -- Game type (denormalized from league for performance)
  game_type VARCHAR(20) NOT NULL CHECK (game_type IN ('eight_ball', 'nine_ball', 'ten_ball')),
  is_tiebreaker BOOLEAN DEFAULT false NOT NULL,

  -- Audit timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Constraints
  UNIQUE(match_id, game_number),

  -- Can't have both B&R and golden break (golden break means no runout)
  CHECK (NOT (break_and_run = true AND golden_break = true))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_match_games_match_id ON match_games(match_id);
CREATE INDEX IF NOT EXISTS idx_match_games_winner_player ON match_games(winner_player_id);
CREATE INDEX IF NOT EXISTS idx_match_games_tiebreaker ON match_games(is_tiebreaker);
CREATE INDEX IF NOT EXISTS idx_match_games_game_type ON match_games(game_type);

-- Composite indexes for handicap calculation performance
-- (player + game_type + date ordering for optimal query performance)
CREATE INDEX IF NOT EXISTS idx_match_games_player_game_type_created
  ON match_games(home_player_id, game_type, created_at DESC)
  WHERE winner_player_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_match_games_player_game_type_created_away
  ON match_games(away_player_id, game_type, created_at DESC)
  WHERE winner_player_id IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN match_games.break_and_run IS
  'Break and Run (B&R): Player breaks and runs the entire table. Always tracked for statistics.';

COMMENT ON COLUMN match_games.golden_break IS
  '8BB/9BB: Game ball sunk on break. Whether this counts as a win depends on league.golden_break_counts_as_win setting.';

COMMENT ON COLUMN match_games.confirmed_by_home IS
  'True when home team has confirmed this game result. Both teams must confirm for game to be official.';

COMMENT ON COLUMN match_games.confirmed_by_away IS
  'True when away team has confirmed this game result. Both teams must confirm for game to be official.';

COMMENT ON COLUMN match_games.game_type IS
  'Denormalized from league for performance. Game type (eight_ball, nine_ball, ten_ball) enables fast filtering without joins. Used heavily in handicap calculations to ensure 8-ball games do not count toward 9-ball handicaps.';

-- Enable Row Level Security
ALTER TABLE match_games ENABLE ROW LEVEL SECURITY;

-- Policy: Players can view games for their own team's matches
CREATE POLICY "Players can view games for their matches"
  ON match_games
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      JOIN team_players tp ON tp.team_id IN (m.home_team_id, m.away_team_id)
      JOIN members mem ON mem.id = tp.member_id
      WHERE m.id = match_games.match_id
        AND mem.user_id = auth.uid()
    )
  );

-- Policy: Players can insert games for their own team's matches
CREATE POLICY "Players can insert games for their matches"
  ON match_games
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches m
      JOIN team_players tp ON tp.team_id IN (m.home_team_id, m.away_team_id)
      JOIN members mem ON mem.id = tp.member_id
      WHERE m.id = match_games.match_id
        AND mem.user_id = auth.uid()
    )
  );

-- Policy: Players can update games for their own team's matches
CREATE POLICY "Players can update games for their matches"
  ON match_games
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      JOIN team_players tp ON tp.team_id IN (m.home_team_id, m.away_team_id)
      JOIN members mem ON mem.id = tp.member_id
      WHERE m.id = match_games.match_id
        AND mem.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches m
      JOIN team_players tp ON tp.team_id IN (m.home_team_id, m.away_team_id)
      JOIN members mem ON mem.id = tp.member_id
      WHERE m.id = match_games.match_id
        AND mem.user_id = auth.uid()
    )
  );

-- Policy: Players can delete games for their own team's matches (for undo functionality)
CREATE POLICY "Players can delete games for their matches"
  ON match_games
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      JOIN team_players tp ON tp.team_id IN (m.home_team_id, m.away_team_id)
      JOIN members mem ON mem.id = tp.member_id
      WHERE m.id = match_games.match_id
        AND mem.user_id = auth.uid()
    )
  );
