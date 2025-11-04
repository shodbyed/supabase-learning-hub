/**
 * @fileoverview Confirm Dialog Component
 *
 * Reusable confirmation dialog for destructive actions.
 * Displays a modal with title, message, and cancel/confirm buttons.
 */

import React from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  /** Dialog title */
  title: string;
  /** Confirmation message */
  message: string;
  /** Text for the confirm button */
  confirmText?: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Button variant for confirm button (default: 'destructive' for delete actions) */
  confirmVariant?: 'default' | 'destructive';
  /** Called when user confirms */
  onConfirm: () => void;
  /** Called when user cancels or clicks outside */
  onCancel: () => void;
}

/**
 * ConfirmDialog Component
 *
 * A modal dialog for confirming destructive or important actions.
 * Clicking outside the dialog or pressing Cancel will trigger onCancel.
 *
 * @example
 * <ConfirmDialog
 *   title="Delete Team?"
 *   message="This will permanently delete the team and all roster data."
 *   confirmText="Delete"
 *   onConfirm={handleDelete}
 *   onCancel={handleCancel}
 * />
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'destructive',
  onConfirm,
  onCancel,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
