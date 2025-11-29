/**
 * @fileoverview Increase Handicap Precision Migration
 *
 * Problem: match_lineups table has DECIMAL(3,1) for handicap columns, which only allows values up to 99.9
 * This causes numeric overflow errors when restoring data with handicap values of 100.0 or higher
 *
 * Solution: Increase precision to DECIMAL(5,1) to allow values up to 999.9
 * This is sufficient for all standard handicap systems (BCA goes up to 100, APA systems use different scales)
 *
 * Affected columns:
 * - player1_handicap through player5_handicap
 * - home_team_modifier (team bonus/penalty)
 *
 * Run this migration BEFORE restore_match_lineups.sql
 */

-- Increase precision for all player handicap columns
ALTER TABLE match_lineups
  ALTER COLUMN player1_handicap TYPE DECIMAL(5,1),
  ALTER COLUMN player2_handicap TYPE DECIMAL(5,1),
  ALTER COLUMN player3_handicap TYPE DECIMAL(5,1),
  ALTER COLUMN player4_handicap TYPE DECIMAL(5,1),
  ALTER COLUMN player5_handicap TYPE DECIMAL(5,1),
  ALTER COLUMN home_team_modifier TYPE DECIMAL(5,1);

-- Note: This change is backward compatible - all existing DECIMAL(3,1) values
-- will fit within DECIMAL(5,1) constraints with no data loss
