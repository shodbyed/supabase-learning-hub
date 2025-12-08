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
import { Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useSavePlayoffConfiguration } from '@/api/mutations/playoffConfigurations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { InfoButton } from '@/components/InfoButton';
import { PlayoffTemplateSelector } from '@/components/playoff/PlayoffTemplateSelector';
import { PlayoffMatchRulesCard } from '@/components/playoff/PlayoffMatchRulesCard';
import { PlayoffBracketPreviewCard } from '@/components/playoff/PlayoffBracketPreviewCard';
import { PlayoffSeedingCard } from '@/components/playoff/PlayoffSeedingCard';
import { ParticipationSettingsCard } from '@/components/playoff/ParticipationSettingsCard';
import { PlayoffWeeksCard } from '@/components/playoff/PlayoffWeeksCard';
import { WildcardSettingsCard } from '@/components/playoff/WildcardSettingsCard';
import { ExampleTeamCountCard } from '@/components/playoff/ExampleTeamCountCard';
import {
  usePlayoffSettingsReducer,
  calculateQualifyingTeams,
} from '@/hooks/playoff/usePlayoffSettingsReducer';
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
   * Handle matchup style change for a specific week
   */
  const handleMatchupStyleChange = (weekIndex: number, style: MatchupStyle) => {
    dispatch({
      type: 'SET_WEEK_MATCHUP_STYLE',
      payload: { weekIndex, style },
    });
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
