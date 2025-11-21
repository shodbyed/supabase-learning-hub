/**
 * @fileoverview Team Stats Page
 *
 * Combined team and player stats grouped by team.
 * Shows team standings with player breakdown underneath each team.
 * Mobile-first design with responsive table.
 *
 * Layout:
 * - Team header rows: Bold, shows match-level stats
 * - Player detail rows: Indented, shows game-level stats with handicaps
 * - Substitutes: Aggregated as single row per team
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTeamStats } from '@/api/hooks/useTeamStats';
import { usePlayerHandicaps } from '@/api/hooks/usePlayerHandicaps';
import { getLeagueBySeasonId } from '@/api/queries/leagues';
import { queryKeys } from '@/api/queryKeys';

/**
 * Team Stats Component
 *
 * Displays hierarchical view with:
 *
 * Team Header Rows:
 * - Team Name | Match Wins | Match Losses | Points | Games Won
 *
 * Player Detail Rows (under each team):
 * - Player Name (indented) | Games Won | Games Lost | Matches Played | H.C.
 */
export function TeamStats() {
  const { seasonId } = useParams<{ seasonId: string; leagueId: string }>();
  const navigate = useNavigate();

  // Fetch team stats with player breakdowns
  const { teams, isLoading: statsLoading, error: statsError } = useTeamStats(seasonId!);

  // Fetch league config for handicap calculation
  const {
    data: league,
    isLoading: leagueLoading,
    error: leagueError,
  } = useQuery({
    queryKey: queryKeys.seasons.detail(seasonId!),
    queryFn: () => getLeagueBySeasonId(seasonId!),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  // Extract all player IDs (excluding substitutes)
  const allPlayerIds = teams.flatMap(team =>
    team.players.filter(p => !p.isSubstitute).map(p => p.playerId)
  );

  // Calculate handicaps for all players
  const {
    handicaps,
    isLoading: handicapsLoading,
  } = usePlayerHandicaps({
    playerIds: allPlayerIds,
    teamFormat: league?.team_format || '5_man',
    handicapVariant: league?.handicap_variant || 'standard',
    gameType: league?.game_type || 'eight_ball',
    seasonId,
    gameLimit: 200,
  });

  const isLoading = statsLoading || leagueLoading || (allPlayerIds.length > 0 && handicapsLoading);
  const error = statsError || leagueError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">Loading team stats...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-red-600">
                Error loading team stats: {error.message}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-4"
        >
          ← Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-4xl">Team Stats</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile-first: horizontal scroll wrapper */}
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-center px-4 py-2 w-[60px]">H.C.</th>
                    <th className="text-left px-4 py-2 w-[200px]">Team / Player</th>
                    <th className="text-center px-4 py-2 w-[60px]">W</th>
                    <th className="text-center px-4 py-2 w-[60px]">L</th>
                    <th className="text-center px-4 py-2 w-[100px]">Matches</th>
                    <th className="text-center px-4 py-2 w-[80px]">Games</th>
                    <th className="text-center px-4 py-2 w-[80px]">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <>
                      {/* Team Header Row */}
                      <tr key={team.teamId} className="border-b bg-gray-100">
                        <td className="text-center px-4 py-3 font-bold"></td>
                        <td className="px-4 py-3 font-bold">{team.teamName}</td>
                        <td className="text-center px-4 py-3 font-bold">{team.matchWins}</td>
                        <td className="text-center px-4 py-3 font-bold">{team.matchLosses}</td>
                        <td className="text-center px-4 py-3 font-bold">{team.matchWins + team.matchLosses}</td>
                        <td className="text-center px-4 py-3 font-bold">{team.gamesWon}</td>
                        <td className="text-center px-4 py-3 font-bold">{team.points}</td>
                      </tr>

                      {/* Player Detail Rows */}
                      {team.players.map((player) => {
                        const handicap = player.isSubstitute ? '' : (handicaps.get(player.playerId) ?? '-');

                        return (
                          <tr key={`${team.teamId}-${player.playerId}`} className="border-b">
                            <td className="text-center px-4 py-2 text-sm">{handicap}</td>
                            <td className="px-8 py-2 text-sm text-gray-700">{player.playerName}</td>
                            <td className="text-center px-4 py-2 text-sm">{player.gamesWon}</td>
                            <td className="text-center px-4 py-2 text-sm">{player.gamesLost}</td>
                            <td className="text-center px-4 py-2 text-sm">{player.matchesPlayed}</td>
                            <td className="text-center px-4 py-2 text-sm"></td>
                            <td className="text-center px-4 py-2 text-sm"></td>
                          </tr>
                        );
                      })}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
