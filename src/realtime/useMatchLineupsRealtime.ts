/**
 * @fileoverview Real-time subscription for match lineups
 *
 * Subscribes to both matches and match_lineups table changes and handles:
 * - Refetching lineup data via TanStack Query
 * - Refetching match data via TanStack Query (to get lineup IDs)
 * - Detecting opponent lineup status changes
 *
 * Only active when component using this hook is mounted.
 * Automatically cleans up subscription on unmount.
 *
 * @example
 * const { refetch: refetchMatch } = useMatch(matchId);
 * const { refetch: refetchLineups } = useMatchLineups(matchId);
 * useMatchLineupsRealtime(matchId, {
 *   onMatchUpdate: refetchMatch,
 *   onLineupUpdate: refetchLineups,
 * });
 */

import { useEffect, useRef } from 'react';
import { supabase } from '@/supabaseClient';

interface UseMatchLineupsRealtimeOptions {
  /** Callback to refetch match data (typically TanStack Query refetch) */
  onMatchUpdate: () => void;
  /** Callback to refetch lineups data (typically TanStack Query refetch) */
  onLineupUpdate: () => void;
}

/**
 * Subscribe to real-time updates for match and lineups
 *
 * Listens for INSERT/UPDATE/DELETE events on both tables:
 * - matches: when lineup IDs are added/removed
 * - match_lineups: when lineups are created/updated/locked
 *
 * When updates occur, triggers TanStack Query refetch immediately
 * to get fresh data (no cached data).
 *
 * @param matchId - Match ID to subscribe to
 * @param options - Configuration with refetch callbacks
 */
export function useMatchLineupsRealtime(
  matchId: string | null | undefined,
  options: UseMatchLineupsRealtimeOptions
) {
  const { onMatchUpdate, onLineupUpdate } = options;

  // Use refs to avoid re-subscribing when callbacks change
  const onMatchUpdateRef = useRef(onMatchUpdate);
  const onLineupUpdateRef = useRef(onLineupUpdate);

  // Update refs when callbacks change
  useEffect(() => {
    onMatchUpdateRef.current = onMatchUpdate;
    onLineupUpdateRef.current = onLineupUpdate;
  }, [onMatchUpdate, onLineupUpdate]);

  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`match_lineups_${matchId}`)
      // Watch match_lineups table for lineup changes
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'match_lineups',
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          // Trigger TanStack Query refetch for lineups
          onLineupUpdateRef.current();
        }
      )
      // Watch matches table for lineup ID changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        () => {
          // Trigger TanStack Query refetch for match
          onMatchUpdateRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]); // Only re-subscribe when matchId changes
}
