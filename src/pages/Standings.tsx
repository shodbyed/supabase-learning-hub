/**
 * @fileoverview Standings Page
 *
 * Team rankings showing wins/losses/points/games for a season.
 * Mobile-first design with responsive table.
 *
 * TODO: Make page more mobile friendly - table is too wide on mobile screens
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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Stats Navigation */}
        <StatsNavBar activePage="standings" />

        {/* Page Title */}
        <h1 className="text-xl sm:text-4xl font-bold text-center mb-4 sm:mb-6">Standings</h1>

        {/* Table - no card wrapper */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px] sm:w-[50px] px-1 sm:px-4 text-center text-xs sm:text-sm">#</TableHead>
                <TableHead className="px-1 sm:px-4 text-xs sm:text-sm">Team</TableHead>
                <TableHead className="w-[30px] sm:w-[50px] px-1 sm:px-4 text-center text-xs sm:text-sm">W</TableHead>
                <TableHead className="w-[30px] sm:w-[50px] px-1 sm:px-4 text-center text-xs sm:text-sm">L</TableHead>
                <TableHead className="w-[35px] sm:w-[60px] px-1 sm:px-4 text-center text-xs sm:text-sm">Pts</TableHead>
                <TableHead className="w-[40px] sm:w-[60px] px-1 sm:px-4 text-center text-xs sm:text-sm">Gms</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((team, index) => {
                const rank = index + 1;
                return (
                  <TableRow key={team.teamId}>
                    <TableCell className="font-medium px-1 sm:px-4 text-center text-xs sm:text-base">{rank}</TableCell>
                    <TableCell className="px-1 sm:px-4 text-xs sm:text-base">{team.teamName}</TableCell>
                    <TableCell className="text-center px-1 sm:px-4 text-xs sm:text-base">{team.matchWins}</TableCell>
                    <TableCell className="text-center px-1 sm:px-4 text-xs sm:text-base">{team.matchLosses}</TableCell>
                    <TableCell className="text-center px-1 sm:px-4 text-xs sm:text-base">
                      {team.points > 0 ? `+${team.points}` : team.points}
                    </TableCell>
                    <TableCell className="text-center px-1 sm:px-4 text-xs sm:text-base">{team.gamesWon}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
