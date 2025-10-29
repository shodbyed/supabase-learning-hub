/**
 * @fileoverview Match Lineup Page
 *
 * Mobile-first lineup selection page where players choose their 3-player lineup
 * before starting a match. Shows player handicaps and calculates team total.
 *
 * Flow: Team Schedule → Score Match → Lineup Entry
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Calendar, MapPin, Users, Lock, CheckCircle } from 'lucide-react';
import { parseLocalDate } from '@/utils/formatters';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { TeamNameLink } from '@/components/TeamNameLink';
import { PlayerNameLink } from '@/components/PlayerNameLink';
import {
  calculatePlayerHandicap,
  calculateTeamHandicap,
  type HandicapVariant,
} from '@/utils/handicapCalculations';

interface Match {
  id: string;
  scheduled_date: string;
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
  scheduled_venue: {
    id: string;
    name: string;
    city: string;
    state: string;
  } | null;
  season_week: {
    scheduled_date: string;
  } | null;
}

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  handicap: number; // Mock for now - will calculate from game history later
}

export function MatchLineup() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { memberId, loading: memberLoading } = useCurrentMember();

  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Team handicap bonus (only for home team)
  const [teamHandicap, setTeamHandicap] = useState<number>(0);

  // Lineup selection (value is UUID or "SUBSTITUTE")
  const [player1Id, setPlayer1Id] = useState<string>('');
  const [player2Id, setPlayer2Id] = useState<string>('');
  const [player3Id, setPlayer3Id] = useState<string>('');
  const [lineupLocked, setLineupLocked] = useState(false);

  // Substitute handicap (only used if one player is "SUBSTITUTE")
  const [subHandicap, setSubHandicap] = useState<string>('');

  // Opponent lineup status
  const [opponentLineup, setOpponentLineup] = useState<any>(null);

  // Determine user's team
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [isHomeTeam, setIsHomeTeam] = useState<boolean | null>(null);

  // Lineup ID (for updates after initial save)
  const [lineupId, setLineupId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatchAndLineup() {
      // Wait for member data to load
      if (memberLoading) return;

      if (!matchId || !memberId) {
        setError('Missing match or member information');
        setLoading(false);
        return;
      }

      try {
        // Fetch match details with league handicap variants
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select(`
            id,
            home_team_id,
            away_team_id,
            season_id,
            home_team:teams!matches_home_team_id_fkey(id, team_name),
            away_team:teams!matches_away_team_id_fkey(id, team_name),
            scheduled_venue:venues!matches_scheduled_venue_id_fkey(id, name, city, state),
            season_week:season_weeks(scheduled_date),
            season:seasons!matches_season_id_fkey(
              league:leagues(handicap_variant, team_handicap_variant)
            )
          `)
          .eq('id', matchId)
          .single();

        if (matchError) throw matchError;

        console.log('Match data received:', matchData);

        // Extract handicap variants from nested league data
        const seasonData = Array.isArray(matchData.season)
          ? matchData.season[0]
          : matchData.season;
        const leagueData = seasonData && Array.isArray((seasonData as any).league)
          ? (seasonData as any).league[0]
          : (seasonData as any)?.league;
        const playerVariant = (leagueData?.handicap_variant || 'standard') as HandicapVariant;
        const teamVariant = (leagueData?.team_handicap_variant || 'standard') as HandicapVariant;
        console.log('League handicap variants:', { playerVariant, teamVariant });

        // Transform to include scheduled_date - handle both array and object formats
        const homeTeam = Array.isArray(matchData.home_team)
          ? matchData.home_team[0]
          : matchData.home_team;
        const awayTeam = Array.isArray(matchData.away_team)
          ? matchData.away_team[0]
          : matchData.away_team;
        const venue = Array.isArray(matchData.scheduled_venue)
          ? matchData.scheduled_venue[0]
          : matchData.scheduled_venue;
        const seasonWeek = Array.isArray(matchData.season_week)
          ? matchData.season_week[0]
          : matchData.season_week;

        const transformedMatch: Match = {
          id: matchData.id,
          scheduled_date: (seasonWeek as any)?.scheduled_date || '',
          season_id: matchData.season_id,
          home_team_id: matchData.home_team_id,
          away_team_id: matchData.away_team_id,
          home_team: homeTeam as any || null,
          away_team: awayTeam as any || null,
          scheduled_venue: venue as any || null,
          season_week: seasonWeek as any || null,
        };

        console.log('Transformed match:', transformedMatch);
        setMatch(transformedMatch);

        // Calculate team handicap (only for home team)
        const calculatedTeamHandicap = await calculateTeamHandicap(
          matchData.home_team_id,
          matchData.away_team_id,
          matchData.season_id,
          teamVariant,
          true // useRandom = true for testing until we have standings
        );
        setTeamHandicap(calculatedTeamHandicap);
        console.log('Team handicap calculated:', calculatedTeamHandicap);

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
        console.log('User team determination:', {
          userTeam,
          homeTeamId: matchData.home_team_id,
          awayTeamId: matchData.away_team_id,
          isHome,
        });
        setUserTeamId(userTeam);
        setIsHomeTeam(isHome);

        // Fetch all players on user's team
        const { data: playersData, error: playersError } = await supabase
          .from('team_players')
          .select(`
            members:members!team_players_member_id_fkey(
              id,
              first_name,
              last_name,
              nickname
            )
          `)
          .eq('team_id', userTeam);

        if (playersError) throw playersError;

        // Calculate handicaps for all players (use random for testing until scoring is built)
        const transformedPlayers = await Promise.all(
          (playersData || []).map(async (p: any) => {
            const handicap = await calculatePlayerHandicap(
              p.members.id,
              playerVariant,
              true // useRandom = true for testing until we have game history
            );

            return {
              id: p.members.id,
              first_name: p.members.first_name,
              last_name: p.members.last_name,
              nickname: p.members.nickname,
              handicap,
            };
          })
        );

        console.log('Players with calculated handicaps:', transformedPlayers);
        setPlayers(transformedPlayers);

        // Check if lineup already exists for this team
        const { data: existingLineup, error: lineupError } = await supabase
          .from('match_lineups')
          .select('*')
          .eq('match_id', matchId)
          .eq('team_id', userTeam)
          .maybeSingle();

        if (!lineupError && existingLineup) {
          // Load existing lineup and use stored handicaps for consistency
          console.log('Loading existing lineup from database:', existingLineup);

          setLineupId(existingLineup.id);
          setPlayer1Id(existingLineup.player1_id || 'SUBSTITUTE');
          setPlayer2Id(existingLineup.player2_id || 'SUBSTITUTE');
          setPlayer3Id(existingLineup.player3_id || 'SUBSTITUTE');
          setLineupLocked(existingLineup.locked);

          // Update players array with stored handicaps to ensure consistency
          // across all team members viewing this lineup
          const updatedPlayers = transformedPlayers.map((player) => {
            if (player.id === existingLineup.player1_id) {
              return { ...player, handicap: parseFloat(existingLineup.player1_handicap) };
            }
            if (player.id === existingLineup.player2_id) {
              return { ...player, handicap: parseFloat(existingLineup.player2_handicap) };
            }
            if (player.id === existingLineup.player3_id) {
              return { ...player, handicap: parseFloat(existingLineup.player3_handicap) };
            }
            return player;
          });
          setPlayers(updatedPlayers);

          // If any player is a substitute, get the handicap
          if (!existingLineup.player1_id) {
            setSubHandicap(existingLineup.player1_handicap.toString());
          } else if (!existingLineup.player2_id) {
            setSubHandicap(existingLineup.player2_handicap.toString());
          } else if (!existingLineup.player3_id) {
            setSubHandicap(existingLineup.player3_handicap.toString());
          }
        }

        // Fetch opponent's lineup
        const opponentTeamId = isHome ? matchData.away_team_id : matchData.home_team_id;
        const { data: opponentLineupData } = await supabase
          .from('match_lineups')
          .select('*')
          .eq('match_id', matchId)
          .eq('team_id', opponentTeamId)
          .maybeSingle();

        if (opponentLineupData) {
          setOpponentLineup(opponentLineupData);
        }
      } catch (err: any) {
        console.error('Error fetching match/lineup:', err);
        setError(err.message || 'Failed to load match information');
      } finally {
        setLoading(false);
      }
    }

    fetchMatchAndLineup();
  }, [matchId, memberId, memberLoading]);

  // Real-time subscription for opponent lineup changes
  useEffect(() => {
    if (!matchId || !match || isHomeTeam === null) return;

    const opponentTeamId = isHomeTeam ? match.away_team_id : match.home_team_id;

    console.log('Setting up real-time subscription:', {
      matchId,
      userTeamId,
      opponentTeamId,
      isHomeTeam,
    });

    // Subscribe to opponent's lineup changes
    const channel = supabase
      .channel(`match-lineup-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_lineups',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          console.log('Real-time event received:', payload);
          console.log('Opponent team ID:', opponentTeamId);
          console.log('Event team ID:', (payload.new as any)?.team_id);

          // Only update if it's the opponent's lineup
          if (payload.new && (payload.new as any).team_id === opponentTeamId) {
            console.log('Updating opponent lineup state');
            setOpponentLineup(payload.new);
          } else {
            console.log('Ignoring event - not opponent team');
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [matchId, match, isHomeTeam, userTeamId]);

  // Auto-navigate to scoring page when both lineups are locked
  useEffect(() => {
    if (lineupLocked && opponentLineup?.locked) {
      console.log('Both lineups locked - navigating to scoring page');
      navigate(`/match/${matchId}/score`);
    }
  }, [lineupLocked, opponentLineup, matchId, navigate]);

  /**
   * Helper: Check if any player is a substitute
   */
  const hasSub = (): boolean => {
    return player1Id === 'SUBSTITUTE' || player2Id === 'SUBSTITUTE' || player3Id === 'SUBSTITUTE';
  };

  /**
   * Helper: Get the highest handicap of players NOT in the lineup
   */
  const getHighestUnusedHandicap = (): number => {
    const usedPlayerIds = [player1Id, player2Id, player3Id].filter(
      (id) => id && id !== 'SUBSTITUTE'
    );
    const unusedPlayers = players.filter((p) => !usedPlayerIds.includes(p.id));

    if (unusedPlayers.length === 0) return 0;

    return Math.max(...unusedPlayers.map((p) => p.handicap));
  };

  /**
   * Helper: Get handicap for a player slot
   */
  const getPlayerHandicap = (playerId: string): number => {
    if (playerId === 'SUBSTITUTE') {
      const highestUnused = getHighestUnusedHandicap();

      // If sub handicap is manually entered, use the HIGHER of the two
      if (subHandicap) {
        const subValue = parseFloat(subHandicap);
        return Math.max(subValue, highestUnused);
      }

      // Otherwise use highest handicap of unused players
      return highestUnused;
    }
    const player = players.find((p) => p.id === playerId);
    return player?.handicap || 0;
  };

  /**
   * Helper: Format handicap display (show whole number if .0, otherwise 1 decimal)
   */
  const formatHandicap = (handicap: number): string => {
    return handicap % 1 === 0 ? handicap.toString() : handicap.toFixed(1);
  };

  /**
   * Calculate total player handicap (sum of 3 players)
   */
  const calculatePlayerHandicapTotal = (): number => {
    const h1 = getPlayerHandicap(player1Id);
    const h2 = getPlayerHandicap(player2Id);
    const h3 = getPlayerHandicap(player3Id);

    const total = h1 + h2 + h3;
    return Math.round(total * 10) / 10; // Round to 1 decimal
  };

  /**
   * Calculate final team total (player handicaps + team bonus for home team)
   */
  const calculateFinalTeamHandicap = (): number => {
    const playerTotal = calculatePlayerHandicapTotal();

    // Only home team gets team handicap bonus
    const bonus = isHomeTeam ? teamHandicap : 0;

    return Math.round((playerTotal + bonus) * 10) / 10; // Round to 1 decimal
  };

  /**
   * Check if lineup is complete
   */
  const isLineupComplete = (): boolean => {
    const playersSelected = !!(player1Id && player2Id && player3Id);
    // If there's a sub, handicap must be selected
    if (hasSub()) {
      return playersSelected && !!subHandicap;
    }
    return playersSelected;
  };

  /**
   * Handle lock lineup - Save to database and lock
   */
  const handleLockLineup = async () => {
    if (!isLineupComplete()) {
      alert('Please select all 3 players before locking your lineup');
      return;
    }

    if (!matchId || !userTeamId) {
      alert('Error: Missing match or team information');
      return;
    }

    try {
      // Verify user is on the team
      const { data: teamCheck, error: teamCheckError } = await supabase
        .from('team_players')
        .select('*')
        .eq('team_id', userTeamId)
        .eq('member_id', memberId)
        .single();

      console.log('Team membership check:', {
        userTeamId,
        memberId,
        teamCheck,
        error: teamCheckError,
      });

      if (teamCheckError || !teamCheck) {
        throw new Error('You are not a member of this team');
      }

      // Prepare lineup data
      const lineupData = {
        match_id: matchId,
        team_id: userTeamId,
        player1_id: player1Id === 'SUBSTITUTE' ? null : player1Id,
        player1_handicap: getPlayerHandicap(player1Id),
        player2_id: player2Id === 'SUBSTITUTE' ? null : player2Id,
        player2_handicap: getPlayerHandicap(player2Id),
        player3_id: player3Id === 'SUBSTITUTE' ? null : player3Id,
        player3_handicap: getPlayerHandicap(player3Id),
        locked: true,
      };

      console.log('Attempting to save lineup:', lineupData);

      let result;

      if (lineupId) {
        // Update existing lineup
        result = await supabase
          .from('match_lineups')
          .update(lineupData)
          .eq('id', lineupId)
          .select()
          .single();
      } else {
        // Insert new lineup
        result = await supabase
          .from('match_lineups')
          .insert(lineupData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Database error details:', {
          code: result.error.code,
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint,
          lineupData,
        });
        throw result.error;
      }

      // Update local state
      setLineupId(result.data.id);
      setLineupLocked(true);

      console.log('Lineup locked successfully:', result.data);
    } catch (err: any) {
      console.error('Error saving lineup:', err);
      alert(`Failed to save lineup: ${err.message || 'Unknown error'}`);
    }
  };

  /**
   * Handle unlock lineup - Only allowed if opponent hasn't locked yet
   */
  const handleUnlockLineup = async () => {
    if (!lineupId) {
      alert('Error: No lineup to unlock');
      return;
    }

    try {
      const result = await supabase
        .from('match_lineups')
        .update({ locked: false, locked_at: null })
        .eq('id', lineupId)
        .select()
        .single();

      if (result.error) throw result.error;

      setLineupLocked(false);
      console.log('Lineup unlocked successfully:', result.data);
    } catch (err: any) {
      console.error('Error unlocking lineup:', err);
      alert('Failed to unlock lineup. Please try again.');
    }
  };

  /**
   * Get opponent team info
   */
  const getOpponentTeam = () => {
    if (!match) return null;
    const opponent = isHomeTeam ? match.away_team : match.home_team;
    console.log('Getting opponent:', { isHomeTeam, opponent, match });
    return opponent;
  };

  if (loading || memberLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading match...</p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error || 'Match not found'}</p>
            <Link to="/my-teams">
              <Button variant="outline" className="mt-4">
                Back to My Teams
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const opponent = getOpponentTeam();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <Link
            to={`/team/${userTeamId}/schedule`}
            className="flex items-center gap-2 text-sm text-gray-600 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schedule
          </Link>
          <div className="text-4xl font-semibold text-gray-900">Lineup Entry</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Match Info Card */}
        <Card>
          <CardContent className="px-4 py-0 space-y-1">
            {/* Date */}
            {match.scheduled_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {parseLocalDate(match.scheduled_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}

            {/* Matchup */}
            <div className="text-lg font-semibold text-gray-900">
              vs{' '}
              {opponent ? (
                <TeamNameLink teamId={opponent.id} teamName={opponent.team_name} />
              ) : (
                'BYE'
              )}
            </div>

            {/* Home/Away & Venue on same line */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium">
                {isHomeTeam ? 'Home Game' : 'Away Game'}
              </span>
              {match.scheduled_venue && (
                <>
                  <span>@</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {match.scheduled_venue.name}, {match.scheduled_venue.city}, {match.scheduled_venue.state}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lineup Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Your Lineup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Available Players List */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Available Players ({players.length})
              </p>
              <div>
                <div className="flex gap-3 text-xs font-medium text-gray-500 pb-1 border-b">
                  <span className="flex-1">Player Name</span>
                  <span className="w-20">Nickname</span>
                  <span className="w-12 text-center">H/C</span>
                </div>
                <div className="space-y-1 mt-1">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex gap-3 text-sm py-1 px-2 bg-gray-50 rounded items-center"
                    >
                      <div className="flex-1">
                        <PlayerNameLink
                          playerId={player.id}
                          playerName={`${player.first_name} ${player.last_name}`}
                        />
                      </div>
                      <span className="text-gray-600 text-xs w-20 truncate">{player.nickname || '-'}</span>
                      <span className="text-gray-600 w-12 text-center">{formatHandicap(player.handicap)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Player Selection Dropdowns */}
            <div className="pt-2">
              {/* Header Row */}
              <div className="flex gap-3 items-center pb-1 border-b">
                <div className="w-12 text-center">
                  <div className="text-xs font-medium text-gray-500">Player</div>
                </div>
                <div className="w-12 text-center">
                  <div className="text-xs font-medium text-gray-500">H/C</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-500">Player Name</div>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                {/* Player 1 */}
                <div className="flex gap-3 items-center">
                  <div className="w-12 text-center">
                    <div className="text-sm font-semibold text-gray-700">1</div>
                  </div>
                  <div className="w-12 text-center">
                    <div className="text-sm font-semibold text-blue-600">
                      {player1Id ? formatHandicap(getPlayerHandicap(player1Id)) : '-'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Select
                      value={player1Id}
                      onValueChange={setPlayer1Id}
                      disabled={lineupLocked}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Player 1" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player) => (
                          <SelectItem
                            key={player.id}
                            value={player.id}
                            disabled={player.id === player2Id || player.id === player3Id}
                          >
                            {player.nickname || `${player.first_name} ${player.last_name}`}
                          </SelectItem>
                        ))}
                        <SelectItem value="SUBSTITUTE" disabled={hasSub() && player1Id !== 'SUBSTITUTE'}>
                          Substitute
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {player1Id === 'SUBSTITUTE' && (
                    <div className="flex-1">
                      <Select
                        value={subHandicap}
                        onValueChange={setSubHandicap}
                        disabled={lineupLocked}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sub H/C" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">+2</SelectItem>
                          <SelectItem value="1">+1</SelectItem>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="-1">-1</SelectItem>
                          <SelectItem value="-2">-2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Player 2 */}
                <div className="flex gap-3 items-center">
                  <div className="w-12 text-center">
                    <div className="text-sm font-semibold text-gray-700">2</div>
                  </div>
                  <div className="w-12 text-center">
                    <div className="text-sm font-semibold text-blue-600">
                      {player2Id ? formatHandicap(getPlayerHandicap(player2Id)) : '-'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Select
                      value={player2Id}
                      onValueChange={setPlayer2Id}
                      disabled={lineupLocked}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Player 2" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player) => (
                          <SelectItem
                            key={player.id}
                            value={player.id}
                            disabled={player.id === player1Id || player.id === player3Id}
                          >
                            {player.nickname || `${player.first_name} ${player.last_name}`}
                          </SelectItem>
                        ))}
                        <SelectItem value="SUBSTITUTE" disabled={hasSub() && player2Id !== 'SUBSTITUTE'}>
                          Substitute
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {player2Id === 'SUBSTITUTE' && (
                    <div className="flex-1">
                      <Select
                        value={subHandicap}
                        onValueChange={setSubHandicap}
                        disabled={lineupLocked}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sub H/C" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">+2</SelectItem>
                          <SelectItem value="1">+1</SelectItem>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="-1">-1</SelectItem>
                          <SelectItem value="-2">-2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Player 3 */}
                <div className="flex gap-3 items-center">
                  <div className="w-12 text-center">
                    <div className="text-sm font-semibold text-gray-700">3</div>
                  </div>
                  <div className="w-12 text-center">
                    <div className="text-sm font-semibold text-blue-600">
                      {player3Id ? formatHandicap(getPlayerHandicap(player3Id)) : '-'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Select
                      value={player3Id}
                      onValueChange={setPlayer3Id}
                      disabled={lineupLocked}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Player 3" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player) => (
                          <SelectItem
                            key={player.id}
                            value={player.id}
                            disabled={player.id === player1Id || player.id === player2Id}
                          >
                            {player.nickname || `${player.first_name} ${player.last_name}`}
                          </SelectItem>
                        ))}
                        <SelectItem value="SUBSTITUTE" disabled={hasSub() && player3Id !== 'SUBSTITUTE'}>
                          Substitute
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {player3Id === 'SUBSTITUTE' && (
                    <div className="flex-1">
                      <Select
                        value={subHandicap}
                        onValueChange={setSubHandicap}
                        disabled={lineupLocked}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sub H/C" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">+2</SelectItem>
                          <SelectItem value="1">+1</SelectItem>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="-1">-1</SelectItem>
                          <SelectItem value="-2">-2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Team Handicap Display */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Player Handicaps:</span>
                <span className="font-semibold">{formatHandicap(calculatePlayerHandicapTotal())}</span>
              </div>

              {/* Always show team bonus, but indicate it only applies to home team */}
              <div className="flex justify-between items-center text-sm">
                <span className={isHomeTeam ? "text-gray-600" : "text-gray-400"}>
                  Team Bonus {isHomeTeam ? "(Applied)" : "(Home Only)"}:
                </span>
                <span className={`font-semibold ${isHomeTeam ? "text-gray-600" : "text-gray-400"}`}>
                  {teamHandicap >= 0 ? '+' : ''}{formatHandicap(teamHandicap)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold text-gray-900">Team Total Handicap:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatHandicap(calculateFinalTeamHandicap())}
                </span>
              </div>

              {!isHomeTeam && (
                <p className="text-xs text-gray-500 italic">
                  Team bonus shown above applies to home team only
                </p>
              )}
            </div>

            {/* Lock/Unlock Lineup Button */}
            {!lineupLocked ? (
              <Button
                className="w-full"
                onClick={handleLockLineup}
                disabled={!isLineupComplete()}
              >
                <Lock className="h-4 w-4 mr-2" />
                Lock Lineup
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Lineup Locked</span>
                  </div>
                </div>
                {/* Only show unlock if opponent hasn't locked yet */}
                {!opponentLineup?.locked && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleUnlockLineup}
                  >
                    Unlock Lineup
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opponent Status Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Opponent Status:</span>
              {!opponentLineup ? (
                <span className="text-sm text-gray-500">Waiting for opponent lineup...</span>
              ) : !opponentLineup.locked ? (
                <span className="text-sm text-yellow-600">Opponent selecting players...</span>
              ) : !lineupLocked ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Opponent ready - Lock your lineup to start</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Starting match...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
