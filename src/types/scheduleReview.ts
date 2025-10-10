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
}

/**
 * Props for ConflictBadge component
 */
export interface ConflictBadgeProps {
  /** Conflict to display */
  conflict: ConflictFlag;
}
