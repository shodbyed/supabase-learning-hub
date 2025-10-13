/**
 * @fileoverview ScheduleReview Component
 *
 * Smart container component for reviewing and modifying the generated season schedule
 * Manages schedule state, conflict detection, and week toggling logic
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScheduleReviewTable } from './ScheduleReviewTable';
import { WeekOffReasonModal } from '@/components/modals/WeekOffReasonModal';
import { InfoButton } from '../InfoButton';
import { generateSchedule } from '@/utils/scheduleUtils';
import { detectScheduleConflicts } from '@/utils/conflictDetectionUtils';
import { parseLocalDate } from '@/utils/formatters';
import { STORAGE_KEYS } from '@/constants/scheduleConflicts';
import type { ScheduleReviewProps } from '@/types/scheduleReview';
import type { WeekEntry } from '@/types/season';

/**
 * ScheduleReview Component
 *
 * Container component that:
 * - Displays the generated schedule with conflicts
 * - Allows skipping weeks (recalculates dates)
 * - Allows ignoring conflicts
 * - Provides navigation (Back/Confirm)
 */
export const ScheduleReview: React.FC<ScheduleReviewProps> = ({
  schedule: initialSchedule,
  leagueDayOfWeek,
  seasonStartDate,
  holidays,
  bcaChampionship,
  apaChampionship,
  currentPlayWeek = 0, // TODO: In future, fetch from database (e.g., SELECT MAX(week_number) FROM match_results WHERE season_id = ?)
  onConfirm,
  onBack,
}) => {
  const [schedule, setSchedule] = useState<WeekEntry[]>(() => {
    // Try to restore schedule from localStorage first
    const stored = localStorage.getItem(STORAGE_KEYS.SCHEDULE_REVIEW);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return initialSchedule;
      }
    }
    return initialSchedule;
  });

  const [blackoutWeeks, setBlackoutWeeks] = useState<WeekEntry[]>(() => {
    // Try to restore blackout weeks from localStorage
    const stored = localStorage.getItem(STORAGE_KEYS.BLACKOUT_WEEKS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [addSeasonEndBreak, setAddSeasonEndBreak] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingWeekIndex, setPendingWeekIndex] = useState<number | null>(null);

  // Store the original season length (count of regular weeks from initial schedule)
  const [originalSeasonLength, setOriginalSeasonLength] = useState(() => {
    return initialSchedule.filter(w => w.type === 'regular').length;
  });

  // Update originalSeasonLength when initialSchedule changes (on first load)
  useEffect(() => {
    const regularCount = initialSchedule.filter(w => w.type === 'regular').length;
    if (regularCount > 0 && originalSeasonLength === 0) {
      setOriginalSeasonLength(regularCount);
    }
  }, [initialSchedule, originalSeasonLength]);

  // Update local schedule when prop changes (but only if localStorage is empty)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SCHEDULE_REVIEW);
    if (!stored) {
      setSchedule(initialSchedule);
    }
  }, [initialSchedule]);

  // Save schedule to localStorage whenever it changes
  useEffect(() => {
    if (schedule.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE_REVIEW, JSON.stringify(schedule));
    }
  }, [schedule]);

  // Save blackout weeks to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BLACKOUT_WEEKS, JSON.stringify(blackoutWeeks));
  }, [blackoutWeeks]);

  /**
   * Regenerates the schedule with current blackout weeks
   */
  const regenerateSchedule = () => {
    // Use the original season length to ensure we always generate the same number of regular weeks
    const newSchedule = generateSchedule(
      parseLocalDate(seasonStartDate),
      leagueDayOfWeek,
      originalSeasonLength,
      blackoutWeeks,
      addSeasonEndBreak
    );

    // Detect conflicts using shared utility
    const scheduleWithConflicts = detectScheduleConflicts(
      newSchedule,
      holidays,
      bcaChampionship,
      apaChampionship,
      leagueDayOfWeek
    );

    setSchedule(scheduleWithConflicts);
  };

  /**
   * Handler for inserting/removing week-off
   */
  const handleToggleWeekOff = (index: number) => {
    const week = displaySchedule[index];

    // Special handling for Season End Break - decrement count
    if (week.weekName === 'Season End Break') {
      setAddSeasonEndBreak(Math.max(0, addSeasonEndBreak - 1));
      return;
    }

    // Special handling for Playoffs - increment Season End Break count
    if (week.type === 'playoffs') {
      setAddSeasonEndBreak(addSeasonEndBreak + 1);
      return;
    }

    // If it's already a week-off, remove it from blackout
    if (week.type === 'week-off') {
      const updatedBlackout = blackoutWeeks.filter(b => b.date !== week.date);
      setBlackoutWeeks(updatedBlackout);
      // Schedule will regenerate via useEffect
      return;
    }

    // If week has conflicts, use the first conflict's name
    if (week.conflicts.length > 0) {
      const conflict = week.conflicts[0];
      const blackoutEntry: WeekEntry = {
        weekNumber: 0, // Not used for blackouts
        weekName: conflict.name,
        date: week.date,
        type: 'week-off',
        conflicts: [],
      };
      setBlackoutWeeks([...blackoutWeeks, blackoutEntry]);
      // Schedule will regenerate via useEffect
    } else {
      // No conflicts - show modal for custom reason
      setPendingWeekIndex(index);
      setModalOpen(true);
    }
  };

  /**
   * Handler for modal confirmation with custom reason
   */
  const handleModalConfirm = (reason: string) => {
    if (pendingWeekIndex === null) return;

    const week = schedule[pendingWeekIndex];
    const blackoutEntry: WeekEntry = {
      weekNumber: 0,
      weekName: reason,
      date: week.date,
      type: 'week-off',
      conflicts: [],
    };

    setBlackoutWeeks([...blackoutWeeks, blackoutEntry]);
    setModalOpen(false);
    setPendingWeekIndex(null);
  };

  /**
   * Handler for modal cancel
   */
  const handleModalCancel = () => {
    setModalOpen(false);
    setPendingWeekIndex(null);
  };

  // Regenerate schedule whenever blackoutWeeks or addSeasonEndBreak changes
  useEffect(() => {
    // Only regenerate if we have initial data loaded
    if (schedule.length > 0 && seasonStartDate) {
      regenerateSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blackoutWeeks, addSeasonEndBreak]);

  /**
   * Combine schedule and blackout weeks for display
   * Sort by date to show chronological order
   */
  const displaySchedule = [...schedule, ...blackoutWeeks].sort((a, b) => {
    return a.date.localeCompare(b.date);
  });

  /**
   * Counts total conflicts across all weeks
   */
  const totalConflicts = displaySchedule.reduce(
    (sum, week) => sum + week.conflicts.length,
    0
  );

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="flex-1 flex flex-col p-8">
        <div className="w-full mx-auto px-4">
          {/* Header */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Review Season Schedule
          </h2>
          <p className="text-gray-600 mb-4">
            Review your schedule for conflicts with holidays and championships.
            You can skip weeks or ignore conflicts as needed.
          </p>

          <div className="mb-6">
            <InfoButton
              title="How to Choose Weeks to Take Off"
              label="How to Choose Weeks to Take Off"
            >
              <div className="space-y-3">
                <p>
                  Major holidays should always be taken off as a significant amount of people travel during these holidays.
                </p>
                <p>
                  BCA and APA championships usually need to be taken off for the same reason, and we like to encourage these trips as well.
                </p>
                <p>
                  Smaller holidays are up to you and your players. Remember you can change your mind mid-season and can edit this schedule up until that week is played.
                </p>
                <p>
                  You can also schedule weeks off for local events that may interfere with the schedule.
                </p>
                <p>
                  We try to give you as much control over the season as possible. You are not charged for weeks taken off, only weeks played within the season.
                </p>
              </div>
            </InfoButton>
          </div>

          {/* Conflict Summary */}
          {totalConflicts > 0 && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 font-medium">
                ⚠️ {totalConflicts} conflict{totalConflicts > 1 ? 's' : ''}{' '}
                detected
              </p>
              <p className="text-orange-700 text-sm mt-1">
                Review the conflicts below and either skip the week or ignore
                the conflict.
              </p>
            </div>
          )}

          {/* Schedule Table */}
          <ScheduleReviewTable
            schedule={displaySchedule}
            onToggleWeekOff={handleToggleWeekOff}
            currentPlayWeek={currentPlayWeek}
          />

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              Previous
            </Button>

            <Button type="button" onClick={onConfirm} className="flex-1">
              Confirm Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Week Off Reason Modal */}
      <WeekOffReasonModal
        isOpen={modalOpen}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
    </div>
  );
};
