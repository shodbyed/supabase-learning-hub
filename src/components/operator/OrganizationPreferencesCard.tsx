/**
 * @fileoverview Organization Preferences Card Component
 *
 * Displays and manages organization-level default preferences.
 * These serve as defaults for all leagues under this organization.
 * NULL values will use system defaults.
 *
 * TODO: Enhanced InfoButton dialogs needed
 * Each preference setting needs:
 * 1. Brief explanation in info dialog
 * 2. "Learn More" link in dialog that navigates to dedicated help page
 * 3. Help pages should explain:
 *    - How the setting works in detail
 *    - Why we use it / best practices
 *    - Impact on gameplay/scoring
 *    - Examples of when to use each option
 *
 * Example structure:
 * - /help/preferences/handicap-variant
 * - /help/preferences/team-handicap-variant
 * - /help/preferences/game-history-limit
 * - /help/preferences/team-format
 * - /help/preferences/golden-break
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { InfoButton } from '@/components/InfoButton';
import { Settings } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import type { OrganizationPreferences } from '@/types/preferences';
import type { HandicapVariant, TeamFormat } from '@/types/league';
import { SYSTEM_DEFAULTS } from '@/types/preferences';
import { logger } from '@/utils/logger';

interface OrganizationPreferencesCardProps {
  organizationId: string;
  onUpdate?: () => void;
}

/**
 * Organization Preferences Card
 * Allows operators to set default preferences for all their leagues
 */
export const OrganizationPreferencesCard: React.FC<OrganizationPreferencesCardProps> = ({
  organizationId,
  onUpdate,
}) => {
  const [preferences, setPreferences] = useState<OrganizationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<'handicap' | 'format' | 'rules' | null>(null);

  // Local edit state
  const [handicapVariant, setHandicapVariant] = useState<HandicapVariant | 'default'>('default');
  const [teamHandicapVariant, setTeamHandicapVariant] = useState<HandicapVariant | 'default'>('default');
  const [gameHistoryLimit, setGameHistoryLimit] = useState<number>(200);
  const [teamFormat, setTeamFormat] = useState<TeamFormat | 'default'>('default');
  const [goldenBreakWin, setGoldenBreakWin] = useState<boolean>(true);

  // Fetch organization preferences on mount
  useEffect(() => {
    fetchPreferences();
  }, [organizationId]);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('preferences')
      .select('*')
      .eq('entity_type', 'organization')
      .eq('entity_id', organizationId)
      .single();

    if (fetchError) {
      // If no preference record exists, create one with default values
      if (fetchError.code === 'PGRST116') {
        const { data: newPrefs, error: insertError } = await supabase
          .from('preferences')
          .insert({
            entity_type: 'organization',
            entity_id: organizationId,
            // All preference fields default to NULL (will use system defaults)
          })
          .select()
          .single();

        if (insertError) {
          setError('Failed to create preferences record');
          logger.error('Error creating preferences', { error: insertError.message });
        } else if (newPrefs) {
          setPreferences(newPrefs as OrganizationPreferences);
          syncLocalState(newPrefs as OrganizationPreferences);
        }
      } else {
        setError('Failed to load preferences');
        logger.error('Error fetching preferences', { error: fetchError.message });
      }
    } else if (data) {
      setPreferences(data as OrganizationPreferences);
      syncLocalState(data as OrganizationPreferences);
    }

    setLoading(false);
  };

  // Sync local edit state with fetched preferences
  const syncLocalState = (prefs: OrganizationPreferences) => {
    setHandicapVariant(prefs.handicap_variant || 'default');
    setTeamHandicapVariant(prefs.team_handicap_variant || 'default');
    setGameHistoryLimit(prefs.game_history_limit ?? SYSTEM_DEFAULTS.game_history_limit);
    setTeamFormat(prefs.team_format || 'default');
    setGoldenBreakWin(prefs.golden_break_counts_as_win ?? SYSTEM_DEFAULTS.golden_break_counts_as_win);
  };

  // Start editing a section
  const startEditing = (section: 'handicap' | 'format' | 'rules') => {
    if (preferences) {
      syncLocalState(preferences);
    }
    setEditingSection(section);
  };

  // Cancel editing
  const cancelEditing = () => {
    if (preferences) {
      syncLocalState(preferences);
    }
    setEditingSection(null);
  };

  // Save handicap settings
  const saveHandicap = async () => {
    if (!preferences) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('preferences')
      .update({
        handicap_variant: handicapVariant === 'default' ? null : handicapVariant,
        team_handicap_variant: teamHandicapVariant === 'default' ? null : teamHandicapVariant,
        game_history_limit: gameHistoryLimit,
        updated_at: new Date().toISOString(),
      })
      .eq('id', preferences.id);

    if (updateError) {
      setError('Failed to update handicap settings');
      logger.error('Error updating preferences', { error: updateError.message });
    } else {
      setEditingSection(null);
      await fetchPreferences();
      onUpdate?.();
    }

    setSaving(false);
  };

  // Save format settings
  const saveFormat = async () => {
    if (!preferences) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('preferences')
      .update({
        team_format: teamFormat === 'default' ? null : teamFormat,
        updated_at: new Date().toISOString(),
      })
      .eq('id', preferences.id);

    if (updateError) {
      setError('Failed to update format settings');
      logger.error('Error updating preferences', { error: updateError.message });
    } else {
      setEditingSection(null);
      await fetchPreferences();
      onUpdate?.();
    }

    setSaving(false);
  };

  // Save rules settings
  const saveRules = async () => {
    if (!preferences) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('preferences')
      .update({
        golden_break_counts_as_win: goldenBreakWin,
        updated_at: new Date().toISOString(),
      })
      .eq('id', preferences.id);

    if (updateError) {
      setError('Failed to update rules settings');
      logger.error('Error updating preferences', { error: updateError.message });
    } else {
      setEditingSection(null);
      await fetchPreferences();
      onUpdate?.();
    }

    setSaving(false);
  };

  // Display value helpers
  const getDisplayValue = (value: string | number | boolean | null): string => {
    if (value === null) {
      return 'None chosen';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (value === 'standard') return 'Standard';
    if (value === 'reduced') return 'Reduced';
    if (value === 'none') return 'None';
    if (value === '5_man') return '5-Man Teams';
    if (value === '8_man') return '8-Man Teams';
    return String(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-indigo-600" />
            <CardTitle>Organization Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading preferences...</p>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-indigo-600" />
            <CardTitle>Organization Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">
            {error || 'No preferences found. Please contact support.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-indigo-600" />
          <div className="flex-1">
            <CardTitle>Organization Preferences</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Default settings for all your leagues
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Handicap Settings Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Handicap Settings</h3>
              <InfoButton title="Handicap Settings">
                Controls how player and team handicaps are calculated. NULL values use system defaults. These can be overridden per league.
              </InfoButton>
            </div>
            {editingSection !== 'handicap' ? (
              <Button
                onClick={() => startEditing('handicap')}
                size="sm"
                variant="outline"
              >
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={saveHandicap} size="sm" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={cancelEditing} size="sm" variant="outline">
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {editingSection === 'handicap' ? (
            <div className="space-y-4">
              <div>
                <Label>Player Handicap Variant</Label>
                <Select value={handicapVariant} onValueChange={(v) => setHandicapVariant(v as HandicapVariant | 'default')}>
                  <SelectTrigger>
                    <SelectValue placeholder="None chosen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">None chosen</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="reduced">Reduced</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Team Handicap Variant</Label>
                <Select value={teamHandicapVariant} onValueChange={(v) => setTeamHandicapVariant(v as HandicapVariant | 'default')}>
                  <SelectTrigger>
                    <SelectValue placeholder="None chosen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">None chosen</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="reduced">Reduced</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Game History Limit (for handicap calculation)</Label>
                <Input
                  type="number"
                  value={gameHistoryLimit}
                  onChange={(e) => setGameHistoryLimit(parseInt(e.target.value) || 200)}
                  min={50}
                  max={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of recent games to include (50-500)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Player Handicap:</span>
                <span className="font-medium text-gray-900">
                  {getDisplayValue(preferences.handicap_variant)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Team Handicap:</span>
                <span className="font-medium text-gray-900">
                  {getDisplayValue(preferences.team_handicap_variant)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Game History Limit:</span>
                <span className="font-medium text-gray-900">
                  {preferences.game_history_limit ?? 200} games
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Format Settings Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Format Settings</h3>
              <InfoButton title="Format Settings">
                Default team format for new leagues. Can be overridden per league.
              </InfoButton>
            </div>
            {editingSection !== 'format' ? (
              <Button
                onClick={() => startEditing('format')}
                size="sm"
                variant="outline"
              >
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={saveFormat} size="sm" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={cancelEditing} size="sm" variant="outline">
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {editingSection === 'format' ? (
            <div>
              <Label>Team Format</Label>
              <Select value={teamFormat} onValueChange={(v) => setTeamFormat(v as TeamFormat | 'default')}>
                <SelectTrigger>
                  <SelectValue placeholder="None chosen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">None chosen</SelectItem>
                  <SelectItem value="5_man">5-Man Teams</SelectItem>
                  <SelectItem value="8_man">8-Man Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Team Format:</span>
              <span className="font-medium text-gray-900">
                {getDisplayValue(preferences.team_format)}
              </span>
            </div>
          )}
        </div>

        {/* Rules Settings Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Match Rules</h3>
              <InfoButton title="Golden Break Rules">
                <div className="space-y-3">
                  <p>
                    <strong>Official BCA Rules:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>9-Ball:</strong> Golden break DOES count as a win</li>
                    <li><strong>8-Ball:</strong> Golden break does NOT count as a win</li>
                    <li><strong>10-Ball:</strong> Golden break does NOT count as a win</li>
                  </ul>
                  <p>
                    <strong>Your Options:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>None chosen (BCA Standard):</strong> Follows official BCA rules based on game type</li>
                    <li><strong>Yes:</strong> Golden breaks ALWAYS count as wins for ALL game types</li>
                    <li><strong>No:</strong> Golden breaks NEVER count as wins for ANY game types</li>
                  </ul>
                  <p className="text-sm italic mt-2">
                    Note: This is your organization-level default. Individual leagues can override this setting if needed.
                  </p>
                </div>
              </InfoButton>
            </div>
            {editingSection !== 'rules' ? (
              <Button
                onClick={() => startEditing('rules')}
                size="sm"
                variant="outline"
              >
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={saveRules} size="sm" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={cancelEditing} size="sm" variant="outline">
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {editingSection === 'rules' ? (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="goldenBreak"
                checked={goldenBreakWin}
                onChange={(e) => setGoldenBreakWin(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="goldenBreak" className="cursor-pointer">
                Golden break counts as win
              </Label>
            </div>
          ) : (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Golden Break Counts as Win:</span>
              <span className="font-medium text-gray-900">
                {preferences.golden_break_counts_as_win === null ? 'BCA Standard' : (preferences.golden_break_counts_as_win ? 'Yes (all game types)' : 'No (all game types)')}
              </span>
            </div>
          )}
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> These are organization-level defaults used when creating new leagues. Individual leagues can override these settings in the future.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
