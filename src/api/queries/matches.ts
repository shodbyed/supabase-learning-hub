/**
 * @fileoverview Match Query Functions
 *
 * Pure data fetching functions for match-related queries.
 * These functions return plain data and throw errors (no loading states).
 * Used by TanStack Query hooks for caching and state management.
 *
 * @see api/hooks/useMatches.ts - React hook wrapper
 */

import { supabase } from '@/supabaseClient';
import type { MatchWithLeagueSettings } from '@/types';

/**
 * Match with team and venue details
 */
export interface MatchWithDetails {
  id: string;
  season_id: string;
  season_week_id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  scheduled_venue_id: string | null;
  actual_venue_id: string | null;
  match_number: number;
  status: string;
  home_team_score: number | null;
  away_team_score: number | null;
  created_at: string;
  updated_at: string;
  scheduled_date?: string;
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
    street_address: string;
    city: string;
    state: string;
  } | null;
  season_week?: {
    id: string;
    scheduled_date: string;
    week_name: string;
    week_type: string;
  } | null;
}

/**
 * Season week with schedule info
 */
export interface SeasonWeek {
  id: string;
  season_id: string;
  week_number: number;
  scheduled_date: string;
  week_name: string;
  week_type: string;
  week_completed: boolean;
}

/**
 * Week schedule (week + matches)
 */
export interface WeekSchedule {
  week: SeasonWeek;
  matches: MatchWithDetails[];
}

/**
 * Fetch match by ID with all details
 *
 * Gets complete match record with team, venue, and week details.
 *
 * @param matchId - Match's primary key ID
 * @returns Complete match record with nested details
 * @throws Error if match not found or database error
 *
 * @example
 * const match = await getMatchById('match-uuid');
 * console.log(`${match.home_team.team_name} vs ${match.away_team.team_name}`);
 */
export async function getMatchById(matchId: string): Promise<MatchWithDetails> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, team_name, captain_id),
      away_team:teams!matches_away_team_id_fkey(id, team_name, captain_id),
      scheduled_venue:venues!matches_scheduled_venue_id_fkey(id, name, street_address, city, state),
      season_week:season_weeks(id, scheduled_date, week_name, week_type)
    `)
    .eq('id', matchId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch match: ${error.message}`);
  }

  return data as MatchWithDetails;
}

/**
 * Fetch all matches for a season with details
 *
 * Gets all matches for a season ordered by match number.
 * Includes team, venue, and week details.
 *
 * @param seasonId - Season's primary key ID
 * @returns Array of matches with nested details
 * @throws Error if database query fails
 *
 * @example
 * const matches = await getMatchesBySeason('season-uuid');
 * matches.forEach(match => console.log(`Match ${match.match_number}: ${match.home_team.team_name} vs ${match.away_team.team_name}`));
 */
export async function getMatchesBySeason(seasonId: string): Promise<MatchWithDetails[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, team_name, captain_id),
      away_team:teams!matches_away_team_id_fkey(id, team_name, captain_id),
      scheduled_venue:venues!matches_scheduled_venue_id_fkey(id, name, street_address, city, state),
      season_week:season_weeks(id, scheduled_date, week_name, week_type)
    `)
    .eq('season_id', seasonId)
    .order('match_number', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch matches: ${error.message}`);
  }

  return (data || []) as MatchWithDetails[];
}

/**
 * Fetch all matches for a team
 *
 * Gets all matches where team is home or away.
 * Ordered by scheduled date.
 *
 * @param teamId - Team's primary key ID
 * @returns Array of matches with nested details
 * @throws Error if database query fails
 *
 * @example
 * const matches = await getMatchesByTeam('team-uuid');
 * const upcomingMatches = matches.filter(m => m.status === 'scheduled');
 */
export async function getMatchesByTeam(teamId: string): Promise<MatchWithDetails[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, team_name, captain_id),
      away_team:teams!matches_away_team_id_fkey(id, team_name, captain_id),
      scheduled_venue:venues!matches_scheduled_venue_id_fkey(id, name, city, state),
      season_week:season_weeks(id, week_name, scheduled_date)
    `)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order('season_week(scheduled_date)', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch team matches: ${error.message}`);
  }

  // Transform to include scheduled_date at top level
  const matches = (data || []).map((match: any) => ({
    ...match,
    scheduled_date: match.season_week?.scheduled_date || null,
  }));

  return matches as MatchWithDetails[];
}

/**
 * Fetch season schedule organized by week
 *
 * Gets all weeks and matches for a season, organized hierarchically.
 * Used for displaying full season schedule with week groupings.
 *
 * @param seasonId - Season's primary key ID
 * @returns Array of weeks with their matches
 * @throws Error if database query fails
 *
 * @example
 * const schedule = await getSeasonSchedule('season-uuid');
 * schedule.forEach(({ week, matches }) => {
 *   console.log(`${week.week_name}: ${matches.length} matches`);
 * });
 */
export async function getSeasonSchedule(seasonId: string): Promise<WeekSchedule[]> {
  // Fetch all season weeks
  const { data: weeksData, error: weeksError } = await supabase
    .from('season_weeks')
    .select('*')
    .eq('season_id', seasonId)
    .order('scheduled_date', { ascending: true });

  if (weeksError) {
    throw new Error(`Failed to fetch season weeks: ${weeksError.message}`);
  }

  // Fetch all matches for season
  const matches = await getMatchesBySeason(seasonId);

  // Organize matches by week
  const schedule: WeekSchedule[] = (weeksData || []).map((week) => ({
    week: week as SeasonWeek,
    matches: matches.filter((match) => match.season_week_id === week.id),
  }));

  return schedule;
}

/**
 * Fetch season weeks for a season
 *
 * Gets all week records (regular, blackout, playoffs, breaks).
 * Ordered by scheduled date.
 *
 * @param seasonId - Season's primary key ID
 * @returns Array of season weeks
 * @throws Error if database query fails
 *
 * @example
 * const weeks = await getSeasonWeeks('season-uuid');
 * const regularWeeks = weeks.filter(w => w.week_type === 'regular');
 */
export async function getSeasonWeeks(seasonId: string): Promise<SeasonWeek[]> {
  const { data, error } = await supabase
    .from('season_weeks')
    .select('*')
    .eq('season_id', seasonId)
    .order('scheduled_date', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch season weeks: ${error.message}`);
  }

  return (data || []) as SeasonWeek[];
}

/**
 * Fetch match details with league settings for scoring
 *
 * Gets match with team names and league scoring configuration.
 * Used by scoring pages to access handicap variants and game rules.
 *
 * @param matchId - Match's primary key ID
 * @returns Match with league settings
 * @throws Error if match not found or database error
 *
 * @example
 * const match = await getMatchWithLeagueSettings('match-uuid');
 * console.log(`Handicap variant: ${match.league.handicap_variant}`);
 */
export async function getMatchWithLeagueSettings(matchId: string): Promise<MatchWithLeagueSettings> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      id,
      season_id,
      home_team_id,
      away_team_id,
      home_team_verified_by,
      away_team_verified_by,
      home_team:teams!matches_home_team_id_fkey(id, team_name),
      away_team:teams!matches_away_team_id_fkey(id, team_name),
      season:seasons!matches_season_id_fkey(
        league:leagues(
          handicap_variant,
          team_handicap_variant,
          golden_break_counts_as_win,
          game_type
        )
      )
    `)
    .eq('id', matchId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch match with league settings: ${error.message}`);
  }

  // Transform nested season/league structure
  const seasonData = Array.isArray(data.season) ? data.season[0] : data.season;
  const leagueData = seasonData && Array.isArray((seasonData as any).league)
    ? (seasonData as any).league[0]
    : (seasonData as any)?.league;

  const homeTeam = Array.isArray(data.home_team) ? data.home_team[0] : data.home_team;
  const awayTeam = Array.isArray(data.away_team) ? data.away_team[0] : data.away_team;

  return {
    id: data.id,
    season_id: data.season_id,
    home_team_id: data.home_team_id,
    away_team_id: data.away_team_id,
    home_team_verified_by: data.home_team_verified_by ?? null,
    away_team_verified_by: data.away_team_verified_by ?? null,
    home_team: homeTeam as any,
    away_team: awayTeam as any,
    league: {
      handicap_variant: (leagueData?.handicap_variant || 'standard') as any,
      team_handicap_variant: (leagueData?.team_handicap_variant || 'standard') as any,
      golden_break_counts_as_win: leagueData?.golden_break_counts_as_win ?? false,
      game_type: leagueData?.game_type || '8-ball',
    },
  };
}

/**
 * Fetch match lineups for both teams
 *
 * Gets lineup records for home and away teams.
 * Both lineups must be locked before scoring can begin.
 * Used by scoring pages to access player IDs and handicaps.
 *
 * @param matchId - Match's primary key ID
 * @param homeTeamId - Home team's primary key ID
 * @param awayTeamId - Away team's primary key ID
 * @returns Object with homeLineup and awayLineup
 * @throws Error if lineups not found, not locked, or database error
 *
 * @example
 * const { homeLineup, awayLineup } = await getMatchLineups(matchId, homeTeamId, awayTeamId);
 * console.log(`Home player 1: ${homeLineup.player1_id}`);
 */
export async function getMatchLineups(matchId: string, homeTeamId: string, awayTeamId: string) {
  const { data: lineupsData, error: lineupsError } = await supabase
    .from('match_lineups')
    .select('*')
    .eq('match_id', matchId)
    .in('team_id', [homeTeamId, awayTeamId]);

  if (lineupsError) {
    throw new Error(`Failed to fetch lineups: ${lineupsError.message}`);
  }

  // Separate home and away lineups
  const homeLineupData = lineupsData?.find(l => l.team_id === homeTeamId);
  const awayLineupData = lineupsData?.find(l => l.team_id === awayTeamId);

  if (!homeLineupData || !awayLineupData) {
    throw new Error('Both team lineups must be locked before scoring can begin');
  }

  if (!homeLineupData.locked || !awayLineupData.locked) {
    throw new Error('Both team lineups must be locked before scoring can begin');
  }

  return {
    homeLineup: homeLineupData,
    awayLineup: awayLineupData,
  };
}

/**
 * Fetch match games (scoring results)
 *
 * Gets all game records for a match showing winners, confirmations, etc.
 * Returns empty array if no games exist (should not happen in normal flow).
 * Used by scoring pages to display and update game results.
 *
 * @param matchId - Match's primary key ID
 * @returns Array of match game records
 * @throws Error if database error
 *
 * @example
 * const games = await getMatchGames(matchId);
 * const gamesMap = new Map(games.map(g => [g.game_number, g]));
 */
export async function getMatchGames(matchId: string) {
  const { data: gamesData, error: gamesError } = await supabase
    .from('match_games')
    .select('*')
    .eq('match_id', matchId);

  if (gamesError) {
    throw new Error(`Failed to fetch match games: ${gamesError.message}`);
  }

  return gamesData || [];
}
