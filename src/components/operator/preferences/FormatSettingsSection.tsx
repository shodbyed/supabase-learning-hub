/**
 * @fileoverview Format Settings Section Component
 *
 * Reusable section for managing team format preferences.
 * Used within PreferencesCard for both organization and league levels.
 */
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { InfoButton } from '@/components/InfoButton';
import type { TeamFormat } from '@/types/league';

interface FormatSettingsSectionProps {
  /** Whether this is league level (affects labels) */
  isLeague: boolean;
  /** Whether currently editing */
  isEditing: boolean;
  /** Whether save is in progress */
  saving: boolean;
  /** Current team format value */
  teamFormat: TeamFormat | 'default';
  /** Display value for team format */
  teamFormatDisplay: string;
  /** Handler for team format change */
  onTeamFormatChange: (value: TeamFormat | 'default') => void;
  /** Handler to start editing */
  onStartEditing: () => void;
  /** Handler to save */
  onSave: () => void;
  /** Handler to cancel */
  onCancel: () => void;
}

/**
 * Format Settings Section
 * Manages team format (5-man or 8-man)
 */
export const FormatSettingsSection: React.FC<FormatSettingsSectionProps> = ({
  isLeague,
  isEditing,
  saving,
  teamFormat,
  teamFormatDisplay,
  onTeamFormatChange,
  onStartEditing,
  onSave,
  onCancel,
}) => {
  const defaultLabel = isLeague ? 'Use organization default' : 'None chosen';

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Format Settings</h3>
          <InfoButton title="Format Settings">
            {isLeague ? 'Team format for this league.' : 'Default team format for new leagues. Can be overridden per league.'}
          </InfoButton>
        </div>
        {!isEditing ? (
          <Button onClick={onStartEditing} size="sm" variant="outline">
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={onSave} size="sm" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={onCancel} size="sm" variant="outline">
              Cancel
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div>
          <Label>Team Format</Label>
          <Select value={teamFormat} onValueChange={(v) => onTeamFormatChange(v as TeamFormat | 'default')}>
            <SelectTrigger>
              <SelectValue placeholder={defaultLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">{defaultLabel}</SelectItem>
              <SelectItem value="5_man">5-Man Teams</SelectItem>
              <SelectItem value="8_man">8-Man Teams</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Team Format:</span>
          <span className="font-medium text-gray-900">{teamFormatDisplay}</span>
        </div>
      )}
    </div>
  );
};
