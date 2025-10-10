/**
 * @fileoverview ConflictBadge Component
 *
 * Small visual indicator for schedule conflicts (holidays or championships)
 * Shows conflict type with appropriate color and tooltip
 */
import React from 'react';
import type { ConflictBadgeProps } from '@/types/scheduleReview';

/**
 * ConflictBadge Component
 *
 * Displays a single conflict as a colored badge with tooltip
 * Holiday conflicts show in orange, championship conflicts in blue
 */
export const ConflictBadge: React.FC<ConflictBadgeProps> = ({ conflict }) => {
  const isHoliday = conflict.type === 'holiday';

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
        isHoliday
          ? 'bg-orange-100 text-orange-800 border border-orange-200'
          : 'bg-blue-100 text-blue-800 border border-blue-200'
      }`}
      title={conflict.reason}
    >
      {isHoliday ? '⚠️' : '🏆'}
      <span>{conflict.name}</span>
    </div>
  );
};
