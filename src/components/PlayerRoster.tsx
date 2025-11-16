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

  // Build dynamic grid columns based on visible columns
  const visibleColumns = [
    !hidePlayerNumber && 'auto',
    !hideName && '1fr',
    !hideNickname && 'auto',
    !hideHandicap && 'auto',
  ].filter(Boolean);
  const gridCols = `grid-cols-[${visibleColumns.join('_')}]`;

  return (
    <div>
      <p className="text-sm font-medium text-gray-600 mb-2">
        Roster ({players.length} players)
      </p>

      {/* Header Row */}
      <div className={`grid ${gridCols} gap-3 text-xs font-medium text-gray-500 pb-1 border-b`}>
        {!hidePlayerNumber && <span className="w-16">Player #</span>}
        {!hideName && <span>Name</span>}
        {!hideNickname && <span className="w-20">Nickname</span>}
        {!hideHandicap && <span className="w-12 text-center">H/C</span>}
      </div>

      {/* Player Rows */}
      <div className="space-y-1 mt-1">
        {players.map((player) => {
          const handicap = handicaps.get(player.id);

          return (
            <div key={player.id} className={`grid ${gridCols} gap-3 text-sm py-1 px-2 bg-gray-50 rounded`}>
              {!hidePlayerNumber && (
                <span className="text-gray-600 w-16">
                  {player.system_player_number}
                </span>
              )}
              {!hideName && (
                <span className="text-gray-900">
                  {player.first_name} {player.last_name}
                </span>
              )}
              {!hideNickname && (
                <span className="text-gray-600 text-xs w-20 truncate">
                  {player.nickname || '-'}
                </span>
              )}
              {!hideHandicap && (
                <span className="text-gray-600 w-12 text-center">
                  {handicap !== undefined ? handicap : '-'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
