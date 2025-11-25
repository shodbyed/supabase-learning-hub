-- Migration: Add Starting Handicap Columns to Members Table
-- Date: 2025-01-24
-- Description: Adds starting_handicap_3v3 and starting_handicap_5v5 columns to allow
--              operators to set initial handicaps for players with limited game history.
--              These handicaps are used when a player has < 15 games in a league.

-- Add starting_handicap_3v3 column (for 5_man format leagues)
-- Default: 0 (standard starting handicap for 3v3)
-- Range: Typically -2 to +2, but allowing any decimal for flexibility
ALTER TABLE members
ADD COLUMN starting_handicap_3v3 DECIMAL DEFAULT 0;

-- Add starting_handicap_5v5 column (for 8_man format leagues)
-- Default: 40 (standard starting handicap percentage for 5v5)
-- Range: Typically 0-100, but allowing any decimal for flexibility
ALTER TABLE members
ADD COLUMN starting_handicap_5v5 DECIMAL DEFAULT 40;

-- Add comments for documentation
COMMENT ON COLUMN members.starting_handicap_3v3 IS
'Starting handicap for 3v3 (5_man) format. Used when player has < 15 games in a league. Typically ranges from -2 to +2. Default: 0';

COMMENT ON COLUMN members.starting_handicap_5v5 IS
'Starting handicap for 5v5 (8_man) format. Used when player has < 15 games in a league. Typically ranges from 0-100 (percentage). Default: 40';

-- Backfill existing members with default values (0 for 3v3, 40 for 5v5)
-- Note: This is redundant due to DEFAULT clause, but ensures consistency
UPDATE members
SET
  starting_handicap_3v3 = 0,
  starting_handicap_5v5 = 40
WHERE
  starting_handicap_3v3 IS NULL
  OR starting_handicap_5v5 IS NULL;

-- Verification: Check that all members have starting handicaps set
-- Expected result: All members should have starting_handicap_3v3 = 0 and starting_handicap_5v5 = 40
SELECT
  COUNT(*) as total_members,
  COUNT(starting_handicap_3v3) as members_with_3v3,
  COUNT(starting_handicap_5v5) as members_with_5v5,
  AVG(starting_handicap_3v3) as avg_3v3,
  AVG(starting_handicap_5v5) as avg_5v5
FROM members;
