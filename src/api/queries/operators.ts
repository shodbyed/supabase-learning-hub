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

/**
 * Fetch all league operators
 *
 * Gets all league operator records with their member information.
 * Used by developers for impersonation/testing purposes.
 *
 * @returns List of all league operators with member details
 * @throws Error if database query fails
 *
 * @example
 * const operators = await getAllLeagueOperators();
 * console.log(`Found ${operators.length} operators`);
 */
export async function getAllLeagueOperators(): Promise<Array<{
  id: string;
  organization_name: string;
  member_id: string;
  first_name: string;
  last_name: string;
}>> {
  const { data, error } = await supabase
    .from('league_operators')
    .select(`
      id,
      organization_name,
      member_id,
      members!inner (
        first_name,
        last_name
      )
    `)
    .order('organization_name');

  if (error) {
    throw new Error(`Failed to fetch league operators: ${error.message}`);
  }

  // Flatten the nested member data
  return (data || []).map((op: any) => ({
    id: op.id,
    organization_name: op.organization_name,
    member_id: op.member_id,
    first_name: op.members.first_name,
    last_name: op.members.last_name,
  }));
}
