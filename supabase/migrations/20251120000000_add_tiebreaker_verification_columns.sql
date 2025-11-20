-- Add separate verification columns for tiebreaker results
-- This allows tracking both regular match verification AND tiebreaker verification separately

-- Add tiebreaker verification columns to matches table
ALTER TABLE matches
ADD COLUMN home_tiebreaker_verified_by uuid REFERENCES members(id),
ADD COLUMN away_tiebreaker_verified_by uuid REFERENCES members(id);

-- Add comments explaining the columns
COMMENT ON COLUMN matches.home_tiebreaker_verified_by IS 'Member who verified tiebreaker results for home team';
COMMENT ON COLUMN matches.away_tiebreaker_verified_by IS 'Member who verified tiebreaker results for away team';
