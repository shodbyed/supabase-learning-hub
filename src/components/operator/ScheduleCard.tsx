/**
 * @fileoverview ScheduleCard Component
 * Displays schedule status and creation button for a league
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Button } from '@/components/ui/button';

interface ScheduleCardProps {
  /** League ID to fetch schedule for */
  leagueId: string;
}

/**
 * ScheduleCard Component
 *
 * Shows:
 * - "Create Schedule" button if no schedule exists and no weeks are completed
 * - Schedule status if schedule exists
 * - Hides "Create Schedule" button if any week has been completed (prevents schedule changes)
 */
export const ScheduleCard: React.FC<ScheduleCardProps> = ({ leagueId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [scheduleExists, setScheduleExists] = useState(false);
  const [activeSeason, setActiveSeason] = useState<any | null>(null);
  const [upcomingWeeks, setUpcomingWeeks] = useState<Array<{ name: string; date: string; type: string }>>([]);
  const [nextBlackout, setNextBlackout] = useState<{ name: string; date: string } | null>(null);
  const [weeksCompleted, setWeeksCompleted] = useState(0);
  const [totalWeeks, setTotalWeeks] = useState(0);
  const [seasonStartDate, setSeasonStartDate] = useState<string | null>(null);
  const [playoffsDate, setPlayoffsDate] = useState<string | null>(null);

  /**
   * Check if schedule exists and find the next upcoming week
   */
  useEffect(() => {
    const checkScheduleStatus = async () => {
      setLoading(true);
      try {
        // Get active season for this league
        const { data: seasonData, error: seasonError } = await supabase
          .from('seasons')
          .select('id')
          .eq('league_id', leagueId)
          .eq('status', 'active')
          .single();

        if (seasonError && seasonError.code !== 'PGRST116') {
          throw seasonError;
        }

        if (!seasonData) {
          setLoading(false);
          return;
        }

        setActiveSeason(seasonData);

        // Check if any matches exist for this season
        const { count: matchesCount, error: matchesError } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .eq('season_id', seasonData.id);

        if (matchesError) throw matchesError;

        setScheduleExists((matchesCount || 0) > 0);

        // Get ALL weeks for this season (for debugging)
        const { data: allWeeksData, error: allWeeksError } = await supabase
          .from('season_weeks')
          .select('week_name, scheduled_date, week_type, week_completed')
          .eq('season_id', seasonData.id)
          .order('scheduled_date', { ascending: true });

        if (allWeeksError) throw allWeeksError;

        if (allWeeksData) {
          console.log('📅 ALL SEASON WEEKS:', allWeeksData);
          console.log('📊 Week Type Breakdown:', {
            regular: allWeeksData.filter(w => w.week_type === 'regular').length,
            blackout: allWeeksData.filter(w => w.week_type === 'blackout').length,
            playoffs: allWeeksData.filter(w => w.week_type === 'playoffs').length,
            season_end_break: allWeeksData.filter(w => w.week_type === 'season_end_break').length,
            total: allWeeksData.length
          });
        }

        // Get the next 3 upcoming weeks (incomplete weeks of any type)
        const { data: upcomingWeeksData, error: upcomingWeeksError } = await supabase
          .from('season_weeks')
          .select('week_name, scheduled_date, week_type')
          .eq('season_id', seasonData.id)
          .eq('week_completed', false)
          .gte('scheduled_date', new Date().toISOString().split('T')[0]) // Future dates only
          .order('scheduled_date', { ascending: true })
          .limit(3);

        if (upcomingWeeksError) throw upcomingWeeksError;

        if (upcomingWeeksData) {
          setUpcomingWeeks(upcomingWeeksData.map(week => ({
            name: week.week_name,
            date: week.scheduled_date,
            type: week.week_type
          })));
        }

        // Get the next blackout week (upcoming holiday/break)
        const { data: nextBlackoutData, error: nextBlackoutError } = await supabase
          .from('season_weeks')
          .select('week_name, scheduled_date')
          .eq('season_id', seasonData.id)
          .eq('week_type', 'blackout')
          .gte('scheduled_date', new Date().toISOString().split('T')[0]) // Future dates only
          .order('scheduled_date', { ascending: true })
          .limit(1)
          .single();

        if (nextBlackoutError && nextBlackoutError.code !== 'PGRST116') {
          throw nextBlackoutError;
        }

        if (nextBlackoutData) {
          setNextBlackout({
            name: nextBlackoutData.week_name,
            date: nextBlackoutData.scheduled_date
          });
        }

        // Get week counts (regular weeks only)
        const { count: totalWeeksCount } = await supabase
          .from('season_weeks')
          .select('*', { count: 'exact', head: true })
          .eq('season_id', seasonData.id)
          .eq('week_type', 'regular');

        const { count: completedWeeksCount } = await supabase
          .from('season_weeks')
          .select('*', { count: 'exact', head: true })
          .eq('season_id', seasonData.id)
          .eq('week_type', 'regular')
          .eq('week_completed', true);

        setTotalWeeks(totalWeeksCount || 0);
        setWeeksCompleted(completedWeeksCount || 0);

        // Get Week 1 start date (first regular week)
        const { data: week1Data } = await supabase
          .from('season_weeks')
          .select('scheduled_date')
          .eq('season_id', seasonData.id)
          .eq('week_type', 'regular')
          .order('scheduled_date', { ascending: true })
          .limit(1)
          .single();

        if (week1Data) {
          setSeasonStartDate(week1Data.scheduled_date);
        }

        // Get playoffs date (first playoffs week)
        const { data: playoffsData } = await supabase
          .from('season_weeks')
          .select('scheduled_date')
          .eq('season_id', seasonData.id)
          .eq('week_type', 'playoffs')
          .order('scheduled_date', { ascending: true })
          .limit(1)
          .single();

        if (playoffsData) {
          setPlayoffsDate(playoffsData.scheduled_date);
        }
      } catch (err) {
        console.error('Error checking schedule status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkScheduleStatus();
  }, [leagueId]);

  /**
   * Navigate to schedule setup page
   */
  const handleCreateSchedule = () => {
    if (activeSeason) {
      navigate(`/league/${leagueId}/season/${activeSeason.id}/schedule-setup`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule</h2>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading schedule status...</p>
        </div>
      ) : !activeSeason ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🗓️</div>
          <p className="text-gray-600">Create a season first to generate a schedule</p>
        </div>
      ) : scheduleExists ? (
        <div>
          {upcomingWeeks.length > 0 ? (
            <>
              {/* Summary Info Row */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Weeks:</span>{' '}
                  <span>{weeksCompleted}/{totalWeeks} played</span>
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Started:</span>{' '}
                  {seasonStartDate && (
                    <span>
                      {new Date(seasonStartDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Playoffs:</span>{' '}
                  {playoffsDate ? (
                    <span>
                      {new Date(playoffsDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  ) : (
                    <span className="text-gray-500 italic">Not scheduled</span>
                  )}
                </div>
              </div>

              {/* Upcoming Weeks and Holiday Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Upcoming Weeks Card */}
                <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Upcoming Weeks</h3>
                <div className="space-y-2">
                  {upcomingWeeks.map((week, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                      <span className="text-sm font-medium text-gray-900">{week.name}</span>
                      <span className="text-sm text-gray-600">
                        {new Date(week.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Holiday Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Next Holiday</h3>
                {nextBlackout ? (
                  <div className="py-2">
                    <p className="text-lg font-semibold text-gray-900 mb-1">{nextBlackout.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(nextBlackout.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    <p className="text-sm text-gray-500 italic">No holidays scheduled</p>
                  </div>
                )}
              </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🏁</div>
              <p className="text-gray-600">All weeks completed</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🗓️</div>
          <p className="text-gray-600 mb-4">Ready to create your schedule</p>
          <Button onClick={handleCreateSchedule}>
            Create Schedule
          </Button>
        </div>
      )}
    </div>
  );
};
