/**
 * @fileoverview LeagueProgressBar Component
 * Displays progress bar for league with context-aware styling
 */
import React from 'react';

type ProgressStatus = 'setup' | 'active' | 'ending_soon' | 'playoffs' | 'completed';

interface LeagueProgressBarProps {
  /** Current status of the league */
  status: ProgressStatus;
  /** Progress percentage (0-100) */
  progress: number;
  /** Label text for progress */
  label: string;
  /** Next action text */
  nextAction?: string;
}

/**
 * LeagueProgressBar Component
 *
 * Displays a color-coded progress bar based on league status:
 * - Orange: Setup phase (0-25%) - League needs configuration
 * - Green: Active season (early/mid) - League running smoothly
 * - Yellow: Season ending soon - Few weeks left
 * - Orange: Playoffs - Playoff period
 * - Red: Season completed - New season needed
 */
export const LeagueProgressBar: React.FC<LeagueProgressBarProps> = ({
  status,
  progress,
  label,
  nextAction,
}) => {
  /**
   * Get styling based on status
   */
  const getStatusStyles = () => {
    switch (status) {
      case 'setup':
        return {
          barColor: 'bg-orange-500',
          textColor: 'text-orange-700',
          bgColor: 'bg-gray-200',
        };
      case 'active':
        return {
          barColor: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-gray-200',
        };
      case 'ending_soon':
        return {
          barColor: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-gray-200',
        };
      case 'playoffs':
        return {
          barColor: 'bg-orange-500',
          textColor: 'text-orange-700',
          bgColor: 'bg-gray-200',
        };
      case 'completed':
        return {
          barColor: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-gray-200',
        };
      default:
        return {
          barColor: 'bg-blue-500',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-200',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className={`w-full ${styles.bgColor} rounded-full h-2`}>
        <div
          className={`${styles.barColor} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
      {nextAction && (
        <p className={`text-xs ${styles.textColor} mt-1`}>{nextAction}</p>
      )}
    </div>
  );
};
