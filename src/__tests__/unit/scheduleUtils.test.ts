/**
 * @fileoverview Unit tests for schedule utility functions
 * Tests schedule generation, date calculations, and blackout date handling
 */
import { describe, it, expect } from 'vitest';
import { generateSchedule } from '@/utils/scheduleUtils';
import type { WeekEntry } from '@/types/season';

/**
 * Helper function to create dates in local timezone
 * Avoids timezone conversion issues with ISO date strings
 */
function createLocalDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day); // month is 0-indexed
}

describe('scheduleUtils', () => {
  describe('generateSchedule', () => {
    it('should generate correct number of weeks for a standard 16-week season', () => {
      const startDate = createLocalDate(2025, 1, 8); // Wednesday, Jan 8, 2025
      // Function signature: startDate, leagueDayOfWeek, seasonLength, blackoutWeeks, seasonEndBreakWeeks
      // Total weeks = seasonLength (16) + seasonEndBreakWeeks (1) + playoffs (1) = 18
      const schedule = generateSchedule(startDate, 'wednesday', 16, [], 1);

      expect(schedule).toHaveLength(18); // 16 regular + 1 break + 1 playoff
      expect(schedule.filter(w => w.type === 'regular')).toHaveLength(16);
      expect(schedule.filter(w => w.type === 'week-off')).toHaveLength(1);
      expect(schedule.filter(w => w.type === 'playoffs')).toHaveLength(1);
    });

    it('should start on the correct day of week', () => {
      const startDate = createLocalDate(2025, 1, 8); // Wednesday, Jan 8, 2025
      const schedule = generateSchedule(startDate, 'wednesday', 16, []);

      // First week should start on the provided start date
      expect(schedule[0].date).toBe('2025-01-08');
    });

    it('should generate consecutive weeks', () => {
      const startDate = createLocalDate(2025, 1, 8); // Wednesday, Jan 8, 2025
      // 3 regular weeks + 1 break week + 1 playoff = 5 total
      const schedule = generateSchedule(startDate, 'wednesday', 3, []);

      // Each week should be 7 days apart
      expect(schedule[0].date).toBe('2025-01-08');
      expect(schedule[1].date).toBe('2025-01-15');
      expect(schedule[2].date).toBe('2025-01-22');
      // Week 3 is season end break
      expect(schedule[3].date).toBe('2025-01-29');
      // Week 4 is playoffs
      expect(schedule[4].date).toBe('2025-02-05');
    });

    it('should skip blackout dates', () => {
      const startDate = createLocalDate(2025, 1, 8); // Wednesday, Jan 8, 2025
      const blackouts: WeekEntry[] = [
        {
          date: '2025-01-15',
          weekName: 'Holiday',
          weekNumber: 0,
          type: 'week-off', // Use 'week-off' instead of 'blackout' for type compatibility
          conflicts: []
        }
      ];
      const schedule = generateSchedule(startDate, 'wednesday', 3, blackouts);

      // Should have regular weeks for 1/8, 1/22, 1/29 (skipping 1/15 blackout)
      expect(schedule[0].date).toBe('2025-01-08');
      expect(schedule[0].type).toBe('regular');
      expect(schedule[1].date).toBe('2025-01-22');
      expect(schedule[1].type).toBe('regular');
      expect(schedule[2].date).toBe('2025-01-29');
      expect(schedule[2].type).toBe('regular');
    });

    it('should handle multiple blackout dates', () => {
      const startDate = createLocalDate(2025, 1, 8); // Wednesday, Jan 8, 2025
      const blackouts: WeekEntry[] = [
        {
          date: '2025-01-15',
          weekName: 'Holiday 1',
          weekNumber: 0,
          type: 'week-off',
          conflicts: []
        },
        {
          date: '2025-01-22',
          weekName: 'Holiday 2',
          weekNumber: 0,
          type: 'week-off',
          conflicts: []
        }
      ];
      const schedule = generateSchedule(startDate, 'wednesday', 3, blackouts);

      // Should skip both blackout dates
      expect(schedule[0].date).toBe('2025-01-08');
      expect(schedule[0].type).toBe('regular');
      expect(schedule[1].date).toBe('2025-01-29');
      expect(schedule[1].type).toBe('regular');
      expect(schedule[2].date).toBe('2025-02-05');
      expect(schedule[2].type).toBe('regular');
    });

    it('should generate correct week numbers', () => {
      const startDate = createLocalDate(2025, 1, 8); // Wednesday, Jan 8, 2025
      const schedule = generateSchedule(startDate, 'wednesday', 5, []);

      // Regular weeks should be numbered 1-5
      expect(schedule[0].weekNumber).toBe(1);
      expect(schedule[1].weekNumber).toBe(2);
      expect(schedule[2].weekNumber).toBe(3);
      expect(schedule[3].weekNumber).toBe(4);
      expect(schedule[4].weekNumber).toBe(5);
      // Season end break is week 6
      expect(schedule[5].weekNumber).toBe(6);
      // Playoffs is week 7
      expect(schedule[6].weekNumber).toBe(7);
    });

    it('should handle year boundaries correctly', () => {
      const startDate = createLocalDate(2024, 12, 25); // Wednesday, Dec 25, 2024
      const schedule = generateSchedule(startDate, 'wednesday', 3, []);

      expect(schedule[0].date).toBe('2024-12-25');
      expect(schedule[1].date).toBe('2025-01-01'); // Should cross into new year
      expect(schedule[2].date).toBe('2025-01-08');
    });

    it('should add custom number of season-end break weeks', () => {
      const startDate = createLocalDate(2025, 1, 8); // Wednesday, Jan 8, 2025
      const schedule = generateSchedule(startDate, 'wednesday', 3, [], 2);

      // 3 regular weeks + 2 break weeks + 1 playoff = 6 total
      expect(schedule).toHaveLength(6);
      expect(schedule.filter(w => w.type === 'regular')).toHaveLength(3);
      expect(schedule.filter(w => w.type === 'week-off')).toHaveLength(2);
      expect(schedule.filter(w => w.type === 'playoffs')).toHaveLength(1);
    });

    it('should handle zero season-end break weeks', () => {
      const startDate = createLocalDate(2025, 1, 8); // Wednesday, Jan 8, 2025
      const schedule = generateSchedule(startDate, 'wednesday', 3, [], 0);

      // 3 regular weeks + 0 break weeks + 1 playoff = 4 total
      expect(schedule).toHaveLength(4);
      expect(schedule.filter(w => w.type === 'regular')).toHaveLength(3);
      expect(schedule.filter(w => w.type === 'week-off')).toHaveLength(0);
      expect(schedule.filter(w => w.type === 'playoffs')).toHaveLength(1);
    });
  });
});
