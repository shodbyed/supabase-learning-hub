/**
 * @fileoverview Score Match Page - 3v3 Match Scoring
 *
 * Mobile-first scoring page for 3v3 pool league matches.
 * Displays compact scoreboard with swipe navigation between teams.
 * Allows players to score games, confirm results, and track match progress.
 *
 * Flow: Lineup Entry → Score Match → (Tiebreaker if needed)
 *
 * Features:
 * - Compact scoreboard (top 1/3 of screen) with swipe left/right
 * - 18-game scoring with real-time updates
 * - Confirmation flow (both teams must agree)
 * - Break & Run (B&R) and Golden Break (8BB) tracking
 * - Match end detection with winner announcement
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { calculateTeamHandicap, type HandicapVariant } from '@/utils/handicapCalculations';
import { getAllGames } from '@/utils/gameOrder';

interface Match {
  id: string;
  season_id: string;
  home_team_id: string;
  away_team_id: string;
  home_team: {
    id: string;
    team_name: string;
  } | null;
  away_team: {
    id: string;
    team_name: string;
  } | null;
}

interface Lineup {
  id: string;
  team_id: string;
  player1_id: string | null;
  player1_handicap: number;
  player2_id: string | null;
  player2_handicap: number;
  player3_id: string | null;
  player3_handicap: number;
  locked: boolean;
}

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
}

interface HandicapThresholds {
  games_to_win: number;
  games_to_tie: number | null;
  games_to_lose: number;
}

export function ScoreMatch() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { memberId, loading: memberLoading } = useCurrentMember();

  const [match, setMatch] = useState<Match | null>(null);
  const [homeLineup, setHomeLineup] = useState<Lineup | null>(null);
  const [awayLineup, setAwayLineup] = useState<Lineup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // League variants (will be used for B&R/8BB checkboxes)
  const [goldenBreakCountsAsWin, setGoldenBreakCountsAsWin] = useState(false);
  void goldenBreakCountsAsWin; // Will be used in scoring UI

  // Team handicap calculations
  const [homeTeamHandicap, setHomeTeamHandicap] = useState(0);
  const [homePlayerHandicapTotal, setHomePlayerHandicapTotal] = useState(0);
  const [awayPlayerHandicapTotal, setAwayPlayerHandicapTotal] = useState(0);

  // Handicap thresholds from lookup table
  const [homeThresholds, setHomeThresholds] = useState<HandicapThresholds | null>(null);
  const [awayThresholds, setAwayThresholds] = useState<HandicapThresholds | null>(null);

  // Player data (for display names)
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());

  // Scoreboard view toggle (true = home team, false = away team)
  const [showingHomeTeam, setShowingHomeTeam] = useState(true);

  // Determine user's team (will be used for permissions and UI)
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [isHomeTeam, setIsHomeTeam] = useState<boolean | null>(null);
  void userTeamId; // Will be used for scoring permissions
  void isHomeTeam; // Will be used for UI display

  useEffect(() => {
    async function fetchMatchData() {
      if (memberLoading) return;

      if (!matchId || !memberId) {
        setError('Missing match or member information');
        setLoading(false);
        return;
      }

      try {
        // Fetch match details with league variants
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select(`
            id,
            season_id,
            home_team_id,
            away_team_id,
            home_team:teams!matches_home_team_id_fkey(id, team_name),
            away_team:teams!matches_away_team_id_fkey(id, team_name),
            season:seasons!matches_season_id_fkey(
              league:leagues(
                handicap_variant,
                team_handicap_variant,
                golden_break_counts_as_win
              )
            )
          `)
          .eq('id', matchId)
          .single();

        if (matchError) throw matchError;

        console.log('Match data received:', matchData);

        // Extract league variants
        const seasonData = Array.isArray(matchData.season)
          ? matchData.season[0]
          : matchData.season;
        const leagueData = seasonData && Array.isArray((seasonData as any).league)
          ? (seasonData as any).league[0]
          : (seasonData as any)?.league;

        const playerVariant = (leagueData?.handicap_variant || 'standard') as HandicapVariant;
        const teamVariant = (leagueData?.team_handicap_variant || 'standard') as HandicapVariant;
        const goldenBreakSetting = leagueData?.golden_break_counts_as_win ?? false;

        setGoldenBreakCountsAsWin(goldenBreakSetting);
        console.log('League variants:', { playerVariant, teamVariant, goldenBreakSetting });

        // Transform match data
        const homeTeam = Array.isArray(matchData.home_team)
          ? matchData.home_team[0]
          : matchData.home_team;
        const awayTeam = Array.isArray(matchData.away_team)
          ? matchData.away_team[0]
          : matchData.away_team;

        const transformedMatch: Match = {
          id: matchData.id,
          season_id: matchData.season_id,
          home_team_id: matchData.home_team_id,
          away_team_id: matchData.away_team_id,
          home_team: homeTeam as any || null,
          away_team: awayTeam as any || null,
        };

        setMatch(transformedMatch);

        // Calculate team handicap (only for home team)
        const calculatedTeamHandicap = await calculateTeamHandicap(
          matchData.home_team_id,
          matchData.away_team_id,
          matchData.season_id,
          teamVariant,
          true // useRandom = true for testing
        );
        setHomeTeamHandicap(calculatedTeamHandicap);

        // Determine which team the user is on
        const { data: teamPlayerData, error: teamPlayerError } = await supabase
          .from('team_players')
          .select('team_id')
          .eq('member_id', memberId)
          .or(`team_id.eq.${matchData.home_team_id},team_id.eq.${matchData.away_team_id}`)
          .single();

        if (teamPlayerError) throw new Error('You are not on either team in this match');

        const userTeam = teamPlayerData.team_id;
        const isHome = userTeam === matchData.home_team_id;
        setUserTeamId(userTeam);
        setIsHomeTeam(isHome);
        setShowingHomeTeam(isHome); // Start by showing user's own team

        // Fetch lineups for both teams
        const { data: lineupsData, error: lineupsError } = await supabase
          .from('match_lineups')
          .select('*')
          .eq('match_id', matchId)
          .in('team_id', [matchData.home_team_id, matchData.away_team_id]);

        if (lineupsError) throw lineupsError;

        console.log('Lineups data received:', lineupsData);

        // Separate home and away lineups
        const homeLineupData = lineupsData?.find(l => l.team_id === matchData.home_team_id);
        const awayLineupData = lineupsData?.find(l => l.team_id === matchData.away_team_id);

        if (!homeLineupData || !awayLineupData) {
          throw new Error('Both team lineups must be locked before scoring can begin');
        }

        if (!homeLineupData.locked || !awayLineupData.locked) {
          throw new Error('Both team lineups must be locked before scoring can begin');
        }

        setHomeLineup(homeLineupData);
        setAwayLineup(awayLineupData);

        // Calculate player handicap totals
        const homeTotal = homeLineupData.player1_handicap + homeLineupData.player2_handicap + homeLineupData.player3_handicap;
        const awayTotal = awayLineupData.player1_handicap + awayLineupData.player2_handicap + awayLineupData.player3_handicap;
        setHomePlayerHandicapTotal(homeTotal);
        setAwayPlayerHandicapTotal(awayTotal);

        // Calculate handicap difference and lookup thresholds
        const homeTotalHandicap = homeTotal + calculatedTeamHandicap;
        const awayTotalHandicap = awayTotal;
        const handicapDiff = homeTotalHandicap - awayTotalHandicap;

        // Cap at ±12
        const cappedHomeDiff = Math.max(-12, Math.min(12, handicapDiff));
        const cappedAwayDiff = Math.max(-12, Math.min(12, -handicapDiff));

        console.log('Handicap calculations:', {
          homeTotal,
          awayTotal,
          teamHandicap: calculatedTeamHandicap,
          homeTotalHandicap,
          awayTotalHandicap,
          handicapDiff,
          cappedHomeDiff,
          cappedAwayDiff,
        });

        // Lookup thresholds from handicap_chart_3vs3 table
        const { data: homeThresholdData, error: homeThresholdError } = await supabase
          .from('handicap_chart_3vs3')
          .select('*')
          .eq('hcp_diff', cappedHomeDiff)
          .single();

        const { data: awayThresholdData, error: awayThresholdError } = await supabase
          .from('handicap_chart_3vs3')
          .select('*')
          .eq('hcp_diff', cappedAwayDiff)
          .single();

        if (homeThresholdError) throw homeThresholdError;
        if (awayThresholdError) throw awayThresholdError;

        setHomeThresholds(homeThresholdData);
        setAwayThresholds(awayThresholdData);

        console.log('Thresholds:', { home: homeThresholdData, away: awayThresholdData });

        // Fetch all player names for display
        const allPlayerIds = [
          homeLineupData.player1_id,
          homeLineupData.player2_id,
          homeLineupData.player3_id,
          awayLineupData.player1_id,
          awayLineupData.player2_id,
          awayLineupData.player3_id,
        ].filter(Boolean);

        const { data: playersData, error: playersError } = await supabase
          .from('members')
          .select('id, first_name, last_name, nickname')
          .in('id', allPlayerIds);

        if (playersError) throw playersError;

        // Create player lookup map
        const playerMap = new Map<string, Player>();
        playersData?.forEach(p => {
          playerMap.set(p.id, p);
        });
        setPlayers(playerMap);

        console.log('Players loaded:', playerMap);

      } catch (err: any) {
        console.error('Error fetching match data:', err);
        setError(err.message || 'Failed to load match information');
      } finally {
        setLoading(false);
      }
    }

    fetchMatchData();
  }, [matchId, memberId, memberLoading]);

  /**
   * Get display name for a player (nickname or first name, max 12 chars)
   */
  const getPlayerDisplayName = (playerId: string | null): string => {
    if (!playerId) return 'Substitute';
    const player = players.get(playerId);
    if (!player) return 'Unknown';
    return player.nickname || player.first_name;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700">Loading match...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600 mb-2">Error</div>
              <div className="text-gray-700 mb-4">{error}</div>
              <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!match || !homeLineup || !awayLineup || !homeThresholds || !awayThresholds) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Scoreboard - Fixed at top */}
      <div className="bg-white border-b shadow-sm flex-shrink-0">
        <div className="px-4 py-2">
          {/* Team selector buttons */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-4">
            <Button
              variant={showingHomeTeam ? "default" : "outline"}
              onClick={() => setShowingHomeTeam(true)}
            >
              {match.home_team?.team_name}
            </Button>
            <div className="text-sm text-gray-500 font-semibold px-2">vs</div>
            <Button
              variant={!showingHomeTeam ? "default" : "outline"}
              onClick={() => setShowingHomeTeam(false)}
            >
              {match.away_team?.team_name}
            </Button>
          </div>

          {/* Team scoreboard (shows one team at a time) */}
          {showingHomeTeam ? (
            <div className="space-y-2">
              <div className="text-center font-bold text-lg mb-2">HOME</div>
              {/* Two-column layout: Player stats and match stats */}
              <div className="grid grid-cols-[55%_45%] gap-2">
                {/* Player stats table */}
                <div className="border border-gray-300 rounded bg-blue-50">
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-xs font-semibold border-b border-gray-300 p-1">
                    <div className="text-center">H/C</div>
                    <div>Name</div>
                    <div className="text-center">W</div>
                    <div className="text-center">L</div>
                  </div>
                  {/* Team row */}
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1 font-semibold border-b border-gray-300">
                    <div className="text-center">{homeTeamHandicap}</div>
                    <div className="truncate">Team</div>
                    <div className="text-center">0</div>
                    <div className="text-center">0</div>
                  </div>
                  {/* Player rows */}
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">{homeLineup.player1_handicap}</div>
                    <div className="truncate">{getPlayerDisplayName(homeLineup.player1_id)}</div>
                    <div className="text-center">0</div>
                    <div className="text-center">0</div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">{homeLineup.player2_handicap}</div>
                    <div className="truncate">{getPlayerDisplayName(homeLineup.player2_id)}</div>
                    <div className="text-center">0</div>
                    <div className="text-center">0</div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">{homeLineup.player3_handicap}</div>
                    <div className="truncate">{getPlayerDisplayName(homeLineup.player3_id)}</div>
                    <div className="text-center">0</div>
                    <div className="text-center">0</div>
                  </div>
                </div>

                {/* Match stats card */}
                <div className="border border-gray-300 rounded p-2 bg-blue-50">
                  <div className="flex justify-around text-xs mb-2">
                    <div className="text-center">
                      <div className="text-gray-500">To Win</div>
                      <div className="font-semibold text-lg">{homeThresholds.games_to_win}</div>
                    </div>
                    {homeThresholds.games_to_tie !== null && (
                      <div className="text-center">
                        <div className="text-gray-500">To Tie</div>
                        <div className="font-semibold text-lg">{homeThresholds.games_to_tie}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-center text-4xl font-bold mt-4">
                    0 / {homeThresholds.games_to_win}
                  </div>
                  <div className="text-center text-sm mt-2">
                    Points - {0 - (homeThresholds.games_to_tie ?? homeThresholds.games_to_win)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-center font-bold text-lg mb-2">AWAY</div>
              {/* Two-column layout: Player stats and match stats */}
              <div className="grid grid-cols-[55%_45%] gap-2">
                {/* Player stats table */}
                <div className="border border-gray-300 rounded bg-orange-50">
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-xs font-semibold border-b border-gray-300 p-1">
                    <div className="text-center">H/C</div>
                    <div>Name</div>
                    <div className="text-center">W</div>
                    <div className="text-center">L</div>
                  </div>
                  {/* Team row */}
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1 font-semibold border-b border-gray-300">
                    <div className="text-center">0</div>
                    <div className="truncate">Team</div>
                    <div className="text-center">0</div>
                    <div className="text-center">0</div>
                  </div>
                  {/* Player rows */}
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">{awayLineup.player1_handicap}</div>
                    <div className="truncate">{getPlayerDisplayName(awayLineup.player1_id)}</div>
                    <div className="text-center">0</div>
                    <div className="text-center">0</div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">{awayLineup.player2_handicap}</div>
                    <div className="truncate">{getPlayerDisplayName(awayLineup.player2_id)}</div>
                    <div className="text-center">0</div>
                    <div className="text-center">0</div>
                  </div>
                  <div className="grid grid-cols-[2.5rem_6rem_2rem_2rem] gap-1 text-sm py-1 px-1">
                    <div className="text-center">{awayLineup.player3_handicap}</div>
                    <div className="truncate">{getPlayerDisplayName(awayLineup.player3_id)}</div>
                    <div className="text-center">0</div>
                    <div className="text-center">0</div>
                  </div>
                </div>

                {/* Match stats card */}
                <div className="border border-gray-300 rounded p-2 bg-orange-50">
                  <div className="flex justify-around text-xs mb-2">
                    <div className="text-center">
                      <div className="text-gray-500">To Win</div>
                      <div className="font-semibold text-lg">{awayThresholds.games_to_win}</div>
                    </div>
                    {awayThresholds.games_to_tie !== null && (
                      <div className="text-center">
                        <div className="text-gray-500">To Tie</div>
                        <div className="font-semibold text-lg">{awayThresholds.games_to_tie}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-center text-4xl font-bold mt-4">
                    0 / {awayThresholds.games_to_win}
                  </div>
                  <div className="text-center text-sm mt-2">
                    Points - {0 - (awayThresholds.games_to_tie ?? awayThresholds.games_to_win)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game list section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed header */}
        <div className="flex-shrink-0 px-4 pt-4 pb-2 bg-gray-50">
          <div className="text-sm font-semibold mb-4">
            Games Complete - <span className="text-lg">0 / 18</span>
          </div>
          {/* Column headers */}
          <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-xs text-gray-500 pb-2">
            <div></div>
            <div className="text-center">Break</div>
            <div className="text-center font-semibold">vs</div>
            <div className="text-center">Rack</div>
          </div>
        </div>

        {/* Scrollable game list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            {getAllGames().map(game => {
            const homePlayerId = homeLineup[`player${game.homePlayerPosition}_id` as keyof Lineup] as string;
            const awayPlayerId = awayLineup[`player${game.awayPlayerPosition}_id` as keyof Lineup] as string;
            const homePlayerName = getPlayerDisplayName(homePlayerId);
            const awayPlayerName = getPlayerDisplayName(awayPlayerId);

            // Determine who breaks and who racks, and which team they're from
            const breakerName = game.homeAction === 'breaks' ? homePlayerName : awayPlayerName;
            const rackerName = game.homeAction === 'racks' ? homePlayerName : awayPlayerName;
            const breakerIsHome = game.homeAction === 'breaks';
            const rackerIsHome = game.homeAction === 'racks';

            return (
              <div key={game.gameNumber} className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-sm py-2 border-b">
                <div className="font-semibold">{game.gameNumber}.</div>
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full ${breakerIsHome ? 'bg-blue-100 hover:bg-blue-200' : 'bg-orange-100 hover:bg-orange-200'}`}
                  >
                    {breakerName}
                  </Button>
                </div>
                <div className="text-center font-semibold text-gray-400">vs</div>
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full ${rackerIsHome ? 'bg-blue-100 hover:bg-blue-200' : 'bg-orange-100 hover:bg-orange-200'}`}
                  >
                    {rackerName}
                  </Button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
