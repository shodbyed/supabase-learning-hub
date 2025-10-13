/**
 * @fileoverview Schedule Review Types
 *
 * Type definitions specific to the schedule review UI components
 */
import type { WeekEntry, ConflictFlag, ChampionshipEvent } from './season';
import type { Holiday } from '@/utils/holidayUtils';

/**
 * Props for ScheduleReview container component
 */
export interface ScheduleReviewProps {
  /** Initial schedule with conflicts */
  schedule: WeekEntry[];
  /** League day of week for conflict detection */
  leagueDayOfWeek: string;
  /** Season start date (used for recalculation) */
  seasonStartDate: string;
  /** Holidays for conflict recalculation */
  holidays: Holiday[];
  /** BCA championship dates */
  bcaChampionship?: ChampionshipEvent;
  /** APA championship dates */
  apaChampionship?: ChampionshipEvent;
  /**
   * Current play week number (locks editing of earlier weeks)
   * TODO: Will be fetched from database in future (e.g., SELECT MAX(week_number) FROM match_results)
   * For new seasons, pass 0 to allow all weeks to be edited
   */
  currentPlayWeek?: number;
  /** Callback when schedule is modified */
  onScheduleChange: (updatedSchedule: WeekEntry[]) => void;
  /** Callback when user confirms final schedule */
  onConfirm: () => void;
  /** Callback to go back to previous step */
  onBack: () => void;
}

/**
 * Props for ScheduleWeekRow component
 */
export interface ScheduleWeekRowProps {
  /** Week data to display */
  week: WeekEntry;
  /** Index in schedule array */
  index: number;
  /** Callback when insert/remove week-off is clicked */
  onToggleWeekOff: (index: number) => void;
  /**
   * Current play week number (locks editing of earlier weeks)
   * Weeks with weekName "Week 1", "Week 2", etc. that are <= currentPlayWeek will be locked
   */
  currentPlayWeek?: number;
}

/**
 * Props for ConflictBadge component
 */
export interface ConflictBadgeProps {
  /** Conflict to display */
  conflict: ConflictFlag;
}
