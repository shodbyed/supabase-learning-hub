/**
 * @fileoverview ScheduleReviewTable Component
 *
 * Table wrapper component for schedule review
 * Displays headers and maps schedule entries to ScheduleWeekRow components
 */
import React from 'react';
import { ScheduleWeekRow } from './ScheduleWeekRow';
import type { WeekEntry } from '@/types/season';

/**
 * Props for ScheduleReviewTable component
 */
interface ScheduleReviewTableProps {
  /** Array of week entries to display */
  schedule: WeekEntry[];
  /** Callback when insert/remove week-off is clicked */
  onToggleWeekOff: (index: number) => void;
}

/**
 * ScheduleReviewTable Component
 *
 * Simple presentation component that renders a table with headers
 * and maps schedule entries to ScheduleWeekRow components
 */
export const ScheduleReviewTable: React.FC<ScheduleReviewTableProps> = ({
  schedule,
  onToggleWeekOff,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
              Week
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
              Date
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
              Status
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
              Conflicts
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 w-48">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((week, index) => (
            <ScheduleWeekRow
              key={`week-${week.weekName}-${week.date}`}
              week={week}
              index={index}
              onToggleWeekOff={onToggleWeekOff}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
