-- Change home_points_earned and away_points_earned from integer to numeric(4,1)
-- This allows decimal points for BCA scoring (e.g., 1.5, 3.0, 4.1)
-- Safe to run - will preserve existing data

-- Step 1: Change column types (PostgreSQL will automatically cast integer values to numeric)
ALTER TABLE matches
  ALTER COLUMN home_points_earned TYPE numeric(4,1);

ALTER TABLE matches
  ALTER COLUMN away_points_earned TYPE numeric(4,1);

-- Step 2: Add comments explaining the change
COMMENT ON COLUMN matches.home_points_earned IS 'Points earned by home team. Uses numeric(4,1) to support BCA scoring with decimal values (e.g., 1.5 for 70% bonus)';
COMMENT ON COLUMN matches.away_points_earned IS 'Points earned by away team. Uses numeric(4,1) to support BCA scoring with decimal values (e.g., 1.5 for 70% bonus)';

-- Verify the change
SELECT
  column_name,
  data_type,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_name = 'matches'
  AND column_name IN ('home_points_earned', 'away_points_earned');
