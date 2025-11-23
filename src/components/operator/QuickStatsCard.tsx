/**
 * @fileoverview Smart QuickStats Card Component
 *
 * Self-contained stats card that fetches its own data.
 * Displays operator dashboard statistics with automatic data fetching and caching.
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useLeagueCount,
  useTeamCount,
  usePlayerCount,
  useVenueCount
} from '@/api/hooks';

interface QuickStatsCardProps {
  /** Operator ID to fetch stats for */
  operatorId: string | null | undefined;
}

/**
 * QuickStatsCard Component
 *
 * Fetches and displays operator statistics:
 * - Active leagues count
 * - Total teams count
 * - Total players count
 * - Total venues count
 *
 * All data is fetched via TanStack Query hooks with automatic caching.
 *
 * @example
 * <QuickStatsCard operatorId={operatorId} />
 */
export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({ operatorId }) => {
  // Fetch all stats using TanStack Query hooks
  const { data: leagueCount = 0 } = useLeagueCount(operatorId);
  const { data: teamCount = 0 } = useTeamCount(operatorId);
  const { data: playerCount = 0 } = usePlayerCount(operatorId);
  const { data: venueCount = 0 } = useVenueCount(operatorId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Active Stats Section */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Active
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Leagues</span>
              <span className="font-medium">{leagueCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Teams</span>
              <span className="font-medium">{teamCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Players</span>
              <span className="font-medium">{playerCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Venues</span>
              <span className="font-medium">{venueCount}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Historical Stats Section */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            All Time
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Seasons Completed</span>
              <span className="font-medium text-gray-400">Coming Soon</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Matches</span>
              <span className="font-medium text-gray-400">Coming Soon</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
