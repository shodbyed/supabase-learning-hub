-- Create the table
CREATE TABLE handicap_chart_3vs3 (
  hcp_diff INTEGER PRIMARY KEY,
  games_to_win INTEGER NOT NULL,
  games_to_tie INTEGER,
  games_to_lose INTEGER NOT NULL,
  CHECK (hcp_diff BETWEEN -12 AND 12)
);

-- Insert all rows (25 total)
INSERT INTO handicap_chart_3vs3 (hcp_diff, games_to_win, games_to_tie, games_to_lose) VALUES
(12, 16, 15, 14),
(11, 15, NULL, 14),
(10, 15, 14, 13),
(9, 14, NULL, 13),
(8, 14, 13, 12),
(7, 13, NULL, 12),
(6, 13, 12, 11),
(5, 12, NULL, 11),
(4, 12, 11, 10),
(3, 11, NULL, 10),
(2, 11, 10, 9),
(1, 10, NULL, 9),
(0, 10, 9, 8),
(-1, 9, NULL, 8),
(-2, 9, 8, 7),
(-3, 8, NULL, 7),
(-4, 8, 7, 6),
(-5, 7, NULL, 6),
(-6, 7, 6, 5),
(-7, 6, NULL, 5),
(-8, 6, 5, 4),
(-9, 5, NULL, 4),
(-10, 5, 4, 3),
(-11, 4, NULL, 3),
(-12, 4, 3, 2);
