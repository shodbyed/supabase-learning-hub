-- Allow substitute players in match lineups and games by removing foreign key constraints
-- This allows special substitute UUIDs (SUB_HOME_ID, SUB_AWAY_ID) to be stored
-- in player_id columns without requiring them to exist in the members table.
--
-- Substitutes are handled specially in the application:
-- - SUB_HOME_ID: 00000000-0000-0000-0000-000000000001
-- - SUB_AWAY_ID: 00000000-0000-0000-0000-000000000002

-- Drop foreign key constraints on match_lineups player columns
ALTER TABLE match_lineups DROP CONSTRAINT IF EXISTS match_lineups_player1_id_fkey;
ALTER TABLE match_lineups DROP CONSTRAINT IF EXISTS match_lineups_player2_id_fkey;
ALTER TABLE match_lineups DROP CONSTRAINT IF EXISTS match_lineups_player3_id_fkey;
ALTER TABLE match_lineups DROP CONSTRAINT IF EXISTS match_lineups_player4_id_fkey;
ALTER TABLE match_lineups DROP CONSTRAINT IF EXISTS match_lineups_player5_id_fkey;

-- Drop foreign key constraints on match_games player columns
ALTER TABLE match_games DROP CONSTRAINT IF EXISTS match_games_home_player_id_fkey;
ALTER TABLE match_games DROP CONSTRAINT IF EXISTS match_games_away_player_id_fkey;
ALTER TABLE match_games DROP CONSTRAINT IF EXISTS match_games_winner_player_id_fkey;

-- Note: Player IDs are still UUIDs and still nullable
-- Application code validates that player IDs are either:
-- 1. Valid member IDs from the members table, OR
-- 2. Special substitute UUIDs (SUB_HOME_ID or SUB_AWAY_ID)
