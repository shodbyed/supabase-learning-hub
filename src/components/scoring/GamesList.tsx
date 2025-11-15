/**
 * @fileoverview Games List Component
 *
 * Displays scrollable list of all match games.
 * Format-agnostic - works for 3, 18, or 25 games automatically.
 * Shows game status (unscored, pending, confirmed) and handles user interactions.
 *
 * ALL game data comes directly from the database (gameResults Map).
 * No calculated or "on the fly" data is displayed.
 */

import { Button } from '@/components/ui/button';
import type { MatchGame } from '@/types';

interface GamesListProps {
  gameResults: Map<number, MatchGame>;
  getPlayerDisplayName: (playerId: string | null) => string;
  onGameClick: (gameNumber: number, playerId: string, playerName: string, teamId: string) => void;
  onVacateClick: (gameNumber: number, currentWinnerName: string) => void;
  onVacateRequestClick?: (gameNumber: number, currentWinnerName: string) => void;
  homeTeamId: string;
  awayTeamId: string;
  totalGames: number; // 18 for 3v3, 3 for tiebreaker, 25 for 5v5
  isHomeTeam: boolean | null; // Needed to determine if user requested vacate
}

/**
 * Scrollable game list showing all games in the match
 *
 * Game states:
 * - Unscored: Clickable buttons (blue for home, orange for away)
 * - Pending: Yellow background on winner, white on loser, no trophy, no edit button
 * - Vacate Requested: Red background on winner, white on loser, "Vacate Request" button in middle
 * - Confirmed: Green background on winner, white on loser, trophy icon, "Vacate" button
 *
 * Key feature: Reads ALL data from database (gameResults Map)
 */
export function GamesList({
  gameResults,
  getPlayerDisplayName,
  onGameClick,
  onVacateClick,
  onVacateRequestClick,
  homeTeamId,
  awayTeamId,
  totalGames,
  isHomeTeam,
}: GamesListProps) {
  /**
   * Get completed games count
   */
  const getCompletedGamesCount = () => {
    let count = 0;
    gameResults.forEach(game => {
      if (game.confirmed_by_home && game.confirmed_by_away) {
        count++;
      }
    });
    return count;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Fixed header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 bg-gray-50">
        <div className="text-sm font-semibold mb-4">
          Games Complete: <span className="text-lg">{getCompletedGamesCount()} / {totalGames}</span>
        </div>
        {/* Column headers */}
        <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-xs text-gray-500 pb-2">
          <div></div>
          <div className="text-center">Break</div>
          <div className="text-center font-semibold">vs</div>
          <div className="text-center">Rack</div>
        </div>
      </div>

      {/* Scrollable game list - DYNAMIC (works for any number of games) */}
      {/* ALL game data comes from database - sorted by game_number */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          {Array.from(gameResults.values())
            .sort((a, b) => a.game_number - b.game_number)
            .map(gameResult => {
            // Read player IDs directly from database record
            const homePlayerId = gameResult.home_player_id;
            const awayPlayerId = gameResult.away_player_id;
            const homePlayerName = getPlayerDisplayName(homePlayerId);
            const awayPlayerName = getPlayerDisplayName(awayPlayerId);

            // Determine who breaks and who racks from database fields
            const breakerName = gameResult.home_action === 'breaks' ? homePlayerName : awayPlayerName;
            const breakerPlayerId = gameResult.home_action === 'breaks' ? homePlayerId : awayPlayerId;
            const breakerTeamId = gameResult.home_action === 'breaks' ? homeTeamId : awayTeamId;

            const rackerName = gameResult.home_action === 'racks' ? homePlayerName : awayPlayerName;
            const rackerPlayerId = gameResult.home_action === 'racks' ? homePlayerId : awayPlayerId;
            const rackerTeamId = gameResult.home_action === 'racks' ? homeTeamId : awayTeamId;

            const breakerIsHome = gameResult.home_action === 'breaks';
            const rackerIsHome = gameResult.home_action === 'racks';

            // Check game status
            const hasWinner = gameResult.winner_player_id;
            const isConfirmed = gameResult.confirmed_by_home && gameResult.confirmed_by_away;
            const isVacateRequested = !!(gameResult as any).vacate_requested_by;
            const isPending = hasWinner && !isConfirmed && !isVacateRequested;

            // If game has a winner (pending or confirmed)
            if (hasWinner) {
              const breakerWon = gameResult.winner_player_id === breakerPlayerId;
              const rackerWon = gameResult.winner_player_id === rackerPlayerId;

              // Determine styling based on confirmation status
              const winnerClass = isConfirmed ? 'bg-green-200 font-semibold' : 'bg-yellow-100 font-semibold';
              const loserClass = 'bg-white text-gray-500';

              // If vacate requested, show distinctive styling
              if (isVacateRequested) {
                const vacateRequestedBy = (gameResult as any).vacate_requested_by;
                const requestedByHome = vacateRequestedBy === 'home';
                const iRequestedVacate = (isHomeTeam && requestedByHome) || (!isHomeTeam && !requestedByHome);

                return (
                  <div key={gameResult.game_number} className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-sm py-2 border-b">
                    <div className="font-semibold">{gameResult.game_number}.</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full ${breakerWon ? 'bg-red-100 font-semibold' : 'bg-white text-gray-500'}`}
                      disabled={iRequestedVacate}
                      onClick={() => !iRequestedVacate && breakerPlayerId && onGameClick(gameResult.game_number, breakerPlayerId, breakerName, breakerTeamId)}
                    >
                      {breakerName}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-xs px-1 ${iRequestedVacate ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'}`}
                      disabled={iRequestedVacate}
                      onClick={() => {
                        if (!iRequestedVacate && onVacateRequestClick) {
                          onVacateRequestClick(gameResult.game_number, breakerWon ? breakerName : rackerName);
                        }
                      }}
                    >
                      {iRequestedVacate ? 'Request Sent' : 'Vacate Request'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full ${rackerWon ? 'bg-red-100 font-semibold' : 'bg-white text-gray-500'}`}
                      disabled={iRequestedVacate}
                      onClick={() => !iRequestedVacate && rackerPlayerId && onGameClick(gameResult.game_number, rackerPlayerId, rackerName, rackerTeamId)}
                    >
                      {rackerName}
                    </Button>
                  </div>
                );
              }

              // If pending, show buttons with NO trophy, NO Edit button - just colored backgrounds
              if (isPending) {
                return (
                  <div key={gameResult.game_number} className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-sm py-2 border-b">
                    <div className="font-semibold">{gameResult.game_number}.</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full ${breakerWon ? winnerClass : loserClass}`}
                      onClick={() => breakerPlayerId && onGameClick(gameResult.game_number, breakerPlayerId, breakerName, breakerTeamId)}
                    >
                      {breakerName}
                    </Button>
                    <div className="text-center font-semibold text-gray-400">vs</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full ${rackerWon ? winnerClass : loserClass}`}
                      onClick={() => rackerPlayerId && onGameClick(gameResult.game_number, rackerPlayerId, rackerName, rackerTeamId)}
                    >
                      {rackerName}
                    </Button>
                  </div>
                );
              }

              // If confirmed, show divs with trophy on winner and Vacate button in middle
              return (
                <div key={gameResult.game_number} className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-sm py-2 border-b">
                  <div className="font-semibold">{gameResult.game_number}.</div>
                  <div className={`text-center p-2 rounded ${breakerWon ? winnerClass : loserClass}`}>
                    {breakerWon && <span className="mr-1">🏆</span>}
                    {breakerName}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs px-1"
                    onClick={() => {
                      onVacateClick(gameResult.game_number, breakerWon ? breakerName : rackerName);
                    }}
                  >
                    Vacate
                  </Button>
                  <div className={`text-center p-2 rounded ${rackerWon ? winnerClass : loserClass}`}>
                    {rackerWon && <span className="mr-1">🏆</span>}
                    {rackerName}
                  </div>
                </div>
              );
            }

            // Unscored game - show clickable buttons
            return (
              <div key={gameResult.game_number} className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-sm py-2 border-b">
                <div className="font-semibold">{gameResult.game_number}.</div>
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full ${breakerIsHome ? 'bg-blue-100 hover:bg-blue-200' : 'bg-orange-100 hover:bg-orange-200'}`}
                    onClick={() => breakerPlayerId && onGameClick(gameResult.game_number, breakerPlayerId, breakerName, breakerTeamId)}
                  >
                    {breakerName}
                  </Button>
                </div>
                <div className="text-center font-semibold text-gray-400">vs</div>
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full ${rackerIsHome ? 'bg-blue-100 hover:bg-blue-200' : 'bg-orange-100 hover:bg-orange-200'}`}
                    onClick={() => rackerPlayerId && onGameClick(gameResult.game_number, rackerPlayerId, rackerName, rackerTeamId)}
                  >
                    {rackerName}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
