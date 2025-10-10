/**
 * @fileoverview Schedule Generation Utilities
 *
 * Functions for generating season schedules, detecting conflicts with holidays/championships,
 * and recalculating schedules when weeks are skipped.
 */
import type { WeekEntry, ConflictFlag, Holiday, ChampionshipEvent } from '@/types/season';
import { formatDateForDB } from '@/types/season';
import { shouldFlagHoliday } from './holidayUtils';
import { parseLocalDate } from './formatters';

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

/**
 * Checks if a date range overlaps with a championship event
 */
function doesChampionshipConflict(
  weekDate: string,
  championship: ChampionshipEvent
): boolean {
  if (championship.ignored) return false;

  const week = new Date(weekDate);
  const champStart = new Date(championship.start);
  const champEnd = new Date(championship.end);

  // Check if the week falls within or near the championship dates
  // Consider the entire week (7 days from weekDate)
  const weekEnd = new Date(week);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Overlap if: week starts before champ ends AND week ends after champ starts
  return week <= champEnd && weekEnd >= champStart;
}

/**
 * Adds conflict flags to schedule based on holidays and championships
 *
 * @param schedule - Initial schedule array
 * @param holidays - Array of holidays to check
 * @param bcaChampionship - BCA championship dates (if not ignored)
 * @param apaChampionship - APA championship dates (if not ignored)
 * @param leagueDayOfWeek - Day of week league plays
 * @returns Updated schedule with conflict flags
 */
export function addConflictFlags(
  schedule: WeekEntry[],
  holidays: Holiday[],
  bcaChampionship: ChampionshipEvent | undefined,
  apaChampionship: ChampionshipEvent | undefined,
  leagueDayOfWeek: string
): WeekEntry[] {
  return schedule.map((week) => {
    const conflicts: ConflictFlag[] = [];
    const weekDate = parseLocalDate(week.date);

    // Check holiday conflicts
    for (const holiday of holidays) {
      const holidayDate = parseLocalDate(holiday.date);
      const result = shouldFlagHoliday(holidayDate, holiday.name, leagueDayOfWeek, weekDate);

      if (result.shouldFlag) {
        conflicts.push({
          type: 'holiday',
          name: holiday.name,
          reason: result.reason,
        });
      }
    }

    // Check BCA championship conflict
    if (bcaChampionship && doesChampionshipConflict(week.date, bcaChampionship)) {
      conflicts.push({
        type: 'championship',
        name: 'BCA National Championship',
        reason: 'Championship tournament week',
      });
    }

    // Check APA championship conflict
    if (apaChampionship && doesChampionshipConflict(week.date, apaChampionship)) {
      conflicts.push({
        type: 'championship',
        name: 'APA National Championship',
        reason: 'Championship tournament week',
      });
    }

    return {
      ...week,
      conflicts,
    };
  });
}

/**
 * Recalculates the entire schedule from scratch
 * Updates weekNumber, date, and conflicts for all entries based on start date
 *
 * @param schedule - Current schedule array
 * @param startDate - Season start date (YYYY-MM-DD string)
 * @param holidays - Array of holidays to check conflicts against
 * @param bcaChampionship - BCA championship dates
 * @param apaChampionship - APA championship dates
 * @param leagueDayOfWeek - Day of week league plays
 * @returns Fully recalculated schedule
 */
export function recalculateSchedule(
  schedule: WeekEntry[],
  startDate: string,
  holidays: Holiday[],
  bcaChampionship: ChampionshipEvent | undefined,
  apaChampionship: ChampionshipEvent | undefined,
  leagueDayOfWeek: string
): WeekEntry[] {
  const updatedSchedule = [...schedule];
  let currentDate = parseLocalDate(startDate);

  // Loop through entire array and recalculate everything
  for (let i = 0; i < updatedSchedule.length; i++) {
    // Set week number (sequential: 1, 2, 3...)
    updatedSchedule[i] = {
      ...updatedSchedule[i],
      weekNumber: i + 1,
      date: formatDateForDB(currentDate),
      conflicts: [], // Clear conflicts first
    };

    // Only recalculate conflicts for regular weeks
    if (updatedSchedule[i].type === 'regular') {
      const conflicts: ConflictFlag[] = [];

      // Check holidays (only 4-5 holidays per season)
      holidays.forEach((holiday) => {
        const holidayDateStr = holiday.date.split(' ')[0]; // Extract date from timestamp
        const holidayDate = parseLocalDate(holidayDateStr);
        const daysDiff = Math.abs(
          Math.floor((holidayDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
        );

        // Only check holidays within 7 days of this week
        if (daysDiff <= 7) {
          const flagResult = shouldFlagHoliday(holidayDate, holiday.name, leagueDayOfWeek, currentDate);

          if (flagResult.shouldFlag) {
            const holidayDayOfWeek = holidayDate.toLocaleDateString('en-US', { weekday: 'short' });
            const holidayDateDisplay = holidayDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            conflicts.push({
              type: 'holiday',
              name: `${holiday.name} (${holidayDayOfWeek}, ${holidayDateDisplay})`,
              reason: flagResult.reason,
            });
          }
        }
      });

      // Check BCA championship
      if (bcaChampionship && !bcaChampionship.ignored) {
        const weekDateStr = formatDateForDB(currentDate);
        if (doesChampionshipConflict(weekDateStr, bcaChampionship)) {
          conflicts.push({
            type: 'championship',
            name: 'BCA National Championship',
            reason: 'Championship tournament week',
          });
        }
      }

      // Check APA championship
      if (apaChampionship && !apaChampionship.ignored) {
        const weekDateStr = formatDateForDB(currentDate);
        if (doesChampionshipConflict(weekDateStr, apaChampionship)) {
          conflicts.push({
            type: 'championship',
            name: 'APA National Championship',
            reason: 'Championship tournament week',
          });
        }
      }

      updatedSchedule[i].conflicts = conflicts;
    }

    // Advance to next week (7 days)
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return updatedSchedule;
}

/**
 * Toggles a week between regular and week-off status
 * Then recalculates all subsequent dates and conflicts
 *
 * NOTE: This function is deprecated - use manual insert/remove in ScheduleReview instead
 *
 * @param schedule - Current schedule
 * @param weekIndex - Index of week to toggle
 * @param startDate - Season start date
 * @param holidays - Array of holidays
 * @param bcaChampionship - BCA championship dates
 * @param apaChampionship - APA championship dates
 * @param leagueDayOfWeek - Day of week league plays
 * @returns Updated schedule
 */
export function toggleWeekOff(
  schedule: WeekEntry[],
  weekIndex: number,
  startDate: string,
  holidays: Holiday[],
  bcaChampionship: ChampionshipEvent | undefined,
  apaChampionship: ChampionshipEvent | undefined,
  leagueDayOfWeek: string
): WeekEntry[] {
  const updatedSchedule = [...schedule];
  const week = updatedSchedule[weekIndex];

  if (week.type === 'regular') {
    // Convert to week-off
    updatedSchedule[weekIndex] = {
      ...week,
      type: 'week-off',
    };
  } else if (week.type === 'week-off') {
    // Convert back to regular
    updatedSchedule[weekIndex] = {
      ...week,
      type: 'regular',
    };
  }

  // Recalculate all dates and conflicts
  return recalculateSchedule(
    updatedSchedule,
    startDate,
    holidays,
    bcaChampionship,
    apaChampionship,
    leagueDayOfWeek
  );
}
