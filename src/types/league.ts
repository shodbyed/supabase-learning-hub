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
 * Game types supported
 */
export type GameType = '8-ball' | '9-ball' | '10-ball';

/**
 * Season classification based on start date
 */
export type Season = 'Winter' | 'Spring' | 'Summer' | 'Fall';
