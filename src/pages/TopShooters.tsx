/**
 * @fileoverview Top Shooters Page (Placeholder)
 *
 * Individual player rankings showing wins/losses/points/win% for a season.
 * Mobile-first design with responsive table.
 *
 * TODO: Implement full player stats calculation and ranking logic
 */

import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * Top Shooters Component (Placeholder)
 *
 * Will display player rankings with:
 * - Rank (based on most wins)
 * - Player Name
 * - Wins (individual games won)
 * - Losses (individual games lost)
 * - Points (wins - losses)
 * - Win/Loss % (calculated percentage)
 */
export function TopShooters() {
  const { seasonId } = useParams<{ seasonId: string; leagueId: string }>();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle>Top Shooters</CardTitle>
          <p className="text-sm text-gray-600">
            Individual player rankings (placeholder - implementation pending)
          </p>
        </CardHeader>
        <CardContent>
          {/* Mobile-first: horizontal scroll wrapper */}
          <div className="overflow-x-auto -mx-4 px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[60px]">Rank</TableHead>
                  <TableHead className="min-w-[200px]">Player Name</TableHead>
                  <TableHead className="min-w-[70px]">Wins</TableHead>
                  <TableHead className="min-w-[70px]">Losses</TableHead>
                  <TableHead className="min-w-[80px]">Points</TableHead>
                  <TableHead className="min-w-[90px]">Win/Loss %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Player stats will be displayed here once implemented.
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
