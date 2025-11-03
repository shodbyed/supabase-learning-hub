/**
 * @fileoverview Match Lineup Mutation Functions
 *
 * Pure functions for match lineup operations.
 * These functions are wrapped by TanStack Query mutation hooks.
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
