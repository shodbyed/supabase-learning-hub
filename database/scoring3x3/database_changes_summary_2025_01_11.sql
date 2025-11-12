/**
 * Database Changes Summary - January 11, 2025
 *
 * This file documents all database schema changes made to support
 * "database as single source of truth" for game data and improved
 * lineup management with real-time subscriptions.
 *
 * DO NOT RUN THIS FILE - It's for documentation purposes only.
 * The actual migrations are in supabase/migrations/
 */

-- ============================================================================
-- CHANGE 1: Game Confirmation Tracking (Player IDs instead of Booleans)
-- ============================================================================
-- Migration: change_game_confirmations_to_member_ids.sql
-- Purpose: Track WHICH player confirmed each game result, not just true/false

ALTER TABLE match_games
ADD COLUMN confirmed_by_home_member UUID REFERENCES members(id),
ADD COLUMN confirmed_by_away_member UUID REFERENCES members(id);

ALTER TABLE match_games
DROP COLUMN confirmed_by_home,
DROP COLUMN confirmed_by_away;

ALTER TABLE match_games
RENAME COLUMN confirmed_by_home_member TO confirmed_by_home,
RENAME COLUMN confirmed_by_away_member TO confirmed_by_away;

-- Also adds games_to_lose columns to matches table for complete threshold tracking
ALTER TABLE matches
ADD COLUMN home_games_to_lose INTEGER,
ADD COLUMN away_games_to_lose INTEGER;


-- ============================================================================
-- CHANGE 2: Lineup IDs Saved to Matches
-- ============================================================================
-- Purpose: Track which lineup was used for each match
-- This was already in the schema but now being actively used

-- Columns used:
-- matches.home_lineup_id → References match_lineups(id)
-- matches.away_lineup_id → References match_lineups(id)


-- ============================================================================
-- CHANGE 3: Handicap Thresholds Saved to Matches
-- ============================================================================
-- Purpose: Store calculated thresholds in database instead of calculating "on the fly"
-- This was already in the schema but now being actively populated

-- Columns used:
-- matches.home_games_to_win
-- matches.home_games_to_tie
-- matches.home_games_to_lose (added above)
-- matches.away_games_to_win
-- matches.away_games_to_tie
-- matches.away_games_to_lose (added above)


-- ============================================================================
-- CHANGE 4: Match Lineups - 5v5 Support
-- ============================================================================
-- Migration: add_5v5_lineup_support.sql
-- Purpose: Extend match_lineups to support 5-player lineups (not just 3)

-- Rename team_handicap to home_team_modifier for clarity
ALTER TABLE match_lineups
RENAME COLUMN team_handicap TO home_team_modifier;

-- Add player4 and player5 columns for 5v5 format
ALTER TABLE match_lineups
ADD COLUMN player4_id UUID REFERENCES members(id),
ADD COLUMN player4_handicap DECIMAL(3,1),
ADD COLUMN player5_id UUID REFERENCES members(id),
ADD COLUMN player5_handicap DECIMAL(3,1);


-- ============================================================================
-- CHANGE 5: Match Lineups - Composite Unique Constraint
-- ============================================================================
-- Migration: supabase/migrations/20251111180437_add_unique_constraint_match_lineups.sql
-- Purpose: Ensure only ONE lineup record per team per match
--          Prevents race conditions when multiple team members access lineup page
--          Enables "create on mount" pattern for real-time subscriptions

ALTER TABLE match_lineups
ADD CONSTRAINT match_lineups_match_team_unique UNIQUE (match_id, team_id);

COMMENT ON CONSTRAINT match_lineups_match_team_unique ON match_lineups IS
'Composite unique constraint ensures only one lineup record exists per team per match. A match will have exactly 2 lineup records (one per team).';


-- ============================================================================
-- CHANGE 6: Match Games - Player IDs and Actions
-- ============================================================================
-- Purpose: Store complete game structure in database (not calculated "on the fly")
-- This was already in the schema but now being actively populated at lineup lock

-- Columns actively populated:
-- match_games.home_player_id → Actual player ID from home lineup (not null after lineup lock)
-- match_games.away_player_id → Actual player ID from away lineup (not null after lineup lock)
-- match_games.home_action → 'breaks' or 'racks' (from game order algorithm)
-- match_games.away_action → 'breaks' or 'racks' (from game order algorithm)

-- Game Creation Process:
-- When both lineups are locked, the HOME team creates all game rows:
-- - 18 games for 3v3 (double round-robin)
-- - 25 games for 5v5 (single round-robin)
-- Uses generateGameOrder() algorithm to determine player positions and break/rack order
-- Looks up actual player IDs from lineups based on positions


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify composite unique constraint exists
SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'match_lineups'::regclass
  AND conname = 'match_lineups_match_team_unique';

-- Check for duplicate lineups (should return 0 rows)
SELECT match_id, team_id, COUNT(*) as duplicate_count
FROM match_lineups
GROUP BY match_id, team_id
HAVING COUNT(*) > 1;

-- Verify match_games have player IDs populated (after lineup lock)
SELECT
    COUNT(*) as total_games,
    COUNT(home_player_id) as games_with_home_player,
    COUNT(away_player_id) as games_with_away_player,
    COUNT(home_action) as games_with_home_action,
    COUNT(away_action) as games_with_away_action
FROM match_games;

-- Verify handicap thresholds are being saved
SELECT
    COUNT(*) as total_matches,
    COUNT(home_games_to_win) as matches_with_home_thresholds,
    COUNT(away_games_to_win) as matches_with_away_thresholds,
    COUNT(home_lineup_id) as matches_with_home_lineup,
    COUNT(away_lineup_id) as matches_with_away_lineup
FROM matches;


-- ============================================================================
-- SUMMARY OF BEHAVIORAL CHANGES
-- ============================================================================

-- BEFORE:
-- - Game structure calculated "on the fly" using getAllGames()
-- - Handicap thresholds calculated during scoring
-- - Lineup records created only when user clicks "Lock Lineup"
-- - Real-time subscriptions watching rows that don't exist yet
-- - Confirmation tracking as boolean (no audit trail)

-- AFTER:
-- - All game structure stored in database at lineup lock
-- - Handicap thresholds calculated and saved at lineup lock
-- - Lineup records created immediately when page loads
-- - Real-time subscriptions watching existing rows
-- - Confirmation tracking stores player ID (full audit trail)
-- - Database is single source of truth for all game information
-- - No "on the fly" calculations displayed to users
-- - Scoring page reads everything from database

