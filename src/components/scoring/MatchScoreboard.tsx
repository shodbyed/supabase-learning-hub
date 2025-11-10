/**
 * @fileoverview Match Scoreboard Component
 *
 * Swipeable scoreboard for 3v3 match scoring.
 * Displays team stats, player stats, and match progress.
 * Allows toggling between home and away team views.
 *
 * Features:
 * - Team selector buttons (Home/Away)
 * - Player stats table (Handicap, Name, Wins, Losses)
 * - Match stats (Games to Win/Tie, Points)
 * - Auto-confirm toggle
 */

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Lineup } from '@/types/match';
import {
  getPlayerStats,
  getTeamStats,
  calculatePoints,
  type HandicapThresholds,
} from '@/types/match';
import { MatchEndVerification } from './MatchEndVerification';
import { InfoButton } from '@/components/InfoButton';

interface MatchScoreboardProps {
  /** Current match data */
  match: {
    id: string;
    home_team_id: string;
    away_team_id: string;
    home_team?: { team_name: string };
    away_team?: { team_name: string };
    home_team_verified_by?: string | null;
    away_team_verified_by?: string | null;
  };
  /** Home team lineup */
  homeLineup: Lineup;
  /** Away team lineup */
  awayLineup: Lineup;
  /** Map of game results by game number */
  gameResults: Map<
    number,
    {
      id: string;
      winner_player_id: string | null;
      winner_team_id: string | null;
      confirmed_by_home: boolean;
      confirmed_by_away: boolean;
      break_and_run: boolean;
      golden_break: boolean;
    }
  >;
  /** Home team handicap */
  homeTeamHandicap: number;
  /** Home team thresholds (games to win/tie) */
  homeThresholds: HandicapThresholds;
  /** Away team thresholds (games to win/tie) */
  awayThresholds: HandicapThresholds;
  /** Whether showing home team (true) or away team (false) */
  showingHomeTeam: boolean;
  /** Handler to toggle team view */
  onToggleTeam: (showHome: boolean) => void;
  /** Auto-confirm setting */
  autoConfirm: boolean;
  /** Handler to toggle auto-confirm */
  onAutoConfirmChange: (checked: boolean) => void;
  /** Get player display name by ID */
  getPlayerDisplayName: (playerId: string) => string;
  /** Whether all games are complete */
  allGamesComplete: boolean;
  /** Is current user on home team? */
  isHomeTeam: boolean;
  /** Handler when user clicks verify */
  onVerify: () => void;
  /** Is verification in progress? */
  isVerifying?: boolean;
}

/**
 * Swipeable scoreboard component for match scoring
 *
 * Displays team and player statistics with toggle between home/away views.
 * Shows match progress, thresholds, and points calculation.
 */
export function MatchScoreboard({
  match,
  homeLineup,
  awayLineup,
  gameResults,
  homeTeamHandicap,
  homeThresholds,
  awayThresholds,
  showingHomeTeam,
  onToggleTeam,
  autoConfirm,
  onAutoConfirmChange,
  getPlayerDisplayName,
  allGamesComplete,
  isHomeTeam,
  onVerify,
  isVerifying = false,
}: MatchScoreboardProps) {
  const navigate = useNavigate();

  // Calculate team wins for verification component
  const homeWins = getTeamStats(match.home_team_id, gameResults as any).wins;
  const awayWins = getTeamStats(match.away_team_id, gameResults as any).wins;

  return (
    <div className="bg-white border-b shadow-sm flex-shrink-0">
      <div className="px-4 py-2">
        {/* Show verification component when all games complete, otherwise show normal header */}
        {allGamesComplete ? (
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
          />
        ) : (
          <>
            {/* Header row: Exit button + My Team Name + Auto-confirm */}
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Exit
              </Button>
              <div className="text-sm font-semibold text-gray-700">
                {isHomeTeam ? match.home_team?.team_name : match.away_team?.team_name}
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoConfirm}
                    onChange={(e) => onAutoConfirmChange(e.target.checked)}
                    className="w-3 h-3"
                  />
                  Auto-Confirm
                </label>
                <InfoButton title="Auto-Confirm Opponent Selections" className="relative">
                  <p className="text-sm">
                    By enabling this your opponents game result selections will automatically be confirmed for your team. Your team is still responsible for ensuring the scoring is accurate. This option simply removes the need to confirm each game individually.
                  </p>
                </InfoButton>
              </div>
            </div>
          </>
        )}

        {/* Mobile: Title above team selector buttons */}
        <div className="md:hidden">
          <div className="text-center font-bold text-lg mb-2">
            {showingHomeTeam ? 'HOME' : 'AWAY'}
          </div>
          {/* Team selector buttons */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-4">
            <Button
              variant={showingHomeTeam ? 'default' : 'outline'}
              onClick={() => onToggleTeam(true)}
            >
              {match.home_team?.team_name}
            </Button>
            <div className="text-sm text-gray-500 font-semibold px-2">vs</div>
            <Button
              variant={!showingHomeTeam ? 'default' : 'outline'}
              onClick={() => onToggleTeam(false)}
            >
              {match.away_team?.team_name}
            </Button>
          </div>
        </div>

        {/* Desktop: Both teams side by side */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-4">
          {/* Home Team */}
          <div className="space-y-2">
            <div className="text-center font-bold text-lg mb-2">
              {match.home_team?.team_name} (HOME)
            </div>
            {/* Two-column layout: Player stats and match stats */}
            <div className="grid grid-cols-[55%_45%] gap-2">
              {/* Player stats table */}
              <div className="border border-gray-300 rounded bg-blue-50">
                <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-xs font-semibold border-b border-gray-300 p-1">
                  <div className="text-center">H/C</div>
                  <div>Name</div>
                  <div className="text-center">W</div>
                  <div className="text-center">L</div>
                </div>
                {/* Team row */}
                <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1 font-semibold border-b border-gray-300">
                  <div className="text-center">{homeTeamHandicap}</div>
                  <div className="truncate">{match.home_team?.team_name}</div>
                  <div className="text-center">
                    {getTeamStats(match.home_team_id, gameResults as any).wins}
                  </div>
                  <div className="text-center">
                    {
                      getTeamStats(match.home_team_id, gameResults as any)
                        .losses
                    }
                  </div>
                </div>
                {/* Player rows */}
                <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                  <div className="text-center">
                    {homeLineup.player1_handicap}
                  </div>
                  <div className="truncate">
                    {homeLineup.player1_id
                      ? getPlayerDisplayName(homeLineup.player1_id)
                      : '-'}
                  </div>
                  <div className="text-center">
                    {homeLineup.player1_id
                      ? getPlayerStats(
                          homeLineup.player1_id,
                          gameResults as any
                        ).wins
                      : 0}
                  </div>
                  <div className="text-center">
                    {homeLineup.player1_id
                      ? getPlayerStats(
                          homeLineup.player1_id,
                          gameResults as any
                        ).losses
                      : 0}
                  </div>
                </div>
                <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                  <div className="text-center">
                    {homeLineup.player2_handicap}
                  </div>
                  <div className="truncate">
                    {homeLineup.player2_id
                      ? getPlayerDisplayName(homeLineup.player2_id)
                      : '-'}
                  </div>
                  <div className="text-center">
                    {homeLineup.player2_id
                      ? getPlayerStats(
                          homeLineup.player2_id,
                          gameResults as any
                        ).wins
                      : 0}
                  </div>
                  <div className="text-center">
                    {homeLineup.player2_id
                      ? getPlayerStats(
                          homeLineup.player2_id,
                          gameResults as any
                        ).losses
                      : 0}
                  </div>
                </div>
                <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                  <div className="text-center">
                    {homeLineup.player3_handicap}
                  </div>
                  <div className="truncate">
                    {homeLineup.player3_id
                      ? getPlayerDisplayName(homeLineup.player3_id)
                      : '-'}
                  </div>
                  <div className="text-center">
                    {homeLineup.player3_id
                      ? getPlayerStats(
                          homeLineup.player3_id,
                          gameResults as any
                        ).wins
                      : 0}
                  </div>
                  <div className="text-center">
                    {homeLineup.player3_id
                      ? getPlayerStats(
                          homeLineup.player3_id,
                          gameResults as any
                        ).losses
                      : 0}
                  </div>
                </div>
              </div>

              {/* Match stats card */}
              <div className="border border-gray-300 rounded p-2 bg-blue-50">
                <div className="flex justify-around text-xs mb-2">
                  <div className="text-center">
                    <div className="text-gray-500">To Win</div>
                    <div className="font-semibold text-lg">
                      {homeThresholds.games_to_win}
                    </div>
                  </div>
                  {homeThresholds.games_to_tie !== null && (
                    <div className="text-center">
                      <div className="text-gray-500">To Tie</div>
                      <div className="font-semibold text-lg">
                        {homeThresholds.games_to_tie}
                      </div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-gray-500">To Lose</div>
                    <div className="font-semibold text-lg">
                      &lt;{homeThresholds.games_to_lose}
                    </div>
                  </div>
                </div>
                <div className="text-center text-4xl font-bold mt-4">
                  {getTeamStats(match.home_team_id, gameResults as any).wins} /{' '}
                  {homeThresholds.games_to_win}
                </div>
                <div className="text-center text-sm mt-2">
                  Points:{' '}
                  {calculatePoints(
                    match.home_team_id,
                    homeThresholds,
                    gameResults as any
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Away Team */}
          <div className="space-y-2">
            <div className="text-center font-bold text-lg mb-2">
              {match.away_team?.team_name} (AWAY)
            </div>
            {/* Two-column layout: Player stats and match stats */}
            <div className="grid grid-cols-[55%_45%] gap-2">
              {/* Player stats table */}
              <div className="border border-gray-300 rounded bg-orange-50">
                <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-xs font-semibold border-b border-gray-300 p-1">
                  <div className="text-center">H/C</div>
                  <div>Name</div>
                  <div className="text-center">W</div>
                  <div className="text-center">L</div>
                </div>
                {/* Team row */}
                <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1 font-semibold border-b border-gray-300">
                  <div className="text-center">0</div>
                  <div className="truncate">{match.away_team?.team_name}</div>
                  <div className="text-center">
                    {getTeamStats(match.away_team_id, gameResults as any).wins}
                  </div>
                  <div className="text-center">
                    {
                      getTeamStats(match.away_team_id, gameResults as any)
                        .losses
                    }
                  </div>
                </div>
                {/* Player rows */}
                <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                  <div className="text-center">
                    {awayLineup.player1_handicap}
                  </div>
                  <div className="truncate">
                    {awayLineup.player1_id
                      ? getPlayerDisplayName(awayLineup.player1_id)
                      : '-'}
                  </div>
                  <div className="text-center">
                    {awayLineup.player1_id
                      ? getPlayerStats(
                          awayLineup.player1_id,
                          gameResults as any
                        ).wins
                      : 0}
                  </div>
                  <div className="text-center">
                    {awayLineup.player1_id
                      ? getPlayerStats(
                          awayLineup.player1_id,
                          gameResults as any
                        ).losses
                      : 0}
                  </div>
                </div>
                <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                  <div className="text-center">
                    {awayLineup.player2_handicap}
                  </div>
                  <div className="truncate">
                    {awayLineup.player2_id
                      ? getPlayerDisplayName(awayLineup.player2_id)
                      : '-'}
                  </div>
                  <div className="text-center">
                    {awayLineup.player2_id
                      ? getPlayerStats(
                          awayLineup.player2_id,
                          gameResults as any
                        ).wins
                      : 0}
                  </div>
                  <div className="text-center">
                    {awayLineup.player2_id
                      ? getPlayerStats(
                          awayLineup.player2_id,
                          gameResults as any
                        ).losses
                      : 0}
                  </div>
                </div>
                <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                  <div className="text-center">
                    {awayLineup.player3_handicap}
                  </div>
                  <div className="truncate">
                    {awayLineup.player3_id
                      ? getPlayerDisplayName(awayLineup.player3_id)
                      : '-'}
                  </div>
                  <div className="text-center">
                    {awayLineup.player3_id
                      ? getPlayerStats(
                          awayLineup.player3_id,
                          gameResults as any
                        ).wins
                      : 0}
                  </div>
                  <div className="text-center">
                    {awayLineup.player3_id
                      ? getPlayerStats(
                          awayLineup.player3_id,
                          gameResults as any
                        ).losses
                      : 0}
                  </div>
                </div>
              </div>

              {/* Match stats card */}
              <div className="border border-gray-300 rounded p-2 bg-orange-50">
                <div className="flex justify-around text-xs mb-2">
                  <div className="text-center">
                    <div className="text-gray-500">To Win</div>
                    <div className="font-semibold text-lg">
                      {awayThresholds.games_to_win}
                    </div>
                  </div>
                  {awayThresholds.games_to_tie !== null && (
                    <div className="text-center">
                      <div className="text-gray-500">To Tie</div>
                      <div className="font-semibold text-lg">
                        {awayThresholds.games_to_tie}
                      </div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-gray-500">To Lose</div>
                    <div className="font-semibold text-lg">
                      &lt;{awayThresholds.games_to_lose}
                    </div>
                  </div>
                </div>
                <div className="text-center text-4xl font-bold mt-4">
                  {getTeamStats(match.away_team_id, gameResults as any).wins} /{' '}
                  {awayThresholds.games_to_win}
                </div>
                <div className="text-center text-sm mt-2">
                  Points:{' '}
                  {calculatePoints(
                    match.away_team_id,
                    awayThresholds,
                    gameResults as any
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Team scoreboard (shows one team at a time) */}
        <div className="md:hidden">
          {showingHomeTeam ? (
            <div className="space-y-2">
              {/* Two-column layout: Player stats and match stats */}
              <div className="grid grid-cols-[55%_45%] gap-2">
                {/* Player stats table */}
                <div className="border border-gray-300 rounded bg-blue-50">
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-xs font-semibold border-b border-gray-300 p-1">
                    <div className="text-center">H/C</div>
                    <div>Name</div>
                    <div className="text-center">W</div>
                    <div className="text-center">L</div>
                  </div>
                  {/* Team row */}
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1 font-semibold border-b border-gray-300">
                    <div className="text-center">{homeTeamHandicap}</div>
                    <div className="truncate">{match.home_team?.team_name}</div>
                    <div className="text-center">
                      {
                        getTeamStats(match.home_team_id, gameResults as any)
                          .wins
                      }
                    </div>
                    <div className="text-center">
                      {
                        getTeamStats(match.home_team_id, gameResults as any)
                          .losses
                      }
                    </div>
                  </div>
                  {/* Player rows */}
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">
                      {homeLineup.player1_handicap}
                    </div>
                    <div className="truncate">
                      {homeLineup.player1_id
                        ? getPlayerDisplayName(homeLineup.player1_id)
                        : '-'}
                    </div>
                    <div className="text-center">
                      {homeLineup.player1_id
                        ? getPlayerStats(
                            homeLineup.player1_id,
                            gameResults as any
                          ).wins
                        : 0}
                    </div>
                    <div className="text-center">
                      {homeLineup.player1_id
                        ? getPlayerStats(
                            homeLineup.player1_id,
                            gameResults as any
                          ).losses
                        : 0}
                    </div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">
                      {homeLineup.player2_handicap}
                    </div>
                    <div className="truncate">
                      {homeLineup.player2_id
                        ? getPlayerDisplayName(homeLineup.player2_id)
                        : '-'}
                    </div>
                    <div className="text-center">
                      {homeLineup.player2_id
                        ? getPlayerStats(
                            homeLineup.player2_id,
                            gameResults as any
                          ).wins
                        : 0}
                    </div>
                    <div className="text-center">
                      {homeLineup.player2_id
                        ? getPlayerStats(
                            homeLineup.player2_id,
                            gameResults as any
                          ).losses
                        : 0}
                    </div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">
                      {homeLineup.player3_handicap}
                    </div>
                    <div className="truncate">
                      {homeLineup.player3_id
                        ? getPlayerDisplayName(homeLineup.player3_id)
                        : '-'}
                    </div>
                    <div className="text-center">
                      {homeLineup.player3_id
                        ? getPlayerStats(
                            homeLineup.player3_id,
                            gameResults as any
                          ).wins
                        : 0}
                    </div>
                    <div className="text-center">
                      {homeLineup.player3_id
                        ? getPlayerStats(
                            homeLineup.player3_id,
                            gameResults as any
                          ).losses
                        : 0}
                    </div>
                  </div>
                </div>

                {/* Match stats card */}
                <div className="border border-gray-300 rounded p-2 bg-blue-50">
                  <div className="flex justify-around text-xs mb-2">
                    <div className="text-center">
                      <div className="text-gray-500">To Win</div>
                      <div className="font-semibold text-lg">
                        {homeThresholds.games_to_win}
                      </div>
                    </div>
                    {homeThresholds.games_to_tie !== null && (
                      <div className="text-center">
                        <div className="text-gray-500">To Tie</div>
                        <div className="font-semibold text-lg">
                          {homeThresholds.games_to_tie}
                        </div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-gray-500">To Lose</div>
                      <div className="font-semibold text-lg">
                        &lt;{homeThresholds.games_to_lose}
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-4xl font-bold mt-4">
                    {getTeamStats(match.home_team_id, gameResults as any).wins}{' '}
                    / {homeThresholds.games_to_win}
                  </div>
                  <div className="text-center text-sm mt-2">
                    Points:{' '}
                    {calculatePoints(
                      match.home_team_id,
                      homeThresholds,
                      gameResults as any
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Two-column layout: Player stats and match stats */}
              <div className="grid grid-cols-[55%_45%] gap-2">
                {/* Player stats table */}
                <div className="border border-gray-300 rounded bg-orange-50">
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-xs font-semibold border-b border-gray-300 p-1">
                    <div className="text-center">H/C</div>
                    <div>Name</div>
                    <div className="text-center">W</div>
                    <div className="text-center">L</div>
                  </div>
                  {/* Team row */}
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1 font-semibold border-b border-gray-300">
                    <div className="text-center">0</div>
                    <div className="truncate">{match.away_team?.team_name}</div>
                    <div className="text-center">
                      {
                        getTeamStats(match.away_team_id, gameResults as any)
                          .wins
                      }
                    </div>
                    <div className="text-center">
                      {
                        getTeamStats(match.away_team_id, gameResults as any)
                          .losses
                      }
                    </div>
                  </div>
                  {/* Player rows */}
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">
                      {awayLineup.player1_handicap}
                    </div>
                    <div className="truncate">
                      {awayLineup.player1_id
                        ? getPlayerDisplayName(awayLineup.player1_id)
                        : '-'}
                    </div>
                    <div className="text-center">
                      {awayLineup.player1_id
                        ? getPlayerStats(
                            awayLineup.player1_id,
                            gameResults as any
                          ).wins
                        : 0}
                    </div>
                    <div className="text-center">
                      {awayLineup.player1_id
                        ? getPlayerStats(
                            awayLineup.player1_id,
                            gameResults as any
                          ).losses
                        : 0}
                    </div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">
                      {awayLineup.player2_handicap}
                    </div>
                    <div className="truncate">
                      {awayLineup.player2_id
                        ? getPlayerDisplayName(awayLineup.player2_id)
                        : '-'}
                    </div>
                    <div className="text-center">
                      {awayLineup.player2_id
                        ? getPlayerStats(
                            awayLineup.player2_id,
                            gameResults as any
                          ).wins
                        : 0}
                    </div>
                    <div className="text-center">
                      {awayLineup.player2_id
                        ? getPlayerStats(
                            awayLineup.player2_id,
                            gameResults as any
                          ).losses
                        : 0}
                    </div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">
                      {awayLineup.player3_handicap}
                    </div>
                    <div className="truncate">
                      {awayLineup.player3_id
                        ? getPlayerDisplayName(awayLineup.player3_id)
                        : '-'}
                    </div>
                    <div className="text-center">
                      {awayLineup.player3_id
                        ? getPlayerStats(
                            awayLineup.player3_id,
                            gameResults as any
                          ).wins
                        : 0}
                    </div>
                    <div className="text-center">
                      {awayLineup.player3_id
                        ? getPlayerStats(
                            awayLineup.player3_id,
                            gameResults as any
                          ).losses
                        : 0}
                    </div>
                  </div>
                </div>

                {/* Match stats card */}
                <div className="border border-gray-300 rounded p-2 bg-orange-50">
                  <div className="flex justify-around text-xs mb-2">
                    <div className="text-center">
                      <div className="text-gray-500">To Win</div>
                      <div className="font-semibold text-lg">
                        {awayThresholds.games_to_win}
                      </div>
                    </div>
                    {awayThresholds.games_to_tie !== null && (
                      <div className="text-center">
                        <div className="text-gray-500">To Tie</div>
                        <div className="font-semibold text-lg">
                          {awayThresholds.games_to_tie}
                        </div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-gray-500">To Lose</div>
                      <div className="font-semibold text-lg">
                        &lt;{awayThresholds.games_to_lose}
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-4xl font-bold mt-4">
                    {getTeamStats(match.away_team_id, gameResults as any).wins}{' '}
                    / {awayThresholds.games_to_win}
                  </div>
                  <div className="text-center text-sm mt-2">
                    Points:{' '}
                    {calculatePoints(
                      match.away_team_id,
                      awayThresholds,
                      gameResults as any
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
