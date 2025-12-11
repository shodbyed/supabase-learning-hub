/**
 * @fileoverview Team Stats Card Component
 *
 * Displays team statistics in a compact card format for match scoreboards.
 * Shows wins, losses, points, and threshold progress.
 * Includes collapsible player stats section.
 *
 * Used by:
 * - FiveVFiveScoreboard (5v5/8-man format matches)
 * - Can be adapted for 3v3 format as well
 */

import { Card } from '@/components/ui/card';
import type { Lineup, HandicapThresholds } from '@/types';
import { getTeamColors } from './scoreboardColors';
import { PlayerNameLink } from '@/components/PlayerNameLink';
import { TeamNameLink } from '@/components/TeamNameLink';

interface PlayerStatsGetter {
  (playerId: string, position: number, isHomeTeam: boolean): {
    wins: number;
    losses: number;
  };
}

interface TeamStatsCardProps {
  /** Team name to display */
  teamName: string;
  /** Whether this is the home team (affects styling) */
  isHome: boolean;
  /** Number of games won */
  wins: number;
  /** Number of games lost */
  losses: number;
  /** Total points (BCA calculation) */
  points: number;
  /** Handicap thresholds for this team */
  thresholds: HandicapThresholds;
  /** Team lineup data */
  lineup: Lineup;
  /** Total team handicap (sum of player handicaps) */
  teamHandicap: number;
  /** Whether player stats section is expanded */
  showPlayerStats: boolean;
  /** Handler to toggle player stats visibility */
  onTogglePlayerStats: () => void;
  /** Function to get player display name by ID */
  getPlayerDisplayName: (playerId: string) => string;
  /** Function to get player stats (wins/losses) by position */
  getPlayerStats: PlayerStatsGetter;
}

/**
 * TeamStatsCard Component
 *
 * Compact card displaying team statistics:
 * - Team name (clickable to toggle player stats)
 * - Wins/Losses/Points
 * - Games needed to win
 * - Games needed for 1.5x bonus (70% threshold)
 * - Collapsible player stats table
 */
export function TeamStatsCard({
  teamName,
  isHome,
  wins,
  losses,
  points,
  thresholds,
  lineup,
  teamHandicap,
  showPlayerStats,
  onTogglePlayerStats,
  getPlayerDisplayName,
  getPlayerStats,
}: TeamStatsCardProps) {
  // Calculate 70% threshold for 1.5x bonus
  const bonus70 = Math.round(thresholds.games_to_win * 0.7);

  // Calculate games remaining to reach thresholds
  const gamesNeededToWin = Math.max(0, thresholds.games_to_win - wins);
  const gamesNeededFor15 = Math.max(0, bonus70 - wins);

  // Get colors from shared constants
  const colors = getTeamColors(isHome);
  const cardColors = `${colors.border} ${colors.bg}`;
  const headerColor = colors.headerText;
  const borderColor = colors.borderDark;
  const thresholdColor = colors.accentText;

  // Collect all players from lineup (up to 5 for 5v5)
  const players = [
    { id: lineup.player1_id, handicap: lineup.player1_handicap, position: 1 },
    { id: lineup.player2_id, handicap: lineup.player2_handicap, position: 2 },
    { id: lineup.player3_id, handicap: lineup.player3_handicap, position: 3 },
    { id: lineup.player4_id, handicap: lineup.player4_handicap, position: 4 },
    { id: lineup.player5_id, handicap: lineup.player5_handicap, position: 5 },
  ].filter((p) => p.id);

  return (
    <Card className={`${cardColors} p-0`}>
      <div className="text-sm p-2">
        {/* Team Name - clickable to toggle player stats */}
        <button
          onClick={onTogglePlayerStats}
          className={`text-base font-bold ${headerColor} text-center truncate border-b ${borderColor} pb-1 w-full`}
        >
          {teamName}
        </button>

        {/* Threshold Progress - To Win */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center pt-2">
          <div className={`font-semibold ${thresholdColor} text-2xl text-right pr-1`}>
            {thresholds.games_to_win}
          </div>
          <div className={`font-semibold ${thresholdColor} text-2xl`}>/</div>
          <div className="flex items-center pl-1">
            <span className={`font-semibold ${thresholdColor} text-2xl`}>
              {gamesNeededToWin}
            </span>
            <span className="text-gray-600 ml-2 text-sm">To Win</span>
          </div>
        </div>

        {/* 1.5x Bonus Threshold - slightly smaller font */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="font-semibold text-orange-600 text-xl text-right pr-1">
            {bonus70}
          </div>
          <div className="font-semibold text-orange-600 text-xl">/</div>
          <div className="flex items-center pl-1">
            <span className="font-semibold text-orange-600 text-xl">
              {gamesNeededFor15}
            </span>
            <span className="text-gray-600 ml-2 text-xs">For 1.5</span>
          </div>
        </div>

        {/* Points - decimal point centered like "/" in threshold rows */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center pb-2">
          <div className="font-semibold text-gray-700 text-xl text-right pr-0.5">
            {Math.floor(points)}
          </div>
          <div className="font-semibold text-gray-700 text-xl">.</div>
          <div className="flex items-center pl-0.5">
            <span className="font-semibold text-gray-700 text-xl">
              {Math.round((points % 1) * 10)}
            </span>
            <span className="text-gray-600 ml-2 text-xs">Points</span>
          </div>
        </div>

        {/* Collapsible Player Stats */}
        {showPlayerStats && (
          <div className={`pt-2 border-t ${borderColor}`}>
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 text-xs">
              {/* Header */}
              <div className="font-semibold text-gray-600">HC</div>
              <div className="font-semibold text-gray-600">Name</div>
              <div className="font-semibold text-gray-600 text-center">W</div>
              <div className="font-semibold text-gray-600 text-center">L</div>

              {/* Team Summary Row */}
              <div className="font-semibold text-gray-900">{teamHandicap}</div>
              <div className="font-semibold text-gray-900 truncate">
                <TeamNameLink teamId={lineup.team_id} teamName={teamName} />
              </div>
              <div className="font-semibold text-gray-900 text-center">{wins}</div>
              <div className="font-semibold text-gray-900 text-center">{losses}</div>

              {/* Player Rows */}
              {players.map((player) => {
                const stats = getPlayerStats(player.id!, player.position, isHome);
                return (
                  <>
                    <div key={`${player.id}-hc`} className="text-gray-700">
                      {player.handicap}
                    </div>
                    <div key={`${player.id}-name`} className="text-gray-900 truncate">
                      <PlayerNameLink
                        playerId={player.id!}
                        playerName={getPlayerDisplayName(player.id!)}
                      />
                    </div>
                    <div key={`${player.id}-wins`} className="text-center text-gray-900">
                      {stats.wins}
                    </div>
                    <div key={`${player.id}-losses`} className="text-center text-gray-900">
                      {stats.losses}
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
