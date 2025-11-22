/**
 * @fileoverview Opponent Status Hook
 *
 * Provides opponent team information and lineup status.
 * Calculates whether opponent is absent, choosing lineup, or ready.
 * Shows detailed player selection progress.
 */

interface OpponentStatusParams {
  /** Match data */
  matchData: any;
  /** Is current user on home team? */
  isHomeTeam: boolean;
  /** Opponent's lineup data */
  opponentLineup: any;
  /** Is this tiebreaker mode? */
  isTiebreakerMode?: boolean;
  /** All games (for tiebreaker mode player counting) */
  allGames?: any[];
  /** Player count (3 for 3v3, 5 for 5v5) */
  playerCount?: 3 | 5;
}

export type OpponentStatus = 'absent' | 'choosing' | 'ready';

interface OpponentStatusResult {
  /** Opponent team info */
  opponentTeam: any;
  /** Opponent status: absent, choosing, or ready */
  status: OpponentStatus;
  /** Detailed selection status string for display */
  selectionStatus: string;
}

/**
 * Hook to get opponent team information and lineup status
 *
 * Status meanings:
 * - absent: Opponent hasn't joined (no lineup ID)
 * - choosing: Opponent is selecting players (has lineup ID but not locked)
 * - ready: Opponent has locked their lineup
 *
 * @param params - Match data and opponent info
 * @returns Opponent team, status, and selection details
 *
 * @example
 * const { opponentTeam, status, selectionStatus } = useOpponentStatus({
 *   matchData,
 *   isHomeTeam,
 *   opponentLineup,
 *   isTiebreakerMode,
 *   allGames
 * });
 *
 * // status: 'absent' | 'choosing' | 'ready'
 * // selectionStatus: 'Absent' | 'Choosing lineup' | 'Players chosen: 2' | 'Locked'
 */
export function useOpponentStatus(params: OpponentStatusParams): OpponentStatusResult {
  const {
    matchData,
    isHomeTeam,
    opponentLineup,
    isTiebreakerMode = false,
    allGames = [],
    playerCount = 3, // Default to 3 for backward compatibility
  } = params;

  /**
   * Get opponent team info
   */
  const opponentTeam = matchData
    ? isHomeTeam
      ? matchData.away_team
      : matchData.home_team
    : null;

  /**
   * Calculate opponent status based on lineup_id and locked state
   */
  const getStatus = (): OpponentStatus => {
    if (!matchData) return 'absent';

    const opponentLineupField = isHomeTeam
      ? 'away_lineup_id'
      : 'home_lineup_id';
    const opponentLineupId = matchData[opponentLineupField as keyof typeof matchData];

    // No lineup ID = opponent hasn't joined yet
    if (!opponentLineupId) return 'absent';

    // Has lineup ID, check if locked
    if (opponentLineup?.locked) return 'ready';

    // Has lineup ID but not locked = choosing lineup
    return 'choosing';
  };

  /**
   * Get detailed opponent selection status showing player count
   */
  const getSelectionStatus = (): string => {
    const status = getStatus();

    if (status === 'absent') return 'Absent';
    if (status === 'ready') return 'Locked';

    // Status is 'choosing' - count selected players
    let selectedCount = 0;

    // In tiebreaker mode, count players from games 19, 20, 21
    if (isTiebreakerMode) {
      const opponentPlayerField = isHomeTeam
        ? 'away_player_id'
        : 'home_player_id';

      [19, 20, 21].forEach((gameNumber) => {
        const game = allGames.find(
          (g) => g.game_number === gameNumber && g.is_tiebreaker
        );
        if (game && game[opponentPlayerField as keyof typeof game]) {
          selectedCount++;
        }
      });
    } else {
      // Normal mode - count from lineup (support both 3v3 and 5v5)
      if (opponentLineup?.player1_id) selectedCount++;
      if (opponentLineup?.player2_id) selectedCount++;
      if (opponentLineup?.player3_id) selectedCount++;

      // Add player4/5 for 5v5 matches
      if (playerCount === 5) {
        if (opponentLineup?.player4_id) selectedCount++;
        if (opponentLineup?.player5_id) selectedCount++;
      }
    }

    if (selectedCount === 0) return 'Choosing lineup';
    return `Players chosen: ${selectedCount}`;
  };

  return {
    opponentTeam,
    status: getStatus(),
    selectionStatus: getSelectionStatus(),
  };
}
