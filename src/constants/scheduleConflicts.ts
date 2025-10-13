/**
 * @fileoverview Schedule Conflict Constants
 *
 * Centralized constants for schedule conflict detection and management
 */
import type { ConflictSeverity } from '@/types/season';

/** Days before/after league night to check for conflicts */
export const CONFLICT_DETECTION_THRESHOLD_DAYS = 4;

/** Severity ordering for comparison (lower number = higher severity) */
export const SEVERITY_ORDER: Record<ConflictSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
} as const;

/** localStorage keys for schedule data */
export const STORAGE_KEYS = {
  SCHEDULE_REVIEW: 'season-schedule-review',
  BLACKOUT_WEEKS: 'season-blackout-weeks',
} as const;
