-- Change game confirmation fields from boolean to member UUIDs
-- This allows us to track WHO confirmed each game, not just IF it was confirmed
-- Also add games_to_lose columns to matches table

-- PART 1: Update match_games table confirmations

-- Step 1: Add new columns with UUID type
ALTER TABLE match_games
ADD COLUMN confirmed_by_home_member UUID REFERENCES members(id),
ADD COLUMN confirmed_by_away_member UUID REFERENCES members(id);

-- Step 2: Migrate existing data
-- If confirmed_by_home is true, we can't know WHO confirmed it, so leave as NULL
-- Future confirmations will have the member ID

-- Step 3: Drop old boolean columns
ALTER TABLE match_games
DROP COLUMN confirmed_by_home,
DROP COLUMN confirmed_by_away;

-- Step 4: Rename new columns to match old names
ALTER TABLE match_games
RENAME COLUMN confirmed_by_home_member TO confirmed_by_home;

ALTER TABLE match_games
RENAME COLUMN confirmed_by_away_member TO confirmed_by_away;

-- Step 5: Add helpful comments
COMMENT ON COLUMN match_games.confirmed_by_home IS 'Member ID who confirmed this game result for home team';
COMMENT ON COLUMN match_games.confirmed_by_away IS 'Member ID who confirmed this game result for away team';

-- PART 2: Add games_to_lose columns to matches table

-- Add home_games_to_lose and away_games_to_lose columns
ALTER TABLE matches
ADD COLUMN home_games_to_lose INTEGER,
ADD COLUMN away_games_to_lose INTEGER;

-- Add helpful comments
COMMENT ON COLUMN matches.home_games_to_lose IS 'Number of games home team needs to lose the match (based on handicap thresholds)';
COMMENT ON COLUMN matches.away_games_to_lose IS 'Number of games away team needs to lose the match (based on handicap thresholds)';

-- Note: After running this migration, update TypeScript types:
-- match_games table:
--   confirmed_by_home: boolean -> confirmed_by_home: string | null
--   confirmed_by_away: boolean -> confirmed_by_away: string | null
-- matches table:
--   Add: home_games_to_lose: number | null
--   Add: away_games_to_lose: number | null
