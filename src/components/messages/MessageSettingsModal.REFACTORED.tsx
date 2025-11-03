/**
 * @fileoverview Message Settings Modal (REFACTORED)
 *
 * Accordion-style settings menu for messaging features.
 *
 * REFACTORING IMPROVEMENTS:
 * - Extracted StatusAlert component (success/error messages)
 * - Extracted ProfanityFilterSection component (profanity filter logic + UI)
 * - Extracted PrivacySafetyActions component (blocked users, reports buttons)
 * - Main component now only orchestrates sections (~95 lines vs 254)
 * - Each sub-component has single responsibility
 * - Easier to test and maintain
 */

import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useUser } from '@/context/useUser';
import { useMemberId } from '@/api/hooks';
import { BlockedUsersModal } from './BlockedUsersModal';
import { Modal } from '@/components/shared';
import { StatusAlert } from './settings/StatusAlert';
import { ProfanityFilterSection } from './settings/ProfanityFilterSection';
import { PrivacySafetyActions } from './settings/PrivacySafetyActions';

interface MessageSettingsModalProps {
  onClose: () => void;
  onUnblocked?: () => void; // Callback when a user is unblocked
}

export function MessageSettingsModal({ onClose, onUnblocked }: MessageSettingsModalProps) {
  const { user } = useUser();
  const memberId = useMemberId();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showBlockedUsersModal, setShowBlockedUsersModal] = useState(false);

  const handleSuccess = () => {
    setError(null);
    setSuccess(true);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  const handleError = (message: string) => {
    setSuccess(false);
    setError(message);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Message Settings">
      <Modal.Body className="space-y-4">
        {/* Status Alerts */}
        <StatusAlert
          type={success ? 'success' : error ? 'error' : null}
          message={success ? 'Settings saved successfully!' : error || ''}
        />

        {/* Settings Content */}
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
              <ProfanityFilterSection
                userId={user?.id}
                onSuccess={handleSuccess}
                onError={handleError}
              />

              {/* Privacy Actions */}
              <PrivacySafetyActions
                onBlockedUsersClick={() => setShowBlockedUsersModal(true)}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Notifications Section - Coming Soon */}
          <AccordionItem value="notifications" className="border rounded-lg opacity-50">
            <AccordionTrigger className="px-4 hover:no-underline cursor-not-allowed" disabled>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 flex items-center justify-center text-gray-400">🔔</div>
                <div className="text-left">
                  <div className="font-semibold">Notifications</div>
                  <div className="text-sm text-gray-500 font-normal">Coming soon</div>
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
                  <div className="text-sm text-gray-500 font-normal">Coming soon</div>
                </div>
              </div>
            </AccordionTrigger>
          </AccordionItem>
        </Accordion>
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={onClose} variant="outline" className="w-full">
          Close
        </Button>
      </Modal.Footer>

      {/* Blocked Users Modal */}
      {showBlockedUsersModal && memberId && (
        <BlockedUsersModal
          currentUserId={memberId}
          onClose={() => setShowBlockedUsersModal(false)}
          onUnblocked={onUnblocked}
        />
      )}
    </Modal>
  );
}
