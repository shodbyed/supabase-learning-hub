/**
 * @fileoverview Team Stats Hook (TanStack Query)
 *
 * React hook for fetching team standings with player breakdowns.
 * Combines team-level match data with player-level game statistics.
 *
 * Benefits:
 * - Automatic caching (stats cached for 5 minutes)
 * - Request deduplication
 * - Loading and error states
 *
 * @example
 * const { teams, isLoading } = useTeamStats('season-123');
 * teams.forEach(team => {
 *   console.log(`${team.teamName}: ${team.matchWins}W-${team.matchLosses}L`);
 *   team.players.forEach(p => console.log(`  ${p.playerName}: ${p.gamesWon}W`));
 * });
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { fetchTeamStats } from '../queries/teamStats';
import type { TeamWithPlayerStats } from '../queries/teamStats';

/**
 * Return type for useTeamStats hook
 */
interface UseTeamStatsResult {
  /** Teams with player stats (in standings order) */
  teams: TeamWithPlayerStats[];
  /** True if query is still loading */
  isLoading: boolean;
  /** Error from failed query */
  error: Error | null;
}

/**
 * Hook to fetch team stats with player breakdowns for a season
 *
 * Fetches hierarchical team/player stats from the season.
 * Teams returned in standings order (wins → points → games).
 *
 * Returns:
 * - Team standings (match wins/losses/points/games)
 * - Player stats per team (games won/lost, matches played)
 * - Substitute stats aggregated per team
 *
 * @param seasonId - Season's primary key ID
 * @returns Object with teams array, loading state, and error state
 *
 * @example
 * function TeamStatsPage() {
 *   const { seasonId } = useParams();
 *   const { teams, isLoading, error } = useTeamStats(seasonId!);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {teams.map(team => (
 *         <div key={team.teamId}>
 *           <h2>{team.teamName}: {team.matchWins}W-{team.matchLosses}L</h2>
 *           {team.players.map(player => (
 *             <div key={player.playerId}>
 *               {player.playerName}: {player.gamesWon}W-{player.gamesLost}L
 *             </div>
 *           ))}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useTeamStats(seasonId: string): UseTeamStatsResult {
  const {
    data: teams,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.stats.teamStats(seasonId),
    queryFn: () => fetchTeamStats(seasonId),
    staleTime: 5 * 60 * 1000, // 5 minutes - stats don't change that frequently
    retry: 1,
  });

  return {
    teams: teams || [],
    isLoading,
    error: error as Error | null,
  };
}
