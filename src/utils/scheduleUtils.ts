/**
 * @fileoverview Schedule Generation Utilities
 *
 * Functions for generating season schedules with support for blackout weeks,
 * season-end break periods, and multiple playoff weeks.
 */
import type { WeekEntry } from '@/types/season';
import { formatDateForDB } from '@/types/season';
import { supabase } from '@/supabaseClient';
import { parseLocalDate } from '@/utils/formatters';
import { logger } from '@/utils/logger';

/**
 * Generates season schedule with all regular weeks and playoffs
 * Blackout weeks are inserted as extra weeks, extending the season end date
 *
 * @param startDate - Season start date
 * @param leagueDayOfWeek - Day of week league plays (e.g., 'tuesday')
 * @param seasonLength - Number of regular season weeks (always this many regular weeks in final schedule)
 * @param blackoutWeeks - Array of blackout week entries to insert as extra weeks (optional)
 * @param seasonEndBreakWeeks - Number of season-end break weeks to add before playoffs
 * @param playoffWeeks - Number of playoff weeks (default 1, can be 1-4)
 * @returns Array of WeekEntry objects for the schedule (regular weeks only, blackouts handled separately)
 */
export function generateSchedule(
  startDate: Date,
  _leagueDayOfWeek: string,
  seasonLength: number,
  blackoutWeeks: WeekEntry[] = [],
  seasonEndBreakWeeks: number = 1,
  playoffWeeks: number = 1
): WeekEntry[] {
  const schedule: WeekEntry[] = [];
  const currentDate = new Date(startDate);
  let playWeekCount = 0;

  // Create a sorted set of blackout dates for efficient lookup
  const blackoutDates = new Set(blackoutWeeks.map(b => b.date));

  // Generate schedule by walking through weeks chronologically
  // Insert blackouts where they belong, but keep generating until we have seasonLength regular weeks
  while (playWeekCount < seasonLength) {
    const dateStr = formatDateForDB(currentDate);

    // Check if this date is a blackout
    if (blackoutDates.has(dateStr)) {
      // This is a blackout week - skip it and move to next week
      // Don't increment playWeekCount - we need to keep generating regular weeks
      currentDate.setDate(currentDate.getDate() + 7);
      continue;
    }

    // Not a blackout - create regular week
    playWeekCount++;
    schedule.push({
      weekNumber: playWeekCount,
      weekName: `Week ${playWeekCount}`,
      date: dateStr,
      type: 'regular',
      conflicts: [],
    });

    currentDate.setDate(currentDate.getDate() + 7);
  }

  // Add season-end break weeks (if any)
  for (let i = 0; i < seasonEndBreakWeeks; i++) {
    schedule.push({
      weekNumber: seasonLength + 1 + i,
      weekName: 'Season End Break',
      date: formatDateForDB(currentDate),
      type: 'week-off',
      conflicts: [],
    });
    currentDate.setDate(currentDate.getDate() + 7);
  }

  // Add playoff weeks (supports multiple weeks for multi-round playoffs)
  for (let i = 0; i < playoffWeeks; i++) {
    const weekLabel = playoffWeeks === 1
      ? 'Playoffs'
      : `Playoffs Week ${i + 1}`;

    schedule.push({
      weekNumber: seasonLength + seasonEndBreakWeeks + 1 + i,
      weekName: weekLabel,
      date: formatDateForDB(currentDate),
      type: 'playoffs',
      conflicts: [],
    });
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return schedule;
}

/**
 * Sync playoff weeks in the database to match the configured number
 *
 * This function is called after the playoff configuration is set.
 * It ensures the season_weeks table has the correct number of playoff weeks.
 *
 * @param seasonId - Season ID to sync playoff weeks for
 * @param requiredPlayoffWeeks - Number of playoff weeks needed (from playoff config)
 * @returns Result with success status and any error
 */
export async function syncPlayoffWeeks(
  seasonId: string,
  requiredPlayoffWeeks: number
): Promise<{ success: boolean; weeksAdded: number; error?: string }> {
  try {
    // Fetch existing playoff weeks for this season
    const { data: existingPlayoffWeeks, error: fetchError } = await supabase
      .from('season_weeks')
      .select('id, scheduled_date, week_name')
      .eq('season_id', seasonId)
      .eq('week_type', 'playoffs')
      .order('scheduled_date', { ascending: true });

    if (fetchError) {
      return { success: false, weeksAdded: 0, error: fetchError.message };
    }

    const existingCount = existingPlayoffWeeks?.length ?? 0;

    // If we already have enough playoff weeks, nothing to do
    if (existingCount >= requiredPlayoffWeeks) {
      logger.info('Playoff weeks already synced', { existingCount, requiredPlayoffWeeks });
      return { success: true, weeksAdded: 0 };
    }

    // Need to add more playoff weeks
    const weeksToAdd = requiredPlayoffWeeks - existingCount;

    // Get the last playoff week's date to calculate new dates
    const lastPlayoffWeek = existingPlayoffWeeks?.[existingPlayoffWeeks.length - 1];
    if (!lastPlayoffWeek) {
      return { success: false, weeksAdded: 0, error: 'No existing playoff week found to extend from' };
    }

    const lastDate = parseLocalDate(lastPlayoffWeek.scheduled_date);
    const newWeeks = [];

    for (let i = 0; i < weeksToAdd; i++) {
      // Calculate next week's date
      const newDate = new Date(lastDate);
      newDate.setDate(newDate.getDate() + (7 * (i + 1)));

      const weekNumber = existingCount + i + 1;
      const weekLabel = requiredPlayoffWeeks === 1
        ? 'Playoffs'
        : `Playoffs Week ${weekNumber}`;

      newWeeks.push({
        season_id: seasonId,
        scheduled_date: formatDateForDB(newDate),
        week_name: weekLabel,
        week_type: 'playoffs' as const,
        week_completed: false,
        notes: null,
      });
    }

    // Insert the new playoff weeks
    const { error: insertError } = await supabase
      .from('season_weeks')
      .insert(newWeeks);

    if (insertError) {
      return { success: false, weeksAdded: 0, error: insertError.message };
    }

    // If we now have multiple playoff weeks, update the first one's name too
    if (requiredPlayoffWeeks > 1 && existingCount === 1) {
      const { error: updateError } = await supabase
        .from('season_weeks')
        .update({ week_name: 'Playoffs Week 1' })
        .eq('id', lastPlayoffWeek.id);

      if (updateError) {
        logger.warn('Failed to rename first playoff week', { error: updateError.message });
        // Non-fatal, continue
      }
    }

    logger.info('Added playoff weeks', { seasonId, weeksAdded: weeksToAdd, totalPlayoffWeeks: requiredPlayoffWeeks });
    return { success: true, weeksAdded: weeksToAdd };

  } catch (error) {
    logger.error('Error syncing playoff weeks', {
      error: error instanceof Error ? error.message : String(error),
      seasonId,
      requiredPlayoffWeeks,
    });
    return {
      success: false,
      weeksAdded: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
