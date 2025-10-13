/**
 * @fileoverview Season Type Definitions
 *
 * Types for pool league seasons including dates, holidays, and schedules.
 */

/**
 * Season status types
 */
export type SeasonStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

/**
 * Holiday object from date-holidays package or championship events
 */
export interface Holiday {
  date: string;           // Date string (e.g., "2025-07-04")
  name: string;           // Holiday name (e.g., "Independence Day")
  start: Date | string;   // Start date
  end: Date | string;     // End date
  rule?: string;          // Holiday rule/description
  type: string;           // Type: "public", "bank", "event", etc.
}

/**
 * Championship event dates and settings
 */
export interface ChampionshipEvent {
  start: string;          // Start date (ISO string)
  end: string;            // End date (ISO string)
  ignored: boolean;       // Whether to ignore this event when scheduling
}

/**
 * Season database record
 * Note: Schedule weeks are stored in separate season_weeks table
 * Holidays and championships fetched on-demand during schedule editing
 */
export interface Season {
  id: string;
  league_id: string;
  season_name: string;
  start_date: string;          // ISO date string
  end_date: string;            // ISO date string
  season_length: number;       // Number of weeks (10-52)
  status: SeasonStatus;
  season_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Season week database record
 * Unified table storing all calendar dates: regular weeks, blackouts, season-end breaks, playoffs
 * Sort by scheduled_date to display full season calendar
 */
export interface SeasonWeek {
  id: string;
  season_id: string;
  scheduled_date: string;      // ISO date string - sort by this
  week_name: string;           // "Week 1", "Thanksgiving", "Playoffs"
  week_type: 'regular' | 'blackout' | 'playoffs' | 'season_end_break';
  week_completed: boolean;     // Prevents editing past weeks
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Data needed to create a new season
 * Note: Holidays and championships NOT stored - fetched on-demand during editing
 */
export interface SeasonInsertData {
  league_id: string;
  season_name: string;
  start_date: string;
  end_date: string;
  season_length: number;
  status?: SeasonStatus;
}

/**
 * Form data for season creation wizard
 */
export interface SeasonFormData {
  start_date: Date;
  season_length: number;
  bca_start_date: Date;
  bca_end_date: Date;
  bca_ignored: boolean;
  apa_start_date: Date;
  apa_end_date: Date;
  apa_ignored: boolean;
}

/**
 * Generate season name from league info and start date
 * Format: "Fall 2025 Monday 8-Ball" or "Spring 2026 Tuesday 9-Ball East Division"
 */
export function generateSeasonName(
  startDate: Date,
  dayOfWeek: string,
  gameType: string,
  division?: string | null
): string {
  const month = startDate.getMonth();

  // Determine season based on month
  let seasonLabel: string;
  if (month >= 2 && month <= 4) {
    seasonLabel = 'Spring';
  } else if (month >= 5 && month <= 7) {
    seasonLabel = 'Summer';
  } else if (month >= 8 && month <= 10) {
    seasonLabel = 'Fall';
  } else {
    seasonLabel = 'Winter';
  }

  const year = startDate.getFullYear();
  const divisionText = division ? ` ${division}` : '';

  return `${seasonLabel} ${year} ${dayOfWeek} ${gameType}${divisionText}`;
}

/**
 * Calculate end date based on start date and season length
 */
export function calculateEndDate(startDate: Date, seasonLength: number): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (seasonLength * 7) - 1); // -1 because start date is week 1 day 1
  return endDate;
}

/**
 * Conflict severity levels based on proximity to league night
 */
export type ConflictSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Conflict flag for schedule conflicts (holidays or championships)
 */
export interface ConflictFlag {
  type: 'holiday' | 'championship';
  name: string;
  reason: string;
  severity: ConflictSeverity;  // Visual indicator of conflict importance
  daysAway: number;            // Days between conflict date and league night
}

/**
 * Week entry in the season schedule
 */
export interface WeekEntry {
  weekNumber: number;      // Sequential calendar position: 1, 2, 3, 4...
  weekName: string;        // Display label: "Week 1", "Halloween", "Playoffs"
  date: string;            // ISO date string (YYYY-MM-DD)
  type: 'regular' | 'playoffs' | 'week-off';
  conflicts: ConflictFlag[];
}

/**
 * Format date to ISO string for database storage (timezone-safe)
 */
export function formatDateForDB(date: Date): string {
  // Use local timezone to avoid off-by-one day errors
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
