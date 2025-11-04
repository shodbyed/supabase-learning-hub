/**
 * @fileoverview Season Schedule Page (Refactored)
 *
 * Optimized version following KISS, DRY, and single responsibility principles.
 * - Separated data fetching into custom hook
 * - Extracted reusable components (MatchCard, WeekCard, Loading/Error states)
 * - Moved utility functions to separate file
 * - Reduced component from 440+ lines to ~150 lines
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeekCard } from '@/components/schedule/WeekCard';
import { ScheduleLoadingState } from '@/components/schedule/ScheduleLoadingState';
import { ScheduleErrorState } from '@/components/schedule/ScheduleErrorState';
import { EmptyScheduleState } from '@/components/schedule/EmptyScheduleState';
import { useSeasonSchedule } from '@/hooks/useSeasonSchedule';
import { calculateTableNumbers } from '@/utils/scheduleDisplayUtils';
import { clearSchedule } from '@/utils/scheduleGenerator';

/**
 * SeasonSchedulePage Component
 *
 * Displays the complete season schedule organized by week.
 * Provides actions to clear or accept the schedule.
 *
 * Responsibilities:
 * - Display schedule data
 * - Handle clear/accept actions
 * - Navigate between pages
 */
export const SeasonSchedulePage: React.FC = () => {
  const { leagueId, seasonId } = useParams<{ leagueId: string; seasonId: string }>();
  const navigate = useNavigate();

  const { schedule, seasonName, loading, error } = useSeasonSchedule(seasonId, leagueId);
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
      const { error: updateError } = await supabase
        .from('seasons')
        .update({ status: 'active' })
        .eq('id', seasonId);

      if (updateError) throw updateError;

      console.log('✅ Season activated successfully');
      navigate(`/league/${leagueId}`);
    } catch (err) {
      console.error('❌ Error activating season:', err);
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
      setClearing(false);
    }
  };

  // Loading state
  if (loading) return <ScheduleLoadingState />;

  // Error state
  if (error) {
    return <ScheduleErrorState error={error} onBack={() => navigate(`/league/${leagueId}`)} />;
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
              <p className="text-gray-600 mt-1">{seasonName}</p>
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
                <Button onClick={handleAcceptSchedule} disabled={accepting || clearing}>
                  {accepting ? 'Accepting...' : 'Accept Schedule & Complete Setup'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Schedule by Week */}
        {schedule.length > 0 ? (
          <div className="space-y-6">
            {schedule.map((weekSchedule) => (
              <WeekCard
                key={weekSchedule.week.id}
                weekSchedule={weekSchedule as any}
                tableNumbers={calculateTableNumbers(weekSchedule.matches as any)}
              />
            ))}
          </div>
        ) : (
          <EmptyScheduleState
            onGenerateSchedule={() =>
              navigate(`/league/${leagueId}/season/${seasonId}/schedule-setup`)
            }
          />
        )}
      </div>
    </div>
  );
};
