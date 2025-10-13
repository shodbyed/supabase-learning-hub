/**
 * @fileoverview Tournament-related type definitions
 * Centralized types for tournament management, scheduling, and date tracking
 */

/**
 * Tournament organizations supported
 */
export type TournamentOrganization = 'BCA' | 'APA' | 'VNEA' | 'UPA';

/**
 * Tournament types
 */
export type TournamentType = 'nationals' | 'regionals' | 'state';

/**
 * Tournament date option returned by search
 * Used in league creation wizard for scheduling around major tournaments
 */
export interface TournamentDateOption {
  id: string;
  label: string;
  description: string;
  startDate: string;
  endDate: string;
  voteCount: number;
  lastConfirmed: string;
}

/**
 * Tournament search parameters
 */
export interface TournamentSearchParams {
  organization: TournamentOrganization;
  tournamentType: TournamentType;
  year?: number;
}

/**
 * Tournament database record
 * Represents tournament date information stored in database
 */
export interface Tournament {
  id: string;
  organization: TournamentOrganization;
  tournament_type: TournamentType;
  name: string;
  start_date: string;
  end_date: string;
  year: number;
  vote_count: number;
  last_confirmed: string;
  location?: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
}
