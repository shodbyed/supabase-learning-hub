/**
 * @fileoverview Privacy Settings Section Component
 *
 * Displays user privacy settings including profanity filter toggle.
 * For users under 18, the filter is forced ON and cannot be disabled.
 * For users 18+, the filter can be toggled on/off.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, Lock } from 'lucide-react';
import { useProfanityFilter, updateProfanityFilter } from '@/hooks/useProfanityFilter';
import { useUser } from '@/context/useUser';

export const PrivacySettingsSection: React.FC = () => {
  const { user } = useUser();
  const { shouldFilter, canToggle, isLoading } = useProfanityFilter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleToggle = async () => {
    if (!user || !canToggle) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    const { error: updateError } = await updateProfanityFilter(user.id, !shouldFilter);

    if (updateError) {
      setError('Failed to update profanity filter setting. Please try again.');
      setIsSaving(false);
      return;
    }

    setSuccess(true);
    setIsSaving(false);

    // Reload page to update filter state (or use state management)
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        <div className="text-gray-500">Loading privacy settings...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5" />
        Privacy Settings
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">Privacy settings updated successfully!</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Profanity Filter Toggle */}
        <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-900">
                Profanity Filter
              </Label>
              {!canToggle && (
                <Lock className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {canToggle
                ? 'Filter inappropriate language in messages. When enabled, profanity will be replaced with asterisks.'
                : 'Profanity filter is required for users under 18 years old.'}
            </p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                shouldFilter
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {shouldFilter ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {canToggle && (
            <Button
              onClick={handleToggle}
              disabled={isSaving}
              variant={shouldFilter ? 'destructive' : 'default'}
              size="sm"
            >
              {isSaving ? 'Saving...' : shouldFilter ? 'Disable' : 'Enable'}
            </Button>
          )}
        </div>

        {!canToggle && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> This setting will become available when you turn 18.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
