/**
 * @fileoverview Opponent Substitute Modal Component
 *
 * Modal that appears when opponent has locked their lineup with a substitute.
 * Allows user to choose which of the opponent's 4 real players will play double duty.
 *
 * Flow (5v5 only):
 * 1. Opponent locks lineup with SUB in one position
 * 2. This modal appears for you
 * 3. You choose which of their 4 real players plays in 2 positions
 * 4. Chosen player replaces SUB in their lineup (now appears twice)
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface OpponentSubstituteModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Opponent's locked lineup with SUB in one position */
  opponentLineup: {
    player1_id: string | null;
    player1_handicap: number;
    player2_id: string | null;
    player2_handicap: number;
    player3_id: string | null;
    player3_handicap: number;
    player4_id: string | null;
    player4_handicap: number;
    player5_id: string | null;
    player5_handicap: number;
  };
  /** Function to get player display name from ID */
  getPlayerDisplayName: (playerId: string) => string;
  /** Handler when player is chosen - receives player ID and handicap */
  onPlayerChosen: (playerId: string, handicap: number, position: number) => void;
  /** Handler to close modal */
  onClose: () => void;
  /** SUB_HOME_ID constant */
  subHomeId: string;
  /** SUB_AWAY_ID constant */
  subAwayId: string;
}

/**
 * Modal for opponent to choose which player plays double duty
 */
export function OpponentSubstituteModal({
  isOpen,
  opponentLineup,
  getPlayerDisplayName,
  onPlayerChosen,
  onClose,
  subHomeId,
  subAwayId,
}: OpponentSubstituteModalProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  // Find which position has the substitute
  const subPosition = [1, 2, 3, 4, 5].find((pos) => {
    const playerId = opponentLineup[`player${pos}_id` as keyof typeof opponentLineup];
    return playerId === subHomeId || playerId === subAwayId;
  });

  // Get all real players (exclude the substitute position)
  const realPlayers = [1, 2, 3, 4, 5]
    .filter((pos) => pos !== subPosition)
    .map((pos) => ({
      position: pos,
      id: opponentLineup[`player${pos}_id` as keyof typeof opponentLineup] as string,
      handicap: opponentLineup[`player${pos}_handicap` as keyof typeof opponentLineup] as number,
    }))
    .filter((p) => p.id); // Only include positions that have a player

  const handleConfirm = () => {
    if (!selectedPlayerId || !subPosition) return;

    // Find the selected player's handicap
    const selectedPlayer = realPlayers.find((p) => p.id === selectedPlayerId);
    if (!selectedPlayer) return;

    // Call handler with player ID, handicap, and the position to replace (sub position)
    onPlayerChosen(selectedPlayerId, selectedPlayer.handicap, subPosition);

    // Reset state and close
    setSelectedPlayerId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opponent Used Substitute</DialogTitle>
          <DialogDescription>
            Your opponent only has 4 players. Choose which of their players will play in 2 positions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select player to play double duty:</label>
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a player..." />
              </SelectTrigger>
              <SelectContent>
                {realPlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {getPlayerDisplayName(player.id)} (HC: {player.handicap})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedPlayerId}>
            Confirm Choice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
