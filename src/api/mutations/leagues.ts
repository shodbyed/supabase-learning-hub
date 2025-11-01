/**
 * @fileoverview League Mutation Functions
 *
 * Write operations for leagues (create, update, delete).
 * These functions are used by TanStack Query useMutation hooks.
 *
 * @see api/hooks/useLeagueMutations.ts - React hooks wrapper
 */

import { supabase } from '@/supabaseClient';
import type { DayOfWeek } from '@/types/league';

/**
 * Update Parameters for league day of week
 */
export interface UpdateLeagueDayParams {
  leagueId: string;
  newDay: string;
}

/**
 * Updates the day of week for a league in the database
 *
 * Used when operator changes the league schedule day.
 * Converts day name to numeric format (0-6) for database storage.
 *
 * @param params - League ID and new day name
 * @returns The updated day of week as lowercase string
 * @throws Error if database update fails
 *
 * @example
 * const result = await updateLeagueDayOfWeek({
 *   leagueId: 'league-123',
 *   newDay: 'Wednesday'
 * });
 * console.log(result); // 'wednesday'
 */
export async function updateLeagueDayOfWeek(
  params: UpdateLeagueDayParams
): Promise<DayOfWeek> {
  const { leagueId, newDay } = params;

  // Convert day name to number (0 = Sunday, 6 = Saturday)
  const dayMap: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const newDayNumber = dayMap[newDay];
  const newDayString = newDay.toLowerCase() as DayOfWeek;

  // Update the league's day_of_week in database
  const { error } = await supabase
    .from('leagues')
    .update({ day_of_week: newDayNumber })
    .eq('id', leagueId);

  if (error) {
    throw new Error(`Failed to update league day of week: ${error.message}`);
  }

  return newDayString;
}
