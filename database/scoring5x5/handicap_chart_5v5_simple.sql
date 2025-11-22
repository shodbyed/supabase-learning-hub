-- ============================================================================
-- BCA 5v5 (8-man) Handicap Chart - Simplified Range-Based Version
-- ============================================================================
-- This table stores the lookup chart for determining games needed to win
-- based on handicap difference ranges in 5v5 matches (25 total games).
--
-- Uses min_diff/max_diff ranges instead of individual rows for efficiency.
-- ============================================================================

BEGIN;

-- Drop the old table if it exists
DROP TABLE IF EXISTS public.handicap_chart_5v5;

-- Create the simplified table with range-based lookups
CREATE TABLE public.handicap_chart_5v5 (
  id serial PRIMARY KEY,
  min_diff integer NOT NULL,  -- Minimum handicap difference (inclusive)
  max_diff integer NOT NULL,  -- Maximum handicap difference (inclusive)
  games_to_win integer NOT NULL,
  games_to_tie integer,  -- Always NULL for 5v5 (odd number of games)
  games_to_lose integer NOT NULL,
  CONSTRAINT valid_range CHECK (min_diff <= max_diff)
);

-- Add table comment
COMMENT ON TABLE public.handicap_chart_5v5 IS 'BCA handicap chart for 5v5 (8-man) matches. Range-based lookup for 25-game matches.';

-- Add column comments
COMMENT ON COLUMN public.handicap_chart_5v5.min_diff IS 'Minimum handicap difference for this range (inclusive)';
COMMENT ON COLUMN public.handicap_chart_5v5.max_diff IS 'Maximum handicap difference for this range (inclusive)';
COMMENT ON COLUMN public.handicap_chart_5v5.games_to_win IS 'Games needed to win the match';
COMMENT ON COLUMN public.handicap_chart_5v5.games_to_tie IS 'Always NULL (no ties in 25-game format)';
COMMENT ON COLUMN public.handicap_chart_5v5.games_to_lose IS 'Maximum games to still lose the match';

-- Insert BCA chart ranges (from BCA_HANDICAP_SYSTEM.md)
-- Format: (min_diff, max_diff, games_to_win, games_to_tie, games_to_lose)

-- Positive handicap differences (higher handicap team)
INSERT INTO public.handicap_chart_5v5 (min_diff, max_diff, games_to_win, games_to_tie, games_to_lose) VALUES
  (0, 14, 13, NULL, 12),
  (15, 40, 14, NULL, 11),
  (41, 66, 15, NULL, 10),
  (67, 92, 16, NULL, 9),
  (93, 118, 17, NULL, 8),
  (119, 144, 18, NULL, 7),
  (145, 999, 19, NULL, 6);  -- 145+ capped at max

-- Negative handicap differences (lower handicap team)
INSERT INTO public.handicap_chart_5v5 (min_diff, max_diff, games_to_win, games_to_tie, games_to_lose) VALUES
  (-14, -1, 13, NULL, 12),
  (-40, -15, 12, NULL, 13),
  (-66, -41, 11, NULL, 14),
  (-92, -67, 10, NULL, 15),
  (-118, -93, 9, NULL, 16),
  (-144, -119, 8, NULL, 17),
  (-999, -145, 7, NULL, 18);  -- -145 and below

COMMIT;

-- Verify data inserted correctly
SELECT * FROM public.handicap_chart_5v5 ORDER BY min_diff;

-- Example lookup query for handicap difference of 16
-- Should return: games_to_win = 14
SELECT games_to_win, games_to_lose
FROM public.handicap_chart_5v5
WHERE 16 BETWEEN min_diff AND max_diff;

-- Example lookup query for handicap difference of -40
-- Should return: games_to_win = 12
SELECT games_to_win, games_to_lose
FROM public.handicap_chart_5v5
WHERE -40 BETWEEN min_diff AND max_diff;
