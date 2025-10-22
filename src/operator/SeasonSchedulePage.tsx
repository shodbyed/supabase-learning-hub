/**
 * @fileoverview Season Schedule Page
 *
 * Displays the complete season schedule with all matches organized by week.
 * Shows matchups, venues, dates, and match status.
 * Accessible to both operators and players.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { ArrowLeft, Calendar, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { parseLocalDate } from '@/utils/formatters';
import { clearSchedule } from '@/utils/scheduleGenerator';
import type { Match } from '@/types/schedule';

interface SeasonWeek {
  id: string;
  scheduled_date: string;
  week_name: string;
  week_type: string;
  week_completed: boolean;
}

interface Team {
  id: string;
  team_name: string;
  captain_id: string;
}

interface Venue {
  id: string;
  name: string;
  street_address: string;
  city: string;
  state: string;
}

interface MatchWithDetails extends Match {
  home_team?: Team | null;
  away_team?: Team | null;
  scheduled_venue?: Venue | null;
}

interface WeekSchedule {
  week: SeasonWeek;
  matches: MatchWithDetails[];
}

/**
 * Calculate table numbers per venue within a week
 * Returns a map of match ID to table number
 */
function calculateTableNumbers(matches: MatchWithDetails[]): Map<string, number> {
  const tableNumbers = new Map<string, number>();
  const venueCounters = new Map<string, number>();

  // Sort matches by match_number to maintain consistent ordering
  const sortedMatches = [...matches].sort((a, b) => a.match_number - b.match_number);

  for (const match of sortedMatches) {
    if (match.scheduled_venue_id) {
      // Get current counter for this venue (or start at 0)
      const currentCount = venueCounters.get(match.scheduled_venue_id) || 0;
      const tableNumber = currentCount + 1;

      // Store the table number for this match
      tableNumbers.set(match.id, tableNumber);

      // Increment the counter for this venue
      venueCounters.set(match.scheduled_venue_id, tableNumber);
    }
  }

  return tableNumbers;
}

/**
 * Get styling classes and label based on week type
 */
function getWeekTypeStyle(weekType: string): { bgColor: string; badge: string; badgeColor: string } {
  switch (weekType) {
    case 'playoffs':
      return {
        bgColor: 'bg-purple-50',
        badge: '',
        badgeColor: '',
      };
    case 'blackout':
      return {
        bgColor: 'bg-gray-50',
        badge: '',
        badgeColor: '',
      };
    case 'season_end_break':
      return {
        bgColor: 'bg-yellow-50',
        badge: 'BREAK',
        badgeColor: 'bg-yellow-600 text-white',
      };
    default:
      return {
        bgColor: 'bg-gray-50',
        badge: '',
        badgeColor: '',
      };
  }
}

/**
 * SeasonSchedulePage Component
 *
 * Displays the full season schedule organized by week.
 * Shows all matchups with teams and venues.
 * Includes all week types: regular, playoffs, blackouts, and breaks.
 */
export const SeasonSchedulePage: React.FC = () => {
  const { leagueId, seasonId } = useParams<{ leagueId: string; seasonId: string }>();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState<WeekSchedule[]>([]);
  const [seasonName, setSeasonName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [accepting, setAccepting] = useState(false);

  /**
   * Handle accepting the schedule
   * Updates season status to 'active' and completes league setup
   */
  const handleAcceptSchedule = async () => {
    if (!seasonId || !leagueId) return;

    const confirmed = window.confirm(
      'Accept this schedule and activate the season? You can still make changes later if needed.'
    );
    if (!confirmed) return;

    setAccepting(true);

    try {
      // Update season status to 'active'
      const { error: updateError } = await supabase
        .from('seasons')
        .update({ status: 'active' })
        .eq('id', seasonId);

      if (updateError) throw updateError;

      console.log('✅ Season activated successfully');

      // Navigate to league dashboard
      navigate(`/league/${leagueId}`);
    } catch (err) {
      console.error('❌ Error activating season:', err);
      setError('Failed to activate season');
      setAccepting(false);
    }
  };

  /**
   * Handle clearing the schedule
   * Deletes all matches and navigates back to schedule setup
   */
  const handleClearSchedule = async () => {
    if (!seasonId) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete all matches and regenerate the schedule? This cannot be undone.'
    );
    if (!confirmed) return;

    setClearing(true);
    const result = await clearSchedule(seasonId);

    if (result.success) {
      console.log(`🗑️ Cleared ${result.matchesDeleted} matches`);
      navigate(`/league/${leagueId}/season/${seasonId}/schedule-setup`);
    } else {
      setError(result.error || 'Failed to clear schedule');
      setClearing(false);
    }
  };

  /**
   * Fetch schedule data
   */
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!seasonId || !leagueId) {
        setError('Missing season or league ID');
        setLoading(false);
        return;
      }

      try {
        // Fetch season info
        const { data: seasonData, error: seasonError } = await supabase
          .from('seasons')
          .select('id, start_date, end_date, season_length, season_name')
          .eq('id', seasonId)
          .single();

        if (seasonError) throw seasonError;

        setSeasonName(seasonData.season_name || `Season ${seasonData.season_length} Weeks`);

        // Fetch all season weeks (all types: regular, blackout, playoffs, breaks)
        const { data: weeksData, error: weeksError } = await supabase
          .from('season_weeks')
          .select('*')
          .eq('season_id', seasonId)
          .order('scheduled_date', { ascending: true });

        if (weeksError) throw weeksError;

        // Fetch all matches with team and venue details
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select(`
            *,
            home_team:teams!matches_home_team_id_fkey(id, team_name, captain_id),
            away_team:teams!matches_away_team_id_fkey(id, team_name, captain_id),
            scheduled_venue:venues!matches_scheduled_venue_id_fkey(id, name, street_address, city, state)
          `)
          .eq('season_id', seasonId)
          .order('match_number', { ascending: true });

        if (matchesError) throw matchesError;

        // Organize matches by week using season_week_id
        const scheduleByWeek: WeekSchedule[] = weeksData.map(week => {
          const weekMatches = matchesData.filter(
            match => match.season_week_id === week.id
          ) as MatchWithDetails[];

          return { week, matches: weekMatches };
        });

        setSchedule(scheduleByWeek);
      } catch (err) {
        console.error('Error fetching schedule:', err);
        setError('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [seasonId, leagueId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center text-gray-600">Loading schedule...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-red-600 text-lg font-semibold mb-4">Error</h3>
              <p className="text-gray-700 mb-4">{error}</p>
              <Button onClick={() => navigate(`/league/${leagueId}`)}>
                Back to League
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/league/${leagueId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to League
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Season Schedule</h1>
              <p className="text-gray-600 mt-1">
                {seasonName}
              </p>
            </div>
            {schedule.length > 0 && (
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={handleClearSchedule}
                  disabled={clearing || accepting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {clearing ? 'Clearing...' : 'Clear Schedule'}
                </Button>
                <Button
                  onClick={handleAcceptSchedule}
                  disabled={accepting || clearing}
                >
                  {accepting ? 'Accepting...' : 'Accept Schedule & Complete Setup'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Schedule by Week */}
        <div className="space-y-6">
          {schedule.map(({ week, matches }) => {
            const weekStyle = getWeekTypeStyle(week.week_type);
            const tableNumbers = calculateTableNumbers(matches);
            return (
              <Card key={week.id}>
                <CardHeader className={weekStyle.bgColor}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">
                        {week.week_name}
                      </CardTitle>
                      {weekStyle.badge && (
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${weekStyle.badgeColor}`}>
                          {weekStyle.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {parseLocalDate(week.scheduled_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {matches.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      {week.week_type === 'playoffs'
                        ? 'Matchups TBD'
                        : week.week_type === 'regular'
                          ? 'No matches scheduled'
                          : 'No matches this week'}
                    </p>
                  ) : (
                  <div className="space-y-4">
                    {matches.map((match) => {
                      const tableNumber = tableNumbers.get(match.id);
                      return (
                      <div
                        key={match.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          {/* Teams */}
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div className="text-right flex-1">
                                <span className="font-semibold text-gray-900">
                                  {match.home_team?.team_name || 'BYE'}
                                </span>
                                <span className="text-xs text-gray-500 ml-2">(Home)</span>
                              </div>
                              <div className="text-xl font-bold text-gray-400">vs</div>
                              <div className="text-left flex-1">
                                <span className="font-semibold text-gray-900">
                                  {match.away_team?.team_name || 'BYE'}
                                </span>
                                <span className="text-xs text-gray-500 ml-2">(Away)</span>
                              </div>
                            </div>
                          </div>

                          {/* Venue */}
                          <div className="flex items-center gap-2 text-sm text-gray-600 ml-6">
                            <MapPin className="h-4 w-4" />
                            {match.scheduled_venue ? (
                              <div>
                                <div className="font-medium">{match.scheduled_venue.name}</div>
                                <div className="text-xs">
                                  {match.scheduled_venue.city}, {match.scheduled_venue.state}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-500 italic">Venue TBD</div>
                            )}
                          </div>

                          {/* Table Number - only show if venue exists */}
                          {match.scheduled_venue && tableNumber && (
                            <div className="ml-6 text-right">
                              <div className="text-xs text-gray-500">Table</div>
                              <div className="text-lg font-semibold text-gray-900">
                                {tableNumber}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            );
          })}
        </div>

        {schedule.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Yet</h3>
              <p className="text-gray-600 mb-6">
                Generate your season schedule to see all matchups
              </p>
              <Button onClick={() => navigate(`/league/${leagueId}/season/${seasonId}/schedule-setup`)}>
                Generate Schedule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
