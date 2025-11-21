/**
 * @fileoverview Feats of Excellence Hook (TanStack Query)
 *
 * React hook for fetching special achievement statistics.
 * Returns break & runs, golden breaks, and flawless nights rankings.
 *
 * Benefits:
 * - Automatic caching (feats cached for 5 minutes)
 * - Request deduplication
 * - Loading and error states
 *
 * @example
 * const { feats, isLoading } = useFeatsStats('season-123');
 * feats.breakAndRuns.forEach(p => console.log(`${p.playerName}: ${p.count}`));
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { fetchFeatsStats, type FeatsStats } from '../queries/featsStats';

/**
 * Return type for useFeatsStats hook
 */
interface UseFeatsStatsResult {
  /** Feats statistics with three rankings */
  feats: FeatsStats | null;
  /** True if query is still loading */
  isLoading: boolean;
  /** Error from failed query */
  error: Error | null;
}

/**
 * Hook to fetch feats of excellence statistics for a season
 *
 * Fetches three special achievement rankings:
 * - Break & Runs
 * - Golden Breaks
 * - Flawless Nights
 *
 * All rankings only include players with at least 1 of that feat.
 * Sorted by count (descending), then player name (ascending).
 *
 * @param seasonId - Season's primary key ID
 * @returns Object with feats data, loading state, and error state
 *
 * @example
 * function FeatsPage() {
 *   const { seasonId } = useParams();
 *   const { feats, isLoading, error } = useFeatsStats(seasonId!);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h2>Break & Runs</h2>
 *       {feats.breakAndRuns.map((player, i) => (
 *         <div key={player.playerId}>
 *           {i + 1}. {player.playerName}: {player.count}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useFeatsStats(seasonId: string): UseFeatsStatsResult {
  const {
    data: feats,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.stats.feats(seasonId),
    queryFn: () => fetchFeatsStats(seasonId),
    staleTime: 5 * 60 * 1000, // 5 minutes - feats don't change that frequently
    retry: 1,
  });

  return {
    feats: feats || null,
    isLoading,
    error: error as Error | null,
  };
}
