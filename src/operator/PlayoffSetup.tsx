/**
 * @fileoverview Playoff Setup Page
 *
 * Allows operators to configure and approve playoff brackets for a season.
 * Shows the current playoff configuration with ability to modify settings,
 * displays the generated bracket based on standings, and allows
 * operators to approve and create the playoff matches.
 *
 * Features:
 * - View/modify playoff configuration (template, settings, bracket style)
 * - Preview bracket for each playoff week
 * - Generate bracket from current standings
 * - Create playoff matches when ready
 *
 * Flow:
 * 1. Load resolved playoff configuration for the league
 * 2. Check if regular season is complete
 * 3. Generate bracket from standings using configuration
 * 4. Allow operator to adjust settings
 * 5. On approval, create playoff matches in database
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { Trophy, AlertCircle, Check, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { InfoButton } from '@/components/InfoButton';
import { PlayoffTemplateSelector } from '@/components/playoff/PlayoffTemplateSelector';
import { PlayoffMatchRulesCard } from '@/components/playoff/PlayoffMatchRulesCard';
import { PlayoffBracketPreviewCard } from '@/components/playoff/PlayoffBracketPreviewCard';
import { PlayoffSeedingCard } from '@/components/playoff/PlayoffSeedingCard';
import { PlayoffSettingsCard } from '@/components/playoff/PlayoffSettingsCard';
import { UnsavedChangesDialog } from '@/components/UnsavedChangesDialog';
import { parseLocalDate } from '@/utils/formatters';
import { useSeasonById, useLeagueById } from '@/api/hooks';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useSavePlayoffConfiguration } from '@/api/mutations/playoffConfigurations';
import {
  useResolvedPlayoffConfig,
  usePlayoffConfigurations,
  type PlayoffConfiguration,
} from '@/api/hooks/usePlayoffConfigurations';
import {
  usePlayoffSettingsReducer,
  calculateQualifyingTeams,
  buildLoadSettingsPayload,
  buildSavePayload,
  buildPostSavePayload,
} from '@/hooks/playoff/usePlayoffSettingsReducer';
import type { MatchupStyle } from '@/hooks/playoff/usePlayoffSettingsReducer';
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

  // Season and league data
  const { data: season, isLoading: seasonLoading } = useSeasonById(seasonId);
  const { data: league, isLoading: leagueLoading } = useLeagueById(leagueId);

  // Get the organization ID from the league
  const orgId = league?.organization_id;

  // Fetch resolved playoff configuration for this league
  const { data: resolvedConfig, isLoading: configLoading } = useResolvedPlayoffConfig(leagueId);

  // Fetch league's existing configuration (if any) for saving
  const { data: leagueConfigs } = usePlayoffConfigurations('league', leagueId);

  // Use the reducer for all playoff settings state
  const [settings, dispatch] = usePlayoffSettingsReducer();

  // Track if we've loaded the initial config to prevent re-loading
  const hasLoadedInitialConfig = useRef(false);

  // Mutation for saving configurations
  const saveConfigMutation = useSavePlayoffConfiguration();

  // Local state for bracket generation
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

  // Load the resolved config into the settings reducer
  useEffect(() => {
    if (hasLoadedInitialConfig.current) return;
    if (!resolvedConfig) return;

    hasLoadedInitialConfig.current = true;

    // Build a PlayoffConfiguration-like object from the resolved config
    const configToLoad = {
      id: resolvedConfig.config_id,
      name: resolvedConfig.name,
      description: resolvedConfig.description,
      qualification_type: resolvedConfig.qualification_type,
      fixed_team_count: resolvedConfig.fixed_team_count,
      qualifying_percentage: resolvedConfig.qualifying_percentage,
      percentage_min: resolvedConfig.percentage_min,
      percentage_max: resolvedConfig.percentage_max,
      playoff_weeks: resolvedConfig.playoff_weeks,
      week_matchup_styles: resolvedConfig.week_matchup_styles,
      wildcard_spots: resolvedConfig.wildcard_spots,
      payment_method: resolvedConfig.payment_method,
    };

    dispatch({ type: 'SET_SELECTED_TEMPLATE_ID', payload: resolvedConfig.config_id });
    dispatch({ type: 'LOAD_SETTINGS', payload: buildLoadSettingsPayload(configToLoad as PlayoffConfiguration) });
  }, [resolvedConfig, dispatch]);

  // Block navigation when there are unsaved changes
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    settings.isModified && currentLocation.pathname !== nextLocation.pathname
  );

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

  // Destructure settings for convenience
  const {
    exampleTeamCount,
    playoffWeeks,
    wildcardSpots,
    weekMatchupStyles,
    isModified,
    configName,
    configDescription,
  } = settings;

  // Calculate bracket size based on qualification settings
  const bracketSize = calculateQualifyingTeams(exampleTeamCount, settings);

  /**
   * Handle saving the configuration to the database
   */
  const handleSave = () => {
    if (!leagueId || !settings.configName.trim()) return;

    const payload = buildSavePayload('league', leagueId, settings);

    saveConfigMutation.mutate(payload, {
      onSuccess: (data) => {
        toast.success('Playoff configuration saved!');
        dispatch({ type: 'LOAD_SETTINGS', payload: buildPostSavePayload(data) });
      },
      onError: (error: Error) => {
        toast.error('Failed to save configuration');
        console.error('Save error:', error);
      },
    });
  };

  /**
   * Handle template selection from dropdown
   */
  const handleTemplateSelect = (template: PlayoffConfiguration) => {
    dispatch({ type: 'SET_SELECTED_TEMPLATE_ID', payload: template.id });
    dispatch({ type: 'LOAD_SETTINGS', payload: buildLoadSettingsPayload(template) });
  };

  /**
   * Handle matchup style change for a specific week
   */
  const handleMatchupStyleChange = (weekIndex: number, style: MatchupStyle) => {
    dispatch({
      type: 'SET_WEEK_MATCHUP_STYLE',
      payload: { weekIndex, style },
    });
  };

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

  /**
   * Get the source label for the current configuration
   */
  const getConfigSourceLabel = () => {
    if (!resolvedConfig) return null;
    switch (resolvedConfig.config_source) {
      case 'league':
        return 'League Configuration';
      case 'organization':
        return 'Organization Default';
      case 'global':
        return 'System Template';
      default:
        return null;
    }
  };

  // Loading state
  if (loading || seasonLoading || leagueLoading || configLoading) {
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
      {/* Unsaved changes warning dialog */}
      <UnsavedChangesDialog blocker={blocker} />

      <PageHeader
        backTo={`/league/${leagueId}`}
        backLabel="Back to League"
        title={
          <span className="inline-flex items-center gap-2">
            Playoff Setup
            <InfoButton title="Playoff Setup">
              <p>
                Configure your playoff settings, preview the bracket, and create
                playoff matches when the regular season is complete.
              </p>
            </InfoButton>
          </span>
        }
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

        {/* Playoff Rules - at the top for visibility */}
        <PlayoffMatchRulesCard />

        {/* Playoff Template Selector */}
        <PlayoffTemplateSelector
          context="league"
          organizationId={orgId}
          leagueId={leagueId}
          selectedTemplateId={settings.selectedTemplateId}
          isModified={isModified}
          configName={configName}
          configDescription={configDescription}
          onTemplateSelect={handleTemplateSelect}
          onNameChange={(name) => dispatch({ type: 'SET_CONFIG_NAME', payload: name })}
          onDescriptionChange={(desc) => dispatch({ type: 'SET_CONFIG_DESCRIPTION', payload: desc })}
          onSave={handleSave}
          isSaving={saveConfigMutation.isPending}
        />

        {/* Current Configuration Source Info */}
        {resolvedConfig && !isModified && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              <div>
                <span className="font-medium text-purple-900">{resolvedConfig.name}</span>
                <span className="text-purple-700 ml-2">({getConfigSourceLabel()})</span>
              </div>
            </div>
          </div>
        )}

        {/* Playoff Settings */}
        <PlayoffSettingsCard settings={settings} dispatch={dispatch} />

        {/* Bracket Preview Cards - one for each playoff week */}
        {Array.from({ length: playoffWeeks }, (_, weekIndex) => (
          <PlayoffBracketPreviewCard
            key={weekIndex}
            weekNum={weekIndex + 1}
            weekIndex={weekIndex}
            matchupStyle={weekMatchupStyles[weekIndex] || 'seeded'}
            bracketSize={bracketSize}
            totalTeams={exampleTeamCount}
            qualificationType={settings.qualificationType}
            qualifyingPercentage={settings.qualifyingPercentage}
            wildcardSpots={wildcardSpots}
            onMatchupStyleChange={handleMatchupStyleChange}
          />
        ))}

        {/* Example Standings */}
        <PlayoffSeedingCard
          teamCount={exampleTeamCount}
          bracketSize={bracketSize}
          wildcardSpots={wildcardSpots}
        />

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

        {/* Actual Bracket Display (from standings) */}
        {bracket && (
          <>
            {/* Excluded Teams Notice */}
            <ExcludedTeamsNotice teams={bracket.excludedTeams} />

            {/* Matchups */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-600" />
                  Current Standings Bracket ({bracket.bracketSize} Teams)
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
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/league/${leagueId}`)}
          >
            Cancel
          </Button>
          {bracket && (
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
          )}
        </div>
      </div>

      {ConfirmDialogComponent}
    </div>
  );
};

export default PlayoffSetup;
