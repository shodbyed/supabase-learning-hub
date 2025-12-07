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

  // Destructure for convenience (only values used directly in this component)
  const {
    exampleTeamCount,
    playoffWeeks,
    qualificationType,
    qualifyingPercentage,
    wildcardSpots,
    weekMatchupStyles,
  } = settings;

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
        {/* Playoff Format Explanation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              Standard Playoff Format
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Playoffs are automatically seeded based on final regular season standings.
              The bracket pairs top seeds against bottom seeds:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li><strong>4 teams:</strong> 1st vs 4th, 2nd vs 3rd</li>
              <li><strong>6 teams:</strong> 1st vs 6th, 2nd vs 5th, 3rd vs 4th</li>
              <li><strong>8 teams:</strong> 1st vs 8th, 2nd vs 7th, 3rd vs 6th, 4th vs 5th</li>
              <li><strong>Odd teams:</strong> Last place team does not participate</li>
            </ul>
            <p className="text-sm text-gray-600">
              Higher seeds are designated as the <strong>home team</strong> and play at their home venue.
            </p>
          </CardContent>
        </Card>

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

        {/* Playoff Rules */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Playoff Match Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-600" />
              <div className="text-sm">
                <span className="font-medium">No Team Handicap Bonus</span>
                <span className="text-gray-500 ml-2">— Team standing modifiers do not apply</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-600" />
              <div className="text-sm">
                <span className="font-medium">Points Don&apos;t Count</span>
                <span className="text-gray-500 ml-2">— Only win/loss matters for advancement</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-600" />
              <div className="text-sm">
                <span className="font-medium">Early Termination</span>
                <span className="text-gray-500 ml-2">— Match ends when win threshold is reached</span>
              </div>
            </div>
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
