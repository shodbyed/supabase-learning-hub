/**
 * @fileoverview Report Query Functions
 *
 * Pure data fetching functions for user report-related queries.
 * These functions return plain data and throw errors (no loading states).
 * Used by TanStack Query hooks for caching and state management.
 */

import { supabase } from '@/supabaseClient';

/**
 * Fetch count of pending user reports
 *
 * Gets count of reports with status 'pending' or 'under_review'.
 * Used for notification badges in operator navigation.
 *
 * @returns Number of pending reports
 * @throws Error if database query fails
 *
 * @example
 * const count = await getPendingReportsCount();
 * console.log(`${count} reports awaiting review`);
 */
export async function getPendingReportsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('user_reports')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'under_review']);

  if (error) {
    throw new Error(`Failed to fetch pending reports count: ${error.message}`);
  }

  return count || 0;
}
