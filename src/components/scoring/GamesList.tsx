/**
 * @fileoverview Games List Component
 *
 * Displays scrollable list of all match games.
 * Format-agnostic - works for 3, 18, or 25 games automatically.
 * Shows game status (unscored, pending, confirmed) and handles user interactions.
 */

import { Button } from '@/components/ui/button';
import type { MatchGame, Lineup } from '@/types';

export interface GameDefinition {
  gameNumber: number;
  homePlayerPosition: number; // 1-3 for 3v3, 1-5 for 5v5
  awayPlayerPosition: number;
  homeAction: 'breaks' | 'racks';
  awayAction: 'breaks' | 'racks';
}

interface GamesListProps {
  games: GameDefinition[]; // From getAllGames() or getTiebreakerGames() or get5v5Games()
  gameResults: Map<number, MatchGame>;
  homeLineup: Lineup;
  awayLineup: Lineup;
  getPlayerDisplayName: (playerId: string | null) => string;
  onGameClick: (gameNumber: number, playerId: string, playerName: string, teamId: string) => void;
  onVacateClick: (gameNumber: number, currentWinnerName: string) => void;
  homeTeamId: string;
  awayTeamId: string;
  totalGames: number; // 18 for 3v3, 3 for tiebreaker, 25 for 5v5
}

/**
 * Scrollable game list showing all games in the match
 *
 * Game states:
 * - Unscored: Clickable buttons (blue for home, orange for away)
 * - Pending: Yellow background on winner, white on loser, no trophy, no edit button
 * - Confirmed: Green background on winner, white on loser, trophy icon, "Vacate" button
 *
 * Key feature: Uses games.map() - works for any number of games
 */
export function GamesList({
  games,
  gameResults,
  homeLineup,
  awayLineup,
  getPlayerDisplayName,
  onGameClick,
  onVacateClick,
  homeTeamId,
  awayTeamId,
  totalGames,
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
      {/* Only display games that exist in the database */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          {games
            .filter(game => gameResults.has(game.gameNumber))
            .map(game => {
            const homePlayerId = homeLineup[`player${game.homePlayerPosition}_id` as keyof Lineup] as string;
            const awayPlayerId = awayLineup[`player${game.awayPlayerPosition}_id` as keyof Lineup] as string;
            const homePlayerName = getPlayerDisplayName(homePlayerId);
            const awayPlayerName = getPlayerDisplayName(awayPlayerId);

            // Determine who breaks and who racks, and which team they're from
            const breakerName = game.homeAction === 'breaks' ? homePlayerName : awayPlayerName;
            const breakerPlayerId = game.homeAction === 'breaks' ? homePlayerId : awayPlayerId;
            const breakerTeamId = game.homeAction === 'breaks' ? homeTeamId : awayTeamId;

            const rackerName = game.homeAction === 'racks' ? homePlayerName : awayPlayerName;
            const rackerPlayerId = game.homeAction === 'racks' ? homePlayerId : awayPlayerId;
            const rackerTeamId = game.homeAction === 'racks' ? homeTeamId : awayTeamId;

            const breakerIsHome = game.homeAction === 'breaks';
            const rackerIsHome = game.homeAction === 'racks';

            // Check game status
            const gameResult = gameResults.get(game.gameNumber);
            const hasWinner = gameResult && gameResult.winner_player_id;
            const isConfirmed = gameResult && gameResult.confirmed_by_home && gameResult.confirmed_by_away;
            const isPending = hasWinner && !isConfirmed;

            // If game has a winner (pending or confirmed)
            if (hasWinner) {
              const breakerWon = gameResult.winner_player_id === breakerPlayerId;
              const rackerWon = gameResult.winner_player_id === rackerPlayerId;

              // Determine styling based on confirmation status
              const winnerClass = isConfirmed ? 'bg-green-200 font-semibold' : 'bg-yellow-100 font-semibold';
              const loserClass = 'bg-white text-gray-500';

              // If pending, show buttons with NO trophy, NO Edit button - just colored backgrounds
              if (isPending) {
                return (
                  <div key={game.gameNumber} className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-sm py-2 border-b">
                    <div className="font-semibold">{game.gameNumber}.</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full ${breakerWon ? winnerClass : loserClass}`}
                      onClick={() => onGameClick(game.gameNumber, breakerPlayerId, breakerName, breakerTeamId)}
                    >
                      {breakerName}
                    </Button>
                    <div className="text-center font-semibold text-gray-400">vs</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full ${rackerWon ? winnerClass : loserClass}`}
                      onClick={() => onGameClick(game.gameNumber, rackerPlayerId, rackerName, rackerTeamId)}
                    >
                      {rackerName}
                    </Button>
                  </div>
                );
              }

              // If confirmed, show divs with trophy on winner and Vacate button in middle
              return (
                <div key={game.gameNumber} className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-sm py-2 border-b">
                  <div className="font-semibold">{game.gameNumber}.</div>
                  <div className={`text-center p-2 rounded ${breakerWon ? winnerClass : loserClass}`}>
                    {breakerWon && <span className="mr-1">🏆</span>}
                    {breakerName}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs px-1"
                    onClick={() => {
                      onVacateClick(game.gameNumber, breakerWon ? breakerName : rackerName);
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
              <div key={game.gameNumber} className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-sm py-2 border-b">
                <div className="font-semibold">{game.gameNumber}.</div>
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full ${breakerIsHome ? 'bg-blue-100 hover:bg-blue-200' : 'bg-orange-100 hover:bg-orange-200'}`}
                    onClick={() => onGameClick(game.gameNumber, breakerPlayerId, breakerName, breakerTeamId)}
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
                    onClick={() => onGameClick(game.gameNumber, rackerPlayerId, rackerName, rackerTeamId)}
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
