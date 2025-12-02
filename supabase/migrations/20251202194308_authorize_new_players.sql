-- Migration: Authorize New Players Feature
-- Description: Adds support for tracking player authorization status via starting handicaps
--
-- Changes:
-- 1. Members table: Change starting_handicap defaults from 0/40 to NULL
-- 2. Members table: Set existing default values to NULL (puts players in authorization queue)
-- 3. Preferences table: Add allow_unauthorized_players column

-- =============================================================================
-- MEMBERS TABLE: Change starting handicap defaults to NULL
-- =============================================================================
-- This allows us to distinguish between:
-- - NULL = "not yet reviewed/authorized by operator"
-- - 0/40 (or any value) = "intentionally set by operator"

-- Change default for starting_handicap_3v3 from 0 to NULL
ALTER TABLE members
ALTER COLUMN starting_handicap_3v3 DROP DEFAULT;

ALTER TABLE members
ALTER COLUMN starting_handicap_3v3 SET DEFAULT NULL;

-- Change default for starting_handicap_5v5 from 40 to NULL
ALTER TABLE members
ALTER COLUMN starting_handicap_5v5 DROP DEFAULT;

ALTER TABLE members
ALTER COLUMN starting_handicap_5v5 SET DEFAULT NULL;

-- Update column comments to reflect new behavior
COMMENT ON COLUMN members.starting_handicap_3v3 IS 'Starting handicap for 3v3 (5_man) format. NULL = not yet authorized. Used when player has < 15 games. Typically ranges from -2 to +2.';

COMMENT ON COLUMN members.starting_handicap_5v5 IS 'Starting handicap for 5v5 (8_man) format. NULL = not yet authorized. Used when player has < 15 games. Typically ranges from 0-100 (percentage).';

-- =============================================================================
-- MEMBERS TABLE: Set existing players with default values to NULL
-- =============================================================================
-- This puts all players who currently have the old default values (0 and 40)
-- into the "needs authorization" queue.
--
-- NOTE: If you want to preserve existing values and NOT require re-authorization,
-- comment out this UPDATE statement.

UPDATE members
SET starting_handicap_3v3 = NULL,
    starting_handicap_5v5 = NULL
WHERE starting_handicap_3v3 = 0
  AND starting_handicap_5v5 = 40;

-- =============================================================================
-- PREFERENCES TABLE: Add allow_unauthorized_players column
-- =============================================================================
-- This setting controls whether unauthorized players can be added to lineups.
-- Cascades: league preference → organization preference → system default (true)

ALTER TABLE preferences
ADD COLUMN allow_unauthorized_players BOOLEAN DEFAULT true;

COMMENT ON COLUMN preferences.allow_unauthorized_players IS 'When false, players must have their starting handicaps set (authorized) before they can be added to match lineups. Cascades: league → organization → system default (true).';
