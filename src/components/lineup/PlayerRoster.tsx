/**
 * @fileoverview Player Roster Component
 *
 * Displays available players with their handicaps and optional test mode overrides.
 * Reusable for different lineup contexts (3v3, 5v5, tiebreaker).
 */

import { PlayerNameLink } from '@/components/PlayerNameLink';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface RosterPlayer {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  handicap: number;
}

interface PlayerRosterProps {
  players: RosterPlayer[];
  showHandicaps?: boolean;
  testMode?: boolean;
  testHandicaps?: Record<string, number>;
  onHandicapOverride?: (playerId: string, handicap: number) => void;
  disabled?: boolean;
}

/**
 * Format handicap display (show whole number if .0, otherwise 1 decimal)
 */
function formatHandicap(handicap: number): string {
  return handicap === Math.floor(handicap) ? handicap.toString() : handicap.toFixed(1);
}

/**
 * Player roster display with optional handicap overrides
 *
 * Shows list of available players with their names, nicknames, and handicaps.
 * In test mode, provides dropdowns to override handicaps for testing scenarios.
 */
export function PlayerRoster({
  players,
  showHandicaps = true,
  testMode = false,
  testHandicaps = {},
  onHandicapOverride,
  disabled = false,
}: PlayerRosterProps) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-600 mb-2">
        Available Players ({players.length})
      </p>
      <div>
        {/* Header Row */}
        <div className="flex gap-3 text-xs font-medium text-gray-500 pb-1 border-b">
          <span className="flex-1">Player Name</span>
          <span className="w-20">Nickname</span>
          {showHandicaps && <span className="w-12 text-center">H/C</span>}
          {testMode && showHandicaps && <span className="w-20 text-center">Override</span>}
        </div>

        {/* Player Rows */}
        <div className="space-y-1 mt-1">
          {players.map((player) => {
            const displayHandicap = testHandicaps[player.id] !== undefined
              ? testHandicaps[player.id]
              : player.handicap;

            return (
              <div
                key={player.id}
                className="flex gap-3 text-sm py-1 px-2 bg-gray-50 rounded items-center"
              >
                {/* Player Name */}
                <div className="flex-1">
                  <PlayerNameLink
                    playerId={player.id}
                    playerName={`${player.firstName} ${player.lastName}`}
                  />
                </div>

                {/* Nickname */}
                <span className="text-gray-600 text-xs w-20 truncate">
                  {player.nickname || '-'}
                </span>

                {/* Handicap */}
                {showHandicaps && (
                  <span className="text-gray-600 w-12 text-center">
                    {formatHandicap(displayHandicap)}
                  </span>
                )}

                {/* Test Mode Override */}
                {testMode && showHandicaps && (
                  <Select
                    value={displayHandicap.toString()}
                    onValueChange={(value) => {
                      if (onHandicapOverride) {
                        onHandicapOverride(player.id, parseFloat(value));
                      }
                    }}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-20 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">+2</SelectItem>
                      <SelectItem value="1">+1</SelectItem>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="-1">-1</SelectItem>
                      <SelectItem value="-2">-2</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
