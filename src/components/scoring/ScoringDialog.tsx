/**
 * @fileoverview Scoring Dialog Component
 *
 * Modal for selecting game winner and special achievements (Break & Run, Golden Break).
 * Used when a player clicks to score a game in match scoring.
 */

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ScoringDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Game being scored */
  game: {
    gameNumber: number;
    winnerPlayerName: string;
  } | null;
  /** Break & Run checkbox state */
  breakAndRun: boolean;
  /** Golden Break checkbox state */
  goldenBreak: boolean;
  /** Whether league allows golden break to count as win */
  goldenBreakCountsAsWin: boolean;
  /** Game type for golden break label (8-ball, 9-ball, 10-ball, etc.) */
  gameType: string;
  /** Handler for Break & Run checkbox change */
  onBreakAndRunChange: (checked: boolean) => void;
  /** Handler for Golden Break checkbox change */
  onGoldenBreakChange: (checked: boolean) => void;
  /** Handler for cancel button */
  onCancel: () => void;
  /** Handler for confirm button */
  onConfirm: () => void;
}

/**
 * Dialog for scoring a game with special achievements
 *
 * Shows:
 * - Game number and winner name
 * - Break & Run checkbox (always)
 * - Golden Break checkbox (if league allows)
 *
 * Break & Run and Golden Break are mutually exclusive
 */
export function ScoringDialog({
  open,
  game,
  breakAndRun,
  goldenBreak,
  goldenBreakCountsAsWin,
  gameType,
  onBreakAndRunChange,
  onGoldenBreakChange,
  onCancel,
  onConfirm,
}: ScoringDialogProps) {
  if (!game) return null;

  // Get label for golden break based on game type
  const getGoldenBreakLabel = () => {
    if (gameType === '8-ball') return '8 on the Break';
    if (gameType === '9-ball') return '9 on the Break';
    if (gameType === '10-ball') return '10 on the Break';
    return 'Golden Break';
  };

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Select Game Winner</DialogTitle>
          <DialogDescription>
            Select any special achievements for this game.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Game {game.gameNumber}</p>
            <p className="text-lg font-semibold mt-2">
              Winner: {game.winnerPlayerName}
            </p>
          </div>

          {/* Break & Run Checkbox (always visible) */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="breakAndRun"
              checked={breakAndRun}
              onChange={(e) => {
                onBreakAndRunChange(e.target.checked);
                if (e.target.checked) onGoldenBreakChange(false); // Uncheck golden break if B&R is checked
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="breakAndRun"
              className="text-sm font-normal cursor-pointer"
            >
              Break & Run
            </label>
          </div>

          {/* Golden Break Checkbox (only if league allows it) */}
          {goldenBreakCountsAsWin && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="goldenBreak"
                checked={goldenBreak}
                onChange={(e) => {
                  onGoldenBreakChange(e.target.checked);
                  if (e.target.checked) onBreakAndRunChange(false); // Uncheck B&R if golden break is checked
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="goldenBreak"
                className="text-sm font-normal cursor-pointer"
              >
                {getGoldenBreakLabel()}
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} loadingText="none">
            Cancel
          </Button>
          <Button onClick={onConfirm} loadingText="Saving...">Select Winner</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
