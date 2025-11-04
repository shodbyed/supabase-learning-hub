/**
 * @fileoverview Team-related type definitions
 * Types for teams, rosters, and player management
 */

/**
 * Team status types
 */
export type TeamStatus = 'active' | 'withdrawn' | 'forfeited';

/**
 * Team player status types
 */
export type TeamPlayerStatus = 'active' | 'inactive' | 'dropped';

/**
 * Team database record interface
 * Represents a team competing in a specific season
 */
export interface Team {
  id: string;
  season_id: string;
  league_id: string;
  captain_id: string;
  home_venue_id: string | null;
  team_name: string;
  roster_size: number; // 5 or 8
  wins: number;
  losses: number;
  ties: number;
  points: number;
  games_won: number;
  games_lost: number;
  status: TeamStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Team insert data (for creating new teams)
 * Omits auto-generated fields and stats
 */
export interface TeamInsertData {
  season_id: string;
  league_id: string;
  captain_id: string;
  home_venue_id?: string | null;
  team_name: string;
  roster_size: number;
}

/**
 * Team player (roster member) database record
 * Links a player to a team for a specific season
 */
export interface TeamPlayer {
  id: string;
  team_id: string;
  member_id: string;
  season_id: string;
  is_captain: boolean;
  individual_wins: number;
  individual_losses: number;
  skill_level: number | null; // BCA skill level 1-9
  status: TeamPlayerStatus;
  joined_at: string;
  updated_at: string;
}

/**
 * Team player insert data (for adding players to roster)
 * Omits auto-generated fields and stats
 */
export interface TeamPlayerInsertData {
  team_id: string;
  member_id: string;
  season_id: string;
  is_captain?: boolean;
  skill_level?: number | null;
}

/**
 * Team with expanded data for display
 * Includes captain info and venue name
 */
export interface TeamWithDetails extends Team {
  captain_name?: string;
  captain_email?: string;
  venue_name?: string;
  player_count?: number;
}

/**
 * Team with full nested query data from Supabase
 * Used when querying teams with captain, roster, and venue details
 */
export interface TeamWithQueryDetails extends Team {
  captain?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    system_player_number: number;
    bca_member_number: string | null;
  };
  team_players?: Array<{
    count?: number;
    member_id?: string;
    is_captain?: boolean;
    members?: {
      id: string;
      first_name: string;
      last_name: string;
      system_player_number: number;
      bca_member_number: string | null;
    };
  }>;
  venue?: {
    id: string;
    name: string;
    phone?: string;
    street_address?: string;
    city?: string;
    state?: string;
  };
}

/**
 * Utility function to format team record for display
 */
export function formatTeamRecord(team: Team): string {
  if (team.wins === 0 && team.losses === 0 && team.ties === 0) {
    return '0-0';
  }
  if (team.ties > 0) {
    return `${team.wins}-${team.losses}-${team.ties}`;
  }
  return `${team.wins}-${team.losses}`;
}

/**
 * Utility function to calculate win percentage
 */
export function calculateWinPercentage(team: Team): number {
  const totalGames = team.wins + team.losses;
  if (totalGames === 0) return 0;
  return Math.round((team.wins / totalGames) * 100);
}

/**
 * Return type for useTeamManagement hook
 * Provides all team management data and control functions
 */
export interface UseTeamManagementReturn {
  league: import('./league').League | null;
  venues: import('./venue').Venue[];
  leagueVenues: import('./venue').LeagueVenue[];
  teams: TeamWithQueryDetails[];
  members: import('./member').PartialMember[]; // Partial members for captain/player selection
  seasonId: string | null;
  previousSeasonId: string | null;
  loading: boolean;
  error: string | null;
  refreshTeams: () => Promise<void>;
  // TODO: Remove these setters - use TanStack Query mutations/invalidations instead
  setLeagueVenues: React.Dispatch<React.SetStateAction<import('./venue').LeagueVenue[]>>;
  setTeams: React.Dispatch<React.SetStateAction<TeamWithQueryDetails[]>>;
}

/**
 * Utility function to check if roster is full
 */
export function isRosterFull(currentCount: number, rosterSize: number): boolean {
  return currentCount >= rosterSize;
}

/**
 * Utility function to get remaining roster spots
 */
export function getRemainingSpots(currentCount: number, rosterSize: number): number {
  return Math.max(0, rosterSize - currentCount);
}
