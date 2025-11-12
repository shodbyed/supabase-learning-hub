/**
 * @fileoverview MyTeams Page
 *
 * Mobile-first accordion view of all teams the logged-in user is on.
 * Each team expands to show full details including roster, venue, and actions.
 *
 * Flow: Dashboard → My Teams (accordion list) → Expand to see details
 */

import { useContext, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UserContext } from '@/context/UserContext';
import { useMemberId } from '@/api/hooks';
import { usePlayerTeams, useCaptainTeamEditData, useMatchesByTeam } from '@/api/hooks';
import { queryKeys } from '@/api/queryKeys';
import { TeamEditorModal } from '@/operator/TeamEditorModal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatPartialMemberNumber } from '@/types/member';
import { formatGameType, formatDayOfWeek } from '@/types/league';
import { PlayerNameLink } from '@/components/PlayerNameLink';
import { PageHeader } from '@/components/PageHeader';
import { MapPin, Users, AlertCircle, ArrowRight } from 'lucide-react';
import { parseLocalDate } from '@/utils/formatters';
import { TenBallIcon } from '@/components/icons/TenBallIcon';
import { NineBallIcon } from '@/components/icons/NineBallIcon';
import { EightBallIcon } from '@/components/icons/EightBallIcon';

interface TeamData {
  team_id: string;
  teams: {
    id: string;
    team_name: string;
    captain_id: string;
    roster_size: number;
    captain: {
      id: string;
      first_name: string;
      last_name: string;
      system_player_number: number;
      bca_member_number: string | null;
    };
    venue: {
      id: string;
      name: string;
    } | null;
    team_players: Array<{
      member_id: string;
      is_captain: boolean;
      members: {
        id: string;
        first_name: string;
        last_name: string;
        system_player_number: number;
        bca_member_number: string | null;
      };
    }>;
    season: {
      id: string;
      season_name: string;
      league: {
        id: string;
        game_type: string;
        day_of_week: string;
        division: string | null;
      };
    };
  };
}

/**
 * Team accordion item component
 * Renders a single team with next match info and quick actions
 */
function TeamAccordionItem({
  teamData,
  memberId,
  onEditTeam,
}: {
  teamData: TeamData;
  memberId: string | null;
  onEditTeam: (teamId: string) => void;
}) {
  const team = teamData.teams;
  const isCaptain = team.captain_id === memberId;

  // Fetch all matches to find makeups and upcoming
  const { data: allMatches = [] } = useMatchesByTeam(team.id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find makeup matches (past date, not completed)
  const makeupMatches = allMatches
    .filter(match => {
      if (match.status === 'completed') return false;
      if (!match.scheduled_date) return false;

      const [year, month, day] = match.scheduled_date.split('-').map(Number);
      const scheduledDate = new Date(year, month - 1, day);
      scheduledDate.setHours(0, 0, 0, 0);

      return scheduledDate < today;
    })
    .sort((a, b) => a.scheduled_date!.localeCompare(b.scheduled_date!)); // Oldest first

  // Find upcoming matches (in_progress or future scheduled)
  const upcomingMatches = allMatches
    .filter(match => {
      if (match.status === 'completed') return false;
      if (match.status === 'in_progress') return true;
      if (!match.scheduled_date) return false;

      const [year, month, day] = match.scheduled_date.split('-').map(Number);
      const scheduledDate = new Date(year, month - 1, day);
      scheduledDate.setHours(0, 0, 0, 0);

      return scheduledDate >= today;
    })
    .sort((a, b) => {
      // in_progress first, then by date
      if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
      if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
      return a.scheduled_date!.localeCompare(b.scheduled_date!);
    })
    .slice(0, 1); // Only show next upcoming

  // Combine makeup + upcoming for display in header
  const actionableMatches = [...makeupMatches, ...upcomingMatches];

  // Calculate team readiness
  const minRoster = team.roster_size === 5 ? 3 : 5;
  const hasVenue = team.venue !== null;
  const hasMinRoster = team.team_players.length >= minRoster;
  const isReady = hasVenue && hasMinRoster;

  // Filter out captain from roster
  const nonCaptainPlayers = team.team_players.filter(p => !p.is_captain);

  // Get the appropriate ball icon based on game type
  const getBallIcon = () => {
    const gameType = team.season.league.game_type.toLowerCase();
    const iconSize = 24;

    if (gameType.includes('8')) {
      return <EightBallIcon size={iconSize} />;
    } else if (gameType.includes('9')) {
      return <NineBallIcon size={iconSize} />;
    } else if (gameType.includes('10')) {
      return <TenBallIcon size={iconSize} />;
    }
    // Default to 8-ball if unknown
    return <EightBallIcon size={iconSize} />;
  };

  return (
    <AccordionItem
      key={team.id}
      value={team.id}
      className="bg-white border rounded-lg shadow-sm"
    >
      <AccordionTrigger className="px-4 py-4 hover:no-underline">
        <div className="flex flex-col gap-2 w-full pr-4 text-left">
          {/* Row 1: Team name and game info */}
          <div className="flex items-center justify-between w-full">
            <h2 className="font-semibold text-xl text-gray-900">
              {team.team_name}
            </h2>
            <div className="flex items-center gap-2 font-semibold text-xl text-gray-600">
              {getBallIcon()}
              <span>
                {formatGameType(team.season.league.game_type as any)} •{' '}
                {formatDayOfWeek(team.season.league.day_of_week as any)}
              </span>
            </div>
          </div>

          {/* Rows 2+: Actionable matches (makeups + upcoming) */}
          {/* TODO: VERIFY ACTIONABLE MATCHES DISPLAY */}
          {/* Once you have makeup matches and upcoming matches, verify: */}
          {/* 1. Makeup matches show with orange "MAKEUP" tag */}
          {/* 2. Upcoming matches show with blue "UPCOMING" or "IN PROGRESS" tag */}
          {/* 3. Quick Score buttons work for all matches */}
          {/* 4. Accordion height expands nicely for multiple matches */}
          {actionableMatches.length > 0 ? (
            actionableMatches.map((match) => {
              const isMakeup = makeupMatches.some(m => m.id === match.id);
              const isInProgress = match.status === 'in_progress';
              const tagText = isMakeup ? 'MAKEUP' : isInProgress ? 'IN PROGRESS' : 'UPCOMING';
              const tagColor = isMakeup ? 'text-orange-700 bg-orange-100' : 'text-blue-700 bg-blue-100';

              return (
                <div key={match.id} className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-base text-gray-800">
                    <span>
                      {match.season_week?.week_name || 'Week ?'} -{' '}
                      {parseLocalDate(match.scheduled_date!).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${tagColor}`}>
                      {tagText}
                    </span>
                    <Link
                      to={`/match/${match.id}/lineup`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`text-xs px-2 h-7 ${
                          isMakeup
                            ? 'text-orange-700 hover:text-orange-800 hover:bg-orange-50'
                            : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                        }`}
                      >
                        Quick Score <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-gray-400 italic">No upcoming matches</div>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4 pt-2">
          {/* Team Readiness Warning (Captains Only) */}
          {isCaptain && !isReady && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-900">
                    Team Setup Incomplete
                  </p>
                  <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                    {!hasVenue && <li>• Home venue required</li>}
                    {!hasMinRoster && (
                      <li>
                        • Minimum {minRoster} players required (
                        {team.team_players.length}/{team.roster_size} currently)
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Home Venue */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
              <MapPin className="h-4 w-4" />
              <span>Home Venue</span>
            </div>
            <p className="text-base text-gray-900 ml-6">
              {team.venue?.name || 'No venue assigned'}
            </p>
          </div>

          {/* Captain */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
              <Users className="h-4 w-4" />
              <span>Captain</span>
            </div>
            <div
              className={`text-base ml-6 ${
                team.captain.id === memberId
                  ? 'font-semibold text-blue-600'
                  : 'text-gray-900'
              }`}
            >
              <PlayerNameLink
                playerId={team.captain.id}
                playerName={`${team.captain.first_name} ${team.captain.last_name}`}
                className={team.captain.id === memberId ? 'font-semibold' : ''}
              />{' '}
              {formatPartialMemberNumber(team.captain)}
            </div>
          </div>

          {/* Roster */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Roster ({team.team_players.length}/{team.roster_size})
            </p>
            <ul className="space-y-1 ml-6">
              {nonCaptainPlayers.map((player) => (
                <li
                  key={player.member_id}
                  className={`text-sm ${
                    player.member_id === memberId
                      ? 'font-semibold text-blue-600'
                      : 'text-gray-900'
                  }`}
                >
                  <PlayerNameLink
                    playerId={player.members.id}
                    playerName={`${player.members.first_name} ${player.members.last_name}`}
                    className={player.member_id === memberId ? 'font-semibold' : ''}
                  />{' '}
                  {formatPartialMemberNumber(player.members)}
                </li>
              ))}
              {/* Empty roster slots */}
              {Array.from({
                length: team.roster_size - team.team_players.length,
              }).map((_, index) => (
                <li
                  key={`empty-${index}`}
                  className="text-sm text-gray-400 italic ml-6"
                >
                  Player {nonCaptainPlayers.length + index + 2}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <Link to={`/team/${team.id}/schedule`} className="block">
              <Button variant="outline" className="w-full">
                View Schedule
              </Button>
            </Link>
          </div>

          {/* Edit Team Button (Captains Only) */}
          {isCaptain && (
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => onEditTeam(team.id)}
            >
              Edit Team
            </Button>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function MyTeams() {
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();
  const memberId = useMemberId();

  // Fetch teams using TanStack Query
  const { data: teamsData = [], isLoading: loading, error: teamsError } = usePlayerTeams(memberId);
  const teams = (teamsData || []) as unknown as TeamData[];
  const error = teamsError ? 'Unable to load your teams' : null;

  // Team editing modal state
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  // Fetch edit data when team is selected for editing
  const { data: editData, isLoading: loadingEditData } = useCaptainTeamEditData(editingTeamId);

  // Handle edit button click
  const handleEditTeam = (teamId: string) => {
    setEditingTeamId(teamId);
  };

  // Handle successful team update
  const handleTeamUpdateSuccess = async () => {
    setEditingTeamId(null);

    // Invalidate teams cache to refetch updated data
    if (memberId) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.teams.byMember(memberId),
      });
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setEditingTeamId(null);
  };

  if (userContext?.loading || loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-muted-foreground">Loading your teams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-destructive">{error}</p>
      </div>
    );
  }

  if (!userContext?.isLoggedIn) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-muted-foreground">
          Please log in to view your teams
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        backTo="/dashboard"
        backLabel="Back to Dashboard"
        title="My Teams"
      />

      {/* Main Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
        {teams.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">You are not currently on any teams</p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {teams.map((teamData) => (
              <TeamAccordionItem
                key={teamData.teams.id}
                teamData={teamData}
                memberId={memberId}
                onEditTeam={handleEditTeam}
              />
            ))}
          </Accordion>
        )}
      </main>

      {/* Team Editor Modal for Captains */}
      {editingTeamId && editData && !loadingEditData && (
        <TeamEditorModal
          leagueId={editData.leagueId}
          seasonId={editData.seasonId}
          teamFormat={editData.teamFormat}
          venues={editData.venues}
          leagueVenues={editData.leagueVenues}
          members={editData.members}
          defaultTeamName={editData.team.team_name}
          allTeams={editData.allTeams}
          existingTeam={{
            id: editData.team.id,
            team_name: editData.team.team_name,
            captain_id: editData.team.captain_id,
            home_venue_id: editData.team.home_venue_id,
            roster_size: editData.team.roster_size,
          }}
          onSuccess={handleTeamUpdateSuccess}
          onCancel={handleCancelEdit}
          variant="captain"
        />
      )}
    </div>
  );
}
