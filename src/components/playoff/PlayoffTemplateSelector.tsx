/**
 * @fileoverview Playoff Template Selector Component
 *
 * Displays a card with a dropdown to select from available playoff templates.
 * When a template is selected, shows the template's name and description.
 * When settings are modified from the template, shows editable name/description
 * fields and a save button.
 *
 * Shows both global templates (read-only) and organization-specific configs
 * in the dropdown, with visual distinction between them.
 *
 * Used on the Organization Playoff Settings page to let operators choose
 * which global template to use as their organization's default or create
 * a custom configuration.
 */

import React, { useMemo } from 'react';
import { Trophy, Save, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGlobalPlayoffTemplates,
  usePlayoffConfigurations,
} from '@/api/hooks/usePlayoffConfigurations';
import type { PlayoffConfiguration } from '@/api/hooks/usePlayoffConfigurations';

/**
 * Props for PlayoffTemplateSelector component
 */
export interface PlayoffTemplateSelectorProps {
  /** Organization ID to fetch org-specific configs */
  organizationId: string | undefined;
  /** Currently selected template ID */
  selectedTemplateId: string | undefined;
  /** Whether settings have been modified from the selected template */
  isModified: boolean;
  /** Current configuration name (for modified state) */
  configName: string;
  /** Current configuration description (for modified state) */
  configDescription: string;
  /** Callback when a template is selected */
  onTemplateSelect: (template: PlayoffConfiguration) => void;
  /** Callback when config name changes */
  onNameChange: (name: string) => void;
  /** Callback when config description changes */
  onDescriptionChange: (description: string) => void;
  /** Callback when save button is clicked */
  onSave: () => void;
  /** Whether save is in progress */
  isSaving?: boolean;
}

/**
 * PlayoffTemplateSelector Component
 *
 * Fetches global playoff templates and organization configs, displays them
 * in a grouped dropdown. When unmodified, shows the template's name and description.
 * When modified, shows editable fields for custom name/description and a save button.
 *
 * Validates that custom names don't match global template names.
 */
export const PlayoffTemplateSelector: React.FC<PlayoffTemplateSelectorProps> = ({
  organizationId,
  selectedTemplateId,
  isModified,
  configName,
  configDescription,
  onTemplateSelect,
  onNameChange,
  onDescriptionChange,
  onSave,
  isSaving = false,
}) => {
  // Fetch global templates
  const { data: globalTemplates, isLoading: isLoadingGlobal } = useGlobalPlayoffTemplates();

  // Fetch organization-specific configurations
  const { data: orgConfigs, isLoading: isLoadingOrg } = usePlayoffConfigurations(
    'organization',
    organizationId
  );

  const isLoading = isLoadingGlobal || isLoadingOrg;

  // Combine all templates for lookup
  const allTemplates = useMemo(() => {
    const all: PlayoffConfiguration[] = [];
    if (globalTemplates) all.push(...globalTemplates);
    if (orgConfigs) all.push(...orgConfigs);
    return all;
  }, [globalTemplates, orgConfigs]);

  // Find the currently selected template
  const selectedTemplate = allTemplates.find((t) => t.id === selectedTemplateId);

  // Check if the current name matches a global template name (case-insensitive)
  const nameMatchesGlobalTemplate = useMemo(() => {
    if (!configName.trim() || !globalTemplates) return false;
    const normalizedName = configName.trim().toLowerCase();
    return globalTemplates.some(
      (t) => t.name.toLowerCase() === normalizedName
    );
  }, [configName, globalTemplates]);

  // Handle template selection
  const handleSelect = (templateId: string) => {
    const template = allTemplates.find((t) => t.id === templateId);
    if (template) {
      onTemplateSelect(template);
    }
  };

  // Determine what to show as the title
  const displayTitle = isModified
    ? 'Custom Configuration'
    : selectedTemplate?.name || 'Select Playoff Format';

  // Determine if save is disabled
  const isSaveDisabled =
    !configName.trim() ||
    isSaving ||
    nameMatchesGlobalTemplate;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            {displayTitle}
          </CardTitle>
          <Select
            value={isModified ? '' : (selectedTemplateId ?? '')}
            onValueChange={handleSelect}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder={isLoading ? 'Loading...' : (isModified ? 'Custom...' : 'Select template')} />
            </SelectTrigger>
            <SelectContent>
              {/* Global Templates Group */}
              <SelectGroup>
                <SelectLabel>Templates</SelectLabel>
                {globalTemplates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectGroup>

              {/* Organization Configs Group (if any exist) */}
              {orgConfigs && orgConfigs.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Your Configurations</SelectLabel>
                  {orgConfigs.map((config) => (
                    <SelectItem key={config.id} value={config.id}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isModified ? (
          // Modified state: show editable name/description and save button
          <>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              Settings have been modified. Enter a name and save to create your organization&apos;s custom configuration.
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="config-name">Configuration Name *</Label>
                <Input
                  id="config-name"
                  value={configName}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="e.g., My League Playoffs"
                  maxLength={100}
                  className={nameMatchesGlobalTemplate ? 'border-red-500' : ''}
                />
                {nameMatchesGlobalTemplate && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>This name is reserved. Please choose a different name.</span>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="config-description">Description (optional)</Label>
                <Textarea
                  id="config-description"
                  value={configDescription}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder="Describe your playoff configuration..."
                  rows={3}
                  maxLength={500}
                />
              </div>
              <Button
                onClick={onSave}
                disabled={isSaveDisabled}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save as Organization Default'}
              </Button>
            </div>
          </>
        ) : (
          // Unmodified state: show template description
          selectedTemplate?.description ? (
            <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">
              Select a playoff format to see its description.
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default PlayoffTemplateSelector;
