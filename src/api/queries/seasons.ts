/**
 * @fileoverview Season Query Functions
 *
 * Pure data fetching functions for season-related queries.
 * These functions return plain data and throw errors (no loading states).
 * Used by TanStack Query hooks for caching and state management.
 *
 * @see api/hooks/useSeasons.ts - React hook wrapper
 */

import { supabase } from '@/supabaseClient';

/**
 * Season data structure
 * Represents a pool league season with schedule and status
 */
export interface Season {
  id: string;
  league_id: string;
  season_number: number;
  start_date: string;
  end_date: string;
  regular_weeks: number;
  status: 'upcoming' | 'active' | 'completed';
  playoff_format?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all seasons for a league
 *
 * Gets all seasons ordered by creation date (newest first).
 * Used for season history and selection dropdowns.
 *
 * @param leagueId - League's primary key ID
 * @returns Array of seasons ordered by creation date (newest first)
 * @throws Error if database query fails
 *
 * @example
 * const seasons = await getSeasonsByLeague('league-uuid');
 * seasons.forEach(season => console.log(`Season ${season.season_number}: ${season.status}`));
 */
export async function getSeasonsByLeague(leagueId: string): Promise<Season[]> {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('league_id', leagueId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch seasons: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch season by ID
 *
 * Gets complete season record by primary key.
 *
 * @param seasonId - Season's primary key ID
 * @returns Complete season record
 * @throws Error if season not found or database error
 *
 * @example
 * const season = await getSeasonById('season-uuid');
 * console.log(`Season ${season.season_number} runs from ${season.start_date} to ${season.end_date}`);
 */
export async function getSeasonById(seasonId: string): Promise<Season> {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('id', seasonId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch season: ${error.message}`);
  }

  return data;
}

/**
 * Fetch most recent season for a league
 *
 * Gets the latest season (by creation date) regardless of status.
 * Could be upcoming, active, or completed.
 * Returns null if league has no seasons yet.
 *
 * @param leagueId - League's primary key ID
 * @returns Most recent season or null if none exist
 * @throws Error if database query fails
 *
 * @example
 * const currentSeason = await getMostRecentSeason('league-uuid');
 * if (currentSeason) {
 *   console.log(`Current season status: ${currentSeason.status}`);
 * }
 */
export async function getMostRecentSeason(leagueId: string): Promise<Season | null> {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('league_id', leagueId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch most recent season: ${error.message}`);
  }

  return data;
}

/**
 * Fetch active season for a league
 *
 * Gets the season with status='active' for a league.
 * Returns null if no active season exists.
 *
 * @param leagueId - League's primary key ID
 * @returns Active season or null if none exists
 * @throws Error if database query fails
 *
 * @example
 * const activeSeason = await getActiveSeason('league-uuid');
 * if (activeSeason) {
 *   console.log(`Active season ${activeSeason.season_number} is in progress`);
 * } else {
 *   console.log('No active season - league is between seasons');
 * }
 */
export async function getActiveSeason(leagueId: string): Promise<Season | null> {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('league_id', leagueId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch active season: ${error.message}`);
  }

  return data;
}

/**
 * Fetch count of seasons for a league
 *
 * Efficient count-only query for league progress calculations.
 * Doesn't fetch full season data.
 *
 * @param leagueId - League's primary key ID
 * @returns Number of seasons in league
 * @throws Error if database query fails
 *
 * @example
 * const count = await getSeasonCount('league-uuid');
 * console.log(`This league has run ${count} seasons`);
 */
export async function getSeasonCount(leagueId: string): Promise<number> {
  const { count, error } = await supabase
    .from('seasons')
    .select('*', { count: 'exact', head: true })
    .eq('league_id', leagueId);

  if (error) {
    throw new Error(`Failed to fetch season count: ${error.message}`);
  }

  return count || 0;
}
