/**
 * @fileoverview Member Search Query Functions
 *
 * Server-side search for members with filtering and limits.
 * Prevents loading all members into memory for large datasets.
 *
 * Also includes fuzzy matching functions for placeholder player detection
 * during registration (uses Postgres fuzzystrmatch and pg_trgm extensions).
 */

import { supabase } from '@/supabaseClient';
import type { PartialMember } from '@/types/member';

// ============================================================================
// PLACEHOLDER PLAYER MATCHING (for registration flow)
// ============================================================================

/**
 * Result from fuzzy placeholder search (original simple version)
 * Includes match scores to help user identify correct record
 */
export interface PlaceholderMatch {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  city: string | null;
  state: string | null;
  system_player_number: number;
  /** Soundex score 0-4 (4 = exact phonetic match) */
  first_name_score: number;
  /** Soundex score 0-4 (4 = exact phonetic match) */
  last_name_score: number;
  /** Trigram similarity 0-2 (higher = better) */
  city_score: number;
  /** Whether state matches exactly */
  state_match: boolean;
  /** Combined score used for ranking */
  total_score: number;
}

/**
 * Search criteria for enhanced placeholder player search
 * All fields are optional - more fields = higher confidence
 */
export interface PlaceholderSearchCriteria {
  // League Operator info
  operatorFirstName?: string;
  operatorLastName?: string;
  operatorPlayerNumber?: number;

  // Captain info
  captainFirstName?: string;
  captainLastName?: string;
  captainPlayerNumber?: number;

  // User's system info
  systemFirstName?: string;
  systemLastName?: string;
  systemPlayerNumber?: number;
  systemNickname?: string;

  // Team/Location info
  teamName?: string;
  playNight?: string;
  city?: string;
  state?: string;

  // Last opponent (security verification)
  lastOpponentFirstName?: string;
  lastOpponentLastName?: string;
  hasNotPlayedYet?: boolean;
}

/**
 * Result from enhanced placeholder search (v2)
 * Includes grade (A/B/C) for confidence-based decision making
 */
export interface EnhancedPlaceholderMatch {
  member_id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  city: string | null;
  state: string | null;
  system_player_number: number;
  team_name: string | null;
  captain_name: string | null;
  operator_name: string | null;
  total_score: number;
  matched_fields: string[];
  /** Grade based on confidence: A (6+), B (4-5), C (<4) */
  grade: 'A' | 'B' | 'C';
}

/**
 * Search for placeholder players that might match a registering user
 *
 * Uses fuzzy matching with:
 * - Soundex for phonetic name similarity (catches Mike/Michael, Smith/Smythe)
 * - Trigram similarity for city typos (catches Springfield/Sprigfield)
 * - Exact state matching as anchor
 *
 * This is a "show candidates" approach - returns potential matches for user
 * to confirm, not auto-matching. False positives are OK (user says "not me"),
 * false negatives are bad (user's PP exists but we don't find it).
 *
 * @param firstName - User's entered first name
 * @param lastName - User's entered last name
 * @param city - User's entered city (optional, improves matching)
 * @param state - User's entered state (optional, improves matching)
 * @param limit - Max candidates to return (default 5)
 * @param minScore - Minimum combined score threshold (default 5)
 * @returns Array of potential placeholder matches sorted by score
 *
 * @example
 * const matches = await searchPlaceholderMatches('Mike', 'Smith', 'Springfield', 'IL');
 * // Returns PPs like "Michael Smith, Springfield, IL" with high scores
 */
export async function searchPlaceholderMatches(
  firstName: string,
  lastName: string,
  city?: string | null,
  state?: string | null,
  limit: number = 5,
  minScore: number = 5
): Promise<PlaceholderMatch[]> {
  const { data, error } = await supabase.rpc('search_placeholder_matches', {
    p_first_name: firstName.trim(),
    p_last_name: lastName.trim(),
    p_city: city?.trim() || null,
    p_state: state?.trim() || null,
    p_limit: limit,
    p_min_score: minScore,
  });

  if (error) {
    console.error('Placeholder search failed:', error);
    throw new Error(`Failed to search for placeholder matches: ${error.message}`);
  }

  return (data as PlaceholderMatch[]) || [];
}

/**
 * Direct lookup of placeholder player by system number
 *
 * Used when fuzzy search fails but user knows their player number
 * (given by captain or league operator).
 *
 * @param systemNumber - The P-##### number (just the digits)
 * @returns The placeholder player if found, null otherwise
 *
 * @example
 * // User enters "P-00147" or "147"
 * const pp = await lookupPlaceholderBySystemNumber(147);
 * if (pp) {
 *   // Show confirmation: "Is this you? John Smith, Team Rack City"
 * }
 */
export async function lookupPlaceholderBySystemNumber(
  systemNumber: number
): Promise<PlaceholderMatch | null> {
  const { data, error } = await supabase.rpc('lookup_placeholder_by_system_number', {
    p_system_number: systemNumber,
  });

  if (error) {
    console.error('Placeholder lookup failed:', error);
    throw new Error(`Failed to lookup placeholder: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return null;
  }

  // The RPC returns a table, but should only have one row for this lookup
  const row = data[0];
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    nickname: row.nickname,
    city: row.city,
    state: row.state,
    system_player_number: row.system_player_number,
    // Direct lookup doesn't have scores, set to max
    first_name_score: 4,
    last_name_score: 4,
    city_score: 2,
    state_match: true,
    total_score: 12,
  };
}

/**
 * Parse system player number from user input
 *
 * Handles various formats users might enter:
 * - "147" → 147
 * - "P-00147" → 147
 * - "#P-00147" → 147
 * - "00147" → 147
 *
 * @param input - User's entered player number
 * @returns Parsed number, or null if invalid
 */
export function parseSystemPlayerNumber(input: string): number | null {
  // Remove common prefixes and formatting
  const cleaned = input
    .trim()
    .toUpperCase()
    .replace(/^#?P-?/i, '') // Remove #P-, P-, #P, P prefix
    .replace(/^0+/, ''); // Remove leading zeros

  const num = parseInt(cleaned, 10);
  return isNaN(num) || num <= 0 ? null : num;
}

/**
 * Enhanced placeholder player search with full verification fields
 *
 * Used by the /register-existing page to find placeholder players
 * based on multiple optional verification fields. Returns candidates
 * with confidence grades (A/B/C) for decision making.
 *
 * Grade A (6+ matches): High confidence - can auto-merge
 * Grade B (4-5 matches): Medium confidence - LO review required
 * Grade C (<4 matches): Low confidence - no match found
 *
 * @param criteria - Search criteria with optional fields
 * @param limit - Max candidates to return (default 10)
 * @returns Array of potential matches with scores and grades
 *
 * @example
 * const matches = await searchPlaceholderMatchesEnhanced({
 *   systemFirstName: 'Mike',
 *   systemLastName: 'Smith',
 *   teamName: 'Rack City',
 *   captainFirstName: 'John',
 *   city: 'Springfield',
 *   state: 'IL'
 * });
 * // Returns PPs with grade based on how many fields match
 */
export async function searchPlaceholderMatchesEnhanced(
  criteria: PlaceholderSearchCriteria,
  limit: number = 10
): Promise<EnhancedPlaceholderMatch[]> {
  const { data, error } = await supabase.rpc('search_placeholder_matches_v2', {
    p_operator_first_name: criteria.operatorFirstName?.trim() || null,
    p_operator_last_name: criteria.operatorLastName?.trim() || null,
    p_operator_player_number: criteria.operatorPlayerNumber || null,
    p_captain_first_name: criteria.captainFirstName?.trim() || null,
    p_captain_last_name: criteria.captainLastName?.trim() || null,
    p_captain_player_number: criteria.captainPlayerNumber || null,
    p_system_first_name: criteria.systemFirstName?.trim() || null,
    p_system_last_name: criteria.systemLastName?.trim() || null,
    p_system_player_number: criteria.systemPlayerNumber || null,
    p_system_nickname: criteria.systemNickname?.trim() || null,
    p_team_name: criteria.teamName?.trim() || null,
    p_play_night: criteria.playNight?.trim() || null,
    p_city: criteria.city?.trim() || null,
    p_state: criteria.state?.trim() || null,
    p_last_opponent_first_name: criteria.lastOpponentFirstName?.trim() || null,
    p_last_opponent_last_name: criteria.lastOpponentLastName?.trim() || null,
    p_has_not_played_yet: criteria.hasNotPlayedYet || null,
    p_limit: limit,
  });

  if (error) {
    console.error('Enhanced placeholder search failed:', error);
    throw new Error(`Failed to search for placeholder matches: ${error.message}`);
  }

  return (data as EnhancedPlaceholderMatch[]) || [];
}

/**
 * Team verification option for Grade B verification challenge
 */
export interface TeamVerificationOption {
  team_name: string;
  is_correct: boolean;
}

/**
 * Get team verification options for Grade B challenge
 *
 * Returns the member's actual teams plus random decoy teams.
 * The user must identify their correct team to pass verification.
 *
 * @param memberId - The placeholder player's member_id
 * @param decoyCount - Number of decoy (wrong) teams to include (default 3)
 * @returns Array of team options, shuffled (correct teams + decoys)
 *
 * @example
 * const options = await getTeamVerificationOptions('uuid-here');
 * // Returns: [{ team_name: 'Team A', is_correct: true }, { team_name: 'Team B', is_correct: false }, ...]
 * // Display these shuffled to user, check if their selection is_correct
 */
export async function getTeamVerificationOptions(
  memberId: string,
  decoyCount: number = 3
): Promise<TeamVerificationOption[]> {
  const { data, error } = await supabase.rpc('get_team_verification_options', {
    p_member_id: memberId,
    p_decoy_count: decoyCount,
  });

  if (error) {
    console.error('Team verification options fetch failed:', error);
    throw new Error(`Failed to get team verification options: ${error.message}`);
  }

  // Shuffle the results so correct answers aren't always first
  const options = (data as TeamVerificationOption[]) || [];
  return shuffleArray(options);
}

/**
 * Fisher-Yates shuffle algorithm for randomizing array order
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ============================================================================
// STANDARD MEMBER SEARCH (existing functionality)
// ============================================================================

export type MemberSearchFilter = 'all' | 'my_org' | 'state' | 'staff';

/**
 * Search for members with server-side filtering
 *
 * Returns top 50 matches based on search query and filter.
 * Searches by name (first/last) and player number.
 *
 * @param searchQuery - Text to search (name or player number)
 * @param filter - Which subset of members to search
 * @param organizationId - Current user's organization (for 'my_org' filter)
 * @param userState - Current user's state (for 'state' filter)
 * @param limit - Max results to return (default 50)
 * @returns Array of members matching search criteria
 * @throws Error if database query fails
 *
 * @example
 * const members = await searchMembers('john', 'state', null, 'CA');
 * // Returns up to 50 members named John in California
 */
export async function searchMembers(
  searchQuery: string,
  filter: MemberSearchFilter,
  organizationId: string | null,
  userState: string | null,
  limit: number = 50
): Promise<PartialMember[]> {
  // Handle 'my_org' filter separately since it requires a subquery
  if (filter === 'my_org' && organizationId) {
    // Get members who are on teams in my organization's leagues
    const { data: teamPlayers, error: teamPlayersError } = await supabase
      .from('team_players')
      .select('member_id, teams!inner(season_id, seasons!inner(league_id, leagues!inner(organization_id)))')
      .eq('teams.seasons.leagues.organization_id', organizationId);

    if (teamPlayersError) {
      throw new Error(`Failed to search org members: ${teamPlayersError.message}`);
    }

    // Extract unique member IDs
    const memberIds = [...new Set(teamPlayers?.map(tp => tp.member_id) || [])];

    if (memberIds.length === 0) {
      return []; // No members in this org
    }

    // Now query members table with these IDs
    let query = supabase
      .from('members')
      .select('id, first_name, last_name, system_player_number, bca_member_number, state')
      .in('id', memberIds)
      .limit(limit);

    // Apply search if query provided
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      if (/^\d+$/.test(trimmedQuery)) {
        query = query.eq('system_player_number', parseInt(trimmedQuery, 10));
      } else {
        query = query.or(
          `first_name.ilike.%${trimmedQuery}%,last_name.ilike.%${trimmedQuery}%`
        );
      }
    }

    query = query.order('last_name', { ascending: true }).order('first_name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to search members: ${error.message}`);
    }

    return data as PartialMember[];
  }

  // Standard filters (state, staff, all)
  let query = supabase
    .from('members')
    .select('id, first_name, last_name, system_player_number, bca_member_number, state')
    .limit(limit);

  if (filter === 'state' && userState) {
    query = query.eq('state', userState);
  } else if (filter === 'staff') {
    query = query.eq('role', 'league_operator');
  }
  // 'all' filter has no additional conditions

  // Apply search if query provided
  const trimmedQuery = searchQuery.trim();
  if (trimmedQuery) {
    // Check if query is all digits (player number search)
    if (/^\d+$/.test(trimmedQuery)) {
      query = query.eq('system_player_number', parseInt(trimmedQuery, 10));
    } else {
      // Search by name (case-insensitive partial match)
      query = query.or(
        `first_name.ilike.%${trimmedQuery}%,last_name.ilike.%${trimmedQuery}%`
      );
    }
  }
  // If no search query, just return first 50 ordered by name

  // Order by last name, first name
  query = query.order('last_name', { ascending: true }).order('first_name', { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to search members: ${error.message}`);
  }

  return data as PartialMember[];
}
