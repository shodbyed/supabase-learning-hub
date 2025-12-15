# Branch: venue-table-sizes

**Created:** 2025-12-11
**Updated:** 2025-12-13
**Status:** Not Started

---

## Main Goals

1. **Add 8ft table support** - Currently only 7ft "bar box" and 9ft "regulation"
2. **Per-size table number arrays** - Each size category has its own array of table numbers
3. **Display table assignments** - Show which table a match is assigned to based on match number

---

## Current State

**Database schema (venues table):**
- `bar_box_tables` (integer) - count of 7ft tables
- `regulation_tables` (integer) - count of 9ft tables
- `total_tables` (computed) - sum of both

**Database schema (league_venues table):**
- `available_bar_box_tables` (integer)
- `available_regulation_tables` (integer)
- `available_total_tables` (computed)

**UI (VenueCreationModal):**
- Two number inputs: "Bar-Box Tables (7ft)" and "Regulation Tables (9ft)"

**Problems:**
- 8ft tables are common but not supported
- No way to specify table numbers (venues may have non-sequential numbering)
- No table assignment display for matches

---

## New Data Model

### Key Insight
**The array length IS the count.** No separate count columns needed.

### Venue Level
Each table size has its own array of table numbers.

```typescript
// Venue columns (database)
bar_box_tables: number[]           // 7ft tables - e.g., [1, 2, 3, 4]
eight_foot_tables: number[]        // 8ft tables - e.g., [5, 6]
regulation_tables: number[]        // 9ft tables - e.g., [7, 8, 9]
other_tables: OtherTable[]         // Custom sizes - see below

// OtherTable type for non-standard sizes
type OtherTable = [[number, number], number[]]  // [[length, width], tableNumbers[]]
// Example: [[6.5, 3.25], [10, 11]] = Two 6.5ft x 3.25ft tables numbered 10, 11
```

**Computed values (derived, not stored):**
- `total_tables` = sum of all array lengths
- `all_table_numbers` = combined unique array from all sizes

### Example Venue

```
Venue: Sam's Billiards
├── bar_box_tables: [1, 2, 3, 4]           // 4 seven-foot tables
├── eight_foot_tables: [5, 6]              // 2 eight-foot tables
├── regulation_tables: [7, 8, 9, 10, 11]   // 5 nine-foot tables
├── other_tables: [[[6.5, 3.25], [12]]]    // 1 odd-size table
│
├── total_tables: 12 (computed)
└── all_table_numbers: [1,2,3,4,5,6,7,8,9,10,11,12] (computed)
```

### League-Venue Level
Each league picks which tables they can use from the venue's pool, per size.

```typescript
// League-Venue columns (database)
available_bar_box_tables: number[]       // e.g., [1, 2]
available_eight_foot_tables: number[]    // e.g., []
available_regulation_tables: number[]    // e.g., [7, 8]
available_other_tables: number[]         // e.g., [] (just table numbers, not dimensions)
```

**Computed values:**
- `available_total_tables` = sum of all array lengths
- `available_table_numbers` = combined array from all sizes

### Example League-Venue

```
League-Venue: Monday 8-Ball @ Sam's Billiards
├── available_bar_box_tables: [1, 2]           // Using 2 of 4 bar box tables
├── available_eight_foot_tables: []            // Not using 8ft tables
├── available_regulation_tables: [7, 8]        // Using 2 of 5 regulation tables
├── available_other_tables: []                 // Not using odd-size tables
│
├── available_total_tables: 4 (computed)
└── available_table_numbers: [1, 2, 7, 8] (computed)
```

---

## Validation Rules

### Uniqueness Validation (Critical)
**Table numbers must be unique across ALL size categories within a venue.**

```typescript
function validateUniqueTableNumbers(venue: Venue): ValidationResult {
  const allNumbers: number[] = [
    ...venue.bar_box_tables,
    ...venue.eight_foot_tables,
    ...venue.regulation_tables,
    ...venue.other_tables.flatMap(([_, nums]) => nums)
  ]

  const seen = new Map<number, string>()  // number -> size category
  const duplicates: string[] = []

  for (const [category, numbers] of [
    ['7-foot', venue.bar_box_tables],
    ['8-foot', venue.eight_foot_tables],
    ['9-foot', venue.regulation_tables],
    ['other', venue.other_tables.flatMap(([_, nums]) => nums)]
  ]) {
    for (const num of numbers) {
      if (seen.has(num)) {
        duplicates.push(`Table ${num} exists in both ${seen.get(num)} and ${category}`)
      }
      seen.set(num, category)
    }
  }

  return {
    valid: duplicates.length === 0,
    errors: duplicates
  }
}
```

### League-Venue Validation
- Each `available_*_tables` array must be a subset of the venue's corresponding array
- Example: If venue has `bar_box_tables: [1,2,3,4]`, league can only use `[1,2]`, `[2,4]`, etc.

---

## Database Migration

```sql
-- =====================
-- VENUES TABLE
-- =====================

-- Change bar_box_tables from integer count to integer[] array
-- First, store old values temporarily
ALTER TABLE venues ADD COLUMN bar_box_tables_new integer[] DEFAULT '{}';
UPDATE venues SET bar_box_tables_new =
  CASE
    WHEN bar_box_tables > 0 THEN
      (SELECT array_agg(n) FROM generate_series(1, bar_box_tables) AS n)
    ELSE '{}'
  END;
ALTER TABLE venues DROP COLUMN bar_box_tables;
ALTER TABLE venues RENAME COLUMN bar_box_tables_new TO bar_box_tables;

-- Add 8ft tables column
ALTER TABLE venues ADD COLUMN eight_foot_tables integer[] DEFAULT '{}';

-- Change regulation_tables from integer count to integer[] array
ALTER TABLE venues ADD COLUMN regulation_tables_new integer[] DEFAULT '{}';
UPDATE venues SET regulation_tables_new =
  CASE
    WHEN regulation_tables > 0 THEN
      -- Offset by bar_box count so numbers don't overlap
      (SELECT array_agg(n + COALESCE(array_length(bar_box_tables, 1), 0))
       FROM generate_series(1, regulation_tables) AS n)
    ELSE '{}'
  END;
ALTER TABLE venues DROP COLUMN regulation_tables;
ALTER TABLE venues RENAME COLUMN regulation_tables_new TO regulation_tables;

-- Add other_tables for non-standard sizes (JSONB for flexibility)
-- Format: [[[length, width], [tableNum1, tableNum2]], ...]
ALTER TABLE venues ADD COLUMN other_tables jsonb DEFAULT '[]';

-- Drop old computed column if it exists as a stored column
-- (total_tables will now be computed in application code)

-- =====================
-- LEAGUE_VENUES TABLE
-- =====================

-- Change available_bar_box_tables from integer to integer[]
ALTER TABLE league_venues ADD COLUMN available_bar_box_tables_new integer[] DEFAULT '{}';
ALTER TABLE league_venues DROP COLUMN available_bar_box_tables;
ALTER TABLE league_venues RENAME COLUMN available_bar_box_tables_new TO available_bar_box_tables;

-- Add 8ft available tables
ALTER TABLE league_venues ADD COLUMN available_eight_foot_tables integer[] DEFAULT '{}';

-- Change available_regulation_tables from integer to integer[]
ALTER TABLE league_venues ADD COLUMN available_regulation_tables_new integer[] DEFAULT '{}';
ALTER TABLE league_venues DROP COLUMN available_regulation_tables;
ALTER TABLE league_venues RENAME COLUMN available_regulation_tables_new TO available_regulation_tables;

-- Add other available tables (just table numbers, not dimensions)
ALTER TABLE league_venues ADD COLUMN available_other_tables integer[] DEFAULT '{}';
```

---

## TypeScript Types

```typescript
// types/venue.ts

/**
 * Other table type for non-standard sizes
 * Format: [[length, width], [tableNumbers]]
 * Example: [[6.5, 3.25], [10, 11]] = Two 6.5x3.25 tables numbered 10, 11
 */
export type OtherTable = [[number, number], number[]];

export interface Venue {
  id: string;
  name: string;
  address: string;

  // Table arrays (array length = count)
  bar_box_tables: number[];        // 7ft table numbers
  eight_foot_tables: number[];     // 8ft table numbers
  regulation_tables: number[];     // 9ft table numbers
  other_tables: OtherTable[];      // Non-standard sizes

  // ... other existing fields
}

export interface LeagueVenue {
  id: string;
  league_id: string;
  venue_id: string;

  // Available table arrays (must be subsets of venue arrays)
  available_bar_box_tables: number[];
  available_eight_foot_tables: number[];
  available_regulation_tables: number[];
  available_other_tables: number[];  // Just table numbers

  // ... other existing fields
}

// Utility types
export interface VenueTableSummary {
  barBoxCount: number;
  eightFootCount: number;
  regulationCount: number;
  otherCount: number;
  totalCount: number;
  allTableNumbers: number[];
}
```

---

## Utility Functions

```typescript
// utils/venueTableUtils.ts

import { Venue, LeagueVenue, OtherTable, VenueTableSummary } from '@/types/venue';

/**
 * Get all table numbers from a venue (combined from all sizes)
 */
export function getAllVenueTableNumbers(venue: Venue): number[] {
  const otherNumbers = venue.other_tables?.flatMap(([_, nums]) => nums) ?? [];
  return [
    ...(venue.bar_box_tables ?? []),
    ...(venue.eight_foot_tables ?? []),
    ...(venue.regulation_tables ?? []),
    ...otherNumbers
  ];
}

/**
 * Get total table count for a venue
 */
export function getVenueTotalTables(venue: Venue): number {
  return getAllVenueTableNumbers(venue).length;
}

/**
 * Get venue table summary with counts and combined array
 */
export function getVenueTableSummary(venue: Venue): VenueTableSummary {
  const otherCount = venue.other_tables?.reduce((sum, [_, nums]) => sum + nums.length, 0) ?? 0;

  return {
    barBoxCount: venue.bar_box_tables?.length ?? 0,
    eightFootCount: venue.eight_foot_tables?.length ?? 0,
    regulationCount: venue.regulation_tables?.length ?? 0,
    otherCount,
    totalCount: getVenueTotalTables(venue),
    allTableNumbers: getAllVenueTableNumbers(venue)
  };
}

/**
 * Get all available table numbers for a league-venue
 */
export function getLeagueAvailableTableNumbers(leagueVenue: LeagueVenue): number[] {
  return [
    ...(leagueVenue.available_bar_box_tables ?? []),
    ...(leagueVenue.available_eight_foot_tables ?? []),
    ...(leagueVenue.available_regulation_tables ?? []),
    ...(leagueVenue.available_other_tables ?? [])
  ];
}

/**
 * Validate that all table numbers are unique across size categories
 */
export function validateUniqueTableNumbers(
  barBox: number[],
  eightFoot: number[],
  regulation: number[],
  other: number[]
): { valid: boolean; errors: string[] } {
  const categories = [
    { name: '7-foot', numbers: barBox },
    { name: '8-foot', numbers: eightFoot },
    { name: '9-foot', numbers: regulation },
    { name: 'other', numbers: other }
  ];

  const seen = new Map<number, string>();
  const errors: string[] = [];

  for (const { name, numbers } of categories) {
    for (const num of numbers) {
      if (seen.has(num)) {
        errors.push(`Table ${num} exists in both ${seen.get(num)} and ${name}`);
      } else {
        seen.set(num, name);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate that league tables are a subset of venue tables
 */
export function validateLeagueTablesSubset(
  leagueTables: number[],
  venueTables: number[],
  sizeName: string
): { valid: boolean; errors: string[] } {
  const venueSet = new Set(venueTables);
  const invalid = leagueTables.filter(t => !venueSet.has(t));

  if (invalid.length > 0) {
    return {
      valid: false,
      errors: [`${sizeName} tables [${invalid.join(', ')}] are not available at this venue`]
    };
  }

  return { valid: true, errors: [] };
}
```

---

## Table Assignment Display

### How It Works

1. Get all matches at same venue on same week/night
2. Sort by `match_number`
3. Get `available_table_numbers` from league-venue (combined from all sizes)
4. Assign tables in order
5. Display: "Table 5"

### Implementation

```typescript
// utils/tableAssignment.ts

/**
 * Get the assigned table number for a match based on match order
 */
export function getAssignedTableNumber(
  match: Match,
  allVenueMatches: Match[],  // All matches at same venue, same week
  availableTableNumbers: number[]
): number | null {
  // Sort matches by match_number
  const sorted = [...allVenueMatches].sort((a, b) => a.match_number - b.match_number);

  // Find this match's position
  const position = sorted.findIndex(m => m.id === match.id);

  if (position === -1 || position >= availableTableNumbers.length) {
    return null;  // No table assigned
  }

  return availableTableNumbers[position];
}

/**
 * Get table size label for a given table number at a venue
 */
export function getTableSizeLabel(tableNumber: number, venue: Venue): string {
  if (venue.bar_box_tables?.includes(tableNumber)) return '7ft';
  if (venue.eight_foot_tables?.includes(tableNumber)) return '8ft';
  if (venue.regulation_tables?.includes(tableNumber)) return '9ft';

  const otherTable = venue.other_tables?.find(([_, nums]) => nums.includes(tableNumber));
  if (otherTable) {
    const [dimensions] = otherTable;
    return `${dimensions[0]}ft`;
  }

  return '';
}
```

---

## Implementation Phases

### Phase 1: UI First - Simple Mode (Validate Data Model)
Build the simple count-based UI with auto-numbering. No "Configure Tables" yet.

- [ ] `src/components/operator/VenueCreationModal.tsx` - Count inputs for 7ft/8ft/9ft with auto-generated table number display
- [ ] Auto-numbering logic: first field entered gets 1-N, subsequent fields continue
- [ ] Display table numbers as badges/chips next to each count input
- [ ] Total tables display
- [ ] "Add Custom Size" button (disabled/placeholder for now)
- [ ] "Configure Tables" button (disabled/placeholder for now)
- [ ] `src/components/operator/VenueCard.tsx` - Display table numbers by size

### Phase 2: Types & Utilities
Once UI is solid, formalize the types and helper functions.

- [ ] `src/types/venue.ts` - Update `Venue`, `LeagueVenue` with new array types
- [ ] Create: `src/utils/venueTableUtils.ts` - Table number utilities and validation
- [ ] Create: `src/utils/tableAssignment.ts` - Match-to-table assignment logic

### Phase 3: Database Migration
Now we know exactly what schema we need.

- [ ] Create migration: `supabase/migrations/YYYYMMDD_venue_table_arrays.sql`
- [ ] Test migration preserves existing venue data

### Phase 4: Wire Up Database
Connect UI to database.

- [ ] `src/api/mutations/venues.ts` - Include new array fields
- [ ] Update any venue queries to handle new column types

### Phase 5: League Venue Limits
- [ ] `src/components/operator/VenueLimitModal.tsx` - Select tables per size category
- [ ] `src/api/hooks/useLeagueVenueMutations.ts` - Include new array fields

### Phase 6: Table Assignment Display
- [ ] `src/components/player/MatchLineup.tsx` - Display assigned table
- [ ] `src/components/player/ScoreMatch.tsx` - Display assigned table

### Phase 7: Advanced Configuration (Future)
- [ ] "Configure Tables" modal - custom numbering, alphanumeric labels, reassign sizes
- [ ] "Add Custom Size" - support for odd-size tables (6.5ft, etc.)
- [ ] Non-sequential table numbering support

---

## UI Mockups

### Venue Creation/Edit - Simple Mode (Default)

**Auto-numbering rule:** First field with a value gets numbers starting at 1.
Each subsequent field continues from where the previous left off.
Order is determined by which field the user enters first, not form layout.

```
7-Foot (Bar Box)
[3]  →  [4] [5] [6]

8-Foot
[0]  →  (none)

9-Foot (Tournament)
[3]  →  [1] [2] [3]      ← User entered this first

─────────────────────────────────────
Total: 6 tables

[+ Add Custom Size]  [Configure Tables]
```

**Example flow:**
1. User types "3" in 9-Foot field first → generates [1, 2, 3]
2. User types "3" in 7-Foot field → continues with [4, 5, 6]
3. 8-Foot left at 0 → no tables

**Buttons:**
- **"+ Add Custom Size"** - For rare odd-size tables (6.5ft, etc.)
- **"Configure Tables"** - Opens advanced editor for custom numbering, alphanumeric labels, reassigning sizes

### Configure Tables Modal (Advanced - Phase 2)
Only shown when user clicks "Configure Tables". Allows:
- Custom table numbers/names (alphanumeric: "A1", "Diamond", etc.)
- Reassigning sizes to specific tables
- Non-sequential numbering
- Excluding certain table numbers

```
┌─────────────────────────────────────────────────────┐
│ Configure Tables                                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Table    Size         Name/Number                   │
│  ─────    ────         ───────────                   │
│  1        [9ft ▼]      [1        ]                   │
│  2        [9ft ▼]      [2        ]                   │
│  3        [9ft ▼]      [3        ]                   │
│  4        [7ft ▼]      [Diamond-1]                   │
│  5        [7ft ▼]      [Diamond-2]                   │
│  6        [7ft ▼]      [6        ]                   │
│                                                      │
│  [+ Add Table]                                       │
│                                                      │
├─────────────────────────────────────────────────────┤
│                        [Cancel]  [Save Configuration]│
└─────────────────────────────────────────────────────┘
```

### League Venue Limits Modal
```
Available Tables at Sam's Billiards
───────────────────────────────────

7-Foot (Bar Box) - 4 available
☑ Table 1    ☑ Table 2    ☐ Table 3    ☐ Table 4

8-Foot - 2 available
☐ Table 5    ☐ Table 6

9-Foot (Tournament) - 5 available
☑ Table 7    ☑ Table 8    ☐ Table 9    ☐ Table 10    ☐ Table 11

Other - 1 available
☐ Table 12 (6.5ft)

───────────────────────────────────
Selected: 4 tables [1, 2, 7, 8]
```

### Match Display (Lineup/Scoring Page)
```
┌─────────────────────────────────┐
│ Week 5 - Match 3                │
│ Team A vs Team B                │
│ @ Sam's Billiards               │
│ Table 7 (9ft)                   │
└─────────────────────────────────┘
```

---

## Testing Checklist

- [ ] Create venue with tables in each size category
- [ ] Verify duplicate table number validation works
- [ ] Verify error shows which categories have the duplicate
- [ ] Create venue with custom "other" size tables
- [ ] Verify total count is sum of all array lengths
- [ ] Assign venue to league with table limits per size
- [ ] Verify league can only select from venue's available tables
- [ ] Verify table assignment display on lineup page
- [ ] Verify table assignment display shows size label (e.g., "Table 7 (9ft)")
- [ ] Verify table assignment display on scoring page
- [ ] Test migration preserves existing venue data

---

## Notes

- Labels: "7-Foot (Bar Box)", "8-Foot", "9-Foot (Tournament)"
- Array length = table count (no separate count columns)
- Table numbers must be unique across ALL size categories
- League picks subset of venue tables per size category
- Match-to-table assignment is calculated, not stored in database
- `other_tables` uses JSONB for flexibility with custom dimensions
- Future: Could add table labels ("Diamond #3", "Gold Crown") if requested
