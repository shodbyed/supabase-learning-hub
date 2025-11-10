/**
 * @fileoverview Team Stats Page (Placeholder)
 *
 * Combined team and player stats grouped by team.
 * Shows team standings with player breakdown underneath each team.
 * Mobile-first design with responsive table and collapsible sections.
 *
 * TODO: Implement full team stats with player breakdown and lifetime stats
 */

import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * Team Stats Component (Placeholder)
 *
 * Will display hierarchical view with:
 *
 * Team Header Rows:
 * - Rank, Team Name, Wins, Losses, Points
 *
 * Player Detail Rows (under each team):
 * - Player Name, Games Won, Games Lost, Weeks Played, H.C.
 * - Cumulative section: Lifetime Wins, Lifetime Losses, Lifetime Weeks
 */
export function TeamStats() {
  const { seasonId } = useParams<{ seasonId: string; leagueId: string }>();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle>Team Stats</CardTitle>
          <p className="text-sm text-gray-600">
            Team standings with player breakdowns (placeholder - implementation pending)
          </p>
        </CardHeader>
        <CardContent>
          {/* Mobile-first: horizontal scroll wrapper */}
          <div className="overflow-x-auto -mx-4 px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[60px]">Rank</TableHead>
                  <TableHead className="min-w-[200px]">Team / Player Name</TableHead>
                  <TableHead className="min-w-[70px]">W</TableHead>
                  <TableHead className="min-w-[70px]">L</TableHead>
                  <TableHead className="min-w-[80px]">Weeks</TableHead>
                  <TableHead className="min-w-[70px]">H.C.</TableHead>
                  <TableHead className="min-w-[200px]" colSpan={3}>
                    Cumulative (W / L / Weeks)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    Team stats with player breakdowns will be displayed here once implemented.
                    <br />
                    <span className="text-sm">Season ID: {seasonId}</span>
                    <br />
                    <span className="text-xs text-gray-400 mt-2 block">
                      Format: Team header rows (bold) with player detail rows (indented) underneath
                    </span>
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
