/**
 * @fileoverview Announcement Modal (REFACTORED)
 *
 * Modal for creating announcements to leagues and organizations.
 *
 * REFACTORING IMPROVEMENTS:
 * - Extracted useAnnouncementTargets hook (data fetching logic)
 * - Extracted SelectedTargetChips component (display selected targets)
 * - Extracted TargetSelector component (target selection UI)
 * - Extracted AnnouncementTextInput component (text input with counter)
 * - Main component now only orchestrates sub-components (~100 lines vs 304)
 * - Each sub-component has single responsibility
 * - Easier to test and maintain
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Megaphone } from 'lucide-react';
import { Modal } from '@/components/shared';
import { useAnnouncementTargets, type AnnouncementTarget } from './announcements/useAnnouncementTargets';
import { SelectedTargetChips } from './announcements/SelectedTargetChips';
import { TargetSelector } from './announcements/TargetSelector';
import { AnnouncementTextInput } from './announcements/AnnouncementTextInput';

interface AnnouncementModalProps {
  onClose: () => void;
  onCreateAnnouncement: (targets: AnnouncementTarget[], message: string) => void;
  currentUserId: string;
  canAccessOperatorFeatures: boolean;
}

export function AnnouncementModal({
  onClose,
  onCreateAnnouncement,
  currentUserId,
  canAccessOperatorFeatures,
}: AnnouncementModalProps) {
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [announcementText, setAnnouncementText] = useState('');

  // Fetch announcement targets using custom hook
  const { targets, loading } = useAnnouncementTargets(currentUserId, canAccessOperatorFeatures);

  const handleToggleTarget = (targetId: string) => {
    setSelectedTargetIds((prev) =>
      prev.includes(targetId) ? prev.filter((id) => id !== targetId) : [...prev, targetId]
    );
  };

  const handleCreate = () => {
    if (selectedTargetIds.length === 0) {
      alert('Please select at least one target');
      return;
    }

    if (!announcementText.trim()) {
      alert('Please enter an announcement message');
      return;
    }

    const selectedTargets = targets.filter((t) => selectedTargetIds.includes(t.id));
    onCreateAnnouncement(selectedTargets, announcementText);
  };

  const selectedTargets = targets.filter((t) => selectedTargetIds.includes(t.id));

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create Announcement"
      icon={<Megaphone className="h-5 w-5 text-blue-600" />}
      maxWidth="2xl"
    >
      <Modal.Body className="p-0">
        {/* Selected Targets Chips */}
        <SelectedTargetChips selectedTargets={selectedTargets} onRemove={handleToggleTarget} />

        {/* Target Selection List */}
        <div className="flex-1 overflow-y-auto p-6">
          <TargetSelector
            targets={targets}
            selectedTargetIds={selectedTargetIds}
            loading={loading}
            onToggle={handleToggleTarget}
          />

          {/* Announcement Text Input */}
          {targets.length > 0 && (
            <AnnouncementTextInput
              value={announcementText}
              onChange={setAnnouncementText}
              maxLength={500}
            />
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={selectedTargetIds.length === 0 || !announcementText.trim()}
          className="flex-1"
        >
          {selectedTargetIds.length === 0
            ? 'Select Target'
            : `Send to ${selectedTargetIds.length} Target${selectedTargetIds.length > 1 ? 's' : ''}`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
