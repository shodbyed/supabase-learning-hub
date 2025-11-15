/**
 * @fileoverview Match Lineup Mutation Functions
 *
 * Generic, reusable functions for match lineup operations.
 * These functions are wrapped by TanStack Query mutation hooks.
 *
 * Philosophy: Keep mutations generic and flexible.
 * Instead of many specific functions, provide generic updateMatchLineup()
 * that can update any field(s).
 *
 * Match lineups track which players from each team are playing in a specific match.
 * Supports both 3v3 and 5v5 formats with player positions and handicaps.
 *
 * @see api/hooks/useMatchLineupMutations.ts - Mutation hooks that wrap these functions
 */

import { supabase } from '@/supabaseClient';

/**
 * Player in a lineup with position and handicap
 */
export interface LineupPlayer {
  position: number; // 1-indexed position (1-5 for 5v5, 1-3 for 3v3)
  playerId: string;
  handicap: number;
}

/**
 * Parameters for saving/updating a lineup
 */
export interface SaveLineupParams {
  matchId: string;
  teamId: string;
  players: LineupPlayer[];
  memberId: string; // User performing the action
  existingLineupId?: string; // If updating existing lineup
}

/**
 * Parameters for locking a lineup
 */
export interface LockLineupParams {
  lineupId: string;
  teamId: string;
  memberId: string; // User performing the action
}

/**
 * Parameters for unlocking a lineup
 */
export interface UnlockLineupParams {
  lineupId: string;
  teamId: string;
  memberId: string; // User performing the action
}

/**
 * Match lineup database record
 */
export interface MatchLineup {
  id: string;
  match_id: string;
  team_id: string;
  locked: boolean;
  player1_id?: string;
  player1_handicap?: number;
  player2_id?: string;
  player2_handicap?: number;
  player3_id?: string;
  player3_handicap?: number;
  player4_id?: string;
  player4_handicap?: number;
  player5_id?: string;
  player5_handicap?: number;
}

/**
 * Save or update a match lineup
 *
 * Creates a new lineup if existingLineupId is not provided, otherwise updates.
 * Verifies the user is a member of the team before allowing the operation.
 *
 * @param params - Lineup save parameters
 * @returns The saved/updated lineup
 * @throws Error if validation fails or database operation fails
 */
export async function saveMatchLineup(params: SaveLineupParams): Promise<MatchLineup> {
  // Verify user is on the team
  const { data: teamCheck, error: teamCheckError } = await supabase
    .from('team_players')
    .select('*')
    .eq('team_id', params.teamId)
    .eq('member_id', params.memberId)
    .single();

  if (teamCheckError || !teamCheck) {
    throw new Error('You are not a member of this team');
  }

  // Build lineup data object dynamically based on player count
  const lineupData: any = {
    match_id: params.matchId,
    team_id: params.teamId,
    locked: false,
  };

  // Add player data for each position
  params.players.forEach((player) => {
    lineupData[`player${player.position}_id`] = player.playerId;
    lineupData[`player${player.position}_handicap`] = player.handicap;
  });

  let result;

  if (params.existingLineupId) {
    // Update existing lineup
    result = await supabase
      .from('match_lineups')
      .update(lineupData)
      .eq('id', params.existingLineupId)
      .select()
      .single();
  } else {
    // Insert new lineup
    result = await supabase
      .from('match_lineups')
      .insert(lineupData)
      .select()
      .single();
  }

  if (result.error) {
    throw new Error(`Failed to save lineup: ${result.error.message}`);
  }

  return result.data;
}

/**
 * Lock a match lineup
 *
 * Prevents further edits to the lineup. Verifies user is on the team.
 *
 * @param params - Lock parameters
 * @returns The locked lineup
 * @throws Error if validation fails or database operation fails
 */
export async function lockMatchLineup(params: LockLineupParams): Promise<MatchLineup> {
  // Verify user is on the team
  const { data: teamCheck, error: teamCheckError } = await supabase
    .from('team_players')
    .select('*')
    .eq('team_id', params.teamId)
    .eq('member_id', params.memberId)
    .single();

  if (teamCheckError || !teamCheck) {
    throw new Error('You are not a member of this team');
  }

  const { data, error } = await supabase
    .from('match_lineups')
    .update({ locked: true })
    .eq('id', params.lineupId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to lock lineup: ${error.message}`);
  }

  return data;
}

/**
 * Unlock a match lineup
 *
 * Allows edits to the lineup again. Verifies user is on the team.
 *
 * @param params - Unlock parameters
 * @returns The unlocked lineup
 * @throws Error if validation fails or database operation fails
 */
export async function unlockMatchLineup(params: UnlockLineupParams): Promise<MatchLineup> {
  // Verify user is on the team
  const { data: teamCheck, error: teamCheckError } = await supabase
    .from('team_players')
    .select('*')
    .eq('team_id', params.teamId)
    .eq('member_id', params.memberId)
    .single();

  if (teamCheckError || !teamCheck) {
    throw new Error('You are not a member of this team');
  }

  const { data, error } = await supabase
    .from('match_lineups')
    .update({ locked: false })
    .eq('id', params.lineupId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to unlock lineup: ${error.message}`);
  }

  return data;
}

/**
 * Parameters for creating an empty lineup
 */
export interface CreateEmptyLineupParams {
  matchId: string;
  teamId: string;
}

/**
 * Create an empty match lineup
 *
 * Creates a placeholder lineup record with no players selected.
 * Used when user first enters the lineup page to establish the record.
 * Handles race conditions - if lineup already exists, returns existing one.
 *
 * @param params - Match and team IDs
 * @returns The created or existing lineup
 * @throws Error if database operation fails
 *
 * @example
 * const lineup = await createEmptyLineup({ matchId: '123', teamId: 'team-456' });
 */
export async function createEmptyLineup(params: CreateEmptyLineupParams): Promise<MatchLineup> {
  // Try to insert empty lineup
  const { data, error } = await supabase
    .from('match_lineups')
    .insert({
      match_id: params.matchId,
      team_id: params.teamId,
      player1_id: null,
      player1_handicap: 0,
      player2_id: null,
      player2_handicap: 0,
      player3_id: null,
      player3_handicap: 0,
      home_team_modifier: 0,
      locked: false,
      locked_at: null,
    })
    .select()
    .single();

  // If unique constraint violation (race condition - another user just created it)
  if (error && error.code === '23505') {
    // Fetch the existing lineup
    const { data: existingLineup, error: fetchError } = await supabase
      .from('match_lineups')
      .select('*')
      .eq('match_id', params.matchId)
      .eq('team_id', params.teamId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch existing lineup: ${fetchError.message}`);
    }

    return existingLineup;
  }

  if (error) {
    throw new Error(`Failed to create lineup: ${error.message}`);
  }

  return data;
}

/**
 * Generic match lineup update parameters
 */
export interface UpdateMatchLineupParams {
  lineupId: string;
  updates: Record<string, any>; // Any lineup field(s) to update
  teamId?: string; // Optional - if provided, verifies user is on team
  memberId?: string; // Optional - required if teamId provided
}

/**
 * Update any field(s) on a match lineup
 *
 * Generic mutation that can update any lineup field(s).
 * Use this for all lineup updates instead of creating specific mutations.
 * Optionally verifies user is on the team before updating.
 *
 * @param params - Lineup ID and fields to update
 * @returns The updated lineup
 * @throws Error if validation fails or database operation fails
 *
 * @example
 * // Update locked status
 * await updateMatchLineup({
 *   lineupId: '123',
 *   updates: { locked: true }
 * });
 *
 * @example
 * // Update with team verification
 * await updateMatchLineup({
 *   lineupId: '123',
 *   updates: { locked: true },
 *   teamId: 'team-456',
 *   memberId: 'member-789'
 * });
 *
 * @example
 * // Update multiple fields
 * await updateMatchLineup({
 *   lineupId: '123',
 *   updates: {
 *     locked: true,
 *     locked_at: new Date().toISOString(),
 *     player1_id: 'player-456'
 *   }
 * });
 */
export async function updateMatchLineup(params: UpdateMatchLineupParams): Promise<MatchLineup> {
  // Optional team verification
  if (params.teamId && params.memberId) {
    const { data: teamCheck, error: teamCheckError } = await supabase
      .from('team_players')
      .select('*')
      .eq('team_id', params.teamId)
      .eq('member_id', params.memberId)
      .single();

    if (teamCheckError || !teamCheck) {
      throw new Error('You are not a member of this team');
    }
  }

  const { data, error } = await supabase
    .from('match_lineups')
    .update(params.updates)
    .eq('id', params.lineupId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update lineup: ${error.message}`);
  }

  return data;
}
