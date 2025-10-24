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
 * Blackout weeks are inserted as extra weeks, extending the season end date
 *
 * @param startDate - Season start date
 * @param leagueDayOfWeek - Day of week league plays (e.g., 'tuesday')
 * @param seasonLength - Number of regular season weeks (always this many regular weeks in final schedule)
 * @param blackoutWeeks - Array of blackout week entries to insert as extra weeks (optional)
 * @param seasonEndBreakWeeks - Number of season-end break weeks to add before playoffs
 * @returns Array of WeekEntry objects for the schedule (regular weeks only, blackouts handled separately)
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

  // Create a sorted set of blackout dates for efficient lookup
  const blackoutDates = new Set(blackoutWeeks.map(b => b.date));

  // Generate schedule by walking through weeks chronologically
  // Insert blackouts where they belong, but keep generating until we have seasonLength regular weeks
  while (playWeekCount < seasonLength) {
    const dateStr = formatDateForDB(currentDate);

    // Check if this date is a blackout
    if (blackoutDates.has(dateStr)) {
      // This is a blackout week - skip it and move to next week
      // Don't increment playWeekCount - we need to keep generating regular weeks
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
