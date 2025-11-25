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
      console.log(`${organization} save validation failed:`, {
        operatorId: !!operatorId,
        startDate,
        endDate,
      });
      return;
    }

    // Validate that end date is after start date
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      alert('End date must be after start date');
      return;
    }

    console.log(`Saving ${organization} dates:`, {
      startDate,
      endDate,
      hasExisting: !!preference?.championship,
    });

    setIsSaving(true);

    try {
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
        // Create new championship_date_options record
        const currentYear = new Date().getFullYear();
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

        // Create the preference record linking to this championship
        const { error: prefError } = await supabase
          .from('operator_blackout_preferences')
          .insert({
            operator_id: operatorId,
            preference_type: 'championship',
            preference_action: 'blackout',
            championship_id: newChampionship.id,
            auto_apply: false,
          });

        if (prefError) throw prefError;
      }

      console.log(`✅ ${organization} dates saved successfully`);
      await onSaveSuccess();
      setIsEditing(false);
    } catch (err) {
      console.error(`❌ Failed to save ${organization} dates:`, err);
      alert(`Failed to save ${organization} dates. Check console for details.`);
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
