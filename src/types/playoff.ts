/**
 * @fileoverview Playoff-related type definitions
 *
 * Types for playoff brackets, seeding, and match generation.
 * Playoffs use final regular season standings to seed teams
 * into a bracket where top seeds play bottom seeds.
 */

/**
 * Team seeded for playoffs
 * Combines standing data with seed position
 */
export interface SeededTeam {
  seed: number;              // 1 = best record, 2 = second best, etc.
  teamId: string;
  teamName: string;
  matchWins: number;
  matchLosses: number;
  points: number;
  gamesWon: number;
}

/**
 * Playoff matchup between two seeded teams
 * Pairs are always [higher seed, lower seed]
 */
export interface PlayoffMatchup {
  matchNumber: number;       // Order of the match (1, 2, 3...)
  homeSeed: number;          // Higher seed (1, 2, 3...)
  awaySeed: number;          // Lower seed (8, 7, 6...)
  homeTeam: SeededTeam;
  awayTeam: SeededTeam;
}

/**
 * Team that doesn't qualify for playoffs
 * Used when odd number of teams (last place sits out)
 */
export interface ExcludedTeam {
  seed: number;
  teamId: string;
  teamName: string;
  reason: 'last_place' | 'below_cutoff';
}

/**
 * Complete playoff bracket for a season
 */
export interface PlayoffBracket {
  seasonId: string;
  playoffWeekId: string;     // The season_week with week_type = 'playoffs'
  teamCount: number;         // Total teams in season
  bracketSize: number;       // Actual bracket size (even number)
  matchups: PlayoffMatchup[];
  excludedTeams: ExcludedTeam[];
  seededTeams: SeededTeam[];
}

/**
 * Result of generating playoff matchups
 */
export interface GeneratePlayoffResult {
  success: boolean;
  bracket?: PlayoffBracket;
  error?: string;
}

/**
 * Result of creating playoff matches in database
 */
export interface CreatePlayoffMatchesResult {
  success: boolean;
  matchesCreated: number;
  error?: string;
}
