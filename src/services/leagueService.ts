/**
 * @fileoverview League Service
 *
 * Handles database operations related to leagues, including:
 * - Updating league day of week
 * - Other league management operations
 */

import { supabase } from '@/supabaseClient';
import type { DayOfWeek } from '@/types/league';

/**
 * Updates the day of week for a league in the database
 *
 * @param leagueId - The ID of the league to update
 * @param newDay - The new day of week (e.g., "Monday", "Tuesday")
 * @returns The updated day of week as a lowercase string
 * @throws Error if the database update fails
 *
 * @example
 * ```typescript
 * const updatedDay = await updateLeagueDayOfWeek('league-123', 'Wednesday');
 * console.log(updatedDay); // 'wednesday'
 * ```
 */
export async function updateLeagueDayOfWeek(
  leagueId: string,
  newDay: string
): Promise<DayOfWeek> {
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

  console.log('Updating league day_of_week to:', newDayNumber, `(${newDay})`);

  // Update the league's day_of_week in database
  const { error } = await supabase
    .from('leagues')
    .update({ day_of_week: newDayNumber })
    .eq('id', leagueId);

  if (error) {
    console.error('Error updating league day_of_week:', error);
    throw new Error(`Failed to update league day of week: ${error.message}`);
  }

  console.log('✅ League day_of_week updated successfully');

  return newDayString;
}
