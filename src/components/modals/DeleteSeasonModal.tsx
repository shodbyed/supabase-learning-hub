/**
 * @fileoverview Delete Season Confirmation Modal
 *
 * Modal that warns users about deleting a season and requires confirmation.
 * Shows what data will be deleted (teams, schedule, etc.)
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteSeasonModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Season name to display in warning */
  seasonName: string;
  /** Whether the season has teams */
  hasTeams: boolean;
  /** Whether the season has a schedule */
  hasSchedule: boolean;
  /** Whether delete is in progress */
  isDeleting?: boolean;
  /** Callback when user confirms deletion */
  onConfirm: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
}

/**
 * DeleteSeasonModal Component
 *
 * Displays a warning modal before deleting a season.
 * Shows what data will be removed and requires explicit confirmation.
 */
export const DeleteSeasonModal: React.FC<DeleteSeasonModalProps> = ({
  isOpen,
  seasonName,
  hasTeams,
  hasSchedule,
  isDeleting = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        {/* Warning Icon */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Delete Season?
        </h2>

        {/* Warning Message */}
        <div className="mb-4">
          <p className="text-gray-700 text-center mb-4">
            You are about to permanently delete <strong>{seasonName}</strong>.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-900 font-semibold mb-2">This action will delete:</p>
            <ul className="list-disc list-inside text-red-800 space-y-1 text-sm">
              <li>Season dates and schedule configuration</li>
              {hasSchedule && <li>All season weeks (regular weeks, blackouts, playoffs)</li>}
              {hasTeams && <li>All team enrollments for this season</li>}
              {hasSchedule && <li>Generated match schedule</li>}
            </ul>
          </div>

          <p className="text-gray-600 text-sm text-center mt-4">
            <strong>This cannot be undone.</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Deleting...' : 'Delete Season'}
          </Button>
        </div>
      </div>
    </div>
  );
};
