/**
 * @fileoverview Lineup Actions Component
 *
 * Displays Lock/Unlock buttons and opponent status.
 * Handles button states and click events for lineup management.
 */

import { Button } from '@/components/ui/button';
import { Lock, CheckCircle } from 'lucide-react';

interface LineupActionsProps {
  locked: boolean;
  opponentLocked: boolean;
  canLock: boolean; // All positions filled
  canUnlock: boolean; // Opponent hasn't locked yet
  onLock: () => void;
  onUnlock: () => void;
  onProceed?: () => void; // Navigate to scoring when both locked
}

/**
 * Lineup action buttons with status indicators
 *
 * Shows Lock/Unlock buttons based on lineup state and opponent status.
 * Provides proceed button when both teams are ready.
 */
export function LineupActions({
  locked,
  opponentLocked,
  canLock,
  canUnlock,
  onLock,
  onUnlock,
  onProceed,
}: LineupActionsProps) {
  return (
    <div className="space-y-4">
      {/* Opponent Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Opponent Status:</span>
        <div className="flex items-center gap-2">
          {opponentLocked ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-600">Ready</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">Not Ready</span>
          )}
        </div>
      </div>

      {/* Your Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Your Status:</span>
        <div className="flex items-center gap-2">
          {locked ? (
            <>
              <Lock className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">Locked</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">Not Locked</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {!locked ? (
          <Button
            onClick={onLock}
            disabled={!canLock}
            className="w-full"
            size="lg"
          >
            <Lock className="h-4 w-4 mr-2" />
            Lock Lineup
          </Button>
        ) : (
          <Button
            onClick={onUnlock}
            disabled={!canUnlock}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Unlock Lineup
          </Button>
        )}

        {/* Proceed to Scoring (only show when both teams locked) */}
        {locked && opponentLocked && onProceed && (
          <Button
            onClick={onProceed}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Proceed to Scoring
          </Button>
        )}
      </div>

      {/* Helper Text */}
      {!locked && !canLock && (
        <p className="text-xs text-gray-500 text-center">
          Select all players before locking your lineup
        </p>
      )}

      {locked && !canUnlock && (
        <p className="text-xs text-gray-500 text-center">
          Cannot unlock - opponent has already locked their lineup
        </p>
      )}

      {locked && !opponentLocked && (
        <p className="text-xs text-gray-500 text-center">
          Waiting for opponent to lock their lineup...
        </p>
      )}
    </div>
  );
}
