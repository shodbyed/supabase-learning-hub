/**
 * @fileoverview Scoreboard Card Component
 *
 * Displays team scoreboard with player stats and match stats.
 * Dynamically renders player list (works for 3 or 5 players).
 * Used in swipeable scoreboard section of scoring pages.
 */

export interface ScoreboardPlayer {
  id: string;
  name: string;
  handicap: number;
  wins: number;
  losses: number;
}

export interface MatchStats {
  toWin: number;
  toTie: number | null; // null for tiebreaker/5v5 (no ties)
  currentWins: number;
  points: number;
}

interface ScoreboardCardProps {
  teamType: 'home' | 'away';
  teamName: string;
  teamHandicap: number;
  players: ScoreboardPlayer[];
  matchStats: MatchStats;
  autoConfirm?: boolean;
  onAutoConfirmChange?: (enabled: boolean) => void;
}

/**
 * Scoreboard card showing team players and match progress
 *
 * Key features:
 * - Dynamic player list (uses .map() to render 3 or 5 players)
 * - Team stats row showing team handicap
 * - Match stats showing to win, to tie, current score, points
 * - Auto-confirm checkbox for opponent scores
 */
export function ScoreboardCard({
  teamType,
  teamHandicap,
  players,
  matchStats,
  autoConfirm,
  onAutoConfirmChange,
}: ScoreboardCardProps) {
  const isHome = teamType === 'home';
  const bgColor = isHome ? 'bg-blue-50' : 'bg-orange-50';
  const textColor = isHome ? 'text-blue-900' : 'text-orange-900';

  return (
    <div className="space-y-2 p-4">
      {/* Team Header */}
      <div className="flex flex-col items-center mb-2">
        <div className={`text-center font-bold text-lg ${textColor}`}>
          {isHome ? 'HOME' : 'AWAY'}
        </div>
        {onAutoConfirmChange && (
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={autoConfirm}
              onChange={(e) => onAutoConfirmChange(e.target.checked)}
              className="w-3 h-3"
            />
            Auto-confirm opponent scores
          </label>
        )}
      </div>

      {/* Two-column layout: Player stats and match stats */}
      <div className="grid grid-cols-[55%_45%] gap-2">
        {/* Player stats table */}
        <div className={`border border-gray-300 rounded ${bgColor}`}>
          {/* Column headers */}
          <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-xs font-semibold border-b border-gray-300 p-1">
            <div className="text-center">H/C</div>
            <div>Name</div>
            <div className="text-center">W</div>
            <div className="text-center">L</div>
          </div>

          {/* Team row */}
          <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1 font-semibold border-b border-gray-300">
            <div className="text-center">{teamHandicap}</div>
            <div className="truncate">Team outside</div>
            <div className="text-center">{matchStats.currentWins}</div>
            <div className="text-center">
              {players.reduce((sum, p) => sum + p.losses, 0)}
            </div>
          </div>

          {/* Player rows - DYNAMIC (works for 3 or 5 players) */}
          {players.map((player) => (
            <div
              key={player.id}
              className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1"
            >
              <div className="text-center">{player.handicap}</div>
              <div className="truncate">{player.name}</div>
              <div className="text-center">{player.wins}</div>
              <div className="text-center">{player.losses}</div>
            </div>
          ))}
        </div>

        {/* Match stats card */}
        <div className={`border border-gray-300 rounded p-2 ${bgColor}`}>
          <div className="flex justify-around text-xs mb-2">
            <div className="text-center">
              <div className="text-gray-500">To Win</div>
              <div className="font-semibold text-lg">{matchStats.toWin}</div>
            </div>
            {matchStats.toTie !== null && (
              <div className="text-center">
                <div className="text-gray-500">To Tie</div>
                <div className="font-semibold text-lg">{matchStats.toTie}</div>
              </div>
            )}
          </div>
          <div className="text-center text-4xl font-bold mt-4">
            {matchStats.currentWins} / {matchStats.toWin}
          </div>
          <div className="text-center text-sm mt-2">
            Points: {matchStats.points}
          </div>
        </div>
      </div>
    </div>
  );
}
