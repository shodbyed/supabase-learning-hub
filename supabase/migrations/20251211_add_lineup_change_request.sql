-- Migration: Add lineup change request fields to match_lineups
-- Purpose: Allow teams to request player swaps during a match, pending opponent approval
-- Similar pattern to vacate_requested_by on match_games
--
-- Minimal schema:
-- - swap_position: Which position (1-5) is being swapped. NULL = no pending request.
--   The old player is derived from lineup.player{N}_id at that position.
-- - swap_new_player_id: The replacement player's UUID
-- - swap_new_player_handicap: The replacement player's handicap
-- - swap_requested_at: Timestamp for auditing
--
-- Note: swap_new_player_name is NOT stored - the name is looked up from team roster at display time.
-- This avoids redundant data and ensures consistency with the source of truth.

-- Add columns for tracking lineup change requests
ALTER TABLE match_lineups
ADD COLUMN IF NOT EXISTS swap_position INTEGER CHECK (swap_position >= 1 AND swap_position <= 5),
ADD COLUMN IF NOT EXISTS swap_new_player_id UUID REFERENCES members(id),
ADD COLUMN IF NOT EXISTS swap_new_player_handicap NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS swap_requested_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN match_lineups.swap_position IS 'Position (1-5) being swapped. NULL if no pending request. Old player derived from player{N}_id.';
COMMENT ON COLUMN match_lineups.swap_new_player_id IS 'Player being swapped in.';
COMMENT ON COLUMN match_lineups.swap_new_player_handicap IS 'Handicap of the new player (cached at request time).';
COMMENT ON COLUMN match_lineups.swap_requested_at IS 'When the swap was requested.';

-- Create index for finding pending swap requests
CREATE INDEX IF NOT EXISTS idx_match_lineups_swap_requested
ON match_lineups(match_id)
WHERE swap_position IS NOT NULL;
