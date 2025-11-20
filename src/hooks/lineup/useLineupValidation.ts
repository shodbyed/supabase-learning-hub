/**
 * @fileoverview Lineup Validation Hook
 *
 * Provides validation functions for lineup completeness and validity.
 * Checks for required selections, duplicate nicknames, etc.
 *
 * @example
 * const validation = useLineupValidation({
 *   player1Id,
 *   player2Id,
 *   player3Id,
 *   subHandicap,
 *   players
 * });
 *
 * if (validation.isComplete && !validation.hasDuplicates) {
 *   // Lineup is valid
 * }
 */

import { useMemo } from 'react';
import type { Player } from '@/types/match';
import {
  isLineupComplete,
  hasDuplicateNicknames,
  canLockLineup,
} from '@/utils/lineup';
import { lineupHasSubstitute } from '@/utils/lineup';

export interface LineupValidationInput {
  player1Id: string;
  player2Id: string;
  player3Id: string;
  subHandicap: string;
  players: Player[];
  isTiebreakerMode?: boolean;
}

export interface LineupValidation {
  // Validation flags
  isComplete: boolean;
  hasDuplicates: boolean;
  hasSub: boolean;
  canLock: boolean;

  // Error messages
  completenessError: string | null;
  duplicatesError: string | null;
}

/**
 * Hook to validate lineup selections
 *
 * @param input - All required data for validation
 * @returns Validation results and error messages
 */
export function useLineupValidation(
  input: LineupValidationInput
): LineupValidation {
  const { player1Id, player2Id, player3Id, subHandicap, players, isTiebreakerMode } = input;

  // Check if lineup has a substitute
  const hasSub = useMemo(
    () => lineupHasSubstitute(player1Id, player2Id, player3Id),
    [player1Id, player2Id, player3Id]
  );

  // Check if lineup is complete
  const isComplete = useMemo(
    () => isLineupComplete(player1Id, player2Id, player3Id, subHandicap, isTiebreakerMode),
    [player1Id, player2Id, player3Id, subHandicap, isTiebreakerMode]
  );

  // Check for duplicate nicknames
  const hasDuplicates = useMemo(
    () => hasDuplicateNicknames(player1Id, player2Id, player3Id, players),
    [player1Id, player2Id, player3Id, players]
  );

  // Check if lineup can be locked
  const canLock = useMemo(
    () => canLockLineup(player1Id, player2Id, player3Id, subHandicap, players, isTiebreakerMode),
    [player1Id, player2Id, player3Id, subHandicap, players, isTiebreakerMode]
  );

  // Generate error messages
  const completenessError = useMemo(() => {
    if (isComplete) return null;
    if (hasSub && !subHandicap) {
      return 'Please select a handicap for the substitute player';
    }
    return 'Please select all 3 players before locking your lineup';
  }, [isComplete, hasSub, subHandicap]);

  const duplicatesError = useMemo(() => {
    if (!hasDuplicates) return null;
    return 'Two or more players in your lineup have the same nickname. Please have at least one of them go to their profile page to change their nickname so they will be identifiable during scoring.';
  }, [hasDuplicates]);

  return {
    isComplete,
    hasDuplicates,
    hasSub,
    canLock,
    completenessError,
    duplicatesError,
  };
}
