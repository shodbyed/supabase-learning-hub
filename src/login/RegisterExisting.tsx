/**
 * @fileoverview Register Existing Player Page
 *
 * This page helps users who are already on a team (as placeholder players)
 * find their existing record and link it to a new account.
 *
 * Flow:
 * 1. Recommend getting a registration link from captain (easiest)
 * 2. Or fill out form with whatever details they know (all optional)
 * 3. Search for matching PP record using confidence scoring
 * 4. If found with high confidence, redirect to /register?claim={ppId}
 *
 * Matching Strategy:
 * All fields are optional. We use a confidence score based on how many
 * fields match exactly. 4-6 exact matches = high confidence of legitimate claim.
 *
 * Grading System:
 * - Grade A (6+ matches): Auto-merge - redirect to /register?claim={ppId}
 * - Grade B (4-5 matches): LO Review Required - show pending message
 * - Grade C (<4 matches): No Match - ask user to get registration link
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/components/PageHeader';
import { SelectField } from '@/newPlayer/FormField';
import { US_STATES } from '@/constants/states';
import { DAYS_OF_WEEK } from '@/constants/days';
import { LinkIcon, Search, AlertCircle, Info, CheckCircle, Clock } from 'lucide-react';
import {
  searchPlaceholderMatchesEnhanced,
  parseSystemPlayerNumber,
  getTeamVerificationOptions,
  type EnhancedPlaceholderMatch,
  type TeamVerificationOption,
} from '@/api/queries/memberSearch';

export const RegisterExisting: React.FC = () => {
  const navigate = useNavigate();

  // League Operator info
  const [operatorFirstName, setOperatorFirstName] = useState('');
  const [operatorLastName, setOperatorLastName] = useState('');
  const [operatorPlayerNumber, setOperatorPlayerNumber] = useState('');

  // Captain info
  const [captainFirstName, setCaptainFirstName] = useState('');
  const [captainLastName, setCaptainLastName] = useState('');
  const [captainPlayerNumber, setCaptainPlayerNumber] = useState('');

  // Their info in the system
  const [systemFirstName, setSystemFirstName] = useState('');
  const [systemLastName, setSystemLastName] = useState('');
  const [systemPlayerNumber, setSystemPlayerNumber] = useState('');
  const [systemNickname, setSystemNickname] = useState('');

  // Team/League info
  const [teamName, setTeamName] = useState('');
  const [playNight, setPlayNight] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Last opponent (security verification - only someone who played would know)
  const [lastOpponentFirstName, setLastOpponentFirstName] = useState('');
  const [lastOpponentLastName, setLastOpponentLastName] = useState('');
  const [hasNotPlayedYet, setHasNotPlayedYet] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResult, setSearchResult] = useState<EnhancedPlaceholderMatch | null>(null);

  // Grade B verification challenge state
  const [verificationOptions, setVerificationOptions] = useState<TeamVerificationOption[]>([]);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationPassed, setVerificationPassed] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);

  // Count how many fields are filled (for UI feedback)
  // Checkbox counts as 1 if checked, opponent names only count if not checked
  const filledFieldCount = [
    operatorFirstName,
    operatorLastName,
    operatorPlayerNumber,
    captainFirstName,
    captainLastName,
    captainPlayerNumber,
    systemFirstName,
    systemLastName,
    systemPlayerNumber,
    systemNickname,
    teamName,
    playNight,
    city,
    state,
    // Only count opponent names if they haven't checked "no games yet"
    ...(hasNotPlayedYet ? [] : [lastOpponentFirstName, lastOpponentLastName]),
  ].filter((v) => v.trim() !== '').length + (hasNotPlayedYet ? 1 : 0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSearchResult(null);
    setShowVerification(false);
    setVerificationPassed(false);
    setVerificationFailed(false);
    setVerificationOptions([]);

    // Require at least 4 fields for a reasonable search
    if (filledFieldCount < 4) {
      setError('Please fill in at least 4 fields to help us find your record.');
      return;
    }

    setLoading(true);

    try {
      // Build search criteria from form fields
      // Parse player numbers from string input to numbers
      const searchCriteria = {
        operatorFirstName: operatorFirstName.trim() || undefined,
        operatorLastName: operatorLastName.trim() || undefined,
        operatorPlayerNumber: parseSystemPlayerNumber(operatorPlayerNumber) ?? undefined,
        captainFirstName: captainFirstName.trim() || undefined,
        captainLastName: captainLastName.trim() || undefined,
        captainPlayerNumber: parseSystemPlayerNumber(captainPlayerNumber) ?? undefined,
        systemFirstName: systemFirstName.trim() || undefined,
        systemLastName: systemLastName.trim() || undefined,
        systemPlayerNumber: parseSystemPlayerNumber(systemPlayerNumber) ?? undefined,
        systemNickname: systemNickname.trim() || undefined,
        teamName: teamName.trim() || undefined,
        playNight: playNight || undefined,
        city: city.trim() || undefined,
        state: state || undefined,
        lastOpponentFirstName: hasNotPlayedYet ? undefined : lastOpponentFirstName.trim() || undefined,
        lastOpponentLastName: hasNotPlayedYet ? undefined : lastOpponentLastName.trim() || undefined,
        hasNotPlayedYet: hasNotPlayedYet || undefined,
      };

      // Call the PostgreSQL function via RPC
      const results = await searchPlaceholderMatchesEnhanced(searchCriteria);

      // Get the best match (first result, already sorted by score)
      const bestMatch = results.length > 0 ? results[0] : null;

      setSearchResult(bestMatch);

      // Handle Grade A: Auto-redirect to registration with claim
      if (bestMatch?.grade === 'A') {
        // Short delay to show success message before redirect
        setTimeout(() => {
          navigate(`/register?claim=${bestMatch.member_id}`);
        }, 1500);
      }

      // Handle Grade B: Load team verification options
      if (bestMatch?.grade === 'B') {
        try {
          const options = await getTeamVerificationOptions(bestMatch.member_id);
          // Only show verification if there are options to verify
          // (member must be on at least one team and there must be decoy options)
          if (options.length > 1 && options.some(o => o.is_correct)) {
            setVerificationOptions(options);
            setShowVerification(true);
          }
          // If no verification options available, just show the standard Grade B message
        } catch {
          // If verification options fail to load, proceed without verification
          console.warn('Could not load team verification options');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle team verification selection
   * If user selects a correct team, pass verification and redirect
   */
  const handleVerificationSelection = (option: TeamVerificationOption) => {
    if (option.is_correct) {
      setVerificationPassed(true);
      setShowVerification(false);
      // Redirect to registration with claim
      if (searchResult) {
        setTimeout(() => {
          navigate(`/register?claim=${searchResult.member_id}`);
        }, 1500);
      }
    } else {
      // Wrong answer - they might not be who they claim
      setVerificationFailed(true);
      setShowVerification(false);
    }
  };

  return (
    <div>
      <PageHeader
        backTo="/register"
        backLabel="Back to Register"
        title="Help Us Find You"
        subtitle="Let's locate your player record in our system"
      />
      <Card className="w-full lg:w-1/2 lg:mx-auto p-4 lg:shadow-lg lg:bg-gray-100">
        <CardContent className="pt-4">
        {/* Recommended: Get link from captain */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <LinkIcon className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800">Easiest Option</p>
            <p className="text-sm text-green-700 mt-1">
              Ask your captain or league operator for a registration link.
              They can send you a direct link that will automatically connect
              your account to your player record.
            </p>
          </div>
        </div>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or find yourself</span>
        </div>
      </div>

      {/* Explanation */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          To keep your records secure, we need to verify you're the same player
          before connecting your account. The more information you can provide,
          the more confident we can be in making the connection.
        </p>
      </div>

      {/* Search form - all fields optional */}
      <form onSubmit={handleSearch} className="space-y-6">
        {/* League Operator Section */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">League Operator</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="operatorFirstName">First Name</Label>
              <Input
                id="operatorFirstName"
                placeholder="Operator first name"
                value={operatorFirstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOperatorFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="operatorLastName">Last Name</Label>
              <Input
                id="operatorLastName"
                placeholder="Operator last name"
                value={operatorLastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOperatorLastName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="operatorPlayerNumber">Player Number</Label>
            <Input
              id="operatorPlayerNumber"
              placeholder="e.g., P-12345"
              value={operatorPlayerNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOperatorPlayerNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Captain Section */}
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium text-muted-foreground">Captain</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="captainFirstName">First Name</Label>
              <Input
                id="captainFirstName"
                placeholder="Captain first name"
                value={captainFirstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaptainFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="captainLastName">Last Name</Label>
              <Input
                id="captainLastName"
                placeholder="Captain last name"
                value={captainLastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaptainLastName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="captainPlayerNumber">Player Number</Label>
            <Input
              id="captainPlayerNumber"
              placeholder="e.g., P-12345"
              value={captainPlayerNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaptainPlayerNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Your System Info Section */}
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium text-muted-foreground">Your Info in the System</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="systemFirstName">First Name</Label>
              <Input
                id="systemFirstName"
                placeholder="Your first name"
                value={systemFirstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSystemFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="systemLastName">Last Name</Label>
              <Input
                id="systemLastName"
                placeholder="Your last name"
                value={systemLastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSystemLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="systemPlayerNumber">Your Player Number</Label>
              <Input
                id="systemPlayerNumber"
                placeholder="e.g., P-12345"
                value={systemPlayerNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSystemPlayerNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="systemNickname">Your Nickname</Label>
              <Input
                id="systemNickname"
                placeholder="Your nickname"
                value={systemNickname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSystemNickname(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Team/League Section */}
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium text-muted-foreground">Team & Location</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                placeholder="Your team name"
                value={teamName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeamName(e.target.value)}
              />
            </div>
            <div>
              <SelectField
                label="Play Night"
                value={playNight}
                onValueChange={setPlayNight}
                placeholder="Select night"
                options={DAYS_OF_WEEK}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="City"
                value={city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
              />
            </div>
            <div>
              <SelectField
                label="State"
                value={state}
                onValueChange={setState}
                placeholder="State"
                options={US_STATES}
              />
            </div>
          </div>
        </div>

        {/* Last Opponent Section - security verification */}
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium text-muted-foreground">Last Game Played Against</p>

          {/* Checkbox for no games played yet */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasNotPlayedYet"
              checked={hasNotPlayedYet}
              onCheckedChange={(checked) => {
                setHasNotPlayedYet(checked === true);
                // Clear opponent fields when checking the box
                if (checked) {
                  setLastOpponentFirstName('');
                  setLastOpponentLastName('');
                }
              }}
            />
            <Label
              htmlFor="hasNotPlayedYet"
              className="text-sm font-normal cursor-pointer"
            >
              I haven't played any games yet
            </Label>
          </div>

          {/* Opponent name fields - only show if not checked */}
          {!hasNotPlayedYet && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lastOpponentFirstName">Opponent First Name</Label>
                <Input
                  id="lastOpponentFirstName"
                  placeholder="First name"
                  value={lastOpponentFirstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastOpponentFirstName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lastOpponentLastName">Opponent Last Name</Label>
                <Input
                  id="lastOpponentLastName"
                  placeholder="Last name"
                  value={lastOpponentLastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastOpponentLastName(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Field count indicator */}
        <div className="text-center text-sm text-muted-foreground">
          {filledFieldCount} of 15 fields filled
          {filledFieldCount >= 4 && filledFieldCount < 6 && (
            <span className="text-amber-600 ml-2">(minimum reached)</span>
          )}
          {filledFieldCount >= 6 && (
            <span className="text-green-600 ml-2">(good match potential)</span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {searchResult && !error && (
          <>
            {/* Grade A: High confidence match - redirecting */}
            {searchResult.grade === 'A' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800">Match Found!</p>
                    <p className="text-sm text-green-700 mt-1">
                      We found your record: <strong>{searchResult.first_name} {searchResult.last_name}</strong> (P-{searchResult.system_player_number})
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                      Redirecting you to complete registration...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Grade B: Medium confidence - show verification challenge or LO review */}
            {searchResult.grade === 'B' && (
              <>
                {/* Verification passed - redirecting */}
                {verificationPassed && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-800">Verification Passed!</p>
                        <p className="text-sm text-green-700 mt-1">
                          You correctly identified your team. We're confident this is your record.
                        </p>
                        <p className="text-sm text-green-600 mt-2">
                          Redirecting you to complete registration...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification failed - wrong team selected */}
                {verificationFailed && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-800">Verification Failed</p>
                        <p className="text-sm text-red-700 mt-1">
                          The team you selected doesn't match our records for this player.
                        </p>
                        <p className="text-sm text-red-700 mt-2">
                          Please contact your captain or league operator for a direct registration link,
                          or try searching again with different information.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Team verification challenge */}
                {showVerification && !verificationPassed && !verificationFailed && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="w-full">
                        <p className="font-semibold text-blue-800">Quick Verification</p>
                        <p className="text-sm text-blue-700 mt-1">
                          We found a potential match for <strong>{searchResult.first_name} {searchResult.last_name}</strong>.
                          To verify this is you, please select which team you play on:
                        </p>
                        <div className="mt-3 space-y-2">
                          {verificationOptions.map((option, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full justify-start text-left"
                              onClick={() => handleVerificationSelection(option)}
                            >
                              {option.team_name}
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-blue-600 mt-3">
                          If you don't see your team or aren't sure, contact your captain.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Standard Grade B message (no verification available) */}
                {!showVerification && !verificationPassed && !verificationFailed && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-800">Potential Match Found</p>
                        <p className="text-sm text-amber-700 mt-1">
                          We found a potential match: <strong>{searchResult.first_name} {searchResult.last_name}</strong> (P-{searchResult.system_player_number})
                        </p>
                        <p className="text-sm text-amber-700 mt-2">
                          However, we need your league operator to verify this is you before we can connect your account.
                          Please contact your captain or league operator and let them know you're trying to register.
                        </p>
                        <p className="text-sm text-amber-600 mt-2 font-medium">
                          Matched {searchResult.total_score} fields: {searchResult.matched_fields.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Grade C: Low confidence */}
            {searchResult.grade === 'C' && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">No Confident Match Found</p>
                    <p className="text-sm text-gray-700 mt-1">
                      We couldn't find a confident match for your information.
                      This could mean:
                    </p>
                    <ul className="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
                      <li>Some of the information entered doesn't match our records</li>
                      <li>Your captain hasn't added you to the system yet</li>
                      <li>You may be registered under different details</li>
                    </ul>
                    <p className="text-sm text-gray-700 mt-3">
                      <strong>Recommended:</strong> Ask your captain or league operator for a direct registration link.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* No results found at all */}
        {searchResult === null && !loading && !error && filledFieldCount >= 4 && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">No Match Found</p>
                <p className="text-sm text-gray-700 mt-1">
                  We couldn't find any player records matching your information.
                  Please ask your captain or league operator for a direct registration link.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Only show search button if no Grade A result (since we're redirecting) */}
        {(!searchResult || searchResult.grade !== 'A') && (
          <Button
            type="submit"
            className="w-full"
            loadingText="Searching..."
            isLoading={loading}
            disabled={loading || filledFieldCount < 4}
          >
            <Search className="mr-2 h-4 w-4" />
            {searchResult ? 'Search Again' : 'Find My Record'}
          </Button>
        )}
      </form>

      <CardFooter className="mt-6 text-sm flex flex-col gap-2 w-full">
        <Link to="/register" className="text-primary hover:underline">
          I'm new and not on a team yet
        </Link>
        <Link to="/login" className="text-muted-foreground hover:underline">
          Already have an account? Login
        </Link>
      </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};
