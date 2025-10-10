/**
 * @fileoverview Week Off Reason Modal
 *
 * Modal dialog for entering a custom reason when inserting a week-off
 * without an associated conflict (e.g., local tournament, hurricane, facility closed)
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Props for WeekOffReasonModal component
 */
interface WeekOffReasonModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when user confirms with a reason */
  onConfirm: (reason: string) => void;
  /** Callback when user cancels */
  onCancel: () => void;
}

/**
 * WeekOffReasonModal Component
 *
 * Prompts user to enter a custom reason for a week-off when there's no automatic conflict
 * - 20 character limit (needs to fit in table on mobile)
 * - Cannot be empty
 * - Examples: "Hurricane", "Local Tournament", "Facility Closed"
 */
export const WeekOffReasonModal: React.FC<WeekOffReasonModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const trimmedReason = reason.trim();

    // Validation
    if (!trimmedReason) {
      setError('Please enter a reason for the week off');
      return;
    }

    if (trimmedReason.length > 20) {
      setError('Reason must be 20 characters or less');
      return;
    }

    // Success - clear state and confirm
    setReason('');
    setError('');
    onConfirm(trimmedReason);
  };

  const handleCancel = () => {
    // Clear state and cancel
    setReason('');
    setError('');
    onCancel();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Enter Reason for Week Off
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Provide a brief reason for this week off (e.g., "Hurricane", "Local
          Tournament", "Facility Closed")
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason (max 20 characters)
            </label>
            <input
              id="reason"
              type="text"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(''); // Clear error on input
              }}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Hurricane"
              maxLength={20}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-red-600">{error}</span>
              <span className="text-gray-500">{reason.length}/20</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            Insert Week Off
          </Button>
        </div>
      </div>
    </div>
  );
};
