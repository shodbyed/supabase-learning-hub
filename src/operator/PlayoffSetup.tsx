/**
 * @fileoverview Playoff Setup Page
 *
 * Allows operators to configure and approve playoff brackets for a season.
 * Shows the generated bracket based on final regular season standings,
 * with the ability to approve and create the playoff matches.
 *
 * Flow:
 * 1. Check if regular season is complete
 * 2. Generate bracket from standings (seed teams)
 * 3. Display bracket for operator review
 * 4. On approval, create playoff matches in database
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, AlertCircle, Check, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { parseLocalDate } from '@/utils/formatters';
import { useSeasonById } from '@/api/hooks';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import {
  generatePlayoffBracket,
  getPlayoffWeek,
  checkRegularSeasonComplete,
  createPlayoffMatches,
  clearPlayoffMatches,
} from '@/utils/playoffGenerator';
import type { PlayoffBracket, PlayoffMatchup, SeededTeam, ExcludedTeam } from '@/types/playoff';
import { logger } from '@/utils/logger';

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Single matchup card showing two seeded teams
 * When season is not complete, shows placeholders like "1st Place" instead of team names
 */
function MatchupCard({ matchup, isSeasonComplete }: { matchup: PlayoffMatchup; isSeasonComplete: boolean }) {
  // Show placeholder names when season is not complete
  const homeDisplayName = isSeasonComplete
    ? matchup.homeTeam.teamName
    : `${getOrdinal(matchup.homeSeed)} Place`;
  const awayDisplayName = isSeasonComplete
    ? matchup.awayTeam.teamName
    : `${getOrdinal(matchup.awaySeed)} Place`;

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="text-xs text-gray-500 mb-2 text-center">
        Match {matchup.matchNumber}
      </div>
      <div className="space-y-3">
        {/* Home team (higher seed) */}
        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {matchup.homeSeed}
            </div>
            <div>
              <div className={`font-semibold ${isSeasonComplete ? 'text-gray-900' : 'text-gray-500 italic'}`}>
                {homeDisplayName}
              </div>
              {isSeasonComplete && (
                <div className="text-xs text-gray-500">
                  {matchup.homeTeam.matchWins}W - {matchup.homeTeam.matchLosses}L
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-blue-600 font-medium">HOME</div>
        </div>

        <div className="text-center text-gray-400 text-sm font-medium">vs</div>

        {/* Away team (lower seed) */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold text-sm">
              {matchup.awaySeed}
            </div>
            <div>
              <div className={`font-semibold ${isSeasonComplete ? 'text-gray-900' : 'text-gray-500 italic'}`}>
                {awayDisplayName}
              </div>
              {isSeasonComplete && (
                <div className="text-xs text-gray-500">
                  {matchup.awayTeam.matchWins}W - {matchup.awayTeam.matchLosses}L
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 font-medium">AWAY</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Standings table showing all seeded teams
 */
function StandingsTable({ teams }: { teams: SeededTeam[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left py-2 px-3 font-medium text-gray-600">Seed</th>
            <th className="text-left py-2 px-3 font-medium text-gray-600">Team</th>
            <th className="text-center py-2 px-3 font-medium text-gray-600">W</th>
            <th className="text-center py-2 px-3 font-medium text-gray-600">L</th>
            <th className="text-center py-2 px-3 font-medium text-gray-600">Pts</th>
            <th className="text-center py-2 px-3 font-medium text-gray-600">Games</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.teamId} className="border-b hover:bg-gray-50">
              <td className="py-2 px-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-semibold text-xs">
                  {team.seed}
                </span>
              </td>
              <td className="py-2 px-3 font-medium text-gray-900">{team.teamName}</td>
              <td className="py-2 px-3 text-center text-green-600 font-medium">{team.matchWins}</td>
              <td className="py-2 px-3 text-center text-red-600 font-medium">{team.matchLosses}</td>
              <td className="py-2 px-3 text-center text-gray-700">{team.points}</td>
              <td className="py-2 px-3 text-center text-gray-700">{team.gamesWon}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Excluded teams notice (for odd team counts)
 */
function ExcludedTeamsNotice({ teams }: { teams: ExcludedTeam[] }) {
  if (teams.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div>
          <div className="font-medium text-yellow-800">Team Not In Playoffs</div>
          <div className="text-sm text-yellow-700 mt-1">
            {teams.map((team) => (
              <div key={team.teamId}>
                <span className="font-medium">{team.teamName}</span>
                {' - '}
                {team.reason === 'last_place'
                  ? 'Last place with odd number of teams'
                  : 'Below playoff cutoff'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PlayoffSetup Page Component
 */
export const PlayoffSetup: React.FC = () => {
  const { leagueId, seasonId } = useParams<{ leagueId: string; seasonId: string }>();
  const navigate = useNavigate();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  // Season data
  const { data: season, isLoading: seasonLoading } = useSeasonById(seasonId);

  // Local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bracket, setBracket] = useState<PlayoffBracket | null>(null);
  const [playoffWeek, setPlayoffWeek] = useState<{
    id: string;
    scheduled_date: string;
    week_name: string;
  } | null>(null);
  const [seasonStatus, setSeasonStatus] = useState<{
    isComplete: boolean;
    totalMatches: number;
    completedMatches: number;
    remainingMatches: number;
  } | null>(null);
  const [creating, setCreating] = useState(false);
  const [matchesExist, setMatchesExist] = useState(false);

  /**
   * Load playoff data on mount
   */
  useEffect(() => {
    async function loadPlayoffData() {
      if (!seasonId) return;

      setLoading(true);
      setError(null);

      try {
        // Get playoff week
        const week = await getPlayoffWeek(seasonId);
        if (!week) {
          setError('No playoff week found for this season. Please add a playoff week in the season schedule.');
          setLoading(false);
          return;
        }
        setPlayoffWeek(week);

        // Check if regular season is complete
        const status = await checkRegularSeasonComplete(seasonId);
        setSeasonStatus(status);

        // Generate bracket from standings
        const result = await generatePlayoffBracket(seasonId, week.id);

        if (!result.success || !result.bracket) {
          setError(result.error || 'Failed to generate playoff bracket');
          setLoading(false);
          return;
        }

        setBracket(result.bracket);

        // Check if matches already exist
        // (This is handled inside createPlayoffMatches, but we check here for UI state)
        setMatchesExist(false); // Will be set if creation fails due to existing matches

      } catch (err) {
        logger.error('Error loading playoff data', {
          error: err instanceof Error ? err.message : String(err),
        });
        setError('Failed to load playoff data');
      } finally {
        setLoading(false);
      }
    }

    loadPlayoffData();
  }, [seasonId]);

  /**
   * Handle creating playoff matches
   */
  const handleCreateMatches = async () => {
    if (!bracket) return;

    const confirmed = await confirm({
      title: 'Create Playoff Matches?',
      message: `This will create ${bracket.matchups.length} playoff matches based on the current standings. Teams will be able to see their playoff matchups immediately.`,
      confirmText: 'Create Matches',
      confirmVariant: 'default',
    });

    if (!confirmed) return;

    setCreating(true);

    const result = await createPlayoffMatches(bracket);

    if (result.success) {
      // Navigate to schedule page to see the matches
      navigate(`/league/${leagueId}/season/${seasonId}/schedule`);
    } else {
      if (result.error?.includes('already exist')) {
        setMatchesExist(true);
      }
      setError(result.error || 'Failed to create playoff matches');
    }

    setCreating(false);
  };

  /**
   * Handle clearing existing playoff matches
   */
  const handleClearMatches = async () => {
    if (!seasonId || !playoffWeek) return;

    const confirmed = await confirm({
      title: 'Clear Playoff Matches?',
      message: 'This will delete all existing playoff matches. You can then regenerate them with updated standings.',
      confirmText: 'Clear Matches',
      confirmVariant: 'destructive',
    });

    if (!confirmed) return;

    const result = await clearPlayoffMatches(seasonId, playoffWeek.id);

    if (result.success) {
      setMatchesExist(false);
      setError(null);
    } else {
      setError(result.error || 'Failed to clear matches');
    }
  };

  // Loading state
  if (loading || seasonLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center text-gray-600">Loading playoff data...</div>
        </div>
      </div>
    );
  }

  const seasonName = season?.season_name || 'Season';

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        backTo={`/league/${leagueId}`}
        backLabel="Back to League"
        title="Playoff Setup"
        subtitle={seasonName}
      />

      <div className="container mx-auto px-4 max-w-4xl py-8 space-y-6">
        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800">Error</div>
                  <div className="text-sm text-red-700 mt-1">{error}</div>
                  {matchesExist && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearMatches}
                      className="mt-3"
                    >
                      Clear Existing Matches
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Season Status Card */}
        {seasonStatus && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Regular Season Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {seasonStatus.isComplete ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Complete</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">In Progress</span>
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  {seasonStatus.completedMatches} of {seasonStatus.totalMatches} matches completed
                  {seasonStatus.remainingMatches > 0 && (
                    <span className="ml-1">
                      ({seasonStatus.remainingMatches} remaining)
                    </span>
                  )}
                </div>
              </div>
              {!seasonStatus.isComplete && (
                <p className="text-sm text-yellow-700 mt-3 bg-yellow-50 p-3 rounded-lg">
                  Note: You can still set up playoffs before the regular season ends.
                  The bracket shown is based on current standings and may change as more matches are completed.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Playoff Week Info */}
        {playoffWeek && (
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                <Trophy className="h-5 w-5" />
                Playoff Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-purple-900">
                <div className="font-semibold">{playoffWeek.week_name}</div>
                <div className="text-sm text-purple-700">
                  {parseLocalDate(playoffWeek.scheduled_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bracket Display */}
        {bracket && (
          <>
            {/* Excluded Teams Notice */}
            <ExcludedTeamsNotice teams={bracket.excludedTeams} />

            {/* Matchups */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-600" />
                  Playoff Bracket ({bracket.bracketSize} Teams)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {bracket.matchups.map((matchup) => (
                    <MatchupCard
                      key={matchup.matchNumber}
                      matchup={matchup}
                      isSeasonComplete={seasonStatus?.isComplete ?? false}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Final Standings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Final Standings (Seeding)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StandingsTable teams={bracket.seededTeams} />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/league/${leagueId}`)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateMatches}
                disabled={creating || !seasonStatus?.isComplete}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {creating
                  ? 'Creating...'
                  : !seasonStatus?.isComplete
                    ? 'Complete Regular Season First'
                    : 'Approve & Create Matches'
                }
              </Button>
            </div>
          </>
        )}
      </div>

      {ConfirmDialogComponent}
    </div>
  );
};

export default PlayoffSetup;
