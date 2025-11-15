/**
 * @fileoverview Lineup State Management Hook
 *
 * Manages the state for player selection in match lineups.
 * Handles player IDs, lineup lock status, substitute handicaps, and test mode.
 *
 * @example
 * const lineup = useLineupState();
 * lineup.setPlayer1Id('player-uuid');
 * lineup.lockLineup();
 */

import { useState } from 'react';

export interface LineupState {
  // Player selections
  player1Id: string;
  player2Id: string;
  player3Id: string;

  // Lineup status
  lineupLocked: boolean;
  lineupId: string | null;

  // Substitute handicap
  subHandicap: string;

  // Test mode
  testMode: boolean;
  testHandicaps: Record<string, number>;

  // Setters
  setPlayer1Id: (id: string) => void;
  setPlayer2Id: (id: string) => void;
  setPlayer3Id: (id: string) => void;
  setLineupLocked: (locked: boolean) => void;
  setLineupId: (id: string | null) => void;
  setSubHandicap: (handicap: string) => void;
  setTestMode: (enabled: boolean) => void;
  setTestHandicaps: React.Dispatch<React.SetStateAction<Record<string, number>>>;

  // Convenience methods
  lockLineup: () => void;
  unlockLineup: () => void;
  resetTestMode: () => void;
}

/**
 * Hook to manage lineup selection state
 *
 * Provides a centralized state container for all lineup-related state,
 * including player selections, lock status, and test mode overrides.
 *
 * @returns LineupState object with all state and setters
 */
export function useLineupState(): LineupState {
  // Player selections (UUID or "SUBSTITUTE")
  const [player1Id, setPlayer1Id] = useState<string>('');
  const [player2Id, setPlayer2Id] = useState<string>('');
  const [player3Id, setPlayer3Id] = useState<string>('');

  // Lineup status
  const [lineupLocked, setLineupLocked] = useState(false);
  const [lineupId, setLineupId] = useState<string | null>(null);

  // Substitute handicap (only used if one player is "SUBSTITUTE")
  const [subHandicap, setSubHandicap] = useState<string>('');

  // Test mode for manual handicap override
  const [testMode, setTestMode] = useState(false);
  const [testHandicaps, setTestHandicaps] = useState<Record<string, number>>({});

  // Convenience methods
  const lockLineup = () => setLineupLocked(true);
  const unlockLineup = () => setLineupLocked(false);
  const resetTestMode = () => {
    setTestMode(false);
    setTestHandicaps({});
  };

  return {
    // State
    player1Id,
    player2Id,
    player3Id,
    lineupLocked,
    lineupId,
    subHandicap,
    testMode,
    testHandicaps,

    // Setters
    setPlayer1Id,
    setPlayer2Id,
    setPlayer3Id,
    setLineupLocked,
    setLineupId,
    setSubHandicap,
    setTestMode,
    setTestHandicaps,

    // Convenience
    lockLineup,
    unlockLineup,
    resetTestMode,
  };
}
