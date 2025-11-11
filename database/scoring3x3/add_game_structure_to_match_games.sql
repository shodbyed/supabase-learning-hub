-- Add game structure fields to match_games table
-- These fields store WHO plays WHO and WHO breaks/racks for each game
-- This creates a permanent, queryable record of the exact game structure

-- Add player position fields (which position from each team plays this game)
ALTER TABLE match_games
ADD COLUMN home_player_position INTEGER NOT NULL DEFAULT 1 CHECK (home_player_position BETWEEN 1 AND 5),
ADD COLUMN away_player_position INTEGER NOT NULL DEFAULT 1 CHECK (away_player_position BETWEEN 1 AND 5);

-- Add action fields (who breaks and who racks)
ALTER TABLE match_games
ADD COLUMN home_action VARCHAR(10) NOT NULL DEFAULT 'breaks' CHECK (home_action IN ('breaks', 'racks')),
ADD COLUMN away_action VARCHAR(10) NOT NULL DEFAULT 'racks' CHECK (away_action IN ('breaks', 'racks'));

-- Add helpful comments
COMMENT ON COLUMN match_games.home_player_position IS 'Which home team player position (1-5) plays this game';
COMMENT ON COLUMN match_games.away_player_position IS 'Which away team player position (1-5) plays this game';
COMMENT ON COLUMN match_games.home_action IS 'What home player does: breaks or racks';
COMMENT ON COLUMN match_games.away_action IS 'What away player does: breaks or racks';

-- Remove defaults after explaining them (we want explicit values on insert)
ALTER TABLE match_games
ALTER COLUMN home_player_position DROP DEFAULT,
ALTER COLUMN away_player_position DROP DEFAULT,
ALTER COLUMN home_action DROP DEFAULT,
ALTER COLUMN away_action DROP DEFAULT;

-- Note: These fields are populated when games are created during lineup lock
-- The game structure is determined by the league's game order rules
-- For 3v3: Uses player positions 1-3
-- For 5v5: Uses player positions 1-5
