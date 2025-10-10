/**
 * @fileoverview Holiday Utility Functions
 *
 * Functions for fetching US holidays and determining which ones should be flagged
 * for league scheduling conflicts based on league day of week and holiday type.
 */
import Holidays from 'date-holidays';
import type { Holiday } from '@/types/season';
import { parseLocalDate } from './formatters';

// Re-export Holiday type for convenience
export type { Holiday };

/**
 * Fetches US holidays for a season's date range
 * Includes buffer before/after to account for playoff delays from week-offs
 *
 * @param startDate - Season start date
 * @param seasonLength - Number of weeks in season
 * @returns Array of Holiday objects within the buffered date range
 */
export function fetchHolidaysForSeason(startDate: Date, seasonLength: number): Holiday[] {
  const hd = new Holidays();
  hd.init('US');

  // Calculate buffered date range
  // 2 weeks before season start
  const bufferStart = new Date(startDate);
  bufferStart.setDate(bufferStart.getDate() - 14);

  // Season weeks + 8 week buffer for potential playoff delays
  const estimatedEnd = new Date(startDate);
  estimatedEnd.setDate(estimatedEnd.getDate() + ((seasonLength + 8) * 7));

  // Get all years that fall within the date range
  const yearStart = bufferStart.getFullYear();
  const yearEnd = estimatedEnd.getFullYear();

  // Fetch holidays for all years in range
  const allHolidays = [];
  for (let year = yearStart; year <= yearEnd; year++) {
    const yearHolidays = hd.getHolidays(year);
    allHolidays.push(...yearHolidays);
  }

  // Filter to only holidays within buffered range
  return allHolidays
    .filter((holiday) => {
      const holidayDate = new Date(holiday.date);
      return holidayDate >= bufferStart && holidayDate <= estimatedEnd;
    })
    .map((holiday) => ({
      date: holiday.date,
      name: holiday.name,
      start: holiday.start || holiday.date,
      end: holiday.end || holiday.date,
      rule: holiday.rule,
      type: holiday.type,
    }));
}

/**
 * Check if a holiday name indicates a travel holiday (Christmas or New Year)
 * These affect all leagues regardless of day of week
 */
function isTravelHoliday(holidayName: string): boolean {
  const name = holidayName.toLowerCase();
  return name.includes('christmas') || name.includes('new year');
}

/**
 * Check if holiday is Thanksgiving
 * Always on Thursday, affects Wed/Thu/Fri/Sat/Sun leagues (travel days)
 */
function isThanksgiving(holidayName: string): boolean {
  return holidayName.toLowerCase().includes('thanksgiving');
}

/**
 * Check if holiday is typically observed on Monday
 * Memorial Day, Labor Day, MLK Day, Presidents Day
 */
function isMondayHoliday(holidayName: string): boolean {
  const name = holidayName.toLowerCase();
  return (
    name.includes('memorial day') ||
    name.includes('labor day') ||
    name.includes('martin luther king') ||
    name.includes('presidents') ||
    name.includes("president's day")
  );
}

/**
 * Get day of week from a date (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 */
function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Convert league day string to day number
 */
function leagueDayToNumber(day: string): number {
  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  return dayMap[day.toLowerCase()] ?? 1; // Default to Monday if not found
}

/**
 * Check if holiday is within ±1 day of league night
 */
function isWithinOneDayOfLeagueNight(holidayDate: Date, leagueDayOfWeek: string): boolean {
  const holidayDay = getDayOfWeek(holidayDate);
  const leagueDay = leagueDayToNumber(leagueDayOfWeek);

  // Check if holiday is on league night or ±1 day
  const diff = Math.abs(holidayDay - leagueDay);
  return diff <= 1 || diff >= 6; // 6 handles wrap-around (Sunday=0, Saturday=6)
}

/**
 * Smart flagging logic - determines if a holiday should be flagged for a specific league week
 *
 * @param holidayDate - Date of the holiday
 * @param holidayName - Name of the holiday
 * @param leagueDayOfWeek - Day of week league plays on (e.g., 'tuesday')
 * @param weekDate - The specific week date being checked
 * @returns Object with shouldFlag boolean and reason string
 */
export function shouldFlagHoliday(
  holidayDate: Date,
  holidayName: string,
  leagueDayOfWeek: string,
  weekDate: Date
): { shouldFlag: boolean; reason: string } {
  // Calculate days between holiday and week date
  const daysDiff = Math.abs(Math.floor((holidayDate.getTime() - weekDate.getTime()) / (1000 * 60 * 60 * 24)));

  // TRAVEL HOLIDAYS - Flag if within same week (±3 days to cover the week)
  if (isTravelHoliday(holidayName)) {
    if (daysDiff <= 3) {
      return {
        shouldFlag: true,
        reason: 'Travel holiday - affects entire week',
      };
    }
    return { shouldFlag: false, reason: '' };
  }

  // THANKSGIVING - Flag Wed/Thu/Fri/Sat/Sun leagues if within same week
  if (isThanksgiving(holidayName)) {
    if (daysDiff <= 3) {
      const leagueDay = leagueDayToNumber(leagueDayOfWeek);
      // Wednesday (3) through Sunday (0) - noting Sunday wraps to 0
      if (leagueDay === 0 || leagueDay >= 3) {
        return {
          shouldFlag: true,
          reason: 'Thanksgiving week - travel holiday',
        };
      }
    }
    return { shouldFlag: false, reason: '' };
  }

  // MONDAY HOLIDAYS - Flag Mon/Tue leagues only if within ±1 day
  if (isMondayHoliday(holidayName)) {
    if (daysDiff <= 1) {
      const leagueDay = leagueDayToNumber(leagueDayOfWeek);
      if (leagueDay === 1 || leagueDay === 2) {
        // Monday or Tuesday
        return {
          shouldFlag: true,
          reason: 'Monday holiday - affects Mon/Tue leagues',
        };
      }
    }
    return { shouldFlag: false, reason: '' };
  }

  // OTHER HOLIDAYS - Flag if within ±1 day of league night
  if (daysDiff <= 1 && isWithinOneDayOfLeagueNight(holidayDate, leagueDayOfWeek)) {
    return {
      shouldFlag: true,
      reason: 'Holiday within 1 day of league night',
    };
  }

  return { shouldFlag: false, reason: '' };
}

/**
 * Get formatted date string for display
 */
export function formatHolidayDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseLocalDate(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
