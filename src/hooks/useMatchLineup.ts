/**
 * @fileoverview Custom hook for managing match lineup operations
 *
 * Handles all database operations for match lineups including:
 * - Fetching existing lineups
 * - Saving/updating lineups
 * - Locking/unlocking lineups
 * - Real-time synchronization with opponent
 *
 * Supports both 3v3 and 5v5 formats with configurable player counts.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import { useCurrentMember } from '@/hooks/useCurrentMember';

interface LineupPlayer {
  position: number; // 1-indexed position (1, 2, 3 for 3v3 or 1-5 for 5v5)
  playerId: string;
  handicap: number;
}

interface Lineup {
  id: string;
  match_id: string;
  team_id: string;
  locked: boolean;
  players: LineupPlayer[];
}

interface UseMatchLineupOptions {
  matchId: string;
  teamId: string;
  playerCount: 3 | 5; // Number of players in lineup
}

interface UseMatchLineupReturn {
  lineup: Lineup | null;
  opponentLineup: Lineup | null;
  loading: boolean;
  error: string | null;
  saveLineup: (players: LineupPlayer[]) => Promise<void>;
  lockLineup: () => Promise<void>;
  unlockLineup: () => Promise<void>;
}

/**
 * Custom hook for managing match lineup operations
 *
 * @param options Configuration options
 * @returns Lineup state and operations
 */
export function useMatchLineup({
  matchId,
  teamId,
  playerCount,
}: UseMatchLineupOptions): UseMatchLineupReturn {
  const { memberId } = useCurrentMember();

  const [lineup, setLineup] = useState<Lineup | null>(null);
  const [opponentLineup, setOpponentLineup] = useState<Lineup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch lineup from database
   */
  const fetchLineup = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('match_lineups')
        .select('*')
        .eq('match_id', matchId)
        .eq('team_id', teamId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        // Transform database format to component format
        const players: LineupPlayer[] = [];
        for (let i = 1; i <= playerCount; i++) {
          const playerId = data[`player${i}_id`];
          const handicap = data[`player${i}_handicap`];
          if (playerId) {
            players.push({
              position: i,
              playerId,
              handicap: parseFloat(handicap) || 0,
            });
          }
        }

        setLineup({
          id: data.id,
          match_id: data.match_id,
          team_id: data.team_id,
          locked: data.locked,
          players,
        });
      }
    } catch (err: any) {
      console.error('Error fetching lineup:', err);
      setError(err.message);
    }
  };

  /**
   * Fetch opponent's lineup
   */
  const fetchOpponentLineup = async (opponentTeamId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('match_lineups')
        .select('*')
        .eq('match_id', matchId)
        .eq('team_id', opponentTeamId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        const players: LineupPlayer[] = [];
        for (let i = 1; i <= playerCount; i++) {
          const playerId = data[`player${i}_id`];
          const handicap = data[`player${i}_handicap`];
          if (playerId) {
            players.push({
              position: i,
              playerId,
              handicap: parseFloat(handicap) || 0,
            });
          }
        }

        setOpponentLineup({
          id: data.id,
          match_id: data.match_id,
          team_id: data.team_id,
          locked: data.locked,
          players,
        });
      }
    } catch (err: any) {
      console.error('Error fetching opponent lineup:', err);
    }
  };

  /**
   * Save lineup (insert or update)
   */
  const saveLineup = async (players: LineupPlayer[]) => {
    if (!memberId) {
      throw new Error('No member ID available');
    }

    try {
      // Verify user is on the team
      const { data: teamCheck, error: teamCheckError } = await supabase
        .from('team_players')
        .select('*')
        .eq('team_id', teamId)
        .eq('member_id', memberId)
        .single();

      if (teamCheckError || !teamCheck) {
        throw new Error('You are not a member of this team');
      }

      // Build lineup data object dynamically based on player count
      const lineupData: any = {
        match_id: matchId,
        team_id: teamId,
        locked: false,
      };

      // Add player data for each position
      players.forEach((player) => {
        lineupData[`player${player.position}_id`] = player.playerId;
        lineupData[`player${player.position}_handicap`] = player.handicap;
      });

      let result;

      if (lineup?.id) {
        // Update existing lineup
        result = await supabase
          .from('match_lineups')
          .update(lineupData)
          .eq('id', lineup.id)
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

      if (result.error) throw result.error;

      // Update local state
      await fetchLineup();
    } catch (err: any) {
      console.error('Error saving lineup:', err);
      throw err;
    }
  };

  /**
   * Lock lineup
   */
  const lockLineup = async () => {
    if (!lineup?.id) {
      throw new Error('No lineup to lock');
    }

    if (!memberId) {
      throw new Error('No member ID available');
    }

    try {
      // Verify user is on the team
      const { data: teamCheck, error: teamCheckError } = await supabase
        .from('team_players')
        .select('*')
        .eq('team_id', teamId)
        .eq('member_id', memberId)
        .single();

      if (teamCheckError || !teamCheck) {
        throw new Error('You are not a member of this team');
      }

      const { error: updateError } = await supabase
        .from('match_lineups')
        .update({ locked: true })
        .eq('id', lineup.id);

      if (updateError) throw updateError;

      // Update local state
      await fetchLineup();
    } catch (err: any) {
      console.error('Error locking lineup:', err);
      throw err;
    }
  };

  /**
   * Unlock lineup
   */
  const unlockLineup = async () => {
    if (!lineup?.id) {
      throw new Error('No lineup to unlock');
    }

    try {
      const { error: updateError } = await supabase
        .from('match_lineups')
        .update({ locked: false, locked_at: null })
        .eq('id', lineup.id);

      if (updateError) throw updateError;

      // Update local state
      await fetchLineup();
    } catch (err: any) {
      console.error('Error unlocking lineup:', err);
      throw err;
    }
  };

  // Initial fetch
  useEffect(() => {
    if (matchId && teamId) {
      setLoading(true);
      fetchLineup().finally(() => setLoading(false));
    }
  }, [matchId, teamId]);

  // Real-time subscription for lineup changes
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`match_lineups_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_lineups',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          console.log('Lineup real-time update:', payload);

          // Refresh lineup data
          if (payload.new && (payload.new as any).team_id === teamId) {
            fetchLineup();
          } else if (payload.new) {
            // Opponent lineup changed
            fetchOpponentLineup((payload.new as any).team_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, teamId]);

  return {
    lineup,
    opponentLineup,
    loading,
    error,
    saveLineup,
    lockLineup,
    unlockLineup,
  };
}
