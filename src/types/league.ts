/**
 * @fileoverview League-related type definitions
 * Centralized types for league management, creation, and configuration
 */

/**
 * League form data interface
 * Used during league creation wizard to capture all league configuration
 */
export interface LeagueFormData {
  gameType: string;
  startDate: string;
  dayOfWeek: string;
  season: string;
  year: number;
  qualifier: string;
  seasonLength: number;
  endDate: string;
  bcaNationalsChoice: string;
  bcaNationalsStart: string;
  bcaNationalsEnd: string;
  apaNationalsStart: string;
  apaNationalsEnd: string;
  teamFormat: '5_man' | '8_man' | '';
  handicapSystem: 'custom_5man' | 'bca_standard' | '';
  organizationName: string;
  organizationAddress: string;
  organizationCity: string;
  organizationState: string;
  organizationZipCode: string;
  contactEmail: string;
  contactPhone: string;
  selectedVenueId: string;
}

/**
 * Team format types
 */
export type TeamFormat = '5_man' | '8_man';

/**
 * Handicap system types
 */
export type HandicapSystem = 'custom_5man' | 'bca_standard';

/**
 * Game types supported (stored in database as lowercase with underscore)
 */
export type GameType = 'eight_ball' | 'nine_ball' | 'ten_ball';

/**
 * Day of week types (stored in database as lowercase)
 */
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/**
 * League status types
 */
export type LeagueStatus = 'active' | 'completed' | 'abandoned';

/**
 * Season classification based on start date
 */
export type Season = 'Winter' | 'Spring' | 'Summer' | 'Fall';

/**
 * League database record interface
 * Matches the leagues table schema exactly
 */
export interface League {
  id: string;
  operator_id: string;
  game_type: GameType;
  day_of_week: DayOfWeek;
  division: string | null;
  team_format: TeamFormat;
  league_start_date: string; // ISO date string
  created_at: string;
  updated_at: string;
  status: LeagueStatus;
}

/**
 * League insert data (for creating new leagues)
 * Omits auto-generated fields
 */
export interface LeagueInsertData {
  operator_id: string;
  game_type: GameType;
  day_of_week: DayOfWeek;
  division?: string | null;
  team_format: TeamFormat;
  league_start_date: string; // ISO date string YYYY-MM-DD
}

/**
 * Utility function to format game type for display
 */
export function formatGameType(gameType: GameType): string {
  const displayMap: Record<GameType, string> = {
    eight_ball: '8-Ball',
    nine_ball: '9-Ball',
    ten_ball: '10-Ball'
  };
  return displayMap[gameType];
}

/**
 * Utility function to format day of week for display
 */
export function formatDayOfWeek(day: DayOfWeek): string {
  return day.charAt(0).toUpperCase() + day.slice(1);
}
