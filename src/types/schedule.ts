/**
 * @fileoverview Schedule-related type definitions
 *
 * Types for team schedule positions, matches, and schedule generation.
 * Used for creating and managing league schedules with matchup assignments.
 */

/**
 * Match status types
 */
export type MatchStatus =
  | 'scheduled'      // Not yet played
  | 'in_progress'    // Currently being played
  | 'completed'      // Finished with scores
  | 'forfeited'      // One team forfeited
  | 'postponed';     // Rescheduled to different date

/**
 * Team schedule position assignment
 * Maps teams to positions (1-N) used in matchup tables
 */
export interface TeamSchedulePosition {
  id: string;
  season_id: string;
  team_id: string;
  schedule_position: number;  // 1-N position in matchup table
  created_at: string;
  updated_at: string;
}

/**
 * Team schedule position insert data
 */
export interface TeamSchedulePositionInsertData {
  season_id: string;
  team_id: string;
  schedule_position: number;
}

/**
 * Match record - weekly matchup between two teams
 */
export interface Match {
  id: string;
  season_id: string;
  season_week_id: string;       // FK to season_weeks table
  home_team_id: string | null;  // Null if BYE
  away_team_id: string | null;  // Null if BYE
  scheduled_venue_id: string | null;  // Home team's venue by default
  actual_venue_id: string | null;     // If venue changed from scheduled
  match_number: number;          // Order on the night (1, 2, 3...)
  status: MatchStatus;

  // Score tracking (nullable until completed)
  home_team_score: number | null;
  away_team_score: number | null;

  created_at: string;
  updated_at: string;
}

/**
 * Match insert data
 */
export interface MatchInsertData {
  season_id: string;
  season_week_id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  scheduled_venue_id: string | null;
  match_number: number;
  status?: MatchStatus;
}

/**
 * Match with expanded team and venue details
 * Used for displaying match information
 */
export interface MatchWithDetails extends Match {
  home_team?: {
    id: string;
    team_name: string;
    captain_id: string;
  } | null;
  away_team?: {
    id: string;
    team_name: string;
    captain_id: string;
  } | null;
  scheduled_venue?: {
    id: string;
    name: string;
  } | null;
  actual_venue?: {
    id: string;
    name: string;
  } | null;
  season_week?: {
    id: string;
    scheduled_date: string;
    week_name: string;
    week_type: string;
  };
}

/**
 * Matchup pair from matchup tables
 * Array of [position1, position2] representing which teams play
 */
export type MatchupPair = [number, number];

/**
 * Weekly matchup structure from matchup tables (legacy format)
 * @deprecated Use optimized format (MatchupPair[][]) for new schedules
 */
export interface WeeklyMatchup {
  week: number;
  matches: MatchupPair[];
}

/**
 * Matchup table type - array of weeks, each containing match pairs
 * Week number = array index + 1
 */
export type MatchupTable = MatchupPair[][];

/**
 * Team with assigned schedule position
 * Used during schedule generation
 */
export interface TeamWithPosition {
  id: string;
  team_name: string;
  home_venue_id: string | null;
  schedule_position: number;
}

/**
 * Season week data
 */
export interface SeasonWeek {
  id: string;
  scheduled_date: string;
  week_name: string;
  week_type: string;
  week_completed: boolean;
}

/**
 * Extended match details with venue location
 */
export interface MatchWithVenueDetails extends MatchWithDetails {
  scheduled_venue?: {
    id: string;
    name: string;
    street_address: string;
    city: string;
    state: string;
  } | null;
}

/**
 * Week schedule data - week with all its matches
 */
export interface WeekSchedule {
  week: SeasonWeek;
  matches: MatchWithDetails[];
}
