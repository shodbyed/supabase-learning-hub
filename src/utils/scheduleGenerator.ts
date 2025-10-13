/**
 * @fileoverview Schedule Generation Utility
 *
 * Generates full season schedules by mapping team positions to matchup tables
 * and creating match records for each week of the season.
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
}

interface GenerateScheduleResult {
  success: boolean;
  matchesCreated: number;
  error?: string;
}

/**
 * Generate full season schedule based on team positions
 *
 * Process:
 * 1. Fetch all regular season weeks
 * 2. Get matchup table for team count
 * 3. Map matchup positions to actual teams
 * 4. Create match records for each week
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
}: GenerateScheduleParams): Promise<GenerateScheduleResult> {
  try {
    // Validate teams have positions
    if (teams.length === 0) {
      return {
        success: false,
        matchesCreated: 0,
        error: 'No teams provided for schedule generation',
      };
    }

    // Fetch regular season weeks
    const { data: seasonWeeks, error: weeksError } = await supabase
      .from('season_weeks')
      .select('id, scheduled_date, week_name, week_type')
      .eq('season_id', seasonId)
      .eq('week_type', 'regular')
      .order('scheduled_date', { ascending: true });

    if (weeksError) throw weeksError;

    if (!seasonWeeks || seasonWeeks.length === 0) {
      return {
        success: false,
        matchesCreated: 0,
        error: 'No regular season weeks found. Please create season weeks first.',
      };
    }

    // Get matchup table for team count
    const matchupTable = getMatchupTable(teams.length);
    if (!matchupTable) {
      return {
        success: false,
        matchesCreated: 0,
        error: `No matchup table available for ${teams.length} teams`,
      };
    }

    // Sort teams by schedule position for consistent mapping
    const sortedTeams = [...teams].sort(
      (a, b) => a.schedule_position - b.schedule_position
    );

    // Create team position lookup (position -> team)
    const teamsByPosition = new Map<number, TeamWithPosition>();
    sortedTeams.forEach((team) => {
      teamsByPosition.set(team.schedule_position, team);
    });

    // Generate matches for each week
    const matches: MatchInsertData[] = [];
    const cycleLength = matchupTable.length;

    for (let weekIndex = 0; weekIndex < seasonWeeks.length; weekIndex++) {
      const seasonWeek = seasonWeeks[weekIndex];

      // Use modulo to cycle through matchup table if season is longer
      const matchupWeekIndex = weekIndex % cycleLength;
      const weeklyMatchups = matchupTable[matchupWeekIndex];

      // Create matches for this week
      for (let matchIndex = 0; matchIndex < weeklyMatchups.length; matchIndex++) {
        const [homePos, awayPos] = weeklyMatchups[matchIndex];

        const homeTeam = teamsByPosition.get(homePos);
        const awayTeam = teamsByPosition.get(awayPos);

        // Skip if either position doesn't have a team (shouldn't happen)
        if (!homeTeam || !awayTeam) {
          console.warn(
            `Missing team for positions ${homePos} or ${awayPos} in week ${weekIndex + 1}`
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
    }

    // Insert all matches in bulk
    const { error: insertError } = await supabase
      .from('matches')
      .insert(matches);

    if (insertError) throw insertError;

    console.log(`✅ Generated ${matches.length} matches for season ${seasonId}`);

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
