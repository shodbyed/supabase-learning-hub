/**
 * @fileoverview Message Settings Modal
 *
 * Accordion-style settings menu for messaging features:
 * - Privacy & Safety (profanity filter, block list, reports)
 * - Notifications (future)
 * - Preferences (future)
 */

import { useState } from 'react';
import { X, Shield, Lock, UserX, Flag, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useProfanityFilter, updateProfanityFilter } from '@/hooks/useProfanityFilter';
import { useUser } from '@/context/useUser';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { BlockedUsersModal } from './BlockedUsersModal';

interface MessageSettingsModalProps {
  onClose: () => void;
  onUnblocked?: () => void; // Callback when a user is unblocked
}

export function MessageSettingsModal({ onClose, onUnblocked }: MessageSettingsModalProps) {
  const { user } = useUser();
  const { memberId } = useCurrentMember();
  const { shouldFilter: initialShouldFilter, canToggle, isLoading } = useProfanityFilter();
  const [shouldFilter, setShouldFilter] = useState(initialShouldFilter);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showBlockedUsersModal, setShowBlockedUsersModal] = useState(false);

  const handleToggleProfanityFilter = async () => {
    if (!user || !canToggle) return;

    const newValue = !shouldFilter;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    const { error: updateError } = await updateProfanityFilter(user.id, newValue);

    if (updateError) {
      setError('Failed to update profanity filter. Please try again.');
      setIsSaving(false);
      return;
    }

    // Update local state to reflect the change
    setShouldFilter(newValue);
    setSuccess(true);
    setIsSaving(false);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0 bg-white">
          <h2 className="text-xl font-semibold">Message Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Success/Error Messages */}
        <div className="flex-shrink-0">
          {success && (
            <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700 font-medium">
                Settings saved successfully!
              </p>
            </div>
          )}

          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {/* Privacy & Safety Section */}
            <AccordionItem value="privacy" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div className="text-left">
                    <div className="font-semibold">Privacy & Safety</div>
                    <div className="text-sm text-gray-500 font-normal">
                      Content filtering, blocked users, and reports
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {/* Profanity Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Shield className="h-4 w-4" />
                    Profanity Filter
                  </div>

                  {isLoading ? (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">Loading...</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium text-gray-900">
                              Filter inappropriate language
                            </Label>
                            {!canToggle && (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Control how profanity appears in your messages
                          </p>
                        </div>

                        <Switch
                          checked={shouldFilter}
                          onCheckedChange={handleToggleProfanityFilter}
                          disabled={!canToggle || isSaving}
                          className="ml-3"
                        />
                      </div>

                      {/* Status Badge & Explanation */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 font-medium">Status:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            shouldFilter
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {shouldFilter ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>

                        <div className="p-2 bg-white rounded border border-gray-200">
                          <p className="text-xs text-gray-700">
                            {shouldFilter ? (
                              <>
                                <strong className="text-green-700">Enabled:</strong> Profanity in messages you receive will be replaced with asterisks (****). Other users see messages based on their own filter settings.
                              </>
                            ) : (
                              <>
                                <strong className="text-gray-700">Disabled:</strong> Messages appear unfiltered. You will see all content exactly as it was sent, including any inappropriate language.
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {!canToggle && (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                          <strong>Note:</strong> This filter is required for users under 18 and cannot be disabled.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  {/* Blocked Users */}
                  <button
                    onClick={() => setShowBlockedUsersModal(true)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <UserX className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">Blocked Users</div>
                        <div className="text-xs text-gray-500">Manage blocked users list</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>

                  {/* My Reports */}
                  <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors text-left group">
                    <div className="flex items-center gap-3">
                      <Flag className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">My Reports</div>
                        <div className="text-xs text-gray-500">View reports you've submitted</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Notifications Section - Coming Soon */}
            <AccordionItem value="notifications" className="border rounded-lg opacity-50">
              <AccordionTrigger className="px-4 hover:no-underline cursor-not-allowed" disabled>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 flex items-center justify-center text-gray-400">🔔</div>
                  <div className="text-left">
                    <div className="font-semibold">Notifications</div>
                    <div className="text-sm text-gray-500 font-normal">
                      Coming soon
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
            </AccordionItem>

            {/* Preferences Section - Coming Soon */}
            <AccordionItem value="preferences" className="border rounded-lg opacity-50">
              <AccordionTrigger className="px-4 hover:no-underline cursor-not-allowed" disabled>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 flex items-center justify-center text-gray-400">⚙️</div>
                  <div className="text-left">
                    <div className="font-semibold">Preferences</div>
                    <div className="text-sm text-gray-500 font-normal">
                      Coming soon
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex-shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>

      {/* Blocked Users Modal */}
      {showBlockedUsersModal && memberId && (
        <BlockedUsersModal
          currentUserId={memberId}
          onClose={() => setShowBlockedUsersModal(false)}
          onUnblocked={onUnblocked}
        />
      )}
    </div>
  );
}
