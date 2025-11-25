# Preferences System

## Overview

Single flexible `preferences` table stores both organization defaults and league-specific overrides.

## Design Pattern

**Cascading Defaults:**
```
League Setting → Organization Default → System Default
```

## Database Structure

### Preferences Table

| Column | Type | Description |
|--------|------|-------------|
| `entity_type` | TEXT | 'organization' or 'league' |
| `entity_id` | UUID | operator_id or league_id |
| `handicap_variant` | TEXT | 'standard', 'reduced', 'none' |
| `team_handicap_variant` | TEXT | Team bonus method |
| `game_history_limit` | INTEGER | Games for handicap (1-500) |
| `team_format` | TEXT | '5_man' or '8_man' |
| `golden_break_counts_as_win` | BOOLEAN | Whether golden breaks count |

**All setting columns are nullable** - NULL = "use next level default"

### System Defaults (Hardcoded)

```typescript
handicap_variant: 'standard'
team_handicap_variant: 'standard'
game_history_limit: 200
team_format: '5_man'
golden_break_counts_as_win: true
```

## Usage Examples

### 1. Organization Sets Defaults

```sql
-- Organization prefers reduced handicaps with 150 game history
INSERT INTO preferences (entity_type, entity_id, handicap_variant, game_history_limit)
VALUES ('organization', 'operator-123', 'reduced', 150);
```

### 2. League Uses All Defaults

```sql
-- League inherits all organization defaults
-- No row needed! NULL values cascade automatically
```

### 3. League Overrides Specific Settings

```sql
-- League wants no team bonus but keeps org's other settings
INSERT INTO preferences (entity_type, entity_id, team_handicap_variant)
VALUES ('league', 'league-456', 'none');
```

### 4. Query Resolved Settings

```sql
-- Use the convenience view
SELECT * FROM resolved_league_preferences WHERE league_id = 'league-456';

-- Returns final values with all fallbacks applied:
-- handicap_variant: 'reduced' (from org)
-- team_handicap_variant: 'none' (league override)
-- game_history_limit: 150 (from org)
-- team_format: '5_man' (system default)
-- golden_break_counts_as_win: true (system default)
```

## TypeScript Usage

```typescript
import { Preferences, SYSTEM_DEFAULTS } from '@/types';

// Get organization preferences
const orgPrefs = await supabase
  .from('preferences')
  .select('*')
  .eq('entity_type', 'organization')
  .eq('entity_id', operatorId)
  .single();

// Get league overrides
const leaguePrefs = await supabase
  .from('preferences')
  .select('*')
  .eq('entity_type', 'league')
  .eq('entity_id', leagueId)
  .single();

// Resolve with fallback chain
const resolved = {
  handicap_variant:
    leaguePrefs?.handicap_variant ??
    orgPrefs?.handicap_variant ??
    SYSTEM_DEFAULTS.handicap_variant,
  // ... repeat for each setting
};

// OR use the database view
const { data } = await supabase
  .from('resolved_league_preferences')
  .select('*')
  .eq('league_id', leagueId)
  .single();
```

## Adding New Preferences

1. **Add column to table:**
```sql
ALTER TABLE preferences ADD COLUMN new_preference_name TYPE;
```

2. **Add to TypeScript type:**
```typescript
export interface Preferences {
  // ... existing fields
  new_preference_name: Type | null;
}
```

3. **Add to SYSTEM_DEFAULTS:**
```typescript
export const SYSTEM_DEFAULTS = {
  // ... existing defaults
  new_preference_name: defaultValue,
};
```

4. **Update view:**
```sql
ALTER VIEW resolved_league_preferences ...
  COALESCE(league_prefs.new_preference_name, org_prefs.new_preference_name, default_value)
```

Done! No schema migrations for every preference.

## Migration

Run `add_preferences_table.sql` in Supabase SQL editor:
- Creates `preferences` table
- Creates trigger for auto-creating org preferences
- Backfills existing operators
- Creates `resolved_league_preferences` view
