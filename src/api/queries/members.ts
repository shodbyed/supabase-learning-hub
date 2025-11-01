/**
 * @fileoverview Member Query Functions
 *
 * Pure data fetching functions for member-related queries.
 * These functions return plain data and throw errors (no loading states).
 * Used by TanStack Query hooks for caching and state management.
 *
 * @see api/hooks/useCurrentMember.ts - React hook wrapper
 * @see api/hooks/useUserProfile.ts - React hook wrapper
 * @see api/hooks/useOperatorId.ts - React hook wrapper
 */

import { supabase } from '@/supabaseClient';
import type { Member } from '@/types';

/**
 * Fetch current member by auth user ID
 *
 * Connects authenticated user to their member record.
 * Used across the app to get member ID and basic info.
 *
 * @param userId - Supabase auth user ID
 * @returns Member data with id, user_id, and first_name
 * @throws Error if member not found or database error
 *
 * @example
 * const member = await getCurrentMember(user.id);
 * console.log(member.id, member.first_name);
 */
export async function getCurrentMember(userId: string) {
  const { data, error } = await supabase
    .from('members')
    .select('id, user_id, first_name, last_name')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch complete member profile by auth user ID
 *
 * Gets full member record including all profile fields, role, and metadata.
 * Used for profile pages and role-based access control.
 *
 * @param userId - Supabase auth user ID
 * @returns Complete member record
 * @throws Error with code 'PGRST116' if member not found (user hasn't completed application)
 * @throws Error for other database errors
 *
 * @example
 * const profile = await getMemberProfile(user.id);
 * if (profile.role === 'league_operator') { ... }
 */
export async function getMemberProfile(userId: string): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch member by member ID
 *
 * Gets full member record by the member's primary key ID.
 * Used when you already have a member ID (e.g., from a team roster).
 *
 * @param memberId - Member's primary key ID
 * @returns Complete member record
 * @throws Error if member not found or database error
 *
 * @example
 * const member = await getMemberById('member-uuid');
 */
export async function getMemberById(memberId: string): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', memberId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch operator ID for a member
 *
 * Looks up the league_operator record for a member to get their operator ID.
 * Used across operator dashboard features.
 *
 * @param memberId - Member's primary key ID
 * @returns Object with operator ID
 * @throws Error if member is not an operator or database error
 *
 * @example
 * const { id } = await getOperatorId(memberId);
 * // Use operator ID for operator-specific queries
 */
export async function getOperatorId(memberId: string): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('league_operators')
    .select('id')
    .eq('member_id', memberId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch operator ID by auth user ID (convenience function)
 *
 * Combines member lookup + operator lookup in one function.
 * Useful when you only have the auth user ID.
 *
 * @param userId - Supabase auth user ID
 * @returns Object with operator ID
 * @throws Error if user is not a member, not an operator, or database error
 *
 * @example
 * const { id } = await getOperatorIdByUserId(user.id);
 */
export async function getOperatorIdByUserId(userId: string): Promise<{ id: string }> {
  // First get member ID
  const member = await getCurrentMember(userId);

  // Then get operator ID
  return getOperatorId(member.id);
}

/**
 * Check if member is a league operator
 *
 * Quick check to see if a member has an operator record.
 *
 * @param memberId - Member's primary key ID
 * @returns True if member is an operator, false otherwise
 *
 * @example
 * if (await isOperator(memberId)) {
 *   // Show operator features
 * }
 */
export async function isOperator(memberId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('league_operators')
    .select('id')
    .eq('member_id', memberId)
    .single();

  // If error code is PGRST116 (no rows), member is not an operator
  if (error?.code === 'PGRST116') return false;

  // Other errors should be thrown
  if (error) throw error;

  // Has operator record
  return !!data;
}
