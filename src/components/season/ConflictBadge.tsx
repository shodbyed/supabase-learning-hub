/**
 * @fileoverview ConflictBadge Component
 *
 * Small visual indicator for schedule conflicts (holidays or championships)
 * Color-coded by severity: Red (critical), Orange (high), Yellow (medium), Blue (low)
 */
import React from 'react';
import type { ConflictBadgeProps } from '@/types/scheduleReview';

/**
 * ConflictBadge Component
 *
 * Displays a single conflict as a colored badge based on severity
 * - Critical (red): Same day or travel week
 * - High (orange): 1 day away
 * - Medium (yellow): 2-3 days away
 * - Low (blue): 4-7 days away
 */
export const ConflictBadge: React.FC<ConflictBadgeProps> = ({ conflict }) => {
  // Determine colors based on severity
  const severityStyles = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const severityEmoji = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🔵',
  };

  const colorClass = severityStyles[conflict.severity];
  const emoji = conflict.type === 'championship' ? '🏆' : severityEmoji[conflict.severity];

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${colorClass}`}
      title={conflict.reason}
    >
      <span>{emoji}</span>
      <span>{conflict.name}</span>
    </div>
  );
};
