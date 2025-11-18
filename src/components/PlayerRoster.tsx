/**
 * @fileoverview Generic Player Roster Component
 *
 * Displays a list of players fetched by player IDs.
 * Reusable across the app (My Teams, Lineup, Tiebreaker, etc.)
 * Handles its own data fetching and handicap calculations.
 */

import { useMembersByIds } from '@/api/hooks/useCurrentMember';
import { usePlayerHandicaps } from '@/api/hooks/usePlayerHandicaps';
import type { TeamFormat, HandicapVariant, GameType } from '@/types/league';

interface PlayerRosterProps {
  playerIds: string[];
  teamFormat: TeamFormat;
  handicapVariant: HandicapVariant;
  gameType: GameType;
  seasonId?: string;
  gameLimit?: number;
  hidePlayerNumber?: boolean;
  hideName?: boolean;
  hideNickname?: boolean;
  hideHandicap?: boolean;
}

/**
 * Generic player roster component
 *
 * Takes an array of player IDs and displays them with their info.
 * Fetches player data and calculates handicaps internally.
 */
export function PlayerRoster({
  playerIds,
  teamFormat,
  handicapVariant,
  gameType,
  seasonId,
  gameLimit = 200,
  hidePlayerNumber = false,
  hideName = false,
  hideNickname = false,
  hideHandicap = false,
}: PlayerRosterProps) {
  const { data: players = [], isLoading: loadingPlayers } = useMembersByIds(playerIds);
  const { handicaps, isLoading: loadingHandicaps } = usePlayerHandicaps({
    playerIds,
    teamFormat,
    handicapVariant,
    gameType,
    seasonId,
    gameLimit,
  });

  if (loadingPlayers || loadingHandicaps) {
    return <div>Loading players...</div>;
  }

  // Build grid class based on visible columns
  // Order: H/C Nickname Name Player#
  const getGridClass = () => {
    if (!hidePlayerNumber && !hideName && !hideNickname && !hideHandicap) {
      return 'grid-cols-[48px_80px_1fr_64px]'; // H/C Nickname Name Player#
    }
    if (hidePlayerNumber && !hideName && !hideNickname && !hideHandicap) {
      return 'grid-cols-[48px_80px_1fr]'; // H/C Nickname Name
    }
    if (hidePlayerNumber && !hideName && !hideNickname && hideHandicap) {
      return 'grid-cols-[80px_1fr]'; // Nickname Name
    }
    if (!hidePlayerNumber && !hideName && !hideNickname && hideHandicap) {
      return 'grid-cols-[80px_1fr_64px]'; // Nickname Name Player#
    }
    // Default fallback
    return 'grid-cols-1';
  };

  const gridCols = getGridClass();

  return (
    <div>
      <p className="text-sm font-medium text-gray-600 mb-2">
        Roster ({players.length} players)
      </p>

      {/* Header Row */}
      <div className={`grid ${gridCols} gap-4 text-xs font-medium text-gray-500 pb-1 border-b`}>
        {!hideHandicap && <span className="text-center">H/C</span>}
        {!hideNickname && <span>Nickname</span>}
        {!hideName && <span>Name</span>}
        {!hidePlayerNumber && <span>Player #</span>}
      </div>

      {/* Player Rows */}
      <div className="mt-1">
        {players.map((player) => {
          const handicap = handicaps.get(player.id);

          return (
            <div key={player.id} className={`grid ${gridCols} gap-4 text-sm py-1 px-2 bg-gray-50 rounded`}>
              {!hideHandicap && (
                <span className="text-gray-600 text-center">
                  {handicap !== undefined ? handicap : '-'}
                </span>
              )}
              {!hideNickname && (
                <span className="text-gray-900 truncate">
                  {player.nickname || '-'}
                </span>
              )}
              {!hideName && (
                <span className="text-gray-600 text-xs truncate">
                  {player.first_name} {player.last_name}
                </span>
              )}
              {!hidePlayerNumber && (
                <span className="text-gray-600">
                  {player.system_player_number}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
