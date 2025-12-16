/**
 * @fileoverview Table Number Bar Component
 *
 * Displays the assigned table number on the scoring page.
 * Clickable to open a modal for changing the table number.
 * Players can enter any table number to easily update when
 * they get assigned to a different table than expected.
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateMatch } from '@/api/mutations/matches';
import { queryKeys } from '@/api/queryKeys';
import { toast } from 'sonner';

interface TableNumberBarProps {
  /** Match ID for updating the table number */
  matchId: string;
  /** Current assigned table number (null if not assigned) */
  tableNumber: number | null;
}

/**
 * TableNumberBar Component
 *
 * Shows the current table assignment and allows players to change it.
 * - Displays "Table X" if assigned, "Set Table Number" if not
 * - Clicking opens a modal to enter a new table number
 * - No restrictions on what number can be entered
 * - Leave empty to clear the assignment
 */
export function TableNumberBar({ matchId, tableNumber }: TableNumberBarProps) {
  const queryClient = useQueryClient();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Table number update mutation
  const updateTableNumberMutation = useMutation({
    mutationFn: (newTableNumber: number | null) =>
      updateMatch({
        matchId,
        updates: { assigned_table_number: newTableNumber },
      }),
    onSuccess: () => {
      toast.success('Table number updated');
      setShowModal(false);
      // Invalidate match queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.detail(matchId) });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update table number');
    },
  });

  /**
   * Handle opening the modal - pre-populate with current value
   */
  const handleOpen = () => {
    setInputValue(tableNumber?.toString() || '');
    setShowModal(true);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (trimmed === '') {
      // Clear the table number
      updateTableNumberMutation.mutate(null);
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num > 0) {
        updateTableNumberMutation.mutate(num);
      } else {
        toast.error('Please enter a valid table number');
      }
    }
  };

  return (
    <>
      {/* Table Number Button */}
      <button
        onClick={handleOpen}
        className="w-full bg-blue-50 border-b border-blue-100 px-4 py-2 text-center hover:bg-blue-100 transition-colors"
      >
        <span className="text-sm font-medium text-blue-800">
          {tableNumber ? `Table ${tableNumber}` : 'Set Table Number'}
        </span>
      </button>

      {/* Table Number Change Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Change Table Number
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="table-number">Table Number</Label>
                <Input
                  id="table-number"
                  type="number"
                  min="1"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter table number"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit();
                    } else if (e.key === 'Escape') {
                      setShowModal(false);
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to clear the table assignment
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={updateTableNumberMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleSubmit}
                  disabled={updateTableNumberMutation.isPending}
                  isLoading={updateTableNumberMutation.isPending}
                  loadingText="Saving..."
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
