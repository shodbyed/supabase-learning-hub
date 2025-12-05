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
import { Trophy, Users, Info, Settings, Shuffle, ThumbsDown } from 'lucide-react';
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
import { ParticipationSettingsCard } from '@/components/playoff/ParticipationSettingsCard';
import { PlayoffWeeksCard } from '@/components/playoff/PlayoffWeeksCard';
import { WildcardSettingsCard } from '@/components/playoff/WildcardSettingsCard';
import {
  usePlayoffSettingsReducer,
  calculateQualifyingTeams,
  generateMatchupPairs,
  getMatchupStyleLabel,
  getMatchupStyleDescription,
} from '@/hooks/playoff/usePlayoffSettingsReducer';
import type { MatchupStyle } from '@/hooks/playoff/usePlayoffSettingsReducer';

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Generic matchup card showing placeholder teams
 * Shows wildcard icon for seeds that fall within wildcard spots
 * Handles different matchup styles:
 * - Seeded/Ranked: Shows seed numbers and team positions
 * - Random: Shows shuffle icons for all positions
 * - Bracket: Shows "Winner of Match X" references
 */
function GenericMatchupCard({ matchNumber, homeSeed, awaySeed, bracketSize, wildcardSpots }: {
  matchNumber: number;
  homeSeed: number;
  awaySeed: number;
  bracketSize: number;
  wildcardSpots: number;
}) {
  // Determine if a seed is a wildcard spot (last N positions in bracket)
  const isWildcard = (seed: number) => {
    if (wildcardSpots === 0) return false;
    if (seed < 0 || seed > 100) return false; // Random or bracket seeds aren't wildcards
    const wildcardStartSeed = bracketSize - wildcardSpots + 1;
    return seed >= wildcardStartSeed;
  };

  // Check if this is a random matchup (negative seeds)
  const isRandom = homeSeed < 0 || awaySeed < 0;

  // Check if this is a bracket progression matchup (seeds > 100)
  // 100-199 = Winners, 200-299 = Losers, 300 = Wildcard from losers
  const isBracket = homeSeed > 100 || awaySeed > 100;

  // Get display info for a seed based on matchup style
  const getSeedDisplay = (seed: number, isHome: boolean) => {
    // Random matchup - show shuffle icon
    if (isRandom) {
      return {
        icon: <Shuffle className="h-4 w-4" />,
        label: 'Random Team',
        bgColor: 'bg-purple-50',
        circleBg: 'bg-purple-600',
        textColor: 'text-purple-700',
        badgeColor: isHome ? 'text-purple-600' : 'text-purple-500',
      };
    }

    // Bracket progression - handle winners (100+), losers (200+), and wildcard (300)
    if (isBracket) {
      // Wildcard from losers pool (remaining losers after one was picked)
      if (seed === 300) {
        return {
          icon: <Shuffle className="h-4 w-4" />,
          label: 'Remaining Loser',
          bgColor: 'bg-amber-50',
          circleBg: 'bg-amber-600',
          textColor: 'text-amber-700',
          badgeColor: isHome ? 'text-amber-600' : 'text-amber-500',
        };
      }

      // Loser of match X (200-299)
      if (seed >= 200 && seed < 300) {
        const matchRef = seed - 200;
        return {
          icon: <ThumbsDown className="h-4 w-4" />,
          label: `Loser Match ${matchRef}`,
          bgColor: 'bg-gray-100',
          circleBg: 'bg-gray-500',
          textColor: 'text-gray-600',
          badgeColor: isHome ? 'text-gray-600' : 'text-gray-500',
        };
      }

      // Winner of match X (100-199)
      const matchRef = seed - 100;
      return {
        icon: <Trophy className="h-4 w-4" />,
        label: `Winner Match ${matchRef}`,
        bgColor: 'bg-indigo-50',
        circleBg: 'bg-indigo-600',
        textColor: 'text-indigo-700',
        badgeColor: isHome ? 'text-indigo-600' : 'text-indigo-500',
      };
    }

    // Wildcard spot
    if (isWildcard(seed)) {
      return {
        icon: <Shuffle className="h-4 w-4" />,
        label: 'Wildcard',
        bgColor: 'bg-amber-50',
        circleBg: 'bg-amber-600',
        textColor: 'text-amber-700',
        badgeColor: isHome ? 'text-amber-600' : 'text-amber-500',
      };
    }

    // Regular seeded/ranked - show seed number
    return {
      icon: seed,
      label: `${getOrdinal(seed)} Place Team`,
      bgColor: isHome ? 'bg-blue-50' : 'bg-gray-50',
      circleBg: isHome ? 'bg-blue-600' : 'bg-gray-600',
      textColor: 'text-gray-500',
      badgeColor: isHome ? 'text-blue-600' : 'text-gray-500',
    };
  };

  const homeDisplay = getSeedDisplay(homeSeed, true);
  const awayDisplay = getSeedDisplay(awaySeed, false);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="text-xs text-gray-500 mb-2 text-center">
        Match {matchNumber}
      </div>
      <div className="space-y-3">
        {/* Home team */}
        <div className={`flex items-center justify-between rounded-lg p-3 ${homeDisplay.bgColor}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm ${homeDisplay.circleBg}`}>
              {homeDisplay.icon}
            </div>
            <div>
              <div className={`font-semibold italic ${homeDisplay.textColor}`}>
                {homeDisplay.label}
              </div>
            </div>
          </div>
          <div className={`text-xs font-medium ${homeDisplay.badgeColor}`}>HOME</div>
        </div>

        <div className="text-center text-gray-400 text-sm font-medium">vs</div>

        {/* Away team */}
        <div className={`flex items-center justify-between rounded-lg p-3 ${awayDisplay.bgColor}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm ${awayDisplay.circleBg}`}>
              {awayDisplay.icon}
            </div>
            <div>
              <div className={`font-semibold italic ${awayDisplay.textColor}`}>
                {awayDisplay.label}
              </div>
            </div>
          </div>
          <div className={`text-xs font-medium ${awayDisplay.badgeColor}`}>AWAY</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Generic standings table showing placeholder teams
 */
function GenericStandingsTable({ teamCount, bracketSize }: { teamCount: number; bracketSize: number }) {
  // Generate placeholder teams based on count
  const placeholderTeams = Array.from({ length: teamCount }, (_, i) => ({
    seed: i + 1,
    name: `${getOrdinal(i + 1)} Place Team`,
    inPlayoffs: i + 1 <= bracketSize, // Teams within bracket size are in playoffs
  }));

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
          {placeholderTeams.map((team) => (
            <tr
              key={team.seed}
              className={`border-b ${team.inPlayoffs ? 'hover:bg-gray-50' : 'bg-red-50 opacity-60'}`}
            >
              <td className="py-2 px-3">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-semibold text-xs ${
                  team.inPlayoffs ? 'bg-gray-200 text-gray-700' : 'bg-red-200 text-red-700'
                }`}>
                  {team.seed}
                </span>
              </td>
              <td className="py-2 px-3 font-medium text-gray-500 italic">
                {team.name}
                {!team.inPlayoffs && (
                  <span className="ml-2 text-xs text-red-600">(Not in playoffs)</span>
                )}
              </td>
              <td className="py-2 px-3 text-center text-gray-400">--</td>
              <td className="py-2 px-3 text-center text-gray-400">--</td>
              <td className="py-2 px-3 text-center text-gray-400">--</td>
              <td className="py-2 px-3 text-center text-gray-400">--</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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

  // Available team count options (4-40, matching schedule generator capability)
  const teamCountOptions = Array.from({ length: 37 }, (_, i) => i + 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        backTo={`/operator-settings/${orgId}`}
        backLabel="Back to Settings"
        title="Playoff Settings"
        subtitle="Organization Default Configuration"
      />

      <div className="container mx-auto px-4 max-w-4xl py-8 space-y-6">
        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-800">Organization Default Settings</div>
                <div className="text-sm text-blue-700 mt-1">
                  These settings will be used as the default for all leagues in your organization.
                  Individual leagues can override these settings if needed.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
            {/* Show Example Dropdown */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Show example of</span>
                <Select
                  value={exampleTeamCount.toString()}
                  onValueChange={(value) =>
                    dispatch({ type: 'SET_EXAMPLE_TEAM_COUNT', payload: parseInt(value, 10) })
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select teams" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamCountOptions.map((count) => (
                      <SelectItem key={count} value={count.toString()}>
                        {count} Teams
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                    <GenericMatchupCard
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
            <GenericStandingsTable teamCount={exampleTeamCount} bracketSize={bracketSize} />
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
