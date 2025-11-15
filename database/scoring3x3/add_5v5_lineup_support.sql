-- Add support for 5v5 lineups in match_lineups table
-- For 5-man teams (3v3 format): Only player1-3 are used
-- For 8-man teams (5v5 format): All player1-5 are used

-- Rename team_handicap to home_team_modifier for clarity
ALTER TABLE match_lineups
RENAME COLUMN team_handicap TO home_team_modifier;

-- Update comment for renamed column
COMMENT ON COLUMN match_lineups.home_team_modifier IS 'Home team standings modifier (bonus/penalty based on season record)';

-- Add player4 and player5 columns
ALTER TABLE match_lineups
ADD COLUMN player4_id UUID REFERENCES members(id),
ADD COLUMN player4_handicap DECIMAL(3,1),
ADD COLUMN player5_id UUID REFERENCES members(id),
ADD COLUMN player5_handicap DECIMAL(3,1);

-- Add helpful comments
COMMENT ON COLUMN match_lineups.player4_id IS 'Fourth player ID (used for 5v5 matches in 8-man team format)';
COMMENT ON COLUMN match_lineups.player4_handicap IS 'Fourth player handicap at time of lineup lock (used for 5v5 matches)';
COMMENT ON COLUMN match_lineups.player5_id IS 'Fifth player ID (used for 5v5 matches in 8-man team format)';
COMMENT ON COLUMN match_lineups.player5_handicap IS 'Fifth player handicap at time of lineup lock (used for 5v5 matches)';

-- Note: Match format is determined by league.team_format field:
-- '5_man' = 3v3 matches (uses player1-3)
-- '8_man' = 5v5 matches (uses player1-5)
