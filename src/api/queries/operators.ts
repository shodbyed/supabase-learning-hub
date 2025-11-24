/**
 * @fileoverview Operator Query Functions
 *
 * Pure data fetching functions for operator-related queries.
 * These functions return plain data and throw errors (no loading states).
 * Used by TanStack Query hooks for caching and state management.
 */

import { supabase } from '@/supabaseClient';
import type { LeagueOperator } from '@/types/operator';

/**
 * Fetch operator profile by member ID
 *
 * Gets the league operator record for a given member.
 * Returns null if member is not an operator.
 *
 * @param memberId - Member's primary key ID
 * @returns Operator profile or null if not an operator
 * @throws Error if database query fails
 *
 * @example
 * const operator = await getOperatorProfileByMemberId('member-uuid');
 * if (operator) {
 *   console.log(`Operator: ${operator.organization_name}`);
 * }
 */
export async function getOperatorProfileByMemberId(
  memberId: string
): Promise<LeagueOperator | null> {
  const { data, error } = await supabase
    .from('league_operators')
    .select('*')
    .eq('member_id', memberId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch operator profile: ${error.message}`);
  }

  return data;
}
