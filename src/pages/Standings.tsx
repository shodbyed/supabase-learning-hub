/**
 * @fileoverview Standings Page
 *
 * Team rankings showing wins/losses/points/games for a season.
 * Mobile-first design with responsive table.
 *
 * Data shown:
 * - Rank (based on match wins → points → games)
 * - Team Name
 * - Wins (match wins, not individual games)
 * - Losses (match losses)
 * - Points (total points earned from all matches)
 * - Games (total individual games won)
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { useStandings } from '@/api/hooks/useStandings';
import { StatsNavBar } from '@/components/StatsNavBar';

/**
 * Standings Component
 *
 * Displays team rankings with match records and statistics.
 * Only shows data from completed matches in the season.
 */
export function Standings() {
  const { seasonId } = useParams<{ seasonId: string; leagueId: string }>();
  const navigate = useNavigate();

  // Fetch standings data
  const { standings, isLoading, error } = useStandings(seasonId || '');

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle>Standings</CardTitle>
            <p className="text-sm text-gray-600">Loading team standings...</p>
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
            <CardTitle>Standings</CardTitle>
            <p className="text-sm text-red-600">Failed to load standings</p>
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

  // No teams found
  if (standings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle>Standings</CardTitle>
            <p className="text-sm text-gray-600">Team standings</p>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              No standings available for this season yet.
              <br />
              <span className="text-sm">Standings will appear here after matches are completed.</span>
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
      <StatsNavBar activePage="standings" />

      <Card>
        <CardHeader>
          <CardTitle className="text-center text-4xl">Standings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile-first: horizontal scroll wrapper */}
          <div className="overflow-x-auto -mx-4 px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] px-4 text-center">Rank</TableHead>
                  <TableHead className="min-w-[200px]">Team Name</TableHead>
                  <TableHead className="w-[40px] px-4 text-center">Wins</TableHead>
                  <TableHead className="w-[40px] px-4 text-center">Losses</TableHead>
                  <TableHead className="w-[40px] px-4 text-center">Points</TableHead>
                  <TableHead className="w-[40px] px-4 text-center">Games</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((team, index) => {
                  const rank = index + 1;
                  return (
                    <TableRow key={team.teamId}>
                      <TableCell className="font-medium px-4 text-center">{rank}</TableCell>
                      <TableCell>{team.teamName}</TableCell>
                      <TableCell className="text-center px-4">{team.matchWins}</TableCell>
                      <TableCell className="text-center px-4">{team.matchLosses}</TableCell>
                      <TableCell className="text-center px-4">
                        {team.points > 0 ? `+${team.points}` : team.points}
                      </TableCell>
                      <TableCell className="text-center px-4">{team.gamesWon}</TableCell>
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
