/**
 * @fileoverview Standings Page (Placeholder)
 *
 * Team rankings showing wins/losses/points/games for a season.
 * Mobile-first design with responsive table.
 *
 * TODO: Implement full standings calculation and ranking logic
 */

import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * Standings Component (Placeholder)
 *
 * Will display team rankings with:
 * - Rank (calculated based on wins/points/games)
 * - Team Name
 * - Wins (match wins)
 * - Losses (match losses)
 * - Points (total points earned)
 * - Games (total individual games won)
 */
export function Standings() {
  const { seasonId } = useParams<{ seasonId: string; leagueId: string }>();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle>Standings</CardTitle>
          <p className="text-sm text-gray-600">
            Season standings (placeholder - implementation pending)
          </p>
        </CardHeader>
        <CardContent>
          {/* Mobile-first: horizontal scroll wrapper */}
          <div className="overflow-x-auto -mx-4 px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[60px]">Rank</TableHead>
                  <TableHead className="min-w-[200px]">Team Name</TableHead>
                  <TableHead className="min-w-[70px]">Wins</TableHead>
                  <TableHead className="min-w-[70px]">Losses</TableHead>
                  <TableHead className="min-w-[80px]">Points</TableHead>
                  <TableHead className="min-w-[80px]">Games</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Standings data will be displayed here once implemented.
                    <br />
                    <span className="text-sm">Season ID: {seasonId}</span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
