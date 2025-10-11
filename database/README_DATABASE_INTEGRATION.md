# Database Integration Guide for Season Schedules

## Overview
This document explains the new database schema for storing season schedules and what database operations need to be implemented.

## Schema Design

### Unified `season_weeks` Table
One table stores ALL calendar dates for a season: regular weeks, blackout dates, season-end breaks, and playoffs.

**Columns:**
- `id` (UUID, PK)
- `season_id` (UUID, FK → seasons)
- `scheduled_date` (DATE) - **Primary sort key**
- `week_name` (TEXT) - "Week 1", "Thanksgiving", "Playoffs"
- `week_type` (VARCHAR) - 'regular', 'blackout', 'playoffs', 'season_end_break'
- `week_completed` (BOOLEAN) - Locks past weeks from editing
- `notes` (TEXT, nullable) - Optional operator notes
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Constraints:**
- Unique: (season_id, scheduled_date)

**Key Design:**
- **Regular weeks** (week_type='regular'): League play dates
- **Blackout weeks** (week_type='blackout'): Dates skipped - displayed to user with reason
- **Season-end breaks** (week_type='season_end_break'): Practice week before playoffs
- **Playoffs** (week_type='playoffs'): Championship week

### `seasons` Table
Simple metadata only:
- `season_name`, `league_id`
- `start_date`, `end_date`, `season_length`
- `status`, `season_completed`
- Timestamps

**Not stored**: `schedule` (in season_weeks table), `holidays` (fetched on-demand), `bca_championship`/`apa_championship` (fetched on-demand)

**Why not store championships?**
- They're only needed during schedule creation/editing
- Operator can choose to skip them each time they edit
- Final decision is baked into season_weeks as blackout rows or absence
- Fetched from `championship_date_options` table when needed

## Database Operations

### 1. Create Season (SeasonCreationWizard.tsx)

When operator confirms schedule:

**A. Insert Season Record:**
```typescript
// Note: Holidays and championships NOT stored - they're fetched on-demand during editing
const seasonData = {
  league_id: string,
  season_name: string,
  start_date: string,  // ISO date
  end_date: string,    // ISO date
  season_length: number,
  status: 'upcoming'
};
```

**B. Batch Insert ALL Weeks (regular + blackouts + playoffs):**
```typescript
// Combine schedule and blackouts into single array
const allWeeks = [...schedule, ...blackoutWeeks].map(week => ({
  season_id: createdSeasonId,
  scheduled_date: week.date,
  week_name: week.weekName,
  week_type: week.type,  // 'regular' | 'blackout' | 'playoffs' | 'season_end_break'
  week_completed: false,
  notes: null
}));

// Insert all at once
await supabase.from('season_weeks').insert(allWeeks);
```

### 2. Load Season Schedule (Display or Edit)

**Fetch entire calendar:**
```sql
SELECT * FROM season_weeks
WHERE season_id = ?
ORDER BY scheduled_date ASC;
```

**Separate by type in UI:**
```typescript
const allWeeks = await supabase
  .from('season_weeks')
  .select('*')
  .eq('season_id', seasonId)
  .order('scheduled_date', { ascending: true });

// Filter for display
const regularWeeks = allWeeks.filter(w => w.week_type === 'regular');
const blackoutWeeks = allWeeks.filter(w => w.week_type === 'blackout');
const playoffWeeks = allWeeks.filter(w => w.week_type === 'playoffs');

// Or display all together sorted by date (shows user full calendar)
const fullCalendar = allWeeks; // Already sorted
```

**Convert to UI format (WeekEntry):**
```typescript
const schedule: WeekEntry[] = allWeeks.map(dbWeek => ({
  weekNumber: 0, // Not needed from database
  weekName: dbWeek.week_name,
  date: dbWeek.scheduled_date,
  type: dbWeek.week_type,
  conflicts: []  // Computed on-demand
}));
```

**Fetch holidays and championships, then run conflict detection:**
```typescript
// Fetch holidays for season date range
const holidays = fetchHolidaysForSeason(season.start_date, season.season_length);

// Fetch championship dates from championship_date_options table
const bcaChampionship = await fetchChampionshipDates('BCA', season.start_date);
const apaChampionship = await fetchChampionshipDates('APA', season.start_date);

// Run conflict detection with fetched data
const scheduleWithConflicts = detectScheduleConflicts(
  schedule,
  holidays,
  bcaChampionship,
  apaChampionship,
  leagueDayOfWeek
);
```

### 3. Edit Schedule Mid-Season

**Load existing schedule:**
```typescript
// Fetch all weeks
const { data: allWeeks } = await supabase
  .from('season_weeks')
  .select('*')
  .eq('season_id', seasonId)
  .order('scheduled_date', { ascending: true });

// Separate for editing workflow
const schedule = allWeeks.filter(w => w.week_type !== 'blackout');
const blackoutWeeks = allWeeks.filter(w => w.week_type === 'blackout');
```

**Add blackout date:**
```typescript
// 1. Insert new blackout week
await supabase.from('season_weeks').insert({
  season_id: seasonId,
  scheduled_date: dateToBlackout,
  week_name: "Thanksgiving", // or conflict name
  week_type: 'blackout',
  week_completed: false,
  notes: null
});

// 2. Regenerate schedule for future weeks
const futureWeeks = schedule.filter(w =>
  new Date(w.scheduled_date) > new Date(dateToBlackout) &&
  !w.week_completed
);

// 3. Delete future weeks
await supabase.from('season_weeks')
  .delete()
  .eq('season_id', seasonId)
  .in('id', futureWeeks.map(w => w.id));

// 4. Run generator with updated blackouts
const updatedBlackouts = [...blackoutWeeks, newBlackout];
const newSchedule = generateSchedule(/* with blackouts */);

// 5. Insert regenerated weeks
await supabase.from('season_weeks').insert(newSchedule);
```

**Remove blackout date:**
```typescript
// 1. Delete blackout week
await supabase.from('season_weeks')
  .delete()
  .eq('season_id', seasonId)
  .eq('scheduled_date', blackoutDateToRemove)
  .eq('week_type', 'blackout');

// 2. Regenerate future weeks (same process as adding)
```

### 4. Mark Week as Completed

When all matches for a week are scored:

```typescript
await supabase.from('season_weeks')
  .update({ week_completed: true })
  .eq('id', weekId);
```

**UI behavior:**
- Completed weeks are locked from editing
- Schedule edit flow: disable rows WHERE week_completed = true

## Conflict Detection Strategy

**DO NOT store conflicts or championships in database** - fetch and compute on-demand:

1. Load: `season_weeks` from database
2. Fetch: holidays (date-holidays package), championships (championship_date_options table)
3. Filter regular weeks only: `week_type IN ('regular', 'playoffs', 'season_end_break')`
4. Run: `detectScheduleConflicts()` utility
5. Display: Schedule with conflict badges

**Benefits:**
- Championships can change - always fetch latest from championship_date_options
- Operator re-evaluates skip/play decision each edit session
- Final decision baked into season_weeks (blackout rows or absence)
- Data stays clean and recomputable
- Single source of truth for conflict detection logic

## Key Design Benefits

✅ **User sees full calendar** - One query shows regular weeks AND blackouts with reasons
✅ **Easy editing** - Add/remove blackouts by inserting/deleting rows
✅ **Sortable** - Always sorted by `scheduled_date`, not artificial week_number
✅ **Lockable** - `week_completed` prevents editing past weeks
✅ **Flexible** - Same structure for all week types
✅ **Queryable** - "Show all blackouts" or "Find week on date X"

## Fresh Database Setup

Run SQL files in this order:
1. `seasons.sql` - Create seasons table (clean version without schedule/holidays/championships)
2. `season_weeks.sql` - Create unified season_weeks table

## TypeScript Types

Updated in `/src/types/season.ts`:
- `SeasonWeek` - Unified database row (includes week_type and week_completed)
- `Season` - Updated (removed `schedule` field)
- Removed `SeasonBlackoutWeek` (no longer needed)

## Testing Checklist

- [ ] Create new season with schedule (batch insert all week types)
- [ ] Load existing season schedule (fetch + display)
- [ ] Display full calendar sorted by date (shows regular + blackouts)
- [ ] Add blackout week mid-season (insert + regenerate)
- [ ] Remove blackout week mid-season (delete + regenerate)
- [ ] Mark week as completed (update flag)
- [ ] Verify completed weeks are locked from editing
- [ ] Verify RLS policies prevent unauthorized access
- [ ] Test conflict detection after loading from database
- [ ] Verify unique constraint prevents duplicate dates
