/**
 * @fileoverview Remove unnecessary NULL constraint on match_lineups
 *
 * The constraint assumed substitutes would be NULL player_ids, but that's wrong.
 * Substitutes are actual members in the system with UUIDs, just like regular players.
 * There's no reason to restrict NULL fields - empty lineups can have all NULLs,
 * and filled lineups should have all real UUIDs (including substitutes).
 */

-- Drop the unnecessary constraint
ALTER TABLE match_lineups
DROP CONSTRAINT IF EXISTS match_lineups_check;
