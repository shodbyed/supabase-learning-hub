/**
 * @fileoverview Venue List Item Component
 *
 * Displays a venue with checkbox for assignment and limit button.
 * Used in league venue assignment lists.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import type { Venue } from '@/types/venue';

interface VenueListItemProps {
  /** The venue to display */
  venue: Venue;
  /** Whether the venue is assigned */
  isAssigned: boolean;
  /** Whether the toggle action is in progress */
  isToggling: boolean;
  /** Available tables (may be limited) */
  availableTables: number;
  /** Called when checkbox is toggled */
  onToggle: () => void;
  /** Called when limit button is clicked */
  onLimitClick: () => void;
}

/**
 * VenueListItem Component
 *
 * Renders a single venue in an assignment list with:
 * - Checkbox for toggling assignment
 * - Venue name
 * - Table count (if assigned)
 * - Limit button (if assigned)
 *
 * @example
 * <VenueListItem
 *   venue={venue}
 *   isAssigned={true}
 *   isToggling={false}
 *   availableTables={4}
 *   onToggle={handleToggle}
 *   onLimitClick={handleLimit}
 * />
 */
export const VenueListItem: React.FC<VenueListItemProps> = ({
  venue,
  isAssigned,
  isToggling,
  availableTables,
  onToggle,
  onLimitClick,
}) => {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
      <input
        type="checkbox"
        checked={isAssigned}
        onChange={onToggle}
        disabled={isToggling}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {venue.name}
        </p>
      </div>
      {isAssigned && (
        <>
          <span className="text-xs text-gray-600">
            {availableTables} of {venue.total_tables}
          </span>
          <Button size="sm" variant="outline" onClick={onLimitClick}>
            Limit
          </Button>
        </>
      )}
    </div>
  );
};
