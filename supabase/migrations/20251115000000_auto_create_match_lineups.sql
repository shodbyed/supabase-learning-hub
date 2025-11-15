-- Migration: Auto-create match lineups on match insert
-- Purpose: Automatically create empty lineup records for both home and away teams
--          when a new match is created. This ensures real-time subscriptions have
--          records to watch and eliminates the need for client-side lineup creation logic.
-- Date: 2025-11-15

-- Create function to auto-create lineups for a new match
CREATE OR REPLACE FUNCTION auto_create_match_lineups()
RETURNS TRIGGER AS $$
DECLARE
  home_lineup_uuid UUID;
  away_lineup_uuid UUID;
BEGIN
  -- Create empty home team lineup
  INSERT INTO match_lineups (
    match_id,
    team_id,
    player1_id,
    player1_handicap,
    player2_id,
    player2_handicap,
    player3_id,
    player3_handicap,
    player4_id,
    player4_handicap,
    player5_id,
    player5_handicap,
    home_team_modifier,
    locked,
    locked_at
  ) VALUES (
    NEW.id,
    NEW.home_team_id,
    NULL,
    0,
    NULL,
    0,
    NULL,
    0,
    NULL,
    0,
    NULL,
    0,
    0,
    false,
    NULL
  ) RETURNING id INTO home_lineup_uuid;

  -- Create empty away team lineup
  INSERT INTO match_lineups (
    match_id,
    team_id,
    player1_id,
    player1_handicap,
    player2_id,
    player2_handicap,
    player3_id,
    player3_handicap,
    player4_id,
    player4_handicap,
    player5_id,
    player5_handicap,
    home_team_modifier,
    locked,
    locked_at
  ) VALUES (
    NEW.id,
    NEW.away_team_id,
    NULL,
    0,
    NULL,
    0,
    NULL,
    0,
    NULL,
    0,
    NULL,
    0,
    0,
    false,
    NULL
  ) RETURNING id INTO away_lineup_uuid;

  -- Update the match record with the lineup IDs
  UPDATE matches
  SET
    home_lineup_id = home_lineup_uuid,
    away_lineup_id = away_lineup_uuid
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run after match insert
DROP TRIGGER IF EXISTS trigger_auto_create_match_lineups ON matches;
CREATE TRIGGER trigger_auto_create_match_lineups
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_match_lineups();

-- Add comment explaining the trigger
COMMENT ON FUNCTION auto_create_match_lineups() IS
'Automatically creates empty lineup records for both home and away teams when a new match is inserted. This ensures real-time subscriptions have records to watch and eliminates client-side lineup creation logic.';
