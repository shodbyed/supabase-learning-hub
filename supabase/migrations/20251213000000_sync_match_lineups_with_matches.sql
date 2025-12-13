-- Migration: Sync match_lineups with matches (INSERT and UPDATE)
-- Purpose:
--   1. Allow NULL team_id in match_lineups for playoff placeholder matches
--   2. Auto-create lineups on match INSERT (even with NULL teams)
--   3. Auto-update lineup team_ids when match teams are updated
-- Date: 2025-12-11
--
-- NOTE: This migration was manually applied to STAGING and PRODUCTION on 2025-12-11
-- via SQL Editor before being committed. New local instances will get it via db reset.
-- If running migrations on staging/production fails due to this already existing,
-- you can safely mark it as applied in supabase_migrations table.

-- Step 1: Allow NULL team_id in match_lineups table
-- This is needed for playoff placeholder matches where teams are TBD
ALTER TABLE match_lineups ALTER COLUMN team_id DROP NOT NULL;

-- Step 2: Update the auto-create function to handle NULL team_ids
CREATE OR REPLACE FUNCTION auto_create_match_lineups()
RETURNS TRIGGER AS $$
DECLARE
  home_lineup_uuid UUID;
  away_lineup_uuid UUID;
BEGIN
  -- Create home team lineup (team_id can be NULL for playoff placeholders)
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
    NEW.home_team_id,  -- Can be NULL for playoff TBD matches
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

  -- Create away team lineup (team_id can be NULL for playoff placeholders)
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
    NEW.away_team_id,  -- Can be NULL for playoff TBD matches
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

-- Step 3: Create function to sync lineup team_ids when match teams are updated
-- This handles the case where playoff matches get their teams assigned
CREATE OR REPLACE FUNCTION sync_match_lineups_on_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if team IDs have changed
  IF (OLD.home_team_id IS DISTINCT FROM NEW.home_team_id) OR
     (OLD.away_team_id IS DISTINCT FROM NEW.away_team_id) THEN

    -- Update home lineup's team_id if home_team changed
    IF OLD.home_team_id IS DISTINCT FROM NEW.home_team_id THEN
      UPDATE match_lineups
      SET team_id = NEW.home_team_id
      WHERE id = NEW.home_lineup_id;
    END IF;

    -- Update away lineup's team_id if away_team changed
    IF OLD.away_team_id IS DISTINCT FROM NEW.away_team_id THEN
      UPDATE match_lineups
      SET team_id = NEW.away_team_id
      WHERE id = NEW.away_lineup_id;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create the UPDATE trigger
DROP TRIGGER IF EXISTS trigger_sync_match_lineups_on_update ON matches;
CREATE TRIGGER trigger_sync_match_lineups_on_update
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION sync_match_lineups_on_update();

-- Add comments explaining the triggers
COMMENT ON FUNCTION auto_create_match_lineups() IS
'Automatically creates lineup records for both home and away teams when a new match is inserted. Supports NULL team_ids for playoff placeholder matches where teams are TBD.';

COMMENT ON FUNCTION sync_match_lineups_on_update() IS
'Automatically updates lineup team_ids when match home_team_id or away_team_id changes. This keeps lineups in sync when playoff matches get their teams assigned.';
