-- Add vacate_requested_by column to match_games
-- This preserves confirmation UUIDs when vacate is requested
-- Instead of clearing confirmations (losing data), we set this flag

ALTER TABLE match_games
ADD COLUMN vacate_requested_by VARCHAR(4) CHECK (vacate_requested_by IN ('home', 'away'));

-- Column is nullable - null means no vacate request pending
-- 'home' means home team requested vacate
-- 'away' means away team requested vacate

COMMENT ON COLUMN match_games.vacate_requested_by IS 'Indicates which team requested to vacate this game score. NULL = no request, ''home'' = home team requested, ''away'' = away team requested. Preserves original confirmation UUIDs during vacate request flow.';
