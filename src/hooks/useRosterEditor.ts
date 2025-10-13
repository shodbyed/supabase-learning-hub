/**
 * @fileoverview Roster Editor Hook
 *
 * Custom hook for managing team roster state and validation.
 * Handles player selection, duplicate detection, and captain validation.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

interface UseRosterEditorParams {
  /** Size of the roster (5 or 8) */
  rosterSize: number;
  /** Captain ID */
  captainId: string;
  /** Existing team to edit (optional) */
  existingTeamId?: string;
}

interface UseRosterEditorReturn {
  /** Array of player IDs (excluding captain) */
  playerIds: string[];
  /** Error message for roster validation */
  rosterError: string | null;
  /** Update player at specific roster index */
  handlePlayerChange: (index: number, memberId: string) => void;
  /** Validate roster (returns error message or null) */
  validateRoster: () => string | null;
  /** Clear roster error */
  clearRosterError: () => void;
  /** Get all player IDs including captain */
  getAllPlayerIds: () => string[];
  /** Loading state for roster data */
  loading: boolean;
}

/**
 * Custom hook for roster editor logic
 *
 * Manages:
 * - Player selection state (array of player IDs)
 * - Duplicate player detection
 * - Captain-in-roster validation
 * - Loading existing roster when editing
 *
 * @param params - Configuration for roster editor
 * @returns Roster state and management functions
 */
export function useRosterEditor({
  rosterSize,
  captainId,
  existingTeamId,
}: UseRosterEditorParams): UseRosterEditorReturn {
  const [playerIds, setPlayerIds] = useState<string[]>(Array(rosterSize - 1).fill(''));
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Load existing roster when editing a team
   */
  useEffect(() => {
    if (!existingTeamId) return;

    const loadRoster = async () => {
      setLoading(true);
      try {
        const { data: rosterData, error: rosterError } = await supabase
          .from('team_players')
          .select('member_id, is_captain')
          .eq('team_id', existingTeamId)
          .order('is_captain', { ascending: false });

        if (rosterError) throw rosterError;

        // Filter out captain, get just the other players
        const nonCaptainPlayers = rosterData?.filter(p => !p.is_captain).map(p => p.member_id) || [];

        // Fill the roster array with existing players, pad with empty strings
        const filledRoster = [...nonCaptainPlayers];
        while (filledRoster.length < rosterSize - 1) {
          filledRoster.push('');
        }

        setPlayerIds(filledRoster.slice(0, rosterSize - 1));
      } catch (err) {
        console.error('Error loading roster:', err);
        setRosterError('Failed to load existing roster');
      } finally {
        setLoading(false);
      }
    };

    loadRoster();
  }, [existingTeamId, rosterSize]);

  /**
   * Update player at specific roster index with validation
   */
  const handlePlayerChange = (index: number, memberId: string) => {
    const newPlayerIds = [...playerIds];
    newPlayerIds[index] = memberId;
    setPlayerIds(newPlayerIds);

    // Clear error first
    setRosterError(null);

    // Validate for duplicates immediately
    if (memberId) {
      const selectedPlayers = newPlayerIds.filter(id => id !== '');
      const uniquePlayers = new Set(selectedPlayers);

      if (selectedPlayers.length !== uniquePlayers.size) {
        setRosterError('Cannot select the same player multiple times');
      } else if (selectedPlayers.includes(captainId)) {
        setRosterError('Captain is automatically added to roster - do not select them again as a player');
      }
    }
  };

  /**
   * Validate roster for duplicates and captain conflicts
   * Returns error message or null if valid
   */
  const validateRoster = (): string | null => {
    // Check for duplicate players
    const selectedPlayers = playerIds.filter(id => id !== '');
    const uniquePlayers = new Set(selectedPlayers);
    if (selectedPlayers.length !== uniquePlayers.size) {
      return 'Cannot select the same player multiple times';
    }

    // Check if captain is also in roster
    if (selectedPlayers.includes(captainId)) {
      return 'Captain is automatically added to roster - do not select them again as a player';
    }

    return null;
  };

  /**
   * Clear roster error message
   */
  const clearRosterError = () => {
    setRosterError(null);
  };

  /**
   * Get all player IDs including captain
   * Useful for preparing roster data for database insertion
   */
  const getAllPlayerIds = (): string[] => {
    return [captainId, ...playerIds.filter(id => id !== '')];
  };

  return {
    playerIds,
    rosterError,
    handlePlayerChange,
    validateRoster,
    clearRosterError,
    getAllPlayerIds,
    loading,
  };
}
