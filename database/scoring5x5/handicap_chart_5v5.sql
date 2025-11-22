-- ============================================================================
-- BCA 5v5 (8-man) Handicap Chart
-- ============================================================================
-- This table stores the lookup chart for determining games needed to win
-- based on handicap difference in 5v5 matches (25 total games per match).
--
-- Handicap Calculation:
-- - Individual player handicap = Win Percentage (0-100%)
-- - Team handicap = Sum of all 5 active players' percentages
-- - Handicap difference = Higher team total - Lower team total
--
-- Usage:
-- - Higher handicap team looks up their wins needed using positive hcp_diff
-- - Lower handicap team looks up their wins needed using negative hcp_diff
--
-- Example:
-- Team A: 276 total, Team B: 260 total
-- Difference: 276 - 260 = 16 points
-- Team A (higher): hcp_diff = +16 → needs 14 wins
-- Team B (lower): hcp_diff = -16 → needs 12 wins
-- ============================================================================

BEGIN;

-- Create the table
CREATE TABLE IF NOT EXISTS public.handicap_chart_5v5 (
  hcp_diff integer PRIMARY KEY,
  games_to_win integer NOT NULL,
  games_to_tie integer,  -- Always NULL for 5v5 (odd number of games, no ties)
  games_to_lose integer NOT NULL,
  CONSTRAINT handicap_chart_5v5_hcp_diff_range CHECK (hcp_diff >= -500 AND hcp_diff <= 500)
);

-- Add table comment
COMMENT ON TABLE public.handicap_chart_5v5 IS 'BCA handicap chart for 5v5 (8-man) matches. 25 total games per match. No ties possible.';

-- Add column comments
COMMENT ON COLUMN public.handicap_chart_5v5.hcp_diff IS 'Handicap difference (positive = higher handicap team, negative = lower handicap team)';
COMMENT ON COLUMN public.handicap_chart_5v5.games_to_win IS 'Minimum games this team needs to win the match';
COMMENT ON COLUMN public.handicap_chart_5v5.games_to_tie IS 'Always NULL (no ties in 25-game format)';
COMMENT ON COLUMN public.handicap_chart_5v5.games_to_lose IS 'Maximum games this team can win and still lose the match';

-- Insert data for HIGHER handicap team (positive hcp_diff)
-- Based on BCA CHARTS table from BCA_HANDICAP_SYSTEM.md

-- Range: 0-14 points difference
INSERT INTO public.handicap_chart_5v5 (hcp_diff, games_to_win, games_to_tie, games_to_lose)
SELECT
  diff,
  13,  -- games to win
  NULL,  -- no ties
  12  -- games to lose
FROM generate_series(0, 14) AS diff;

-- Range: 15-40 points difference
INSERT INTO public.handicap_chart_5v5 (hcp_diff, games_to_win, games_to_tie, games_to_lose)
SELECT
  diff,
  14,  -- games to win
  NULL,  -- no ties
  11  -- games to lose
FROM generate_series(15, 40) AS diff;

-- Range: 41-66 points difference
INSERT INTO public.handicap_chart_5v5 (hcp_diff, games_to_win, games_to_tie, games_to_lose)
SELECT
  diff,
  15,  -- games to win
  NULL,  -- no ties
  10  -- games to lose
FROM generate_series(41, 66) AS diff;

-- Range: 67-92 points difference
INSERT INTO public.handicap_chart_5v5 (hcp_diff, games_to_win, games_to_tie, games_to_lose)
SELECT
  diff,
  16,  -- games to win
  NULL,  -- no ties
  9  -- games to lose
FROM generate_series(67, 92) AS diff;

-- Range: 93-118 points difference
INSERT INTO public.handicap_chart_5v5 (hcp_diff, games_to_win, games_to_tie, games_to_lose)
SELECT
  diff,
  17,  -- games to win
  NULL,  -- no ties
  8  -- games to lose
FROM generate_series(93, 118) AS diff;

-- Range: 119-144 points difference
INSERT INTO public.handicap_chart_5v5 (hcp_diff, games_to_win, games_to_tie, games_to_lose)
SELECT
  diff,
  18,  -- games to win
  NULL,  -- no ties
  7  -- games to lose
FROM generate_series(119, 144) AS diff;

-- Range: 145-500 points difference (capped at 145+)
INSERT INTO public.handicap_chart_5v5 (hcp_diff, games_to_win, games_to_tie, games_to_lose)
SELECT
  diff,
  19,  -- games to win
  NULL,  -- no ties
  6  -- games to lose
FROM generate_series(145, 500) AS diff;

-- Insert data for LOWER handicap team (negative hcp_diff)
-- These are mirror values for the lower handicap team

-- Range: 0 to -14 points difference
INSERT INTO public.handicap_chart_5v5 (hcp_diff, games_to_win, games_to_tie, games_to_lose)
SELECT
  -diff,
  13,  -- games to win
  NULL,  -- no ties
  12  -- games to lose
FROM generate_series(1, 14) AS diff;

-- Range: -15 to -40 points difference
INSERT INTO public.handicap_chart_5v5 (hcp_diff, games_to_win, games_to_tie, games_to_lose)
SELECT
  -diff,
  12,  -- games to win (lower team needs fewer)
  NULL,  -- no ties
  13  -- games to lose
FROM generate_series(15, 40) AS diff;

-- Range: -41 to -66 points difference
INSERT INTO public.handicap_chart_5v5 (hcp_diff, games_to_win, games_to_tie, games_to_lose)
SELECT
  -diff,
  11,  -- games to win
  NULL,  -- no ties
  14  -- games to lose
FROM generate_series(41, 66) AS diff;

-- Range: -67 to -92 points difference
INSERT INTO public.handicap_chart_5v5 (hcp_diff, games_to_win, games_to_tie, games_to_lose)
SELECT
  -diff,
  10,  -- games to win
  NULL,  -- no ties
  15  -- games to lose
FROM generate_series(67, 92) AS diff;

-- Range: -93 to -118 points difference
INSERT INTO public.handicap_chart_5v5 (hcp_diff, games_to_win, games_to_tie, games_to_lose)
SELECT
  -diff,
  9,  -- games to win
  NULL,  -- no ties
  16  -- games to lose
FROM generate_series(93, 118) AS diff;

-- Range: -119 to -144 points difference
INSERT INTO public.handicap_chart_5v5 (hcp_diff, games_to_win, games_to_tie, games_to_lose)
SELECT
  -diff,
  8,  -- games to win
  NULL,  -- no ties
  17  -- games to lose
FROM generate_series(119, 144) AS diff;

-- Range: -145 to -500 points difference (capped at 145+)
INSERT INTO public.handicap_chart_5v5 (hcp_diff, games_to_win, games_to_tie, games_to_lose)
SELECT
  -diff,
  7,  -- games to win
  NULL,  -- no ties
  18  -- games to lose
FROM generate_series(145, 500) AS diff;

COMMIT;

-- Verify data inserted correctly
SELECT
  COUNT(*) as total_rows,
  MIN(hcp_diff) as min_diff,
  MAX(hcp_diff) as max_diff,
  COUNT(DISTINCT games_to_win) as unique_win_thresholds
FROM public.handicap_chart_5v5;

-- Sample query to verify positive and negative ranges
SELECT * FROM public.handicap_chart_5v5 WHERE hcp_diff IN (-145, -40, -14, 0, 14, 40, 145) ORDER BY hcp_diff;
