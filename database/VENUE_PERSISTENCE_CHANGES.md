# Venue Persistence Changes

## Summary

Venues now persist independently of operators and organizations. When an operator or organization is deleted, their venues remain in the system for other organizations to discover and use.

## Why This Matters

1. **Physical locations are permanent** - Venues are real bars/pool halls that exist regardless of which operator created the record
2. **Prevent duplicates** - Multiple operators shouldn't create separate records for the same physical location
3. **Preserve history** - Match history stays intact even if organizations change
4. **Enable discovery** - New operators can find and use existing venue records

## Database Changes

### 1. Venue Ownership (venues table)

**Before:**
```sql
created_by_operator_id UUID NOT NULL REFERENCES league_operators(id) ON DELETE CASCADE
```

**After:**
```sql
created_by_operator_id UUID REFERENCES league_operators(id) ON DELETE SET NULL
```

**Impact:**
- Column is now nullable
- When operator deleted → field set to NULL (venue persists)
- Venue continues to exist and can be used by other organizations

### 2. Files Modified

- `database/venues.sql` - Updated table schema
- `database/rebuild_all_tables.sql` - Updated venues section
- `src/types/venue.ts` - Made `created_by_operator_id` nullable

### 3. Migration File

**Run this:** `database/fix_venue_persistence.sql`

This migration:
1. Drops old CASCADE constraint
2. Makes `created_by_operator_id` nullable
3. Adds new SET NULL constraint
4. Creates duplicate detection function
5. Creates venue usage tracking view

## New Features

### Duplicate Detection Function

```sql
find_duplicate_venues(
  p_street_address VARCHAR(255),
  p_city VARCHAR(100),
  p_state VARCHAR(2),
  p_zip_code VARCHAR(10)
)
```

**Usage:**
```typescript
import { findDuplicateVenues } from '@/api/queries/venueDuplicates';

const duplicates = await findDuplicateVenues(
  '123 Main St',
  'Springfield',
  'IL',
  '62701'
);

if (duplicates.length > 0) {
  // Show warning: "This venue may already exist. Use existing?"
}
```

**Features:**
- Case insensitive matching
- Trimmed whitespace
- Normalized zip codes (removes dashes)
- Returns venue details + organization that created it

### Venue Usage Tracking View

```sql
SELECT * FROM venue_organization_usage WHERE venue_id = '<uuid>';
```

**Returns:**
- Which organizations use which venues
- When venue was first authorized for a league
- Last match date at that venue
- Count of leagues using the venue

## UI Integration (Future Work)

### During Venue Creation

1. **Check for duplicates** when operator enters address
2. **Show existing venues** at that address
3. **Offer options:**
   - Use existing venue (add to their league_venues)
   - Create new venue anyway (if truly different location)

### During League Setup

1. **Show all venues** operator has access to
2. **Include venues created by others** (if operator has permission)
3. **Track last usage** to help operators find active venues

## What's Already Correct

These relationships were already using SET NULL:
- `teams.home_venue_id` → SET NULL (correct)
- `matches.scheduled_venue_id` → SET NULL (correct)
- `matches.actual_venue_id` → SET NULL (correct)

This relationship still uses CASCADE (correct):
- `league_venues.venue_id` → CASCADE (removes join record, not venue)

## Testing the Migration

After running `fix_venue_persistence.sql`:

```sql
-- 1. Verify constraint change
SELECT conname, confdeltype
FROM pg_constraint
WHERE conname = 'venues_created_by_operator_id_fkey';
-- Should show confdeltype = 'n' (SET NULL)

-- 2. Test duplicate detection
SELECT * FROM find_duplicate_venues('123 Main St', 'Springfield', 'IL', '62701');

-- 3. Check venue usage
SELECT * FROM venue_organization_usage;
```

## Migration Safety

This migration is **safe to run multiple times** (idempotent):
- Uses `IF NOT EXISTS` where appropriate
- Uses `DROP CONSTRAINT IF EXISTS` before recreating
- Can be run on existing databases with data

## Next Steps

1. ✅ Run migration: `database/fix_venue_persistence.sql`
2. ⏳ Add duplicate detection to venue creation UI
3. ⏳ Add "use existing venue" flow for operators
4. ⏳ Add venue discovery/search for operators
5. ⏳ Show venue usage stats on venue management page
