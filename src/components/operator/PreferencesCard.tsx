/**
 * @fileoverview Preferences Card Component
 *
 * Reusable component for managing preferences at both organization and league levels.
 * - Organization level: NULL = use system defaults
 * - League level: NULL = use organization defaults
 *
 * The component adapts its display text and behavior based on entityType.
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import type { Preferences } from '@/types/preferences';
import type { HandicapVariant, TeamFormat } from '@/types/league';
import { SYSTEM_DEFAULTS } from '@/types/preferences';
import { logger } from '@/utils/logger';

// Import section components
import {
  HandicapSettingsSection,
  FormatSettingsSection,
  MatchRulesSection,
  PlayerAuthorizationSection,
  ContentModerationSection,
} from './preferences';

interface PreferencesCardProps {
  /** Type of entity: 'organization' or 'league' */
  entityType: 'organization' | 'league';
  /** ID of the organization or league */
  entityId: string;
  /** Callback when preferences are updated */
  onUpdate?: () => void;
}

/**
 * Preferences Card Component
 * Allows operators to set preferences for organization or league
 */
export const PreferencesCard: React.FC<PreferencesCardProps> = ({
  entityType,
  entityId,
  onUpdate,
}) => {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<'handicap' | 'format' | 'rules' | 'authorization' | 'moderation' | null>(null);

  // Local edit state
  const [handicapVariant, setHandicapVariant] = useState<HandicapVariant | 'default'>('default');
  const [teamHandicapVariant, setTeamHandicapVariant] = useState<HandicapVariant | 'default'>('default');
  const [gameHistoryLimit, setGameHistoryLimit] = useState<number>(200);
  const [teamFormat, setTeamFormat] = useState<TeamFormat | 'default'>('default');
  const [goldenBreakSetting, setGoldenBreakSetting] = useState<'bca_standard' | 'always' | 'never'>('bca_standard');
  const [allowUnauthorizedPlayers, setAllowUnauthorizedPlayers] = useState<boolean>(true);
  const [profanityFilterEnabled, setProfanityFilterEnabled] = useState<boolean>(false);
  const [isUsingOrgDefault, setIsUsingOrgDefault] = useState(false);
  const [isUsingOrgDefaultModeration, setIsUsingOrgDefaultModeration] = useState(false);

  const isLeague = entityType === 'league';
  const cardTitle = isLeague ? 'League Preferences' : 'Organization Preferences';
  const cardSubtitle = isLeague
    ? 'Override organization defaults for this league'
    : 'Default settings for all your leagues';

  // Fetch preferences on mount
  useEffect(() => {
    fetchPreferences();
  }, [entityId, entityType]);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);

    // Fetch entity preferences
    const { data, error: fetchError } = await supabase
      .from('preferences')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .single();

    if (fetchError) {
      // If no preference record exists, create one with default values
      if (fetchError.code === 'PGRST116') {
        const { data: newPrefs, error: insertError } = await supabase
          .from('preferences')
          .insert({
            entity_type: entityType,
            entity_id: entityId,
          })
          .select()
          .single();

        if (insertError) {
          setError('Failed to create preferences record');
          logger.error('Error creating preferences', { error: insertError.message });
        } else if (newPrefs) {
          setPreferences(newPrefs as Preferences);
          syncLocalState(newPrefs as Preferences);
        }
      } else {
        setError('Failed to load preferences');
        logger.error('Error fetching preferences', { error: fetchError.message });
      }
    } else if (data) {
      setPreferences(data as Preferences);
      syncLocalState(data as Preferences);
    }

    setLoading(false);
  };

  // Sync local edit state with fetched preferences
  const syncLocalState = (prefs: Preferences) => {
    setHandicapVariant(prefs.handicap_variant || 'default');
    setTeamHandicapVariant(prefs.team_handicap_variant || 'default');
    setGameHistoryLimit(prefs.game_history_limit ?? SYSTEM_DEFAULTS.game_history_limit);
    setTeamFormat(prefs.team_format || 'default');
    // Map boolean/null to our three-way setting
    if (prefs.golden_break_counts_as_win === null) {
      setGoldenBreakSetting('bca_standard');
    } else if (prefs.golden_break_counts_as_win === true) {
      setGoldenBreakSetting('always');
    } else {
      setGoldenBreakSetting('never');
    }
    setAllowUnauthorizedPlayers(prefs.allow_unauthorized_players ?? SYSTEM_DEFAULTS.allow_unauthorized_players);
    setProfanityFilterEnabled(prefs.profanity_filter_enabled ?? SYSTEM_DEFAULTS.profanity_filter_enabled);
    setIsUsingOrgDefault(prefs.allow_unauthorized_players === null);
    setIsUsingOrgDefaultModeration(prefs.profanity_filter_enabled === null);
  };

  // Start editing a section
  const startEditing = (section: 'handicap' | 'format' | 'rules' | 'authorization' | 'moderation') => {
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

    // Convert three-way setting to boolean/null for database
    let goldenBreakValue: boolean | null;
    if (goldenBreakSetting === 'bca_standard') {
      goldenBreakValue = null;
    } else if (goldenBreakSetting === 'always') {
      goldenBreakValue = true;
    } else {
      goldenBreakValue = false;
    }

    const { error: updateError } = await supabase
      .from('preferences')
      .update({
        golden_break_counts_as_win: goldenBreakValue,
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

  // Save authorization settings
  const saveAuthorization = async () => {
    if (!preferences) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('preferences')
      .update({
        allow_unauthorized_players: isUsingOrgDefault ? null : allowUnauthorizedPlayers,
        updated_at: new Date().toISOString(),
      })
      .eq('id', preferences.id);

    if (updateError) {
      setError('Failed to update authorization settings');
      logger.error('Error updating preferences', { error: updateError.message });
    } else {
      setEditingSection(null);
      await fetchPreferences();
      onUpdate?.();
    }

    setSaving(false);
  };

  // Save content moderation settings
  const saveModeration = async () => {
    if (!preferences) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('preferences')
      .update({
        profanity_filter_enabled: isUsingOrgDefaultModeration ? null : profanityFilterEnabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', preferences.id);

    if (updateError) {
      setError('Failed to update content moderation settings');
      logger.error('Error updating preferences', { error: updateError.message });
    } else {
      setEditingSection(null);
      await fetchPreferences();
      onUpdate?.();
    }

    setSaving(false);
  };

  // Get display value - simple: show value or "Not set"
  const getDisplayValue = (value: string | null): string => {
    if (value === null) return 'Not set';
    if (value === 'standard') return 'Standard';
    if (value === 'reduced') return 'Reduced';
    if (value === 'none') return 'None';
    if (value === '5_man') return '5-Man Teams';
    if (value === '8_man') return '8-Man Teams';
    return String(value);
  };

  // Get golden break display value
  const getGoldenBreakDisplay = (value: boolean | null): string => {
    if (value === null) return 'Not set';
    return value ? 'Always Count' : 'Never Count';
  };

  // Get authorization display value
  const getAuthorizationDisplay = (value: boolean | null): string => {
    if (value === null) return 'Not set';
    return value
      ? 'New players can be used without authorization'
      : 'Players must be authorized to be used in lineups';
  };

  // Get profanity filter display value
  const getProfanityFilterDisplay = (value: boolean | null): string => {
    if (value === null) return 'Not set';
    return value
      ? 'Team names may not contain profanity'
      : 'Team names may contain profanity';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-indigo-600" />
            <CardTitle>{cardTitle}</CardTitle>
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
            <CardTitle>{cardTitle}</CardTitle>
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
            <CardTitle>{cardTitle}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{cardSubtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Format Settings Section - Only show for organization level (league format is static) */}
        {!isLeague && (
          <FormatSettingsSection
            isLeague={isLeague}
            isEditing={editingSection === 'format'}
            saving={saving}
            teamFormat={teamFormat}
            teamFormatDisplay={getDisplayValue(preferences.team_format)}
            onTeamFormatChange={setTeamFormat}
            onStartEditing={() => startEditing('format')}
            onSave={saveFormat}
            onCancel={cancelEditing}
          />
        )}

        {/* Handicap Settings Section */}
        <HandicapSettingsSection
          isLeague={isLeague}
          isEditing={editingSection === 'handicap'}
          saving={saving}
          handicapVariant={handicapVariant}
          teamHandicapVariant={teamHandicapVariant}
          gameHistoryLimit={gameHistoryLimit}
          playerHandicapDisplay={getDisplayValue(preferences.handicap_variant)}
          teamHandicapDisplay={getDisplayValue(preferences.team_handicap_variant)}
          gameHistoryDisplay={preferences.game_history_limit ? `${preferences.game_history_limit} games` : 'Not set'}
          onHandicapVariantChange={setHandicapVariant}
          onTeamHandicapVariantChange={setTeamHandicapVariant}
          onGameHistoryLimitChange={setGameHistoryLimit}
          onStartEditing={() => startEditing('handicap')}
          onSave={saveHandicap}
          onCancel={cancelEditing}
        />

        {/* Rules Settings Section */}
        <MatchRulesSection
          isLeague={isLeague}
          isEditing={editingSection === 'rules'}
          saving={saving}
          goldenBreakSetting={goldenBreakSetting}
          goldenBreakDisplay={getGoldenBreakDisplay(preferences.golden_break_counts_as_win)}
          onGoldenBreakChange={setGoldenBreakSetting}
          onStartEditing={() => startEditing('rules')}
          onSave={saveRules}
          onCancel={cancelEditing}
        />

        {/* Player Authorization Section */}
        <PlayerAuthorizationSection
          isLeague={isLeague}
          isEditing={editingSection === 'authorization'}
          saving={saving}
          allowUnauthorizedPlayers={allowUnauthorizedPlayers}
          isUsingOrgDefault={isUsingOrgDefault}
          authorizationDisplay={getAuthorizationDisplay(preferences.allow_unauthorized_players)}
          onAuthorizationChange={(value) => {
            setAllowUnauthorizedPlayers(value);
            setIsUsingOrgDefault(false);
          }}
          onUseOrgDefault={isLeague ? () => {
            setIsUsingOrgDefault(true);
            setAllowUnauthorizedPlayers(true);
          } : undefined}
          onStartEditing={() => startEditing('authorization')}
          onSave={saveAuthorization}
          onCancel={cancelEditing}
        />

        {/* Content Moderation Section */}
        <ContentModerationSection
          isLeague={isLeague}
          isEditing={editingSection === 'moderation'}
          saving={saving}
          profanityFilterEnabled={profanityFilterEnabled}
          isUsingOrgDefault={isUsingOrgDefaultModeration}
          profanityFilterDisplay={getProfanityFilterDisplay(preferences.profanity_filter_enabled)}
          onProfanityFilterChange={(value) => {
            setProfanityFilterEnabled(value);
            setIsUsingOrgDefaultModeration(false);
          }}
          onUseOrgDefault={isLeague ? () => {
            setIsUsingOrgDefaultModeration(true);
            setProfanityFilterEnabled(false);
          } : undefined}
          onStartEditing={() => startEditing('moderation')}
          onSave={saveModeration}
          onCancel={cancelEditing}
        />

        {!isLeague && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> These are organization-level defaults. Individual leagues can override these settings.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
