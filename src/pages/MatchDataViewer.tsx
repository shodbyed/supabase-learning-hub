/**
 * @fileoverview Match Data Viewer Page
 *
 * Comprehensive match data viewer showing ALL important match information.
 * Multi-row layout per match to display complete game details.
 * Mobile-first design with status filtering.
 * Used for debugging and verification during MVP development.
 */

import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useMatchesBySeason } from '@/api/hooks/useMatches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Match Data Viewer Component
 *
 * Displays complete match information with filtering by status.
 * Defaults to showing only completed matches.
 * Shows all critical data: teams, scores, winner, games won, points, thresholds.
 * Ordered by date (most recent first).
 */
export function MatchDataViewer() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const { data: allMatches = [], isLoading, error } = useMatchesBySeason(seasonId);
  const [statusFilter, setStatusFilter] = useState<string>('completed');

  // Debug: Log raw data
  console.log('📊 Match Data Viewer - Raw Data:', {
    allMatches,
    matchCount: allMatches.length,
    firstMatch: allMatches[0],
  });

  // Filter and sort matches
  const matches = useMemo(() => {
    console.log('🔍 Filtering matches:', {
      totalMatches: allMatches.length,
      statusFilter,
      statuses: allMatches.map(m => ({ id: m.id, status: m.status })),
    });

    let filtered = allMatches;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => {
        console.log(`Checking match ${m.id}: status="${m.status}" === "${statusFilter}"?`, m.status === statusFilter);
        return m.status === statusFilter;
      });
    }

    console.log('✅ Filtered matches:', filtered.length);

    // Sort by date (most recent first)
    return filtered.sort((a, b) => {
      const dateA = a.season_week?.scheduled_date || '';
      const dateB = b.season_week?.scheduled_date || '';
      return dateB.localeCompare(dateA);
    });
  }, [allMatches, statusFilter]);

  // Count matches by status
  const statusCounts = useMemo(() => {
    return {
      all: allMatches.length,
      completed: allMatches.filter(m => m.status === 'completed').length,
      awaiting_verification: allMatches.filter(m => m.status === 'awaiting_verification').length,
      in_progress: allMatches.filter(m => m.status === 'in_progress').length,
      scheduled: allMatches.filter(m => m.status === 'scheduled').length,
    };
  }, [allMatches]);

  // Helper: Determine match winner
  const getWinner = (match: any) => {
    // Check match_result field first (authoritative)
    if (match.match_result === 'home_win') return 'home';
    if (match.match_result === 'away_win') return 'away';
    if (match.match_result === 'tie') return 'tie';

    // Fallback to games won comparison
    if (match.home_games_won === null || match.away_games_won === null) return null;
    if (match.home_games_won > match.away_games_won) return 'home';
    if (match.away_games_won > match.home_games_won) return 'away';
    return 'tie';
  };

  // Helper: Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'awaiting_verification': return 'bg-yellow-500';
      case 'scheduled': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-600">Loading match data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-red-600">Error loading matches: {(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle>Match Data Viewer</CardTitle>
          <p className="text-sm text-gray-600 mb-4">
            Showing {matches.length} of {allMatches.length} matches • Ordered by date (most recent first)
          </p>

          {/* Debug Info */}
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="font-semibold mb-1">🐛 Debug Info:</div>
            <div>Total Matches Loaded: {allMatches.length}</div>
            <div>Statuses Found: {allMatches.map(m => `${m.id.substring(0, 8)}... = "${m.status}"`).join(', ')}</div>
            <div>Current Filter: "{statusFilter}"</div>
            <div>Matches After Filter: {matches.length}</div>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('completed')}
            >
              Completed ({statusCounts.completed})
            </Button>
            <Button
              variant={statusFilter === 'awaiting_verification' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('awaiting_verification')}
            >
              Awaiting Verification ({statusCounts.awaiting_verification})
            </Button>
            <Button
              variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('in_progress')}
            >
              In Progress ({statusCounts.in_progress})
            </Button>
            <Button
              variant={statusFilter === 'scheduled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('scheduled')}
            >
              Scheduled ({statusCounts.scheduled})
            </Button>
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All ({statusCounts.all})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No {statusFilter !== 'all' ? statusFilter : ''} matches found
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => {
                const winner = getWinner(match);
                const hasScores = match.home_games_won !== null && match.away_games_won !== null;

                return (
                  <Card key={match.id} className="overflow-hidden">
                    {/* Header Row - Match Info */}
                    <div className="bg-gray-50 px-4 py-2 border-b flex flex-wrap items-center gap-4 text-sm">
                      <div className="font-semibold">Match #{match.match_number}</div>
                      <div className="text-gray-600">
                        {match.season_week?.week_name || 'Week ?'}
                      </div>
                      <div className="text-gray-600">
                        {match.season_week?.scheduled_date
                          ? new Date(match.season_week.scheduled_date).toLocaleDateString()
                          : 'Date TBD'
                        }
                      </div>
                      <Badge className={getStatusColor(match.status)}>
                        {match.status.replace(/_/g, ' ')}
                      </Badge>
                      {hasScores && winner && (
                        <Badge className={winner === 'home' ? 'bg-green-600' : winner === 'away' ? 'bg-blue-600' : 'bg-gray-600'}>
                          {winner === 'home' ? 'Home Win' : winner === 'away' ? 'Away Win' : 'Tie'}
                        </Badge>
                      )}
                      <div className="ml-auto flex gap-2">
                        {(match as any).home_team_verified_by && (
                          <Badge variant="outline" className="text-xs">Home ✓</Badge>
                        )}
                        {(match as any).away_team_verified_by && (
                          <Badge variant="outline" className="text-xs">Away ✓</Badge>
                        )}
                      </div>
                    </div>

                    {/* Match Details - Two-column mobile-responsive grid */}
                    <div className="p-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Home Team Column */}
                        <div className={`space-y-2 ${winner === 'home' ? 'bg-green-50 p-3 rounded-lg border-2 border-green-200' : ''}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`font-bold text-lg ${winner === 'home' ? 'text-green-800' : 'text-gray-900'}`}>
                              🏠 {match.home_team?.team_name || 'Home TBD'}
                            </h3>
                            {winner === 'home' && (
                              <Badge className="bg-green-600">WINNER</Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Games Won:</span>
                              <div className="font-bold text-xl">{match.home_games_won ?? '-'}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Points Earned:</span>
                              <div className="font-bold text-xl text-blue-600">
                                {match.home_points_earned ?? '-'}
                              </div>
                            </div>
                          </div>

                          {/* Handicap Thresholds */}
                          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                            <div className="font-semibold mb-1">Thresholds (Handicapped):</div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <span className="text-gray-500">To Win:</span>
                                <div className="font-medium">{match.home_games_to_win ?? '-'}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">To Tie:</span>
                                <div className="font-medium">{match.home_games_to_tie ?? '-'}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">To Lose:</span>
                                <div className="font-medium">
                                  {match.away_games_to_win ? `< ${match.away_games_to_win}` : '-'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Away Team Column */}
                        <div className={`space-y-2 ${winner === 'away' ? 'bg-blue-50 p-3 rounded-lg border-2 border-blue-200' : ''}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`font-bold text-lg ${winner === 'away' ? 'text-blue-800' : 'text-gray-900'}`}>
                              ✈️ {match.away_team?.team_name || 'Away TBD'}
                            </h3>
                            {winner === 'away' && (
                              <Badge className="bg-blue-600">WINNER</Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Games Won:</span>
                              <div className="font-bold text-xl">{match.away_games_won ?? '-'}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Points Earned:</span>
                              <div className="font-bold text-xl text-blue-600">
                                {match.away_points_earned ?? '-'}
                              </div>
                            </div>
                          </div>

                          {/* Handicap Thresholds */}
                          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                            <div className="font-semibold mb-1">Thresholds (Handicapped):</div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <span className="text-gray-500">To Win:</span>
                                <div className="font-medium">{match.away_games_to_win ?? '-'}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">To Tie:</span>
                                <div className="font-medium">{match.away_games_to_tie ?? '-'}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">To Lose:</span>
                                <div className="font-medium">
                                  {match.home_games_to_win ? `< ${match.home_games_to_win}` : '-'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Match Summary Row */}
                      {hasScores && (
                        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                          <div className="text-sm text-gray-600">Final Score</div>
                          <div className="text-3xl font-bold font-mono mt-1">
                            {match.home_games_won} - {match.away_games_won}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Game Differential: {Math.abs((match.home_games_won ?? 0) - (match.away_games_won ?? 0))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
