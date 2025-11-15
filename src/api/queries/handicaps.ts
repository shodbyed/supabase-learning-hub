/**
 * @fileoverview Handicap Query Functions
 *
 * Pure data fetching functions for handicap-related queries.
 * These functions return plain data and throw errors (no loading states).
 * Used by TanStack Query hooks for caching and state management.
 */

import { supabase } from '@/supabaseClient';
import type { HandicapThresholds } from '@/types';

/**
 * Fetch handicap thresholds from 3v3 chart
 *
 * Looks up games to win/tie/lose based on handicap difference.
 * Used by 3v3 scoring to determine match outcome.
 *
 * @param handicapDiff - Handicap difference (capped at ±12)
 * @returns Handicap thresholds (games_to_win, games_to_tie, games_to_lose)
 * @throws Error if threshold not found or database error
 *
 * @example
 * const thresholds = await getHandicapThresholds3v3(5);
 * console.log(`Need ${thresholds.games_to_win} games to win`);
 */
export async function getHandicapThresholds3v3(handicapDiff: number): Promise<HandicapThresholds> {
  // First try with .single()
  let { data, error } = await supabase
    .from('handicap_chart_3vs3')
    .select('*')
    .eq('hcp_diff', handicapDiff)
    .single();

  // If RLS is blocking (406) or single() fails, try without single() and take first row
  if (error?.code === 'PGRST116' || error?.code === '406' || error?.message?.includes('406')) {
    console.log('⚠️ RLS blocking or multiple rows, trying without .single()');
    const result = await supabase
      .from('handicap_chart_3vs3')
      .select('*')
      .eq('hcp_diff', handicapDiff)
      .limit(1);

    if (result.error) {
      throw new Error(`Failed to fetch handicap thresholds: ${result.error.message}`);
    }

    if (!result.data || result.data.length === 0) {
      throw new Error(`No handicap threshold found for diff ${handicapDiff}`);
    }

    return result.data[0] as HandicapThresholds;
  }

  if (error) {
    throw new Error(`Failed to fetch handicap thresholds: ${error.message}`);
  }

  return data as HandicapThresholds;
}
