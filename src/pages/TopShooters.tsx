/**
 * @fileoverview Top Shooters Page
 *
 * Individual player rankings showing wins/losses/handicaps for a season.
 * Mobile-first design with responsive table.
 *
 * Data shown:
 * - Rank (based on most wins, win% as tiebreaker)
 * - Player Name
 * - Wins (individual games won in season, excluding tiebreakers)
 * - Losses (individual games lost in season, excluding tiebreakers)
 * - Win % (calculated percentage)
 * - Handicap (calculated from last 200 games across all seasons)
 *
 * TODO: For 8-man format, add "Beginning %" column showing player's win%
 * from their first match of the season. This would show handicap growth/change
 * throughout the season. Need to:
 * 1. Query for each player's first match in the season (by date)
 * 2. Calculate their win% from just that first match
 * 3. Display as "Beginning %" column (or similar) next to current Win %
 * 4. Could show delta/change (e.g., "+5.2%" or "-3.1%") to highlight improvement
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { useTopShooters } from '@/api/hooks/useTopShooters';
import { StatsNavBar } from '@/components/StatsNavBar';

/**
 * Top Shooters Component
 *
 * Displays player rankings with game statistics and calculated handicaps.
 * Only shows games from the current season (excludes tiebreakers).
 * Handicaps are calculated using the main handicap calculator function.
 */
export function TopShooters() {
  const { seasonId } = useParams<{ seasonId: string; leagueId: string }>();
  const navigate = useNavigate();

  // Fetch player stats with handicaps
  const { players, isLoading, error, teamFormat } = useTopShooters(
    seasonId || ''
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle>Top Shooter</CardTitle>
            <p className="text-sm text-gray-600">
              Loading player statistics...
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle>Top Shooter</CardTitle>
            <p className="text-sm text-red-600">
              Failed to load player statistics
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-red-500">
              Error: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No players found
  if (players.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle>Top Shooter</CardTitle>
            <p className="text-sm text-gray-600">Individual player rankings</p>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              No player statistics available for this season yet.
              <br />
              <span className="text-sm">
                Games will appear here after matches are completed and verified.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Stats Navigation */}
      <StatsNavBar activePage="top-shooters" />

      <Card>
        <CardHeader>
          <CardTitle className="text-center text-4xl">Top Shooter </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile-first: horizontal scroll wrapper */}
          <div className="overflow-x-auto -mx-4 px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20px] px-4 text-center">
                    Rank
                  </TableHead>
                  <TableHead className="w-[20px] px-4 text-center">
                    H/C
                  </TableHead>
                  <TableHead className="min-w-[100px] max-w-[160px]">
                    Player Name
                  </TableHead>
                  <TableHead className="w-[20px] px-4 text-center">
                    Wins
                  </TableHead>
                  <TableHead className="w-[20px] px-4 text-center">
                    Losses
                  </TableHead>
                  {teamFormat === '5_man' && (
                    <TableHead className="w-[40px] px-4 text-center">
                      Points
                    </TableHead>
                  )}
                  <TableHead className="min-w-[90px] pl-8">Win %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player, index) => {
                  const rank = index + 1;
                  const points = player.gamesWon - player.gamesLost;
                  return (
                    <TableRow key={player.playerId}>
                      <TableCell className="font-medium px-4 w-[20px] text-center">
                        {rank}
                      </TableCell>
                      <TableCell className="text-center px-4 w-[20px]">
                        {player.handicap > 0
                          ? `+${player.handicap}`
                          : player.handicap}
                      </TableCell>
                      <TableCell className="w-[100px]">
                        {player.playerName}
                      </TableCell>
                      <TableCell className="font-medium px-4 w-[20px] text-center">
                        {player.gamesWon}
                      </TableCell>
                      <TableCell className="text-center px-4 w-[20px]">
                        {player.gamesLost}
                      </TableCell>
                      {teamFormat === '5_man' && (
                        <TableCell className="text-center px-4 w-[40px]">
                          {points > 0 ? `+${points}` : points}
                        </TableCell>
                      )}
                      <TableCell className="text-center px-4 w-[40px]">
                        {player.winPercentage.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
