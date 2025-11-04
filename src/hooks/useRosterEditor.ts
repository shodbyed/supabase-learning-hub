/**
 * @fileoverview Roster Editor Hook
 *
 * Custom hook for managing team roster state and validation.
 * Handles player selection, duplicate detection, and captain validation.
 */

import { useState, useEffect } from 'react';
import { useTeamRoster } from '@/api/hooks/useTeams';
import type { TeamWithQueryDetails } from '@/types/team';

interface UseRosterEditorParams {
  /** Size of the roster (5 or 8) */
  rosterSize: number;
  /** Captain ID */
  captainId: string;
  /** Existing team to edit (optional) */
  existingTeamId?: string;
  /** All teams in the current season to check for cross-team duplicates */
  allTeams?: TeamWithQueryDetails[];
  /** Season ID to ensure we only check teams in the same season */
  seasonId: string;
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
 * - Duplicate player detection (within team and across teams)
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
  allTeams = [],
  seasonId,
}: UseRosterEditorParams): UseRosterEditorReturn {
  const [playerIds, setPlayerIds] = useState<string[]>(Array(rosterSize - 1).fill(''));
  const [rosterError, setRosterError] = useState<string | null>(null);

  // Use TanStack Query to fetch existing roster when editing
  const { data: rosterData, isLoading } = useTeamRoster(existingTeamId);

  /**
   * Check if a player is on another team in the SAME SEASON (excluding the current team being edited)
   * Returns the team name if found, null otherwise
   *
   * Note: Players CAN be on teams in different seasons/leagues - this only checks the current season
   */
  const getPlayerTeamName = (memberId: string): string | null => {
    if (!memberId) return null;

    for (const team of allTeams) {
      // Skip the team we're currently editing
      if (team.id === existingTeamId) continue;

      // Only check teams in the same season
      if (team.season_id !== seasonId) continue;

      // Check if player is captain
      if (team.captain_id === memberId) {
        return team.team_name;
      }

      // Check if player is on roster
      const isOnRoster = team.team_players?.some(
        (tp) => tp.member_id === memberId
      );
      if (isOnRoster) {
        return team.team_name;
      }
    }

    return null;
  };

  /**
   * Load existing roster when editing a team
   * Uses TanStack Query data (rosterData) to populate player IDs
   */
  useEffect(() => {
    if (!rosterData) return;

    // Filter out captain, get just the other players
    const nonCaptainPlayers = rosterData.filter(p => !p.is_captain).map(p => p.member_id);

    // Fill the roster array with existing players, pad with empty strings
    const filledRoster = [...nonCaptainPlayers];
    while (filledRoster.length < rosterSize - 1) {
      filledRoster.push('');
    }

    setPlayerIds(filledRoster.slice(0, rosterSize - 1));
  }, [rosterData, rosterSize]);

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
      } else {
        // Check if player is on another team
        const teamName = getPlayerTeamName(memberId);
        if (teamName) {
          setRosterError(`This player is already on "${teamName}"`);
        }
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

    // Check if captain is on another team
    const captainTeamName = getPlayerTeamName(captainId);
    if (captainTeamName) {
      return `Captain is already on "${captainTeamName}"`;
    }

    // Check if any players are on other teams
    for (const playerId of selectedPlayers) {
      const teamName = getPlayerTeamName(playerId);
      if (teamName) {
        return `A player is already on "${teamName}"`;
      }
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
    loading: isLoading,
  };
}
