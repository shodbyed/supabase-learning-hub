-- Migration: Auto-delete match lineups on match delete
-- Purpose: Automatically delete lineup records for both home and away teams
--          when a match is deleted. This ensures orphaned lineup records
--          don't remain in the database after match deletion.
-- Date: 2025-11-15

-- Create function to auto-delete lineups when a match is deleted
CREATE OR REPLACE FUNCTION auto_delete_match_lineups()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete home team lineup if it exists
  IF OLD.home_lineup_id IS NOT NULL THEN
    DELETE FROM match_lineups WHERE id = OLD.home_lineup_id;
  END IF;

  -- Delete away team lineup if it exists
  IF OLD.away_lineup_id IS NOT NULL THEN
    DELETE FROM match_lineups WHERE id = OLD.away_lineup_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run before match delete
DROP TRIGGER IF EXISTS trigger_auto_delete_match_lineups ON matches;
CREATE TRIGGER trigger_auto_delete_match_lineups
  BEFORE DELETE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION auto_delete_match_lineups();

-- Add comment explaining the trigger
COMMENT ON FUNCTION auto_delete_match_lineups() IS
'Automatically deletes lineup records for both home and away teams when a match is deleted. This prevents orphaned lineup records and maintains referential integrity.';
