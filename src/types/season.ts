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
 */
export interface Season {
  id: string;
  league_id: string;
  season_name: string;
  start_date: string;          // ISO date string
  end_date: string;            // ISO date string
  season_length: number;       // Number of weeks (10-52)
  status: SeasonStatus;
  holidays: Holiday[];
  bca_championship: ChampionshipEvent | null;
  apa_championship: ChampionshipEvent | null;
  schedule: Record<string, ScheduleEntry>;
  season_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Schedule entry for a specific date
 */
export interface ScheduleEntry {
  title: string;           // "Week 1", "Holiday", "BCA Championship", etc.
  league_play: boolean;    // Whether league plays on this date
  matchup_id?: string;     // ID of matchup if league_play is true
}

/**
 * Data needed to create a new season
 */
export interface SeasonInsertData {
  league_id: string;
  season_name: string;
  start_date: string;
  end_date: string;
  season_length: number;
  status?: SeasonStatus;
  holidays?: Holiday[];
  bca_championship?: ChampionshipEvent;
  apa_championship?: ChampionshipEvent;
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
 * Conflict flag for schedule conflicts (holidays or championships)
 */
export interface ConflictFlag {
  type: 'holiday' | 'championship';
  name: string;
  reason: string;
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
