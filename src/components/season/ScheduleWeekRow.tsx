/**
 * @fileoverview ScheduleWeekRow Component
 *
 * Single row in the schedule review table showing one week's details
 * Displays week number, date, conflicts, and action buttons
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { ConflictBadge } from './ConflictBadge';
import { parseLocalDate } from '@/utils/formatters';
import type { ScheduleWeekRowProps } from '@/types/scheduleReview';

/**
 * ScheduleWeekRow Component
 *
 * Displays a single week in the schedule with:
 * - Week number or type (regular, playoffs, week-off)
 * - Date
 * - Status indicator (✓ Good or ⚠️ Conflicts)
 * - Conflict badges if any
 * - Action buttons (Skip/Un-Skip, Ignore)
 */
export const ScheduleWeekRow: React.FC<ScheduleWeekRowProps> = ({
  week,
  index,
  onToggleWeekOff,
}) => {
  const hasConflicts = week.conflicts.length > 0;
  const isWeekOff = week.type === 'week-off';
  const isPlayoffs = week.type === 'playoffs';
  const isSeasonEndBreak = week.weekName === 'Season End Break';

  // Format date for display using timezone-safe parsing
  const displayDate = parseLocalDate(week.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <tr
      className={`border-b ${
        isWeekOff
          ? 'bg-gray-50'
          : hasConflicts
          ? 'bg-orange-50'
          : 'hover:bg-gray-50'
      }`}
    >
      {/* Week Name */}
      <td className="py-3 px-4 font-medium">
        {week.weekName}
      </td>

      {/* Date */}
      <td className="py-3 px-4 text-gray-700">{displayDate}</td>

      {/* Status */}
      <td className="py-3 px-4">
        {isWeekOff ? (
          <span className="text-gray-500 text-sm">🚫 Week Off</span>
        ) : hasConflicts ? (
          <span className="text-orange-600 font-medium">⚠️ Conflict</span>
        ) : (
          <span className="text-green-600 font-medium">✓ Play</span>
        )}
      </td>

      {/* Conflicts - show for regular weeks and playoffs */}
      <td className="py-3 px-4">
        {hasConflicts && (week.type === 'regular' || week.type === 'playoffs') && (
          <div className="flex flex-col gap-2">
            {week.conflicts.map((conflict, i) => (
              <ConflictBadge key={i} conflict={conflict} />
            ))}
          </div>
        )}
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <Button
          variant={isWeekOff ? 'default' : 'outline'}
          size="sm"
          onClick={() => onToggleWeekOff(index)}
        >
          {isSeasonEndBreak
            ? 'Remove Season End Break'
            : isPlayoffs
            ? 'Insert Season End Break'
            : isWeekOff
            ? 'Remove Week Off'
            : 'Insert Week Off'}
        </Button>
      </td>
    </tr>
  );
};
