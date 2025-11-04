/**
 * @fileoverview Team Schedule Page (Player View)
 *
 * Mobile-first schedule showing all matches for a specific team.
 * Players can see dates, opponents, venues, and access score entry.
 *
 * Flow: My Teams → View Schedule → See all team matches
 */

import { useParams, Link } from 'react-router-dom';
import { useMatchesByTeam, useTeamDetails } from '@/api/hooks';
import type { MatchWithDetails } from '@/api/queries/matches';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ArrowLeft, Trophy } from 'lucide-react';
import { parseLocalDate } from '@/utils/formatters';
import { TeamNameLink } from '@/components/TeamNameLink';

export function TeamSchedule() {
  const { teamId } = useParams<{ teamId: string }>();

  // Fetch team details and matches using TanStack Query hooks
  const { data: team, isLoading: teamLoading, error: teamError } = useTeamDetails(teamId);
  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useMatchesByTeam(teamId);

  const loading = teamLoading || matchesLoading;
  const error = teamError || matchesError ? 'Failed to load team schedule' : null;

  /**
   * Determine if this team is home or away
   */
  const getTeamRole = (match: MatchWithDetails): 'home' | 'away' | null => {
    if (match.home_team_id === teamId) return 'home';
    if (match.away_team_id === teamId) return 'away';
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading schedule...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error || 'Team not found'}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile First */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <Link to="/my-teams" className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <ArrowLeft className="h-4 w-4" />
            Back to My Teams
          </Link>
          <div className="text-4xl font-semibold text-gray-900">{team.team_name}</div>
          <p className="text-xs text-gray-600">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
        {matches.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No matches scheduled yet</p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {matches.map((match) => {
              const teamRole = getTeamRole(match);
              const opponent =
                teamRole === 'home' ? match.away_team : match.home_team;

              return (
                <AccordionItem
                  key={match.id}
                  value={match.id}
                  className="bg-white border rounded-lg shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-4 hover:no-underline">
                    <div className="flex items-center gap-3 w-full pr-4 text-left">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {match.scheduled_date ? (
                          <span>
                            {parseLocalDate(match.scheduled_date).toLocaleDateString(
                              'en-US',
                              {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Date TBD</span>
                        )}
                      </div>
                      {/* Matchup */}
                      <div className="font-semibold text-base text-gray-900">
                        vs{' '}
                        {opponent ? (
                          <TeamNameLink
                            teamId={opponent.id}
                            teamName={opponent.team_name}
                          />
                        ) : (
                          'BYE'
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4 pt-2">
                      {/* Home/Away Indicator */}
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">
                          {teamRole === 'home' ? 'Home Game' : 'Away Game'}
                        </span>
                      </div>

                      {/* Venue */}
                      {match.scheduled_venue && (
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
                            <MapPin className="h-4 w-4" />
                            <span>Venue</span>
                          </div>
                          <div className="ml-6">
                            <p className="text-base text-gray-900">
                              {match.scheduled_venue.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {match.scheduled_venue.city}, {match.scheduled_venue.state}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      {match.status === 'scheduled' && (
                        <Link to={`/match/${match.id}/lineup`} className="block pt-2">
                          <Button className="w-full">
                            <Trophy className="h-4 w-4 mr-2" />
                            Score Match
                          </Button>
                        </Link>
                      )}
                      {match.status === 'in_progress' && (
                        <Link to={`/match/${match.id}/score`} className="block pt-2">
                          <Button className="w-full">
                            <Trophy className="h-4 w-4 mr-2" />
                            Continue Scoring
                          </Button>
                        </Link>
                      )}
                      {match.status === 'completed' && (
                        <Link to={`/match/${match.id}/results`} className="block pt-2">
                          <Button variant="outline" className="w-full">
                            View Results
                          </Button>
                        </Link>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </main>
    </div>
  );
}
