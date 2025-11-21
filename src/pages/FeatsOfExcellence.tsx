/**
 * @fileoverview Feats of Excellence Page
 *
 * Displays special achievement rankings for a season:
 * - Break & Runs
 * - Golden Breaks
 * - Flawless Nights
 *
 * Mobile-first responsive design with three separate ranking tables.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InfoButton } from '@/components/InfoButton';
import { useFeatsStats } from '@/api/hooks/useFeatsStats';
import { StatsNavBar } from '@/components/StatsNavBar';

/**
 * Feats of Excellence Component
 *
 * Displays three rankings:
 * 1. Break & Runs - Players with most break and runs
 * 2. Golden Breaks - Players with most golden breaks
 * 3. Flawless Nights - Matches where player won every game
 *
 * Format: Rank | Player Name | Count
 * Only shows players with at least 1 of each feat
 */
export function FeatsOfExcellence() {
  const { seasonId } = useParams<{ seasonId: string; leagueId: string }>();
  const navigate = useNavigate();

  const { feats, isLoading, error } = useFeatsStats(seasonId!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">Loading feats...</div>
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
                Error loading feats: {error.message}
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

        {/* Stats Navigation */}
        <StatsNavBar activePage="feats" />

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center mb-8">Feats of Excellence</h1>

        {/* Three Rankings */}
        <div className="space-y-8">
          {/* Break & Runs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Break & Runs</CardTitle>
            </CardHeader>
            <CardContent>
              {feats?.breakAndRuns && feats.breakAndRuns.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-center px-4 py-2 w-[60px]">Rank</th>
                        <th className="text-left px-4 py-2">Player Name</th>
                        <th className="text-center px-4 py-2 w-[80px]">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feats.breakAndRuns.map((player, index) => (
                        <tr key={player.playerId} className="border-b">
                          <td className="text-center px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2">{player.playerName}</td>
                          <td className="text-center px-4 py-2 font-semibold">{player.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No break & runs recorded this season
                </div>
              )}
            </CardContent>
          </Card>

          {/* Golden Breaks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Golden Breaks</CardTitle>
            </CardHeader>
            <CardContent>
              {feats?.goldenBreaks && feats.goldenBreaks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-center px-4 py-2 w-[60px]">Rank</th>
                        <th className="text-left px-4 py-2">Player Name</th>
                        <th className="text-center px-4 py-2 w-[80px]">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feats.goldenBreaks.map((player, index) => (
                        <tr key={player.playerId} className="border-b">
                          <td className="text-center px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2">{player.playerName}</td>
                          <td className="text-center px-4 py-2 font-semibold">{player.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No golden breaks recorded this season
                </div>
              )}
            </CardContent>
          </Card>

          {/* Flawless Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                Flawless Matches
                <InfoButton title="Flawless Matches">
                  A flawless match is achieved when a player wins every game they played in that match. Only regular games count - tiebreaker games are excluded.
                </InfoButton>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feats?.flawlessNights && feats.flawlessNights.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-center px-4 py-2 w-[60px]">Rank</th>
                        <th className="text-left px-4 py-2">Player Name</th>
                        <th className="text-center px-4 py-2 w-[80px]">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feats.flawlessNights.map((player, index) => (
                        <tr key={player.playerId} className="border-b">
                          <td className="text-center px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2">{player.playerName}</td>
                          <td className="text-center px-4 py-2 font-semibold">{player.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No flawless matches recorded this season
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
