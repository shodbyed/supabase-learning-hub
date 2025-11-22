/**
 * @fileoverview 5v5 Match Scoreboard Component
 *
 * Compact dual-card scoreboard for 5v5 (8-man format) matches.
 * Shows both teams side-by-side with wins, losses, points, and thresholds.
 * No team toggling needed - both teams visible at once.
 *
 * Points calculation follows BCA system:
 * - Win: 1 point per game won
 * - Close loss (70%+ of threshold): 1.5 points per game won
 * - Bad loss (<70% of threshold): 1 point per game won
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MatchEndVerification } from '@/components/scoring/MatchEndVerification';
import { InfoButton } from '@/components/InfoButton';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { HandicapThresholds } from '@/types';

interface FiveVFiveScoreboardProps {
  /** Match data with team info */
  match: any;
  /** Home team lineup */
  homeLineup: any;
  /** Away team lineup */
  awayLineup: any;
  /** Home team handicap thresholds */
  homeThresholds: HandicapThresholds;
  /** Away team handicap thresholds */
  awayThresholds: HandicapThresholds;
  /** Home team wins count */
  homeWins: number;
  /** Away team wins count */
  awayWins: number;
  /** Home team losses count */
  homeLosses: number;
  /** Away team losses count */
  awayLosses: number;
  /** Home team points (BCA calculation) */
  homePoints: number;
  /** Away team points (BCA calculation) */
  awayPoints: number;
  /** Whether all games are complete */
  allGamesComplete: boolean;
  /** Is current user on home team? */
  isHomeTeam: boolean;
  /** Handler when user clicks verify */
  onVerify: () => void;
  /** Is verification in progress? */
  isVerifying?: boolean;
  /** Game type for tiebreaker games */
  gameType: string;
  /** Function to get player display name by ID */
  getPlayerDisplayName: (playerId: string) => string;
  /** Function to get player stats (wins/losses) by position - for double duty tracking */
  getPlayerStats: (playerId: string, position: number, playerIsHomeTeam: boolean) => { wins: number; losses: number };
}

/**
 * Compact 5v5 scoreboard with both teams side-by-side
 *
 * Displays:
 * - Team name
 * - Wins/Losses
 * - Points (BCA system)
 * - Win threshold progress
 * - 1.5x bonus threshold progress
 */
export function FiveVFiveScoreboard({
  match,
  homeLineup,
  awayLineup,
  homeThresholds,
  awayThresholds,
  homeWins,
  awayWins,
  homeLosses,
  awayLosses,
  homePoints,
  awayPoints,
  allGamesComplete,
  isHomeTeam,
  onVerify,
  isVerifying = false,
  gameType,
  getPlayerDisplayName,
  getPlayerStats,
}: FiveVFiveScoreboardProps) {
  // Accordion state for player stats
  const [showPlayerStats, setShowPlayerStats] = useState(false);

  // Calculate 70% thresholds for 1.5x bonus (straight round, not round up)
  const homeBonus70 = Math.round(homeThresholds.games_to_win * 0.7);
  const awayBonus70 = Math.round(awayThresholds.games_to_win * 0.7);

  // Calculate games remaining to reach thresholds
  const homeGamesNeededToWin = Math.max(
    0,
    homeThresholds.games_to_win - homeWins
  );
  const awayGamesNeededToWin = Math.max(
    0,
    awayThresholds.games_to_win - awayWins
  );
  const homeGamesNeededFor15 = Math.max(0, homeBonus70 - homeWins);
  const awayGamesNeededFor15 = Math.max(0, awayBonus70 - awayWins);

  return (
    <div className="bg-white border-b shadow-sm flex-shrink-0">
      <div className="px-4 py-2">
        {/* Show verification component when all games complete */}
        {allGamesComplete && (
          <MatchEndVerification
            matchId={match.id}
            homeTeamId={match.home_team_id}
            awayTeamId={match.away_team_id}
            homeTeamName={match.home_team?.team_name || 'Home'}
            awayTeamName={match.away_team?.team_name || 'Away'}
            homeWins={homeWins}
            awayWins={awayWins}
            homeWinThreshold={homeThresholds.games_to_win}
            awayWinThreshold={awayThresholds.games_to_win}
            homeTieThreshold={homeThresholds.games_to_tie}
            awayTieThreshold={awayThresholds.games_to_tie}
            homeVerifiedBy={match.home_team_verified_by || null}
            awayVerifiedBy={match.away_team_verified_by || null}
            isHomeTeam={isHomeTeam}
            onVerify={onVerify}
            isVerifying={isVerifying}
            gameType={gameType}
          />
        )}

        {/* Team labels with info button */}
        <div className="flex items-center justify-between mt-2 mb-1">
          <div className="flex-1 text-center text-xs font-semibold text-blue-900">
            HOME
          </div>
          <InfoButton title="Player Stats" className="mx-2">
            <p className="text-sm">
              Click either team name to view individual player stats for all players in the lineup. Click again to close.
            </p>
          </InfoButton>
          <div className="flex-1 text-center text-xs font-semibold text-green-900">
            AWAY
          </div>
        </div>

        {/* Dual Team Cards - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Home Team */}
          <div>
            <Card className="border-blue-200 bg-blue-50 p-0">
              <div className="text-sm p-2">
                <button
                  onClick={() => setShowPlayerStats(!showPlayerStats)}
                  className="text-base font-bold text-blue-900 text-center truncate border-b border-blue-300 pb-1 w-full"
                >
                  {match.home_team?.team_name || 'Home'}
                </button>
                <div className="flex pt-2">
                  <span className="text-gray-600 w-16">Wins:</span>
                  <span className="font-semibold text-gray-900">
                    {homeWins}
                  </span>
                </div>
                <div className="flex ">
                  <span className="text-gray-600 w-16">Losses:</span>
                  <span className="font-semibold text-gray-900">
                    {homeLosses}
                  </span>
                </div>
                <div className="flex pb-2">
                  <span className="text-gray-600 w-16">Points:</span>
                  <span className="font-semibold text-gray-900">
                    {homePoints.toFixed(1)}
                  </span>
                </div>
                <div className="flex pt-1 border-t">
                  <span className="font-semibold text-blue-600 text-center text-2xl w-8">
                    {homeThresholds.games_to_win}
                  </span>
                  <span className="font-semibold text-blue-600 text-center text-2xl w-4">
                    /
                  </span>
                  <span className="font-semibold text-blue-600 text-center text-2xl w-8">
                    {homeGamesNeededToWin}
                  </span>
                  <span className="text-gray-600  ml-5 inline-flex items-center">
                    To Win
                  </span>
                </div>
                <div className="flex">
                  <span className="text-2xl font-semibold text-orange-600 w-8 text-center">
                    {homeBonus70}
                  </span>
                  <span className="text-2xl font-semibold text-orange-600 w-4 text-center">
                    /
                  </span>
                  <span className="text-2xl font-semibold text-orange-600 w-8 text-center">
                    {homeGamesNeededFor15}
                  </span>

                  <span className="text-gray-600 ml-5 inline-flex items-center">
                    For 1.5
                  </span>
                </div>

                {/* Home team player stats */}
                {showPlayerStats && (
                  <div className="pt-2 border-t border-blue-300">
                    <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 text-xs">
                      {/* Header */}
                      <div className="font-semibold text-gray-600">HC</div>
                      <div className="font-semibold text-gray-600">Player</div>
                      <div className="font-semibold text-gray-600 text-center">W</div>
                      <div className="font-semibold text-gray-600 text-center">L</div>

                      {/* Player 1 */}
                      {homeLineup.player1_id && (
                        <>
                          <div className="text-gray-700">{homeLineup.player1_handicap}</div>
                          <div className="text-gray-900">{getPlayerDisplayName(homeLineup.player1_id)}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(homeLineup.player1_id, 1, true).wins}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(homeLineup.player1_id, 1, true).losses}</div>
                        </>
                      )}

                      {/* Player 2 */}
                      {homeLineup.player2_id && (
                        <>
                          <div className="text-gray-700">{homeLineup.player2_handicap}</div>
                          <div className="text-gray-900">{getPlayerDisplayName(homeLineup.player2_id)}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(homeLineup.player2_id, 2, true).wins}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(homeLineup.player2_id, 2, true).losses}</div>
                        </>
                      )}

                      {/* Player 3 */}
                      {homeLineup.player3_id && (
                        <>
                          <div className="text-gray-700">{homeLineup.player3_handicap}</div>
                          <div className="text-gray-900">{getPlayerDisplayName(homeLineup.player3_id)}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(homeLineup.player3_id, 3, true).wins}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(homeLineup.player3_id, 3, true).losses}</div>
                        </>
                      )}

                      {/* Player 4 */}
                      {homeLineup.player4_id && (
                        <>
                          <div className="text-gray-700">{homeLineup.player4_handicap}</div>
                          <div className="text-gray-900">{getPlayerDisplayName(homeLineup.player4_id)}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(homeLineup.player4_id, 4, true).wins}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(homeLineup.player4_id, 4, true).losses}</div>
                        </>
                      )}

                      {/* Player 5 */}
                      {homeLineup.player5_id && (
                        <>
                          <div className="text-gray-700">{homeLineup.player5_handicap}</div>
                          <div className="text-gray-900">{getPlayerDisplayName(homeLineup.player5_id)}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(homeLineup.player5_id, 5, true).wins}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(homeLineup.player5_id, 5, true).losses}</div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Away Team */}
          <div>
            <Card className="border-green-200 bg-green-50 p-0">
              <div className="text-sm p-2">
                <button
                  onClick={() => setShowPlayerStats(!showPlayerStats)}
                  className="text-base font-bold text-green-900 text-center truncate border-b border-green-300 pb-1 w-full"
                >
                  {match.away_team?.team_name || 'Away'}
                </button>
                <div className="flex pt-2">
                  <span className="text-gray-600 w-16">Wins:</span>
                  <span className="font-semibold text-gray-900">
                    {awayWins}
                  </span>
                </div>
                <div className="flex ">
                  <span className="text-gray-600 w-16">Losses:</span>
                  <span className="font-semibold text-gray-900">
                    {awayLosses}
                  </span>
                </div>
                <div className="flex pb-2">
                  <span className="text-gray-600 w-16">Points:</span>
                  <span className="font-semibold text-gray-900">
                    {awayPoints.toFixed(1)}
                  </span>
                </div>
                <div className="flex pt-1 border-t">
                  <span className="font-semibold text-green-600 text-center text-2xl w-8">
                    {awayThresholds.games_to_win}
                  </span>
                  <span className="font-semibold text-green-600 text-center text-2xl w-4">
                    /
                  </span>
                  <span className="font-semibold text-green-600 text-center text-2xl w-8">
                    {awayGamesNeededToWin}
                  </span>
                  <span className="text-gray-600  ml-5 inline-flex items-center">
                    To Win
                  </span>
                </div>
                <div className="flex">
                  <span className="text-2xl font-semibold text-orange-600 w-8 text-center">
                    {awayBonus70}
                  </span>
                  <span className="text-2xl font-semibold text-orange-600 w-4 text-center">
                    /
                  </span>
                  <span className="text-2xl font-semibold text-orange-600 w-8 text-center">
                    {awayGamesNeededFor15}
                  </span>

                  <span className="text-gray-600 ml-5 inline-flex items-center">
                    For 1.5
                  </span>
                </div>

                {/* Away team player stats */}
                {showPlayerStats && (
                  <div className="pt-2 border-t border-green-300">
                    <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 text-xs">
                      {/* Header */}
                      <div className="font-semibold text-gray-600">HC</div>
                      <div className="font-semibold text-gray-600">Player</div>
                      <div className="font-semibold text-gray-600 text-center">W</div>
                      <div className="font-semibold text-gray-600 text-center">L</div>

                      {/* Player 1 */}
                      {awayLineup.player1_id && (
                        <>
                          <div className="text-gray-700">{awayLineup.player1_handicap}</div>
                          <div className="text-gray-900">{getPlayerDisplayName(awayLineup.player1_id)}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(awayLineup.player1_id, 1, false).wins}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(awayLineup.player1_id, 1, false).losses}</div>
                        </>
                      )}

                      {/* Player 2 */}
                      {awayLineup.player2_id && (
                        <>
                          <div className="text-gray-700">{awayLineup.player2_handicap}</div>
                          <div className="text-gray-900">{getPlayerDisplayName(awayLineup.player2_id)}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(awayLineup.player2_id, 2, false).wins}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(awayLineup.player2_id, 2, false).losses}</div>
                        </>
                      )}

                      {/* Player 3 */}
                      {awayLineup.player3_id && (
                        <>
                          <div className="text-gray-700">{awayLineup.player3_handicap}</div>
                          <div className="text-gray-900">{getPlayerDisplayName(awayLineup.player3_id)}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(awayLineup.player3_id, 3, false).wins}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(awayLineup.player3_id, 3, false).losses}</div>
                        </>
                      )}

                      {/* Player 4 */}
                      {awayLineup.player4_id && (
                        <>
                          <div className="text-gray-700">{awayLineup.player4_handicap}</div>
                          <div className="text-gray-900">{getPlayerDisplayName(awayLineup.player4_id)}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(awayLineup.player4_id, 4, false).wins}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(awayLineup.player4_id, 4, false).losses}</div>
                        </>
                      )}

                      {/* Player 5 */}
                      {awayLineup.player5_id && (
                        <>
                          <div className="text-gray-700">{awayLineup.player5_handicap}</div>
                          <div className="text-gray-900">{getPlayerDisplayName(awayLineup.player5_id)}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(awayLineup.player5_id, 5, false).wins}</div>
                          <div className="text-center text-gray-900">{getPlayerStats(awayLineup.player5_id, 5, false).losses}</div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
