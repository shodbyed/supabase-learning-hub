/**
 * @fileoverview Unified League Status Card Component
 *
 * Single source of truth for league status across the application.
 * Displays status badge, progress bar, and next action steps.
 * Used on both Operator Dashboard and League Detail pages to ensure consistency.
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { LeagueProgressBar } from './LeagueProgressBar';
import type { League } from '@/types/league';

interface LeagueStatusCardProps {
  /** League to display status for */
  league: League;
  /** Optional: Show as compact card (for dashboard) vs full section (for detail page) */
  variant?: 'card' | 'section';
}

type LeagueStatus = 'setup' | 'ready' | 'in_session';

/**
 * LeagueStatusCard Component
 *
 * Fetches and calculates league status information:
 * - Season count
 * - Team count
 * - Player count
 * - Schedule existence
 * - Current play week (if active season)
 *
 * Displays:
 * - Status badge (Setup Needed / Ready to Play / In Session)
 * - Progress bar
 * - Next action text
 */
export const LeagueStatusCard: React.FC<LeagueStatusCardProps> = ({
  league,
  variant = 'section'
}) => {
  const [loading, setLoading] = useState(true);
  const [seasonCount, setSeasonCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [playerCount, setPlayerCount] = useState(0);
  const [scheduleExists, setScheduleExists] = useState(false);
  const [activeSeason, setActiveSeason] = useState<any | null>(null);
  const [completedWeeksCount, setCompletedWeeksCount] = useState(0);
  const [totalWeeksCount, setTotalWeeksCount] = useState(0);

  /**
   * Fetch all league status data
   */
  useEffect(() => {
    const fetchStatusData = async () => {
      setLoading(true);
      try {
        // Fetch season count
        const { count: seasonCountResult } = await supabase
          .from('seasons')
          .select('*', { count: 'exact', head: true })
          .eq('league_id', league.id);
        setSeasonCount(seasonCountResult || 0);

        // Fetch active season (if any)
        const { data: activeSeasonData } = await supabase
          .from('seasons')
          .select('*')
          .eq('league_id', league.id)
          .eq('status', 'active')
          .maybeSingle();

        if (activeSeasonData) {
          setActiveSeason(activeSeasonData);

          // Get week counts for the active season
          const { count: totalWeeks } = await supabase
            .from('season_weeks')
            .select('*', { count: 'exact', head: true })
            .eq('season_id', activeSeasonData.id)
            .eq('week_type', 'regular');

          const { count: completedWeeks } = await supabase
            .from('season_weeks')
            .select('*', { count: 'exact', head: true })
            .eq('season_id', activeSeasonData.id)
            .eq('week_type', 'regular')
            .eq('week_completed', true);

          setTotalWeeksCount(totalWeeks || 0);
          setCompletedWeeksCount(completedWeeks || 0);

          // Get team count for active season
          const { count: teamCountResult } = await supabase
            .from('teams')
            .select('*', { count: 'exact', head: true })
            .eq('season_id', activeSeasonData.id);
          setTeamCount(teamCountResult || 0);

          // Get player count across all teams in active season
          const { count: playerCountResult } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('season_id', activeSeasonData.id);
          setPlayerCount(playerCountResult || 0);

          // Check if schedule exists
          const { count: scheduleCount } = await supabase
            .from('season_weeks')
            .select('*', { count: 'exact', head: true })
            .eq('season_id', activeSeasonData.id);
          setScheduleExists((scheduleCount || 0) > 0);
        } else {
          // No active season - check if ANY season exists
          setActiveSeason(null);
          setTeamCount(0);
          setPlayerCount(0);
          setScheduleExists(false);
          setTotalWeeksCount(0);
          setCompletedWeeksCount(0);
        }
      } catch (error) {
        console.error('Error fetching league status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusData();
  }, [league.id]);

  /**
   * Determine current status
   */
  const getStatus = (): LeagueStatus => {
    if (activeSeason) return 'in_session';
    if (seasonCount > 0 && teamCount > 0 && playerCount > 0 && scheduleExists) return 'ready';
    return 'setup';
  };

  /**
   * Calculate progress percentage
   * - If in session: season progress (weeks completed / total weeks)
   * - Otherwise: setup progress (0-100% based on setup tasks)
   */
  const calculateProgress = (): number => {
    if (activeSeason && totalWeeksCount > 0) {
      return Math.round((completedWeeksCount / totalWeeksCount) * 100);
    }

    // Setup progress
    let progress = 0;
    if (seasonCount > 0) progress += 20;
    if (teamCount > 0) progress += 20;
    if (playerCount > 0) progress += 20;
    if (scheduleExists) progress += 20;
    if (seasonCount > 0 && teamCount > 0 && playerCount > 0 && scheduleExists) {
      progress += 20; // All done!
    }
    return progress;
  };

  /**
   * Get status badge configuration
   */
  const getStatusBadge = () => {
    const status = getStatus();
    switch (status) {
      case 'in_session':
        return {
          label: 'In Session',
          classes: 'bg-blue-100 text-blue-800'
        };
      case 'ready':
        return {
          label: 'Ready to Play',
          classes: 'bg-green-100 text-green-800'
        };
      case 'setup':
        return {
          label: 'Setup Needed',
          classes: 'bg-orange-100 text-orange-800'
        };
    }
  };

  /**
   * Get next action text
   */
  const getNextAction = (): string => {
    if (activeSeason) {
      return `Week ${completedWeeksCount} of ${totalWeeksCount} completed`;
    }

    if (seasonCount === 0) return 'Next: Create your first season';
    if (teamCount === 0) return 'Next: Add teams to your season';
    if (playerCount === 0) return 'Next: Enroll players on each team';
    if (!scheduleExists) return 'Next: Generate the schedule';
    return "All set! You're ready to start!";
  };

  const status = getStatus();
  const statusBadge = getStatusBadge();
  const progress = calculateProgress();
  const nextAction = getNextAction();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-2 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Card variant (for dashboard)
  if (variant === 'card') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Status</h3>
          <span className={`px-3 py-1 ${statusBadge.classes} text-sm font-medium rounded-full`}>
            {statusBadge.label}
          </span>
        </div>
        <LeagueProgressBar
          status={status === 'in_session' ? 'active' : status === 'ready' ? 'active' : 'setup'}
          progress={progress}
          label={activeSeason ? 'Season Progress' : 'League Setup Progress'}
          nextAction={nextAction}
        />
      </div>
    );
  }

  // Section variant (for detail page)
  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {activeSeason ? 'Season Status' : 'League Status'}
        </h2>
        <span className={`px-4 py-2 ${statusBadge.classes} text-sm font-medium rounded-full`}>
          {statusBadge.label}
        </span>
      </div>
      <LeagueProgressBar
        status={status === 'in_session' ? 'active' : status === 'ready' ? 'active' : 'setup'}
        progress={progress}
        label={activeSeason ? 'Season Progress' : 'League Setup Progress'}
        nextAction={nextAction}
      />

      {/* Next Steps / Season Management */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          {activeSeason ? 'Season Management' : 'Next Steps'}
        </h3>
        {activeSeason ? (
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Enter scores after each week's matches</li>
            <li>View standings and player statistics</li>
            <li>Manage schedule changes and makeup matches</li>
            <li>Prepare for playoffs when season ends</li>
          </ul>
        ) : (
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li className={seasonCount > 0 ? 'line-through opacity-50' : ''}>
              Create your first season (set dates and weeks)
            </li>
            <li className={teamCount > 0 ? 'line-through opacity-50' : ''}>
              Add teams to the season
            </li>
            <li className={playerCount > 0 ? 'line-through opacity-50' : ''}>
              Enroll players on each team
            </li>
            <li className={scheduleExists ? 'line-through opacity-50' : ''}>
              Generate the schedule
            </li>
            <li className={seasonCount > 0 && teamCount > 0 && playerCount > 0 && scheduleExists ? 'line-through opacity-50' : ''}>
              You're ready to start!
            </li>
          </ol>
        )}
      </div>
    </div>
  );
};
