/**
 * @fileoverview Profanity Filter Section Component
 *
 * Self-contained section for managing profanity filter settings.
 * Handles toggle logic, displays current status, and shows explanatory text.
 */

import { useState } from 'react';
import { Shield, Lock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useProfanityFilter, updateProfanityFilter } from '@/hooks/useProfanityFilter';

interface ProfanityFilterSectionProps {
  userId: string | undefined;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function ProfanityFilterSection({ userId, onSuccess, onError }: ProfanityFilterSectionProps) {
  const { shouldFilter: initialShouldFilter, canToggle, isLoading } = useProfanityFilter();
  const [shouldFilter, setShouldFilter] = useState(initialShouldFilter);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async () => {
    if (!userId || !canToggle) return;

    const newValue = !shouldFilter;

    setIsSaving(true);

    const { error: updateError } = await updateProfanityFilter(userId, newValue);

    if (updateError) {
      onError('Failed to update profanity filter. Please try again.');
      setIsSaving(false);
      return;
    }

    // Update local state to reflect the change
    setShouldFilter(newValue);
    onSuccess();
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Shield className="h-4 w-4" />
        Profanity Filter
      </div>

      <div className="p-3 bg-gray-50 rounded-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-900">
                Filter inappropriate language
              </Label>
              {!canToggle && <Lock className="h-4 w-4 text-gray-400" />}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Control how profanity appears in your messages
            </p>
          </div>

          <Switch
            checked={shouldFilter}
            onCheckedChange={handleToggle}
            disabled={!canToggle || isSaving}
            className="ml-3"
          />
        </div>

        {/* Status Badge & Explanation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Status:</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                shouldFilter ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {shouldFilter ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="p-2 bg-white rounded border border-gray-200">
            <p className="text-xs text-gray-700">
              {shouldFilter ? (
                <>
                  <strong className="text-green-700">Enabled:</strong> Profanity in messages you
                  receive will be replaced with asterisks (****). Other users see messages based on
                  their own filter settings.
                </>
              ) : (
                <>
                  <strong className="text-gray-700">Disabled:</strong> Messages appear unfiltered.
                  You will see all content exactly as it was sent, including any inappropriate
                  language.
                </>
              )}
            </p>
          </div>
        </div>

        {!canToggle && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
            <strong>Note:</strong> This filter is required for users under 18 and cannot be
            disabled.
          </div>
        )}
      </div>
    </div>
  );
}
