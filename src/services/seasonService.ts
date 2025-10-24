/**
 * @fileoverview Season service for database operations
 *
 * Provides database operations for season-related data including
 * creating seasons, updating seasons, and managing season weeks.
 */
import { supabase } from '@/supabaseClient';
import type { SeasonFormData } from '@/data/seasonWizardSteps';
import type { SeasonInsertData, WeekEntry } from '@/types/season';
import { generateSeasonName, calculateEndDate, formatDateForDB } from '@/types/season';
import { formatDayOfWeek, formatGameType, type League } from '@/types/league';
import { parseLocalDate } from '@/utils/formatters';
import { submitChampionshipDates } from '@/utils/tournamentUtils';

/**
 * Parameters for creating a season
 */
export interface CreateSeasonParams {
  /** League ID */
  leagueId: string;
  /** League data */
  league: League;
  /** Form data with season details */
  formData: SeasonFormData;
  /** Schedule with all weeks */
  schedule: WeekEntry[];
  /** Operator ID for saving preferences */
  operatorId: string | null;
  /** Existing season ID if editing */
  existingSeasonId?: string | null;
  /** Callback to save championship preference */
  onSavePreference: (organization: 'BCA' | 'APA', choice: string, championshipId?: string) => Promise<void>;
}

/**
 * Result from creating a season
 */
export interface CreateSeasonResult {
  /** ID of the created season */
  seasonId: string;
  /** Season name */
  seasonName: string;
}

/**
 * Create a new season with schedule
 *
 * @param params - Parameters for season creation
 * @returns Promise resolving to the created season's ID and name
 * @throws Error if season creation fails
 *
 * @example
 * ```tsx
 * const result = await createSeason({
 *   leagueId: 'league-123',
 *   league: leagueData,
 *   formData,
 *   schedule: weekEntries,
 *   operatorId: 'operator-123',
 *   onSavePreference: async (org, choice, id) => { ... },
 * });
 * console.log('Created season:', result.seasonId);
 * ```
 */
export async function createSeason(params: CreateSeasonParams): Promise<CreateSeasonResult> {
  const {
    leagueId,
    league,
    formData,
    schedule,
    existingSeasonId,
    onSavePreference,
  } = params;

  // Submit BCA championship dates to database if custom dates were entered
  let bcaSavedId: string | undefined;
  if (formData.bcaChoice === 'custom' && formData.bcaStartDate && formData.bcaEndDate) {
    console.log('🏆 Submitting BCA championship dates:', formData.bcaStartDate, 'to', formData.bcaEndDate);
    const bcaResult = await submitChampionshipDates('BCA', formData.bcaStartDate, formData.bcaEndDate);
    if (bcaResult) {
      console.log('✅ BCA championship dates saved successfully:', bcaResult);
      bcaSavedId = bcaResult.id;
    } else {
      console.error('❌ Failed to save BCA championship dates - check console for errors');
    }
  } else {
    console.log('ℹ️ Skipping BCA championship date submission:', {
      choice: formData.bcaChoice,
      hasStartDate: !!formData.bcaStartDate,
      hasEndDate: !!formData.bcaEndDate
    });
  }

  // Save BCA preference
  await onSavePreference(
    'BCA',
    formData.bcaChoice,
    bcaSavedId || (formData.bcaChoice !== 'custom' && formData.bcaChoice !== 'ignore' ? formData.bcaChoice : undefined)
  );

  // Submit APA championship dates to database if custom dates were entered
  let apaSavedId: string | undefined;
  if (formData.apaChoice === 'custom' && formData.apaStartDate && formData.apaEndDate) {
    console.log('🏆 Submitting APA championship dates:', formData.apaStartDate, 'to', formData.apaEndDate);
    const apaResult = await submitChampionshipDates('APA', formData.apaStartDate, formData.apaEndDate);
    if (apaResult) {
      console.log('✅ APA championship dates saved successfully:', apaResult);
      apaSavedId = apaResult.id;
    } else {
      console.error('❌ Failed to save APA championship dates - check console for errors');
    }
  } else {
    console.log('ℹ️ Skipping APA championship date submission:', {
      choice: formData.apaChoice,
      hasStartDate: !!formData.apaStartDate,
      hasEndDate: !!formData.apaEndDate
    });
  }

  // Save APA preference
  await onSavePreference(
    'APA',
    formData.apaChoice,
    apaSavedId || (formData.apaChoice !== 'custom' && formData.apaChoice !== 'ignore' ? formData.apaChoice : undefined)
  );

  // Calculate end date using timezone-safe parsing
  const startDate = parseLocalDate(formData.startDate);
  const endDate = calculateEndDate(startDate, parseInt(formData.seasonLength));

  // Generate season name
  const seasonName = generateSeasonName(
    startDate,
    formatDayOfWeek(league.day_of_week),
    formatGameType(league.game_type),
    league.division
  );

  // Build insert data (holidays and championships NOT stored - fetched on-demand)
  const insertData: SeasonInsertData = {
    league_id: leagueId,
    season_name: seasonName,
    start_date: formatDateForDB(startDate),
    end_date: formatDateForDB(endDate),
    season_length: parseInt(formData.seasonLength),
    status: 'upcoming',
  };

  console.log('🔄 Creating season:', insertData);
  console.log('🏆 Championship dates (not stored, baked into schedule):', {
    bca: formData.bcaIgnored ? 'ignored' : `${formData.bcaStartDate} - ${formData.bcaEndDate}`,
    apa: formData.apaIgnored ? 'ignored' : `${formData.apaStartDate} - ${formData.apaEndDate}`,
  });

  let createdSeasonId: string | null = null;

  try {
    // Step 1: Insert season record
    const { data: newSeason, error: seasonError } = await supabase
      .from('seasons')
      .insert([insertData])
      .select()
      .single();

    if (seasonError) throw seasonError;

    createdSeasonId = newSeason.id;
    console.log('✅ Season created:', createdSeasonId);

    // Step 2: Get final schedule from state (already contains regular weeks + blackouts combined)
    // The ScheduleReview component manages the combination and passes us the complete schedule
    console.log('📦 Schedule state at save time:', {
      weekCount: schedule.length,
      byType: {
        regular: schedule.filter(w => w.type === 'regular').length,
        playoffs: schedule.filter(w => w.type === 'playoffs').length,
        'week-off': schedule.filter(w => w.type === 'week-off').length,
      },
      weeks: schedule.map(w => ({ weekNumber: w.weekNumber, weekName: w.weekName, date: w.date, type: w.type }))
    });

    // Map UI week types to database week_type values:
    // - 'regular' → 'regular'
    // - 'playoffs' → 'playoffs'
    // - 'week-off' with weekName containing specific strings → determine if 'season_end_break' or 'blackout'
    const allWeeks = schedule.map(week => {
      let weekType: 'regular' | 'playoffs' | 'blackout' | 'season_end_break';

      // Determine the correct database week_type for each UI type
      if (week.type === 'week-off') {
        // Season End Break has a specific name pattern
        if (week.weekName === 'Season End Break') {
          weekType = 'season_end_break';
        } else {
          // All other week-offs are blackouts (holidays, championships, custom reasons)
          weekType = 'blackout';
        }
      } else if (week.type === 'playoffs') {
        weekType = 'playoffs';
      } else {
        weekType = 'regular';
      }

      return {
        season_id: createdSeasonId,
        scheduled_date: week.date,
        week_name: week.weekName,
        week_type: weekType,
        week_completed: false,
        notes: null,
      };
    });

    console.log('📊 Week insertion summary:', {
      totalWeeks: allWeeks.length,
      byType: {
        regular: allWeeks.filter(w => w.week_type === 'regular').length,
        playoffs: allWeeks.filter(w => w.week_type === 'playoffs').length,
        blackout: allWeeks.filter(w => w.week_type === 'blackout').length,
        season_end_break: allWeeks.filter(w => w.week_type === 'season_end_break').length,
      }
    });
    console.log('📅 Complete schedule to insert:', allWeeks);

    // Step 3: If editing existing season, delete old weeks first
    if (existingSeasonId) {
      console.log('🗑️ Deleting old season_weeks for existing season:', existingSeasonId);
      const { error: deleteError } = await supabase
        .from('season_weeks')
        .delete()
        .eq('season_id', existingSeasonId);

      if (deleteError) {
        console.error('❌ Failed to delete old weeks:', deleteError);
        throw deleteError;
      }
      console.log('✅ Old weeks deleted successfully');
    }

    console.log('🔄 Inserting', allWeeks.length, 'weeks into season_weeks table');

    // Step 4: Batch insert all weeks
    const { error: weeksError } = await supabase
      .from('season_weeks')
      .insert(allWeeks);

    if (weeksError) {
      console.error('❌ Failed to insert weeks, rolling back season creation');
      throw weeksError;
    }

    console.log('✅ Season schedule saved:', allWeeks.length, 'weeks');

    // Type guard - should never be null at this point
    if (!createdSeasonId) {
      throw new Error('Season ID is unexpectedly null after successful creation');
    }

    return {
      seasonId: createdSeasonId,
      seasonName,
    };
  } catch (weeksInsertError) {
    // Rollback: Delete the season if weeks insertion failed
    if (createdSeasonId) {
      console.log('🔄 Rolling back - deleting season:', createdSeasonId);
      await supabase.from('seasons').delete().eq('id', createdSeasonId);
      console.log('✅ Rollback complete - season deleted');
    }
    throw weeksInsertError;
  }
}
