/**
 * @fileoverview Championship service for fetching championship preferences
 *
 * Provides database operations for championship-related data including
 * fetching operator preferences for BCA and APA championship dates.
 */
import { supabase } from '@/supabaseClient';
import type { ChampionshipPreference } from '@/data/seasonWizardSteps';

/**
 * Fetch operator's saved championship preferences from database
 *
 * @param operatorId - The operator's ID to fetch preferences for
 * @returns Array of saved championship preferences or empty array if none exist
 *
 * @example
 * ```tsx
 * const preferences = await fetchChampionshipPreferences('operator-123');
 * console.log(preferences); // [{ organization: 'BCA', startDate: '2024-01-15', endDate: '2024-01-20', ignored: false }]
 * ```
 */
export async function fetchChampionshipPreferences(operatorId: string | null): Promise<ChampionshipPreference[]> {
  if (!operatorId) {
    console.log('⚠️ No operatorId available - cannot fetch preferences');
    return [];
  }

  try {
    const { data: preferences } = await supabase
      .from('operator_blackout_preferences')
      .select('*, championship_date_options(*)')
      .eq('operator_id', operatorId)
      .eq('preference_type', 'championship');

    if (preferences && preferences.length > 0) {
      const prefs: ChampionshipPreference[] = preferences
        .filter(p => p.championship_date_options && p.preference_action !== null)
        .map(p => ({
          organization: p.championship_date_options!.organization as 'BCA' | 'APA',
          startDate: p.championship_date_options!.start_date,
          endDate: p.championship_date_options!.end_date,
          ignored: p.preference_action === 'ignore',
        }));

      console.log('📋 Loaded saved championship preferences:', prefs);
      return prefs;
    } else {
      console.log('📋 No saved championship preferences found');
      return [];
    }
  } catch (err) {
    console.error('❌ Failed to fetch saved championship preferences:', err);
    return [];
  }
}
