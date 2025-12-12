# Branch: venue-table-sizes

**Created:** 2025-12-11
**Status:** Not Started

---

## Main Goals

1. **Add 8ft table support** - Currently only 7ft "bar box" and 9ft "regulation"
2. **Add unified table numbers array** - Single array for venue, leagues pick which tables to use
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

## Data Model

### Important Workflow

**Both table number arrays are editable:**

1. **Venue `table_numbers`** - Operator defines ALL pool tables at the venue that could potentially be used for league play. Exclude tables that would never be used (snooker tables, broken tables, VIP tables, etc.)

2. **League-Venue `available_table_numbers`** - Operator then selects which tables from the venue's pool are available for THIS specific league.

**Key Point:** The venue array is the "master list" of usable tables. It doesn't need to include every physical table in the building - just the ones that could ever be used for league play.

### Venue Level
Venues track counts by size AND a single unified table numbers array.

```
Venue: Sam's Billiards (14 physical tables, but 2 are snooker)
├── bar_box_tables: 4
├── eight_foot_tables: 2
├── regulation_tables: 6
├── total_tables: 12 (computed - only pool tables)
└── table_numbers: [3,4,5,6,7,8,9,10,11,12,13,14]  -- Tables 1-2 are snooker, excluded
```

### League-Venue Level
Each league picks which tables they can use from the venue's pool.

```
League-Venue: Monday 8-Ball @ Sam's Billiards
├── available_bar_box_tables: 2
├── available_eight_foot_tables: 0
├── available_regulation_tables: 2
├── available_total_tables: 4 (computed)
└── available_table_numbers: [3,5,6,7]  -- Subset of venue's table_numbers
```

### Example Scenarios

**Venue with snooker tables excluded:**

| Physical Tables | Venue table_numbers | Notes |
|-----------------|---------------------|-------|
| 14 total | [3,4,5,6,7,8,9,10,11,12,13,14] | Tables 1-2 are snooker, not in array |

**Venue with 12 pool tables, two leagues:**

| League | Available Tables | available_table_numbers |
|--------|-----------------|-------------------------|
| Monday 8-Ball | 4 | [1,2,3,4] |
| Tuesday 9-Ball | 6 | [7,8,9,10,11,12] |

**Venue with non-sequential numbering:**

| Venue Tables | table_numbers | Notes |
|--------------|---------------|-------|
| 6 pool tables | [2,4,5,8,10,12] | Odd numbering from venue's history |

---

## Database Migration

```sql
-- =====================
-- VENUES TABLE
-- =====================

-- Add 8ft tables column
ALTER TABLE venues ADD COLUMN eight_foot_tables integer NOT NULL DEFAULT 0;

-- Add unified table numbers array (NULL = auto-generate [1,2,3...total])
ALTER TABLE venues ADD COLUMN table_numbers integer[] DEFAULT NULL;

-- =====================
-- LEAGUE_VENUES TABLE
-- =====================

-- Add 8ft tables limit
ALTER TABLE league_venues ADD COLUMN available_eight_foot_tables integer NOT NULL DEFAULT 0;

-- Add available table numbers array (NULL = use all venue tables)
ALTER TABLE league_venues ADD COLUMN available_table_numbers integer[] DEFAULT NULL;
```

---

## Logic

### Table Numbers Resolution

```typescript
function getVenueTableNumbers(venue: Venue): number[] {
  // If custom array exists, use it
  if (venue.table_numbers && venue.table_numbers.length > 0) {
    return venue.table_numbers;
  }
  // Otherwise auto-generate [1, 2, 3, ... total_tables]
  return Array.from({ length: venue.total_tables }, (_, i) => i + 1);
}

function getLeagueAvailableTableNumbers(leagueVenue: LeagueVenue, venue: Venue): number[] {
  // If custom array exists, use it
  if (leagueVenue.available_table_numbers && leagueVenue.available_table_numbers.length > 0) {
    return leagueVenue.available_table_numbers;
  }
  // Otherwise use all venue tables
  return getVenueTableNumbers(venue);
}
```

### Validation

- `table_numbers` array length must equal `total_tables` (if provided)
- `available_table_numbers` must be subset of venue's `table_numbers`
- `available_table_numbers` length should match `available_total_tables`

---

## Table Assignment Display

### How It Works

1. Get all matches at same venue on same week/night
2. Sort by `match_number`
3. Assign tables in order from `available_table_numbers`
4. Display: "Table 5"

### Example

League has `available_table_numbers: [3,5,6,7]`

| Match # | Home Team | Assigned Table |
|---------|-----------|----------------|
| 1 | Team A | Table 3 |
| 3 | Team C | Table 5 |
| 5 | Team E | Table 6 |
| 7 | Team G | Table 7 |

### Implementation

```typescript
function getAssignedTableNumber(
  match: Match,
  allVenueMatches: Match[],  // All matches at same venue, same week
  availableTableNumbers: number[]
): number | null {
  // Sort matches by match_number
  const sorted = [...allVenueMatches].sort((a, b) => a.match_number - b.match_number);

  // Find this match's position
  const position = sorted.findIndex(m => m.id === match.id);

  if (position === -1 || position >= availableTableNumbers.length) {
    return null;  // No table assigned (shouldn't happen)
  }

  return availableTableNumbers[position];
}
```

---

## Files to Update

### Phase 1: Database & Types
- [ ] Create migration: `supabase/migrations/YYYYMMDD_venue_table_sizes.sql`
- [ ] `src/types/venue.ts` - Add new fields to `Venue`, `VenueFormData`, `LeagueVenue`

### Phase 2: Venue Management
- [ ] `src/components/operator/VenueCreationModal.tsx` - Add 8ft input, optional table numbers
- [ ] `src/components/operator/VenueCard.tsx` - Display 8ft count and table numbers
- [ ] `src/api/mutations/venues.ts` - Include new fields

### Phase 3: League Venue Limits
- [ ] `src/operator/VenueLimitModal.tsx` - Add 8ft limits, table number selection
- [ ] `src/api/hooks/useLeagueVenueMutations.ts` - Include new fields

### Phase 4: Table Assignment Display
- [ ] Create utility: `src/utils/tableAssignment.ts`
- [ ] `src/player/MatchLineup.tsx` - Display assigned table
- [ ] `src/player/ScoreMatch.tsx` - Display assigned table

---

## UI Mockups

### Venue Creation
```
7-Foot Tables (Bar Box)    [4]
8-Foot Tables              [2]
9-Foot Tables (Tournament) [6]
─────────────────────────────
Total Tables: 12

[ ] Customize table numbers
    └─ Table numbers: [1,2,3,4,5,6,7,8,9,10,11,12]
```

### League Venue Limits Modal
```
Available Tables at Sam's Billiards
───────────────────────────────────
7-Foot (Bar Box):    [2] of 4
8-Foot:              [0] of 2
9-Foot (Tournament): [2] of 6
───────────────────────────────────
Total: 4 tables

Select which tables:
☑ Table 3    ☐ Table 7
☐ Table 4    ☑ Table 8
☑ Table 5    ☐ Table 9
☑ Table 6    ☐ Table 10
             ☐ Table 11
             ☐ Table 12

Selected: [3, 5, 6, 8]
```

### Match Display (Lineup/Scoring Page)
```
┌─────────────────────────────┐
│ Week 5 - Match 3            │
│ Team A vs Team B            │
│ @ Sam's Billiards           │
│ Table 5                     │
└─────────────────────────────┘
```

---

## Testing Checklist

- [ ] Create venue with 8ft tables
- [ ] Create venue with custom table numbers
- [ ] Verify auto-numbering when table_numbers is NULL
- [ ] Assign venue to league with table limits
- [ ] Select specific available table numbers for league
- [ ] Verify table assignment display on lineup page
- [ ] Verify table assignment display on scoring page
- [ ] Verify validation rejects invalid array lengths

---

## Notes

- Labels: "7-Foot (Bar Box)", "8-Foot", "9-Foot (Tournament)"
- Table numbers array is unified per venue (not split by size)
- League picks subset of venue tables via `available_table_numbers`
- Match-to-table assignment is calculated, not stored in database
- Future: Could add table labels ("Diamond #3", "Gold Crown") if requested
