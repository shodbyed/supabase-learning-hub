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
import { Trophy, Users, Info, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PageHeader } from '@/components/PageHeader';
import { generatePlayoffPairs } from '@/utils/playoffGenerator';
import { ParticipationSettingsCard } from '@/components/playoff/ParticipationSettingsCard';
import {
  usePlayoffSettingsReducer,
  calculateQualifyingTeams,
} from '@/hooks/playoff/usePlayoffSettingsReducer';

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
 */
function GenericMatchupCard({ matchNumber, homeSeed, awaySeed }: {
  matchNumber: number;
  homeSeed: number;
  awaySeed: number;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="text-xs text-gray-500 mb-2 text-center">
        Match {matchNumber}
      </div>
      <div className="space-y-3">
        {/* Home team (higher seed) */}
        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {homeSeed}
            </div>
            <div>
              <div className="font-semibold text-gray-500 italic">
                {getOrdinal(homeSeed)} Place Team
              </div>
            </div>
          </div>
          <div className="text-xs text-blue-600 font-medium">HOME</div>
        </div>

        <div className="text-center text-gray-400 text-sm font-medium">vs</div>

        {/* Away team (lower seed) */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold text-sm">
              {awaySeed}
            </div>
            <div>
              <div className="font-semibold text-gray-500 italic">
                {getOrdinal(awaySeed)} Place Team
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 font-medium">AWAY</div>
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

  // Destructure for convenience
  const {
    exampleTeamCount,
    playoffWeeks,
    qualificationType,
    qualifyingPercentage,
    showAddWeeksModal,
    weeksToAdd,
    paymentMethod,
  } = settings;

  // Calculate bracket size based on qualification settings
  const bracketSize = calculateQualifyingTeams(exampleTeamCount, settings);

  // Generate matchups based on qualifying teams (bracketSize)
  const pairs = generatePlayoffPairs(bracketSize);
  const bracketMatchups = pairs.map((pair, index) => ({
    matchNumber: index + 1,
    homeSeed: pair[0],
    awaySeed: pair[1],
  }));

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

            {/* Playoff Weeks */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700"># of playoff weeks</span>
                <Select
                  value={playoffWeeks.toString()}
                  onValueChange={(value) => {
                    if (value === 'add') {
                      dispatch({ type: 'OPEN_ADD_WEEKS_MODAL' });
                      return;
                    }
                    dispatch({ type: 'SET_PLAYOFF_WEEKS', payload: parseInt(value, 10) });
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select weeks" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Dynamically generate options from 1 to current playoffWeeks count */}
                    {Array.from({ length: Math.max(2, playoffWeeks) }, (_, i) => i + 1).map((weekNum) => (
                      <SelectItem key={weekNum} value={weekNum.toString()}>
                        {weekNum}
                      </SelectItem>
                    ))}
                    <SelectItem value="add">Add weeks...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Participation Card Component */}
            <ParticipationSettingsCard
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
        {Array.from({ length: playoffWeeks }, (_, i) => i + 1).map((weekNum) => (
          <Card key={weekNum}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                Example Bracket - Week {weekNum}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Show note when not all teams qualify */}
              {exampleTeamCount !== bracketSize && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  {qualificationType === 'all' && `With ${exampleTeamCount} teams, the ${getOrdinal(exampleTeamCount)} place team does not participate in playoffs.`}
                  {qualificationType === 'fixed' && `Only top ${bracketSize} teams qualify. Teams ranked ${bracketSize + 1}${exampleTeamCount > bracketSize + 1 ? `-${exampleTeamCount}` : ''} do not participate.`}
                  {qualificationType === 'percentage' && `Based on ${qualifyingPercentage}% qualification, ${bracketSize} of ${exampleTeamCount} teams participate.`}
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {bracketMatchups.map((matchup) => (
                  <GenericMatchupCard
                    key={matchup.matchNumber}
                    matchNumber={matchup.matchNumber}
                    homeSeed={matchup.homeSeed}
                    awaySeed={matchup.awaySeed}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

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

      {/* Add Weeks Modal */}
      <Dialog
        open={showAddWeeksModal}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: 'CLOSE_ADD_WEEKS_MODAL' });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Playoff Weeks</DialogTitle>
            <DialogDescription>
              Additional playoff weeks are charged at $2 per team per week.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Number of weeks input */}
            <div className="space-y-2">
              <Label htmlFor="weeksToAdd"># of weeks to add</Label>
              <Input
                id="weeksToAdd"
                type="number"
                min={1}
                max={10}
                value={weeksToAdd}
                onChange={(e) =>
                  dispatch({ type: 'SET_WEEKS_TO_ADD', payload: parseInt(e.target.value) || 1 })
                }
                className="w-32"
              />
            </div>

            {/* Price calculation */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="text-xs text-gray-500 mb-2">Example pricing based on {exampleTeamCount} teams:</div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price per team per week:</span>
                <span className="font-medium">$2.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Teams × Weeks:</span>
                <span className="font-medium">{exampleTeamCount} × {weeksToAdd}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Example total:</span>
                  <span className="font-bold text-purple-600">
                    ${(exampleTeamCount * weeksToAdd * 2).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) =>
                  dispatch({ type: 'SET_PAYMENT_METHOD', payload: value as 'automatic' | 'manual' })
                }
                className="space-y-2"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <RadioGroupItem value="automatic" id="automatic" />
                  <Label htmlFor="automatic" className="flex-1 cursor-pointer">
                    <div className="font-medium">Charge automatically</div>
                    <div className="text-xs text-gray-500">
                      Amount will be charged to your payment method during playoff weeks
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label htmlFor="manual" className="flex-1 cursor-pointer">
                    <div className="font-medium">Pay manually</div>
                    <div className="text-xs text-gray-500">
                      You will receive an invoice to pay before playoff weeks begin
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => dispatch({ type: 'CLOSE_ADD_WEEKS_MODAL' })}
            >
              Cancel
            </Button>
            <Button
              onClick={() => dispatch({ type: 'ADD_PLAYOFF_WEEKS', payload: weeksToAdd })}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Add Weeks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationPlayoffSettings;
