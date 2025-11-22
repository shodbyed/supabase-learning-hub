/**
 * @fileoverview Update Handicap Columns for 5v5 Percentage Support
 *
 * Changes handicap columns from DECIMAL(3,1) to DECIMAL(5,1) to support 5v5 percentage handicaps.
 *
 * 3v3 handicaps: Integer values from -2 to +2 (still fits in new column)
 * 5v5 handicaps: Percentage values from 0 to 100 (requires larger precision)
 *
 * DECIMAL(3,1) supports: -99.9 to 99.9 (not enough for 100.0)
 * DECIMAL(5,1) supports: -9999.9 to 9999.9 (plenty of room for 0-100 range)
 */

-- Update all player handicap columns to support 5v5 percentages
ALTER TABLE match_lineups
  ALTER COLUMN player1_handicap TYPE DECIMAL(5,1),
  ALTER COLUMN player2_handicap TYPE DECIMAL(5,1),
  ALTER COLUMN player3_handicap TYPE DECIMAL(5,1),
  ALTER COLUMN player4_handicap TYPE DECIMAL(5,1),
  ALTER COLUMN player5_handicap TYPE DECIMAL(5,1);

-- Update home_team_modifier as well (for consistency)
ALTER TABLE match_lineups
  ALTER COLUMN home_team_modifier TYPE DECIMAL(5,1);

-- Add check constraints to ensure valid ranges
-- 3v3: -2 to +2
-- 5v5: 0 to 100
-- We'll use a generous range to allow both formats
ALTER TABLE match_lineups
  DROP CONSTRAINT IF EXISTS player1_handicap_range,
  DROP CONSTRAINT IF EXISTS player2_handicap_range,
  DROP CONSTRAINT IF EXISTS player3_handicap_range,
  DROP CONSTRAINT IF EXISTS player4_handicap_range,
  DROP CONSTRAINT IF EXISTS player5_handicap_range;

ALTER TABLE match_lineups
  ADD CONSTRAINT player1_handicap_range CHECK (player1_handicap BETWEEN -10 AND 100),
  ADD CONSTRAINT player2_handicap_range CHECK (player2_handicap BETWEEN -10 AND 100),
  ADD CONSTRAINT player3_handicap_range CHECK (player3_handicap BETWEEN -10 AND 100),
  ADD CONSTRAINT player4_handicap_range CHECK (player4_handicap BETWEEN -10 AND 100),
  ADD CONSTRAINT player5_handicap_range CHECK (player5_handicap BETWEEN -10 AND 100);

COMMENT ON COLUMN match_lineups.player1_handicap IS
  'Player 1 handicap at lineup lock. 3v3: -2 to +2 integer. 5v5: 0-100 percentage.';
COMMENT ON COLUMN match_lineups.player2_handicap IS
  'Player 2 handicap at lineup lock. 3v3: -2 to +2 integer. 5v5: 0-100 percentage.';
COMMENT ON COLUMN match_lineups.player3_handicap IS
  'Player 3 handicap at lineup lock. 3v3: -2 to +2 integer. 5v5: 0-100 percentage.';
COMMENT ON COLUMN match_lineups.player4_handicap IS
  'Player 4 handicap at lineup lock (5v5 only). 0-100 percentage.';
COMMENT ON COLUMN match_lineups.player5_handicap IS
  'Player 5 handicap at lineup lock (5v5 only). 0-100 percentage.';
