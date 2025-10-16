/**
 * @fileoverview Schedule Generation Utility
 *
 * Generates full season schedules by mapping team positions to matchup tables
 * and creating match records for each week of the season.
 *
 * The generation process is broken down into single-responsibility functions:
 * 1. Validate teams have positions assigned
 * 2. Fetch regular season weeks from database
 * 3. Get matchup table for team count
 * 4. Build team position lookup map
 * 5. Generate match records for each week
 * 6. Insert matches in bulk to database
 */

import { supabase } from '@/supabaseClient';
import { getMatchupTable } from './matchupTables';
import type {
  MatchInsertData,
  TeamWithPosition,
} from '@/types/schedule';

interface GenerateScheduleParams {
  seasonId: string;
  teams: TeamWithPosition[];
  skipExistingCheck?: boolean;
}

interface GenerateScheduleResult {
  success: boolean;
  matchesCreated: number;
  error?: string;
}

interface SeasonWeek {
  id: string;
  scheduled_date: string;
  week_name: string;
  week_type: string;
}

/**
 * Validate that teams array is not empty and has required data
 *
 * @param teams - Array of teams with positions
 * @returns Validation result with error message if invalid
 */
function validateTeams(teams: TeamWithPosition[]): { valid: boolean; error?: string } {
  if (teams.length === 0) {
    return {
      valid: false,
      error: 'No teams provided for schedule generation',
    };
  }

  return { valid: true };
}

/**
 * Fetch regular season weeks from database
 * Note: Only fetches 'regular' type weeks for match generation
 * Blackout, playoff, and break weeks are excluded from match scheduling
 *
 * @param seasonId - Season ID to fetch weeks for
 * @returns Array of regular season weeks or error
 */
async function fetchSeasonWeeks(
  seasonId: string
): Promise<{ weeks: SeasonWeek[] | null; error?: string }> {
  const { data: seasonWeeks, error: weeksError } = await supabase
    .from('season_weeks')
    .select('id, scheduled_date, week_name, week_type')
    .eq('season_id', seasonId)
    .eq('week_type', 'regular')
    .order('scheduled_date', { ascending: true });

  if (weeksError) {
    return { weeks: null, error: weeksError.message };
  }

  if (!seasonWeeks || seasonWeeks.length === 0) {
    return {
      weeks: null,
      error: 'No regular season weeks found. Please create season weeks first.',
    };
  }

  return { weeks: seasonWeeks };
}

/**
 * Build a map of schedule positions to teams for quick lookup
 *
 * @param teams - Array of teams with positions
 * @returns Map of position number to team
 */
function buildTeamPositionMap(teams: TeamWithPosition[]): Map<number, TeamWithPosition> {
  const sortedTeams = [...teams].sort(
    (a, b) => a.schedule_position - b.schedule_position
  );

  const teamsByPosition = new Map<number, TeamWithPosition>();
  sortedTeams.forEach((team) => {
    teamsByPosition.set(team.schedule_position, team);
  });

  return teamsByPosition;
}

/**
 * Generate match records for a single week
 *
 * @param seasonWeek - The season week to generate matches for
 * @param weeklyMatchups - Array of matchup pairs for this week
 * @param teamsByPosition - Map of position to team
 * @param seasonId - Season ID
 * @param weekIndex - Index of the week (for logging)
 * @returns Array of match insert data
 */
function generateWeekMatches(
  seasonWeek: SeasonWeek,
  weeklyMatchups: [number, number][],
  teamsByPosition: Map<number, TeamWithPosition>,
  seasonId: string,
  weekIndex: number
): MatchInsertData[] {
  const matches: MatchInsertData[] = [];

  for (let matchIndex = 0; matchIndex < weeklyMatchups.length; matchIndex++) {
    const [homePos, awayPos] = weeklyMatchups[matchIndex];

    const homeTeam = teamsByPosition.get(homePos);
    const awayTeam = teamsByPosition.get(awayPos);

    // Skip if either position doesn't have a team (shouldn't happen with proper validation)
    if (!homeTeam || !awayTeam) {
      console.warn(
        `⚠️ Missing team for positions ${homePos} or ${awayPos} in week ${weekIndex + 1}`
      );
      continue;
    }

    matches.push({
      season_id: seasonId,
      season_week_id: seasonWeek.id,
      home_team_id: homeTeam.id === 'BYE' ? null : homeTeam.id,
      away_team_id: awayTeam.id === 'BYE' ? null : awayTeam.id,
      scheduled_venue_id: homeTeam.home_venue_id,
      match_number: matchIndex + 1,
      status: 'scheduled',
    });
  }

  return matches;
}

/**
 * Generate all match records for the entire season
 *
 * @param seasonWeeks - Array of season weeks
 * @param matchupTable - Matchup table for team count
 * @param teamsByPosition - Map of position to team
 * @param seasonId - Season ID
 * @returns Array of all match insert data
 */
function generateAllMatches(
  seasonWeeks: SeasonWeek[],
  matchupTable: [number, number][][],
  teamsByPosition: Map<number, TeamWithPosition>,
  seasonId: string
): MatchInsertData[] {
  const allMatches: MatchInsertData[] = [];
  const cycleLength = matchupTable.length;

  for (let weekIndex = 0; weekIndex < seasonWeeks.length; weekIndex++) {
    const seasonWeek = seasonWeeks[weekIndex];

    // Use modulo to cycle through matchup table if season is longer than one cycle
    const matchupWeekIndex = weekIndex % cycleLength;
    const weeklyMatchups = matchupTable[matchupWeekIndex];

    const weekMatches = generateWeekMatches(
      seasonWeek,
      weeklyMatchups,
      teamsByPosition,
      seasonId,
      weekIndex
    );

    allMatches.push(...weekMatches);
  }

  return allMatches;
}

/**
 * Insert match records into database
 *
 * @param matches - Array of match insert data
 * @returns Error message if insert fails, undefined otherwise
 */
async function insertMatches(matches: MatchInsertData[]): Promise<string | undefined> {
  const { error: insertError } = await supabase
    .from('matches')
    .insert(matches);

  if (insertError) {
    return insertError.message;
  }

  return undefined;
}

/**
 * Generate full season schedule based on team positions
 *
 * This is the main orchestration function that coordinates the schedule generation process.
 * It delegates to smaller single-responsibility functions for each step:
 *
 * 1. Validate teams have positions assigned (validateTeams)
 * 2. Fetch all regular season weeks from database (fetchSeasonWeeks)
 * 3. Get matchup table for team count (getMatchupTable)
 * 4. Build team position lookup map (buildTeamPositionMap)
 * 5. Generate match records for entire season (generateAllMatches)
 * 6. Insert matches in bulk to database (insertMatches)
 *
 * @param params - Season ID and teams with assigned positions
 * @returns Result indicating success and number of matches created
 *
 * @example
 * const result = await generateSchedule({
 *   seasonId: 'season-123',
 *   teams: [
 *     { id: 'team-1', schedule_position: 1, home_venue_id: 'venue-1' },
 *     { id: 'team-2', schedule_position: 2, home_venue_id: 'venue-2' },
 *     // ...
 *   ]
 * });
 */
export async function generateSchedule({
  seasonId,
  teams,
  skipExistingCheck = false,
}: GenerateScheduleParams): Promise<GenerateScheduleResult> {
  try {
    // Step 0: Check if schedule already exists (unless skip flag is set)
    if (!skipExistingCheck) {
      const { count: existingMatches, error: countError } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('season_id', seasonId);

      if (countError) {
        return {
          success: false,
          matchesCreated: 0,
          error: `Error checking for existing schedule: ${countError.message}`,
        };
      }

      if (existingMatches && existingMatches > 0) {
        return {
          success: false,
          matchesCreated: 0,
          error: `Schedule already exists with ${existingMatches} matches. Delete the existing schedule before regenerating.`,
        };
      }
    }

    // Step 1: Validate teams
    const validation = validateTeams(teams);
    if (!validation.valid) {
      return {
        success: false,
        matchesCreated: 0,
        error: validation.error,
      };
    }

    // Step 2: Fetch regular season weeks
    const { weeks: seasonWeeks, error: weeksError } = await fetchSeasonWeeks(seasonId);
    if (weeksError || !seasonWeeks) {
      return {
        success: false,
        matchesCreated: 0,
        error: weeksError,
      };
    }

    // Step 3: Get matchup table for team count
    const matchupTable = getMatchupTable(teams.length);
    if (!matchupTable) {
      return {
        success: false,
        matchesCreated: 0,
        error: `No matchup table available for ${teams.length} teams`,
      };
    }

    // Step 4: Build team position lookup map
    const teamsByPosition = buildTeamPositionMap(teams);

    // Step 5: Generate all match records
    const matches = generateAllMatches(
      seasonWeeks,
      matchupTable,
      teamsByPosition,
      seasonId
    );

    // Step 6: Insert matches in bulk
    const insertError = await insertMatches(matches);
    if (insertError) {
      return {
        success: false,
        matchesCreated: 0,
        error: insertError,
      };
    }

    // Log success details
    console.log(`✅ Generated ${matches.length} matches for season ${seasonId}`);
    console.log(`📊 Schedule Details:`, {
      teamCount: teams.length,
      weeksInSeason: seasonWeeks.length,
      matchupCycleLength: matchupTable.length,
      matchesPerWeek: matchupTable[0]?.length || 0,
      totalMatches: matches.length,
    });

    return {
      success: true,
      matchesCreated: matches.length,
    };
  } catch (error) {
    console.error('❌ Error generating schedule:', error);
    return {
      success: false,
      matchesCreated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete all matches for a season
 * Use this to clear a schedule before regenerating
 *
 * @param seasonId - Season ID to clear matches for
 * @returns Result indicating success and number of matches deleted
 */
export async function clearSchedule(seasonId: string): Promise<{
  success: boolean;
  matchesDeleted: number;
  error?: string;
}> {
  try {
    // Count matches before deleting
    const { count, error: countError } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('season_id', seasonId);

    if (countError) throw countError;

    const matchCount = count || 0;

    // Delete all matches for this season
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .eq('season_id', seasonId);

    if (deleteError) throw deleteError;

    console.log(`🗑️ Deleted ${matchCount} matches for season ${seasonId}`);

    return {
      success: true,
      matchesDeleted: matchCount,
    };
  } catch (error) {
    console.error('❌ Error clearing schedule:', error);
    return {
      success: false,
      matchesDeleted: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * Used for random team position assignment
 *
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Assign random schedule positions to teams
 *
 * @param teams - Array of teams
 * @returns Teams with randomly assigned positions
 */
export function assignRandomPositions<T extends { id: string }>(
  teams: T[]
): (T & { schedule_position: number })[] {
  const shuffled = shuffleArray(teams);
  return shuffled.map((team, index) => ({
    ...team,
    schedule_position: index + 1,
  }));
}
