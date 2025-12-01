/**
 * @fileoverview Championship Date Editor Hook
 *
 * Reusable hook for managing inline championship date editing.
 * Handles edit state, validation, and saving for any championship type (BCA, APA, etc).
 * Eliminates duplicate code between championship types.
 */

import { useState } from 'react';
import { supabase } from '@/supabaseClient';
import type { ChampionshipPreference } from './useChampionshipPreferences';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

interface UseChampionshipDateEditorReturn {
  /** Is currently in edit mode? */
  isEditing: boolean;
  /** Start date being edited */
  startDate: string;
  /** End date being edited */
  endDate: string;
  /** Set start date */
  setStartDate: (date: string) => void;
  /** Set end date */
  setEndDate: (date: string) => void;
  /** Enter edit mode */
  startEditing: () => void;
  /** Cancel editing and reset */
  cancelEditing: () => void;
  /** Save dates to database */
  saveDates: () => Promise<void>;
  /** Is save operation in progress? */
  isSaving: boolean;
}

/**
 * Hook to manage inline championship date editing
 *
 * Handles all logic for editing championship dates:
 * - Edit state management
 * - Date validation
 * - Creating new championship records
 * - Updating existing championship records
 * - Creating preference records
 *
 * @param organization - Championship organization ('BCA' or 'APA')
 * @param preference - Current championship preference (may be null if not set)
 * @param operatorId - Operator's ID for creating preferences
 * @param onSaveSuccess - Callback when save succeeds
 * @returns Edit state and control functions
 *
 * @example
 * const bcaEditor = useChampionshipDateEditor(
 *   'BCA',
 *   bcaPreference,
 *   operatorId,
 *   refetchPreferences
 * );
 *
 * // In JSX
 * {bcaEditor.isEditing ? (
 *   <>
 *     <Calendar value={bcaEditor.startDate} onChange={bcaEditor.setStartDate} />
 *     <Button onClick={bcaEditor.saveDates}>Save</Button>
 *     <Button onClick={bcaEditor.cancelEditing}>Cancel</Button>
 *   </>
 * ) : (
 *   <Button onClick={bcaEditor.startEditing}>Edit</Button>
 * )}
 */
export function useChampionshipDateEditor(
  organization: 'BCA' | 'APA',
  preference: ChampionshipPreference | null,
  operatorId: string | null | undefined,
  onSaveSuccess: () => Promise<void>
): UseChampionshipDateEditorReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Enter edit mode - populate with existing dates or empty
   */
  const startEditing = () => {
    if (preference?.championship) {
      setStartDate(preference.championship.start_date);
      setEndDate(preference.championship.end_date);
    } else {
      setStartDate('');
      setEndDate('');
    }
    setIsEditing(true);
  };

  /**
   * Cancel editing - reset state
   */
  const cancelEditing = () => {
    setIsEditing(false);
    setStartDate('');
    setEndDate('');
  };

  /**
   * Save championship dates to database
   * Validates dates, creates or updates records, refreshes data
   */
  const saveDates = async () => {
    if (!operatorId || !startDate || !endDate) {
      return;
    }

    // Validate that end date is after start date
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      toast.error('End date must be after start date');
      return;
    }

    setIsSaving(true);

    try {
      const currentYear = new Date().getFullYear();

      if (preference?.championship) {
        // Update existing championship_date_options record
        const { error } = await supabase
          .from('championship_date_options')
          .update({
            start_date: startDate,
            end_date: endDate,
          })
          .eq('id', preference.championship.id);

        if (error) throw error;
      } else {
        // Check if a championship record already exists for this org/year
        const { data: existingChamp } = await supabase
          .from('championship_date_options')
          .select('id')
          .eq('organization', organization)
          .eq('year', currentYear)
          .maybeSingle();

        let championshipId: string;

        if (existingChamp) {
          // Update existing record
          const { error } = await supabase
            .from('championship_date_options')
            .update({
              start_date: startDate,
              end_date: endDate,
            })
            .eq('id', existingChamp.id);

          if (error) throw error;
          championshipId = existingChamp.id;
        } else {
          // Create new championship_date_options record
          const { data: newChampionship, error: champError } = await supabase
            .from('championship_date_options')
            .insert({
              organization,
              year: currentYear,
              start_date: startDate,
              end_date: endDate,
              dev_verified: false,
            })
            .select()
            .single();

          if (champError) throw champError;
          championshipId = newChampionship.id;
        }

        // Check if preference record already exists
        const { data: existingPref } = await supabase
          .from('operator_blackout_preferences')
          .select('id')
          .eq('organization_id', operatorId)
          .eq('preference_type', 'championship')
          .eq('championship_id', championshipId)
          .maybeSingle();

        if (existingPref) {
          // Update existing preference
          const { error: prefError } = await supabase
            .from('operator_blackout_preferences')
            .update({
              preference_action: 'blackout',
              auto_apply: false,
            })
            .eq('id', existingPref.id);

          if (prefError) throw prefError;
        } else {
          // Create new preference record
          const { error: prefError } = await supabase
            .from('operator_blackout_preferences')
            .insert({
              organization_id: operatorId,
              preference_type: 'championship',
              preference_action: 'blackout',
              championship_id: championshipId,
              auto_apply: false,
            });

          if (prefError) throw prefError;
        }
      }

      await onSaveSuccess();
      setIsEditing(false);
    } catch (err) {
      logger.error('Failed to save championship dates', {
        error: err instanceof Error ? err.message : String(err),
        organization,
        operatorId,
        startDate,
        endDate
      });
      toast.error(`Failed to save ${organization} dates. Check console for details.`);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditing,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    startEditing,
    cancelEditing,
    saveDates,
    isSaving,
  };
}
