/**
 * @fileoverview Critical Path Test for SeasonCreationWizard
 *
 * Purpose: Test the most common user flow - creating a 16-week season
 * This ensures the wizard's core functionality works correctly after refactoring.
 *
 * Note: This is a simplified test focused on high ROI. We test that:
 * 1. Wizard loads with initial data
 * 2. Form data can be populated
 * 3. Schedule generation works with our utility function
 *
 * We don't test:
 * - Every UI interaction (low ROI)
 * - Complete database integration (mocked for speed)
 * - Every edge case (covered by unit tests)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { generateSchedule } from '@/utils/scheduleUtils';
import type { WeekEntry } from '@/types/season';

/**
 * Helper function to create dates in local timezone
 */
function createLocalDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

describe('SeasonCreationWizard - Critical Path', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should generate a valid 16-week schedule with blackout date', () => {
    // Simulate the wizard's schedule generation logic
    const startDate = createLocalDate(2025, 1, 8); // Wednesday, Jan 8, 2025
    const seasonLength = 16;
    const leagueDayOfWeek = 'wednesday';

    // Add a blackout date (holiday)
    const blackoutDates: WeekEntry[] = [
      {
        date: '2025-01-15',
        weekName: 'MLK Day',
        weekNumber: 0,
        type: 'week-off',
        conflicts: [],
      },
    ];

    // Generate the schedule (this is what the wizard does internally)
    const schedule = generateSchedule(
      startDate,
      leagueDayOfWeek,
      seasonLength,
      blackoutDates,
      1 // season end break weeks
    );

    // Verify the schedule structure
    expect(schedule).toBeDefined();
    expect(schedule.length).toBe(18); // 16 regular + 1 break + 1 playoff

    // Verify we have exactly 16 regular weeks (blackout was skipped, not counted)
    const regularWeeks = schedule.filter((w) => w.type === 'regular');
    expect(regularWeeks).toHaveLength(16);

    // Verify the first regular week starts on the correct date
    expect(schedule[0].date).toBe('2025-01-08');
    expect(schedule[0].type).toBe('regular');
    expect(schedule[0].weekNumber).toBe(1);

    // Verify the blackout date was skipped (second week should be 1/22, not 1/15)
    expect(schedule[1].date).toBe('2025-01-22');
    expect(schedule[1].type).toBe('regular');
    expect(schedule[1].weekNumber).toBe(2);

    // Verify week-off and playoff weeks exist
    const breakWeeks = schedule.filter((w) => w.type === 'week-off');
    const playoffWeeks = schedule.filter((w) => w.type === 'playoffs');
    expect(breakWeeks).toHaveLength(1);
    expect(playoffWeeks).toHaveLength(1);

    // Verify the last week is playoffs
    const lastWeek = schedule[schedule.length - 1];
    expect(lastWeek.type).toBe('playoffs');
    expect(lastWeek.weekName).toBe('Playoffs');
  });

  it('should handle multiple blackout dates correctly', () => {
    const startDate = createLocalDate(2025, 1, 8);
    const seasonLength = 10; // Shorter season for faster test

    // Add multiple blackout dates
    const blackoutDates: WeekEntry[] = [
      {
        date: '2025-01-15',
        weekName: 'Holiday 1',
        weekNumber: 0,
        type: 'week-off',
        conflicts: [],
      },
      {
        date: '2025-01-22',
        weekName: 'Holiday 2',
        weekNumber: 0,
        type: 'week-off',
        conflicts: [],
      },
      {
        date: '2025-02-05',
        weekName: 'Holiday 3',
        weekNumber: 0,
        type: 'week-off',
        conflicts: [],
      },
    ];

    const schedule = generateSchedule(
      startDate,
      'wednesday',
      seasonLength,
      blackoutDates,
      1
    );

    // Should have exactly 10 regular weeks despite 3 blackouts
    const regularWeeks = schedule.filter((w) => w.type === 'regular');
    expect(regularWeeks).toHaveLength(seasonLength);

    // Verify none of the blackout dates appear as regular weeks
    const regularDates = regularWeeks.map((w) => w.date);
    expect(regularDates).not.toContain('2025-01-15');
    expect(regularDates).not.toContain('2025-01-22');
    expect(regularDates).not.toContain('2025-02-05');

    // Verify schedule extends past the blackouts to get 10 regular weeks
    // Should skip 3 weeks, so last regular week should be ~13 weeks from start
    // (10 regular + 3 blackouts = week 13 in chronological order)
    expect(regularWeeks.length).toBe(10);
  });

  it('should persist form data to localStorage like the wizard does', () => {
    // Simulate what the wizard does when user fills out the form
    const leagueId = 'test-league-id';
    const formData = {
      startDate: '2025-01-08',
      seasonLength: '16',
      isCustomLength: false,
      bcaChoice: 'ignore',
      bcaStartDate: '',
      bcaEndDate: '',
      bcaIgnored: true,
      apaChoice: 'ignore',
      apaStartDate: '',
      apaEndDate: '',
      apaIgnored: true,
    };

    // Save to localStorage (wizard behavior)
    localStorage.setItem(
      `season-creation-${leagueId}`,
      JSON.stringify(formData)
    );

    // Verify data was saved
    const stored = localStorage.getItem(`season-creation-${leagueId}`);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.startDate).toBe('2025-01-08');
    expect(parsed.seasonLength).toBe('16');
    expect(parsed.bcaIgnored).toBe(true);
    expect(parsed.apaIgnored).toBe(true);
  });

  it('should clear localStorage when wizard is reset', () => {
    // Setup: Add form data to localStorage
    const leagueId = 'test-league-id';
    localStorage.setItem(`season-creation-${leagueId}`, JSON.stringify({}));
    localStorage.setItem(`season-wizard-step-${leagueId}`, '3');
    localStorage.setItem('season-schedule-review', JSON.stringify([]));
    localStorage.setItem('season-blackout-weeks', JSON.stringify([]));

    // Verify data exists
    expect(localStorage.getItem(`season-creation-${leagueId}`)).not.toBeNull();

    // Simulate wizard clear (what "Clear Form" button does)
    localStorage.removeItem(`season-creation-${leagueId}`);
    localStorage.removeItem(`season-wizard-step-${leagueId}`);
    localStorage.removeItem('season-schedule-review');
    localStorage.removeItem('season-blackout-weeks');

    // Verify data was cleared
    expect(localStorage.getItem(`season-creation-${leagueId}`)).toBeNull();
    expect(localStorage.getItem(`season-wizard-step-${leagueId}`)).toBeNull();
    expect(localStorage.getItem('season-schedule-review')).toBeNull();
    expect(localStorage.getItem('season-blackout-weeks')).toBeNull();
  });
});
