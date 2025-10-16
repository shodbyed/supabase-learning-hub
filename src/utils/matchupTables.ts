/**
 * @fileoverview Matchup Table Registry
 *
 * Centralized registry of round-robin matchup schedules for different team counts.
 * These tables ensure fair scheduling where each team plays every other team.
 */

import {
  fourTeamSchedule,
  sixTeamSchedule,
  eightTeamSchedule,
  tenTeamSchedule,
  twelveTeamSchedule,
  fourteenTeamSchedule,
  sixteenTeamSchedule,
  eighteenTeamSchedule,
  twentyTeamSchedule,
  twentyTwoTeamSchedule,
  twentyFourTeamSchedule,
  twentySixTeamSchedule,
  twentyEightTeamSchedule,
  thirtyTeamSchedule,
  thirtyTwoTeamSchedule,
  thirtyFourTeamSchedule,
  thirtySixTeamSchedule,
  thirtyEightTeamSchedule,
  fortyTeamSchedule,
} from '@/data/matchupTables';
import type { MatchupPair } from '@/types/schedule';

/**
 * Registry of matchup schedules by team count
 * Key: number of teams
 * Value: array of weekly matchups (week = array index + 1)
 */
const MATCHUP_TABLES: Record<number, MatchupPair[][]> = {
  4: fourTeamSchedule as MatchupPair[][],
  6: sixTeamSchedule as MatchupPair[][],
  8: eightTeamSchedule as MatchupPair[][],
  10: tenTeamSchedule as MatchupPair[][],
  12: twelveTeamSchedule as MatchupPair[][],
  14: fourteenTeamSchedule as MatchupPair[][],
  16: sixteenTeamSchedule as MatchupPair[][],
  18: eighteenTeamSchedule as MatchupPair[][],
  20: twentyTeamSchedule as MatchupPair[][],
  22: twentyTwoTeamSchedule as MatchupPair[][],
  24: twentyFourTeamSchedule as MatchupPair[][],
  26: twentySixTeamSchedule as MatchupPair[][],
  28: twentyEightTeamSchedule as MatchupPair[][],
  30: thirtyTeamSchedule as MatchupPair[][],
  32: thirtyTwoTeamSchedule as MatchupPair[][],
  34: thirtyFourTeamSchedule as MatchupPair[][],
  36: thirtySixTeamSchedule as MatchupPair[][],
  38: thirtyEightTeamSchedule as MatchupPair[][],
  40: fortyTeamSchedule as MatchupPair[][],
};

/**
 * Get matchup table for a specific team count
 *
 * @param teamCount - Number of teams in the league
 * @returns Array of weekly matchups (normalized format), or null if no table exists
 *
 * @example
 * const schedule = getMatchupTable(6);
 * // Returns 35-week schedule: [ [[1,2], [3,4], ...], [[2,3], ...], ... ]
 * // Week number = array index + 1
 */
export function getMatchupTable(teamCount: number): MatchupPair[][] | null {
  return MATCHUP_TABLES[teamCount] || null;
}

/**
 * Get list of team counts that have matchup tables available
 *
 * @returns Array of supported team counts
 *
 * @example
 * const supported = getSupportedTeamCounts();
 * // Returns [4, 6]
 */
export function getSupportedTeamCounts(): number[] {
  return Object.keys(MATCHUP_TABLES)
    .map(Number)
    .sort((a, b) => a - b);
}

/**
 * Check if a matchup table exists for a given team count
 *
 * @param teamCount - Number of teams
 * @returns True if table exists
 */
export function hasMatchupTable(teamCount: number): boolean {
  return teamCount in MATCHUP_TABLES;
}

/**
 * Get the cycle length (number of weeks) for a team count
 * Returns null if no table exists
 *
 * @param teamCount - Number of teams
 * @returns Number of weeks in the matchup cycle
 *
 * @example
 * getMatchupCycleLength(6); // Returns 35
 */
export function getMatchupCycleLength(teamCount: number): number | null {
  const table = getMatchupTable(teamCount);
  return table ? table.length : null;
}
