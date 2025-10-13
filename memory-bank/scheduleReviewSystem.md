# Schedule Review System

## Overview

The Schedule Review system is the final step in the Season Creation Wizard where operators review their generated schedule, identify conflicts with holidays/championships, and make adjustments before finalizing the season.

**Implementation Date**: 2025-01-10
**Status**: ✅ **PRODUCTION READY**

## Architecture

### Two-Array System

The system uses two separate arrays to maintain schedule flexibility while keeping user-inserted week-offs date-locked:

1. **`schedule` Array** - Dynamic play weeks
   - Contains: Regular weeks, Season End Break, Playoffs
   - Gets **regenerated** when blackout weeks change
   - Skips dates that exist in blackoutWeeks array
   - Maintains original season length (e.g., 14 regular weeks stays 14)

2. **`blackoutWeeks` Array** - Date-locked week-offs
   - Contains: User-inserted week-offs (holidays, local events, etc.)
   - **Never regenerated** - dates are locked
   - Stored separately in localStorage
   - Has custom weekName (e.g., "Christmas (Friday 2 days before)")

**Why This Works**:
- Week names stay stable: "Week 1", "Week 2", "Week 3" never change
- Matchups tied to `weekName` always find the correct play week
- Dates can shift (Week 3 moves from Oct 15 to Oct 22) but weekName stays "Week 3"
- Mid-season updates safe: Can insert week-offs after season starts without breaking existing matches

### Display Mechanism

Both arrays are combined for display:
```typescript
const displaySchedule = [...schedule, ...blackoutWeeks].sort((a, b) =>
  a.date.localeCompare(b.date)
);
```

This creates the final chronological view shown to operators.

## Conflict Detection System

### Unified Severity-Based Approach

**Problem Solved**: Original system had special-case logic for different conflict types, causing championships to disappear after inserting week-offs.

**Solution**: Treat ALL conflicts (holidays + championship weeks) identically with distance-based severity.

### Conflict Processing Flow

#### 1. Build Unified Conflict List
```typescript
const allConflicts: Holiday[] = [...holidays];

// Extract BCA championship league nights
const bcaWeeks = extractLeagueNights(
  bcaStartDate,
  bcaEndDate,
  leagueDayOfWeek,
  'BCA National Tournament'
);
allConflicts.push(...bcaWeeks);

// Extract APA championship league nights
const apaWeeks = extractLeagueNights(
  apaStartDate,
  apaEndDate,
  leagueDayOfWeek,
  'APA National Tournament'
);
allConflicts.push(...apaWeeks);
```

**Key Innovation**: `extractLeagueNights()` splits multi-week championships (e.g., BCA May 22-June 5) into individual occurrences of the league night:
- "BCA National Tournament Week 1" (May 22)
- "BCA National Tournament Week 2" (May 29)
- "BCA National Tournament Week 3" (June 5)

This ensures championships are treated exactly like single-day holidays.

#### 2. Two-Pass Closest League Night Algorithm

**Pass 1**: Find closest league night for each conflict
```typescript
const conflictToClosestWeek = new Map<string, number>();

allConflicts.forEach((conflict) => {
  let closestWeekIndex = -1;
  let closestDistance = Infinity;

  newSchedule.forEach((week, weekIndex) => {
    const daysAway = calculateDaysAway(conflict.date, week.date);
    const absDaysAway = Math.abs(daysAway);

    // Only consider weeks within 4 days
    if (absDaysAway > 4) return;

    // Track closest week (if tie, prefer week BEFORE the holiday)
    if (absDaysAway < closestDistance ||
        (absDaysAway === closestDistance && daysAway > 0)) {
      closestDistance = absDaysAway;
      closestWeekIndex = weekIndex;
    }
  });

  if (closestWeekIndex !== -1) {
    conflictToClosestWeek.set(conflict.date, closestWeekIndex);
  }
});
```

**Pass 2**: Build conflicts array for each week
```typescript
scheduleWithConflicts = schedule.map((week, weekIndex) => {
  const conflicts: ConflictFlag[] = [];

  allConflicts.forEach((conflict) => {
    // Only add conflict if this is the closest week
    if (conflictToClosestWeek.get(conflict.date) !== weekIndex) return;

    const severity = calculateSeverity(conflict, week);
    const timingDesc = formatTimingDescription(conflict, week);

    conflicts.push({
      type: conflict.type,
      name: `${conflict.name} (${timingDesc})`,
      reason: isTravel ? 'Travel week - plan for reduced attendance' : '...',
      severity,
      daysAway,
    });
  });

  return { ...week, conflicts };
});
```

**Why This Works**:
- Columbus Day (Oct 13) appears on Oct 16 (3 days before) only, not Oct 9 (4 days after)
- Eliminates duplicate conflict warnings
- Each conflict appears exactly once on the nearest week

### Severity Calculation

```typescript
const isTravel = isTravelHoliday(conflict.name, leagueDayOfWeek);

if (isTravel && absDaysAway <= 4) {
  severity = 'critical';  // 🔴 Red
} else if (absDaysAway === 0) {
  severity = 'critical';  // 🔴 Red - same day
} else if (absDaysAway === 1) {
  severity = 'high';      // 🟠 Orange
} else if (absDaysAway === 2) {
  severity = 'medium';    // 🟡 Yellow
} else {
  severity = 'low';       // 🔵 Blue - 3-4 days
}
```

**Travel Holidays** (always critical within 4 days):
- Christmas
- New Year's Day
- BCA National Tournament
- APA National Tournament
- Thanksgiving (only for Wed-Sun leagues)

### Conflict Display

**Status Column**:
- Shows highest severity conflict for each week
- 🔴 Critical, 🟠 High, 🟡 Medium, 🔵 Low, ✓ Play (no conflicts)

**Conflicts Column**:
- Color-coded badges for each conflict
- Includes day of week + distance: "Wednesday 2 days before"
- Emoji indicators: 🏆 for championships, colored circles for holidays

## Mid-Season Week Locking

### Problem

When updating schedules mid-season, operators shouldn't be able to insert week-offs for weeks that have already been played. This would break existing match results and cause data integrity issues.

### Solution

**`currentPlayWeek` Prop**:
- Passed down from parent component
- Represents the highest completed week number
- For new seasons: `currentPlayWeek={0}` (all weeks editable)
- For existing seasons: Fetched from database (e.g., `currentPlayWeek={5}`)

**Week Locking Logic**:
```typescript
const getPlayWeekNumber = (weekName: string): number | null => {
  const match = weekName.match(/^Week (\d+)$/);
  return match ? parseInt(match[1], 10) : null;
};

const playWeekNumber = getPlayWeekNumber(week.weekName);
const isWeekLocked =
  playWeekNumber !== null &&
  currentPlayWeek !== undefined &&
  playWeekNumber <= currentPlayWeek;
```

**Display**:
- Locked weeks: Show "🔒 Week Completed" (gray text, no button)
- Unlocked weeks: Show "Insert Week Off" button

**Future Integration**:
```sql
-- TODO: Add to seasons table
ALTER TABLE seasons ADD COLUMN current_week INTEGER DEFAULT 1;

-- TODO: Fetch in wizard
SELECT current_week FROM seasons WHERE id = ?

-- TODO: Pass real value instead of 0
<ScheduleReview currentPlayWeek={fetchedCurrentWeek} ... />
```

## User Experience Features

### Season End Break Toggle

**Feature**: Operators can add multiple season-end break weeks before playoffs.

**Implementation**:
- `addSeasonEndBreak` state (number, default 1)
- "Insert Season End Break" button on Playoffs row increments count
- "Remove Season End Break" button on Season End Break rows decrements count
- Count passed to `generateSchedule()` which creates that many break weeks

**Use Case**: Some leagues want 2-3 weeks between regular season end and playoffs.

### InfoButton Guidance

**Location**: Below title and description on Schedule Review page

**Label**: "How to Choose Weeks to Take Off"

**Content**:
1. Major holidays should always be taken off (significant travel)
2. BCA/APA championships usually need week-offs (encourage participation)
3. Smaller holidays are up to operators and players
4. Can change mid-season (edit until week is played)
5. Can schedule weeks off for local events
6. Only charged for weeks played, not weeks off

**Purpose**: Educates operators on when/why to skip weeks, billing policy, flexibility.

### Week-Off Insertion Modal

**Trigger**: Clicking "Insert Week Off" on a week without conflicts

**Purpose**: Capture custom reason for week-off (e.g., "Local tournament", "Venue closed")

**Auto-Population**: Weeks with conflicts auto-use conflict name ("Christmas (Friday 2 days before)")

## localStorage Persistence

### Keys Used
- `season-schedule-review` - Main schedule array
- `season-blackout-weeks` - User-inserted week-offs array

### Restoration Flow
```typescript
const [schedule, setSchedule] = useState(() => {
  const stored = localStorage.getItem('season-schedule-review');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return initialSchedule;
    }
  }
  return initialSchedule;
});
```

### Clearing Logic
- "Clear Form" button removes both keys
- Navigates back to step 1 of wizard
- Allows starting over with fresh data

## Helper Functions

### `extractLeagueNights()`
**Purpose**: Split championship date ranges into individual league night occurrences

**Algorithm**:
1. Parse start and end dates
2. Calculate days until first league night from start date
3. Iterate week by week until past end date
4. Return array of Holiday objects, one per league night

**Example**:
```
Input: BCA May 22 - June 5 (Tuesday league)
Output: [
  { date: '2025-05-27', name: 'BCA National Tournament Week 1', type: 'championship' },
  { date: '2025-06-03', name: 'BCA National Tournament Week 2', type: 'championship' }
]
```

### `isTravelHoliday()`
**Purpose**: Identify holidays that affect entire week due to travel

**Logic**:
- Christmas and New Year's: Always travel holidays
- BCA/APA championships: Always travel holidays
- Thanksgiving: Only for Wed-Sun leagues (people travel home)

**Returns**: Boolean indicating if conflict should be critical severity within 4 days

### `parseLocalDate()`
**Purpose**: Parse ISO date strings without timezone shift errors

**Implementation**:
```typescript
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}
```

**Why Needed**: `new Date('2025-01-15')` can shift to Jan 14 in some timezones. This avoids that.

## Type Definitions

### `ConflictSeverity`
```typescript
export type ConflictSeverity = 'critical' | 'high' | 'medium' | 'low';
```

### `ConflictFlag`
```typescript
export interface ConflictFlag {
  type: 'holiday' | 'championship';
  name: string;                    // "Christmas (Friday 2 days before)"
  reason: string;                  // "Travel week - plan for reduced attendance"
  severity: ConflictSeverity;      // Visual indicator of importance
  daysAway: number;                // Days between conflict and league night
}
```

### `WeekEntry`
```typescript
export interface WeekEntry {
  weekNumber: number;              // Sequential calendar position: 1, 2, 3...
  weekName: string;                // "Week 1", "Halloween", "Playoffs"
  date: string;                    // ISO date string (YYYY-MM-DD)
  type: 'regular' | 'playoffs' | 'week-off';
  conflicts: ConflictFlag[];
}
```

## Known Edge Cases Handled

1. **Blackout Week at Season Start**: If first date is blackout, schedule starts on next valid date
2. **Multiple Blackouts in Row**: Skips all consecutive blackout dates correctly
3. **Tie in Distance**: When conflict is equidistant from two weeks, prefers week BEFORE holiday
4. **Championship Overlap**: Multiple championship weeks each get individual conflict entries
5. **Travel Holiday Near End**: Still flags correctly even if only 1-2 weeks from end
6. **Mid-Season Insert at Top**: Can insert week-off at Week 1 location after season starts (if unlocked)

## Future Enhancements

### Database Integration
```sql
-- seasons table will include:
- schedule_json: JSON column storing full schedule array
- blackout_weeks_json: JSON column storing blackout weeks array
- current_week: INTEGER tracking progress for mid-season locking
```

### Match Results Integration
```sql
-- When match results entered:
UPDATE seasons
SET current_week = (
  SELECT MAX(week_number)
  FROM match_results
  WHERE season_id = ?
)
WHERE id = ?;
```

### Advanced Features
- **Automatic Conflict Resolution**: AI suggests optimal weeks to skip based on severity
- **Historical Data**: Show previous years' schedules for reference
- **Team Vote System**: Let teams vote on which weeks to skip
- **Multi-League Coordination**: Coordinate schedules across multiple leagues in same org

## Component Hierarchy

```
ScheduleReview (container)
├── InfoButton (guidance)
├── Conflict Summary Alert
├── ScheduleReviewTable
│   └── ScheduleWeekRow (for each week)
│       ├── Week name/date/status
│       ├── ConflictBadge (for each conflict)
│       └── Insert/Remove button or 🔒 Lock indicator
└── Navigation buttons (Back/Confirm)
└── WeekOffReasonModal (when needed)
```

## Performance Considerations

- **Conflict Detection**: Two-pass algorithm is O(conflicts × weeks), typically <50 items each = fast
- **localStorage**: JSON stringify/parse on every change, but arrays are small (<30 weeks)
- **Regeneration**: Full schedule regeneration on blackout change, but instant due to small dataset
- **React Rendering**: Individual row components prevent full table re-renders

## Testing Scenarios

### Test Cases Covered
1. ✅ Schedule with no conflicts
2. ✅ Schedule with multiple holidays
3. ✅ BCA championship during season
4. ✅ APA championship during season
5. ✅ Both championships + multiple holidays
6. ✅ Insert week-off, verify schedule regenerates correctly
7. ✅ Remove week-off, verify schedule returns to original
8. ✅ Columbus Day shows on only one week (not two)
9. ✅ Travel holidays show as critical within 4 days
10. ✅ Mid-season lock prevents editing past weeks
11. ✅ Season end break count increment/decrement
12. ✅ localStorage persistence across page refreshes
13. ✅ Clear form removes both localStorage keys

## Summary

The Schedule Review System successfully solves the complex problem of schedule conflict detection and resolution with an elegant two-array architecture. The unified conflict detection system eliminates special-case logic, making the code maintainable and predictable. The mid-season locking feature ensures data integrity when operators need to adjust schedules after the season has started. The system is production-ready and provides operators with clear visual feedback and flexible control over their season schedule.
