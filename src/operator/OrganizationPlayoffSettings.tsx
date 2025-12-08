/**
 * @fileoverview Organization Playoff Settings Page
 *
 * Allows operators to configure default playoff settings for their organization.
 * Shows a generic bracket template that will be used as the default for all leagues.
 * Individual leagues can override these settings.
 *
 * Uses usePlayoffSettingsReducer for centralized state management.
 * State is organized for easy database persistence.
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useSavePlayoffConfiguration } from '@/api/mutations/playoffConfigurations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/PageHeader';
import { InfoButton } from '@/components/InfoButton';
import { PlayoffTemplateSelector } from '@/components/playoff/PlayoffTemplateSelector';
import { PlayoffMatchRulesCard } from '@/components/playoff/PlayoffMatchRulesCard';
import { ParticipationSettingsCard } from '@/components/playoff/ParticipationSettingsCard';
import { PlayoffWeeksCard } from '@/components/playoff/PlayoffWeeksCard';
import { WildcardSettingsCard } from '@/components/playoff/WildcardSettingsCard';
import { ExampleTeamCountCard } from '@/components/playoff/ExampleTeamCountCard';
import { PlayoffMatchupCard } from '@/components/playoff/PlayoffMatchupCard';
import { PlayoffStandingsTable } from '@/components/playoff/PlayoffStandingsTable';
import {
  usePlayoffSettingsReducer,
  calculateQualifyingTeams,
  generateMatchupPairs,
  getMatchupStyleLabel,
  getMatchupStyleDescription,
} from '@/hooks/playoff/usePlayoffSettingsReducer';
import { getOrdinal } from '@/utils/formatters';
import type { MatchupStyle } from '@/hooks/playoff/usePlayoffSettingsReducer';

/**
 * OrganizationPlayoffSettings Page Component
 */
export const OrganizationPlayoffSettings: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();

  // Use the reducer for all playoff settings state
  const [settings, dispatch] = usePlayoffSettingsReducer();

  // Mutation for saving configurations (handles both create and update)
  const saveConfigMutation = useSavePlayoffConfiguration();

  // Destructure for convenience (only values used directly in this component)
  const {
    exampleTeamCount,
    playoffWeeks,
    qualificationType,
    qualifyingPercentage,
    wildcardSpots,
    weekMatchupStyles,
    isModified,
    configName,
    configDescription,
  } = settings;

  /**
   * Handle saving the configuration to the database
   * Creates a new organization-level playoff configuration
   */
  const handleSave = () => {
    if (!orgId || !configName.trim()) return;

    saveConfigMutation.mutate(
      {
        entityType: 'organization',
        entityId: orgId,
        name: configName.trim(),
        description: configDescription.trim() || undefined,
        qualificationType: settings.qualificationType,
        fixedTeamCount: settings.qualificationType === 'fixed' ? settings.fixedTeamCount : null,
        qualifyingPercentage: settings.qualificationType === 'percentage' ? settings.qualifyingPercentage : null,
        percentageMin: settings.qualificationType === 'percentage' ? settings.percentageMin : null,
        percentageMax: settings.qualificationType === 'percentage' ? settings.percentageMax : null,
        playoffWeeks: settings.playoffWeeks,
        weekMatchupStyles: settings.weekMatchupStyles,
        wildcardSpots: settings.wildcardSpots,
        paymentMethod: settings.paymentMethod,
      },
      {
        onSuccess: (data) => {
          toast.success('Playoff configuration saved!');
          // Load the saved config as the selected template
          dispatch({
            type: 'LOAD_SETTINGS',
            payload: {
              selectedTemplateId: data.id,
              originalTemplateName: data.name,
              configName: data.name,
              configDescription: data.description ?? '',
              isModified: false,
            },
          });
        },
        onError: (error: Error) => {
          toast.error('Failed to save configuration');
          console.error('Save error:', error);
        },
      }
    );
  };

  // Calculate bracket size based on qualification settings
  const bracketSize = calculateQualifyingTeams(exampleTeamCount, settings);

  /**
   * Generate matchups for a specific week based on its matchup style
   * @param weekIndex - Zero-based week index
   * @returns Array of matchup objects with matchNumber, homeSeed, awaySeed
   */
  const getWeekMatchups = (weekIndex: number) => {
    const style = weekMatchupStyles[weekIndex] || 'seeded';
    const pairs = generateMatchupPairs(bracketSize, style);
    return pairs.map((pair, index) => ({
      matchNumber: index + 1,
      homeSeed: pair[0],
      awaySeed: pair[1],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        backTo={`/operator-settings/${orgId}`}
        backLabel="Back to Settings"
        title={
          <span className="inline-flex items-center gap-2">
            Playoff Settings
            <InfoButton title="Organization Default Settings">
              <p>
                These settings will be used as the default for all leagues in your organization.
                Individual leagues can override these settings if needed.
              </p>
            </InfoButton>
          </span>
        }
        subtitle="Organization Default Configuration"
      />

      <div className="container mx-auto px-4 max-w-4xl py-8 space-y-6">
        {/* Playoff Rules - at the top for visibility */}
        <PlayoffMatchRulesCard />

        {/* Playoff Template Selector */}
        <PlayoffTemplateSelector
          organizationId={orgId}
          selectedTemplateId={settings.selectedTemplateId}
          isModified={isModified}
          configName={configName}
          configDescription={configDescription}
          onTemplateSelect={(template) => {
            // Set the template ID and load template settings
            dispatch({ type: 'SET_SELECTED_TEMPLATE_ID', payload: template.id });
            dispatch({
              type: 'LOAD_SETTINGS',
              payload: {
                originalTemplateName: template.name,
                configName: template.name,
                configDescription: template.description ?? '',
                qualificationType: template.qualification_type,
                fixedTeamCount: template.fixed_team_count ?? 4,
                qualifyingPercentage: template.qualifying_percentage ?? 50,
                percentageMin: template.percentage_min ?? 4,
                percentageMax: template.percentage_max,
                playoffWeeks: template.playoff_weeks,
                weekMatchupStyles: template.week_matchup_styles as MatchupStyle[],
                wildcardSpots: template.wildcard_spots,
                paymentMethod: template.payment_method,
              },
            });
          }}
          onNameChange={(name) => dispatch({ type: 'SET_CONFIG_NAME', payload: name })}
          onDescriptionChange={(desc) => dispatch({ type: 'SET_CONFIG_DESCRIPTION', payload: desc })}
          onSave={handleSave}
          isSaving={saveConfigMutation.isPending}
        />

        {/* Playoff Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Example Team Count Card Component */}
            <ExampleTeamCountCard
              settings={settings}
              dispatch={dispatch}
            />

            {/* Playoff Weeks Card Component */}
            <PlayoffWeeksCard
              settings={settings}
              dispatch={dispatch}
            />

            {/* Participation Card Component */}
            <ParticipationSettingsCard
              settings={settings}
              dispatch={dispatch}
            />

            {/* Wildcard Settings Card Component */}
            <WildcardSettingsCard
              settings={settings}
              dispatch={dispatch}
            />
          </CardContent>
        </Card>

        {/* Example Brackets - dynamically generated for each playoff week */}
        {Array.from({ length: playoffWeeks }, (_, i) => i).map((weekIndex) => {
          const weekNum = weekIndex + 1;
          const currentStyle = weekMatchupStyles[weekIndex] || 'seeded';
          const weekMatchups = getWeekMatchups(weekIndex);

          return (
            <Card key={weekNum}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-purple-600" />
                    Example Bracket - Week {weekNum}
                  </CardTitle>
                  {/* Matchup Style Dropdown */}
                  <Select
                    value={currentStyle}
                    onValueChange={(value) =>
                      dispatch({
                        type: 'SET_WEEK_MATCHUP_STYLE',
                        payload: { weekIndex, style: value as MatchupStyle },
                      })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seeded">
                        <div className="flex flex-col">
                          <span>Seeded</span>
                          <span className="text-xs text-gray-500">{getMatchupStyleDescription('seeded')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ranked">
                        <div className="flex flex-col">
                          <span>Ranked</span>
                          <span className="text-xs text-gray-500">{getMatchupStyleDescription('ranked')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="random">
                        <div className="flex flex-col">
                          <span>Random Draw</span>
                          <span className="text-xs text-gray-500">{getMatchupStyleDescription('random')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bracket">
                        <div className="flex flex-col">
                          <span>Bracket Progression</span>
                          <span className="text-xs text-gray-500">{getMatchupStyleDescription('bracket')}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Style description below title */}
                <p className="text-sm text-gray-500 mt-2">
                  {getMatchupStyleLabel(currentStyle)}: {getMatchupStyleDescription(currentStyle)}
                </p>
              </CardHeader>
              <CardContent>
                {/* Show note when not all teams qualify or when wildcards are used */}
                {exampleTeamCount !== bracketSize && wildcardSpots === 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    {qualificationType === 'all' && `With ${exampleTeamCount} teams, the ${getOrdinal(exampleTeamCount)} place team does not participate in playoffs.`}
                    {qualificationType === 'fixed' && `Only top ${bracketSize} teams qualify. Teams ranked ${bracketSize + 1}${exampleTeamCount > bracketSize + 1 ? `-${exampleTeamCount}` : ''} do not participate.`}
                    {qualificationType === 'percentage' && `Based on ${qualifyingPercentage}% qualification, ${bracketSize} of ${exampleTeamCount} teams participate.`}
                  </div>
                )}
                {/* Show wildcard info when wildcards are enabled */}
                {wildcardSpots > 0 && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    {wildcardSpots === 1 ? '1 wildcard spot' : `${wildcardSpots} wildcard spots`} randomly selected from teams that didn't automatically qualify.
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  {weekMatchups.map((matchup) => (
                    <PlayoffMatchupCard
                      key={matchup.matchNumber}
                      matchNumber={matchup.matchNumber}
                      homeSeed={matchup.homeSeed}
                      awaySeed={matchup.awaySeed}
                      bracketSize={bracketSize}
                      wildcardSpots={wildcardSpots}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Example Standings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Example Seeding ({exampleTeamCount} Teams)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Teams are seeded by: Match Wins → Points → Games Won
            </p>
            <PlayoffStandingsTable teamCount={exampleTeamCount} bracketSize={bracketSize} wildcardSpots={wildcardSpots} />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/operator-settings/${orgId}`)}
          >
            Back to Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationPlayoffSettings;
