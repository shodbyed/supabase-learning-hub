-- Fix handicap_chart_3vs3 games_to_lose values
--
-- In 3v3 format (18 total games):
-- - games_to_win: How many games you need to win the match
-- - games_to_lose: How many games opponent needs to win for you to lose
-- - games_to_tie: Can be NULL if tie is impossible (when win+lose > 18)
--
-- The relationship is: games_to_lose should equal the total games minus your games_to_win + 1
-- Example: If you need 10 to win out of 18, you lose when opponent gets 9 (18 - 10 + 1 = 9)

-- For positive handicap differentials (you're better, you need more to win)
-- games_to_lose = 18 - games_to_win + 1
UPDATE handicap_chart_3vs3
SET games_to_lose = 18 - games_to_win + 1
WHERE games_to_lose IS NULL;

-- Verify the results
SELECT
  hcp_diff,
  games_to_win,
  games_to_tie,
  games_to_lose,
  (games_to_win + games_to_lose - 1) as total_check -- Should equal 18
FROM handicap_chart_3vs3
ORDER BY hcp_diff;

-- Note: total_check should be 18 for all rows
-- If games_to_tie is NULL, it means (games_to_win + games_to_lose > 18) so tie is impossible
