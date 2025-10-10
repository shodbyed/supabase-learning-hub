/**
 * @fileoverview Schedule Generation Utilities
 *
 * Functions for generating season schedules with support for blackout weeks
 * and season-end break periods.
 */
import type { WeekEntry } from '@/types/season';
import { formatDateForDB } from '@/types/season';

/**
 * Generates season schedule with all regular weeks and playoffs
 * Skips any dates that exist in blackoutWeeks array
 *
 * @param startDate - Season start date
 * @param leagueDayOfWeek - Day of week league plays (e.g., 'tuesday')
 * @param seasonLength - Number of regular season weeks
 * @param blackoutWeeks - Array of blackout week entries to skip (optional)
 * @returns Array of WeekEntry objects for the schedule
 */
export function generateSchedule(
  startDate: Date,
  _leagueDayOfWeek: string,
  seasonLength: number,
  blackoutWeeks: WeekEntry[] = [],
  seasonEndBreakWeeks: number = 1
): WeekEntry[] {
  const schedule: WeekEntry[] = [];
  let currentDate = new Date(startDate);
  let playWeekCount = 0;

  // Generate regular season weeks, skipping blackout dates
  while (playWeekCount < seasonLength) {
    const dateStr = formatDateForDB(currentDate);

    // Check if this date is a blackout
    const isBlackout = blackoutWeeks.some(b => b.date === dateStr);

    if (isBlackout) {
      // Skip this date, move to next week
      currentDate.setDate(currentDate.getDate() + 7);
      continue;
    }

    // Not a blackout - create regular week
    playWeekCount++;
    schedule.push({
      weekNumber: playWeekCount,
      weekName: `Week ${playWeekCount}`,
      date: dateStr,
      type: 'regular',
      conflicts: [],
    });

    currentDate.setDate(currentDate.getDate() + 7);
  }

  // Add season-end break weeks (if any)
  for (let i = 0; i < seasonEndBreakWeeks; i++) {
    schedule.push({
      weekNumber: seasonLength + 1 + i,
      weekName: 'Season End Break',
      date: formatDateForDB(currentDate),
      type: 'week-off',
      conflicts: [],
    });
    currentDate.setDate(currentDate.getDate() + 7);
  }

  // Add playoffs
  schedule.push({
    weekNumber: seasonLength + 2,
    weekName: 'Playoffs',
    date: formatDateForDB(currentDate),
    type: 'playoffs',
    conflicts: [],
  });

  return schedule;
}
