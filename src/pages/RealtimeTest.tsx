/**
 * @fileoverview Realtime Test Page - Using Your Custom Hook
 *
 * Tests YOUR watchMatchAndGames hook with real database data
 * Hardcoded test match ID: 11111111-1111-1111-1111-111111111111
 *
 * SETUP: Run database/test_data/create_realtime_test_data.sql FIRST
 */

import { useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { watchMatchAndGames } from '@/realtime/useMatchAndGamesRealtime';
import { useMatchWithLeagueSettings, useMatchGames } from '@/api/hooks/useMatches';
import { useCurrentMember } from '@/api/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Real match ID with 18 games
const TEST_MATCH_ID = 'eee1fe6b-ef03-42ac-8d21-25c2330cd60f';

export function RealtimeTest() {
  // Get current user
  const { data: member } = useCurrentMember();

  // Use existing TanStack Query hooks
  const { data: matchData, isLoading: matchLoading, error: matchError, refetch: refetchMatch } = useMatchWithLeagueSettings(TEST_MATCH_ID);
  const { data: gamesData = [], isLoading: gamesLoading, error: gamesError, refetch: refetchGames } = useMatchGames(TEST_MATCH_ID);

  // Setup YOUR realtime hook
  useEffect(() => {
    const channel = watchMatchAndGames(TEST_MATCH_ID);
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Toggle match home verification
  const toggleHomeVerified = async () => {
    if (!member) return;
    const newValue = matchData?.home_team_verified_by ? null : member.id;

    const { error } = await supabase
      .from('matches')
      .update({ home_team_verified_by: newValue })
      .eq('id', TEST_MATCH_ID);

    if (error) {
      console.error('Error updating match:', error);
      return;
    }
  };

  // Toggle match away verification
  const toggleAwayVerified = async () => {
    if (!member) return;
    const newValue = matchData?.away_team_verified_by ? null : member.id;

    const { error } = await supabase
      .from('matches')
      .update({ away_team_verified_by: newValue })
      .eq('id', TEST_MATCH_ID);

    if (error) {
      console.error('Error updating match:', error);
      return;
    }
  };

  // Toggle game confirmation
  const toggleGameConfirmation = async (gameNumber: number, isHome: boolean) => {
    const game = gamesData.find(g => g.game_number === gameNumber);
    if (!game) return;

    const field = isHome ? 'confirmed_by_home' : 'confirmed_by_away';
    const currentValue = isHome ? game.confirmed_by_home : game.confirmed_by_away;

    const { error } = await supabase
      .from('match_games')
      .update({ [field]: !currentValue })
      .eq('match_id', TEST_MATCH_ID)
      .eq('game_number', gameNumber);

    if (error) {
      console.error('Error updating game:', error);
      return;
    }
  };

  const loading = matchLoading || gamesLoading;
  const error = matchError || gamesError;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading test data...</div>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Setup Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              {error ? `Error: ${error.message}` : 'Match not found'}
            </p>
            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold mb-2">Run this SQL in Supabase Studio:</p>
              <code className="text-xs">database/test_data/create_realtime_test_data.sql</code>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Your Realtime Hook Test</h1>
      <p className="text-gray-600 mb-6">Testing: watchMatchAndGames('{TEST_MATCH_ID}')</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Match Data */}
        <Card>
          <CardHeader>
            <CardTitle>Match Data (matches table)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Match ID:</p>
              <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                {matchData.id}
              </code>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Verification Status:</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Home Verified:</span>
                  <span className={`font-mono text-sm ${matchData.home_team_verified_by ? 'text-green-600' : 'text-gray-400'}`}>
                    {matchData.home_team_verified_by || 'null'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Away Verified:</span>
                  <span className={`font-mono text-sm ${matchData.away_team_verified_by ? 'text-green-600' : 'text-gray-400'}`}>
                    {matchData.away_team_verified_by || 'null'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Button
                onClick={toggleHomeVerified}
                variant={matchData.home_team_verified_by ? 'default' : 'outline'}
                className="w-full"
              >
                {matchData.home_team_verified_by ? '✅' : '⬜'} Toggle Home Verified
              </Button>
              <Button
                onClick={toggleAwayVerified}
                variant={matchData.away_team_verified_by ? 'default' : 'outline'}
                className="w-full"
              >
                {matchData.away_team_verified_by ? '✅' : '⬜'} Toggle Away Verified
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Games Data */}
        <Card>
          <CardHeader>
            <CardTitle>Games Data (match_games table)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {gamesData.length === 0 ? (
              <p className="text-gray-500">No games found. Run the SQL file first!</p>
            ) : (
              <div className="space-y-2">
                {gamesData.map((game) => (
                  <Card key={game.game_number} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Game {game.game_number}</span>
                        <div className="flex gap-2 text-xs">
                          <span className={game.confirmed_by_home ? 'text-green-600' : 'text-gray-400'}>
                            H: {game.confirmed_by_home ? '✅' : '⬜'}
                          </span>
                          <span className={game.confirmed_by_away ? 'text-green-600' : 'text-gray-400'}>
                            A: {game.confirmed_by_away ? '✅' : '⬜'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant={game.confirmed_by_home ? 'default' : 'outline'}
                          onClick={() => toggleGameConfirmation(game.game_number, true)}
                        >
                          Home
                        </Button>
                        <Button
                          size="sm"
                          variant={game.confirmed_by_away ? 'default' : 'outline'}
                          onClick={() => toggleGameConfirmation(game.game_number, false)}
                        >
                          Away
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="md:col-span-2 bg-blue-50">
          <CardHeader>
            <CardTitle>How Your Hook Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><strong>Your hook is running:</strong> watchMatchAndGames('{TEST_MATCH_ID}')</li>
              <li><strong>It's listening to:</strong> 'matches' table only (match_games listener is commented out)</li>
              <li><strong>Click any button above</strong> to update the database</li>
              <li><strong>Watch the browser console (F12)</strong> - you should see:
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>"MY CHANNEL IS ACTIVE" - Your hook started</li>
                  <li>"STATUS SUBSCRIBED" - Channel connected</li>
                  <li>"HANDLER FIRED" - Realtime event received</li>
                  <li>"MATCHES" or "GAMES" - The actual data that changed</li>
                </ul>
              </li>
              <li><strong>TanStack Query automatically refetches</strong> when realtime fires (via queryClient.invalidateQueries)</li>
              <li><strong>Open this page in TWO browser tabs</strong> to see realtime sync across tabs</li>
            </ol>

            <div className="mt-4 p-3 bg-yellow-100 rounded">
              <p className="font-semibold text-sm">Current Configuration:</p>
              <ul className="text-xs mt-2 space-y-1">
                <li>✅ Listening to: <code>matches</code> table (line 22-31 in your hook)</li>
                <li>❌ Listening to: <code>match_games</code> table (line 34-43 COMMENTED OUT)</li>
                <li>💡 Uncomment lines 34-43 in your hook to listen to games too!</li>
                <li>📊 Using existing TanStack Query hooks: useMatchWithLeagueSettings & useMatchGames</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
