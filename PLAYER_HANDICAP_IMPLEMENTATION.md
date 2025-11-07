# Player Handicap Implementation Plan

## Prerequisites (Must Do First)

Before implementing player handicap calculation, we need to add the `handicap_level` field to the database and UI:

### 1. Add handicap_level to leagues table
**Database Migration:** `database/add_handicap_level_to_leagues.sql`
```sql
ALTER TABLE leagues ADD COLUMN handicap_level TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE leagues ADD CONSTRAINT handicap_level_check
  CHECK (handicap_level IN ('standard', 'reduced', 'none'));
```

### 2. Update TypeScript types
**File:** `src/types/league.ts`
```typescript
export type HandicapLevel = 'standard' | 'reduced' | 'none';

export interface League {
  // ... existing fields
  handicap_level: HandicapLevel;
}
```

### 3. Add to league creation wizard
**Files:**
- `src/data/leagueWizardSteps.tsx`
- `src/data/leagueWizardSteps.simple.tsx`

Add a step asking: "Choose your handicap level"
- Standard: Full range (-2, -1, 0, 1, 2) or (1, 0, -1) depending on format
- Reduced: Limited range (1, 0, -1)
- None: All players at 0

---

## Handicap Calculation Formulas

### 3v3 Format (team_format = '5_man')
**Formula:** `(wins - losses) / weeks_played`
- `weeks_played = total_games / 6`
- Uses last 200 games from `match_games` table
- Valid range based on `handicap_level`:
  - **standard**: -2, -1, 0, 1, 2
  - **reduced**: -1, 0, 1
  - **none**: 0

**Example:**
- Player has 120 games: 72 wins, 48 losses
- weeks_played = 120 / 6 = 20 weeks
- raw_handicap = (72 - 48) / 20 = 24 / 20 = 1.2
- Rounded to nearest valid: **1**

### 5v5 Format (team_format = '8_man')
**Formula:** `win_percentage` (straight percentage)
- Uses last 200 games from `match_games` table
- win_percentage = wins / total_games
- Convert to handicap range:
  - Map 0% - 100% to handicap range
  - **TODO:** Clarify exact mapping (e.g., 50% = 0, 60% = +1, 40% = -1, etc.)

**Example (needs confirmation):**
- Player has 100 games: 65 wins
- win_percentage = 65 / 100 = 0.65 (65%)
- Map to handicap: **+1** (or whatever the mapping is)

---

## Implementation Steps

### Step 1: Update calculatePlayerHandicap function
**File:** `src/utils/handicapCalculations.ts`

```typescript
export async function calculatePlayerHandicap(
  playerId: string,
  variant: HandicapVariant,
  teamFormat: TeamFormat,  // NEW PARAMETER - need to pass from league
  config: Partial<HandicapConfig> = {}
): Promise<number> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (variant === 'none') {
    return 0;
  }

  // Query last N games for this player
  const { data: games, error } = await supabase
    .from('match_games')
    .select('winner_player_id, home_player_id, away_player_id')
    .or(`home_player_id.eq.${playerId},away_player_id.eq.${playerId}`)
    .not('winner_player_id', 'is', null)  // Only completed games
    .order('created_at', { ascending: false })
    .limit(finalConfig.gameHistoryLimit);

  if (error || !games || games.length === 0) {
    return 0;  // New player with no history
  }

  // Count wins and losses
  let wins = 0;
  let losses = 0;
  for (const game of games) {
    if (game.winner_player_id === playerId) {
      wins++;
    } else {
      losses++;
    }
  }

  const totalGames = wins + losses;
  let rawHandicap = 0;

  // Calculate based on team format
  if (teamFormat === '5_man') {
    // 3v3 format: (wins - losses) / weeks_played
    const weeksPlayed = totalGames / 6;
    if (weeksPlayed === 0) return 0;
    rawHandicap = (wins - losses) / weeksPlayed;
  } else {
    // 8_man (5v5 format): win percentage
    const winPercentage = wins / totalGames;
    // TODO: Map win percentage to handicap range
    // For now, placeholder mapping:
    rawHandicap = (winPercentage - 0.5) * 4;  // NEEDS CONFIRMATION
  }

  // Round to nearest valid handicap
  return roundToValidHandicap(rawHandicap, variant);
}
```

### Step 2: Update all calling code
Need to pass `teamFormat` from league to the handicap calculation:

**File:** `src/player/MatchLineup.tsx` (line ~229)
```typescript
const handicap = await calculatePlayerHandicap(
  p.members.id,
  playerVariant,
  match.league.team_format  // ADD THIS - get from league
);
```

**File:** `src/hooks/useMatchScoring.ts` (if used there)

### Step 3: Test with real data
1. Create test games in `match_games` table
2. Verify 3v3 calculation: (wins - losses) / (games / 6)
3. Verify 5v5 calculation: win percentage mapping
4. Verify rounding to valid handicap values
5. Test edge cases: 0 games, very few games, exactly 200 games

---

## Questions to Answer

1. **5v5 Win Percentage Mapping:**
   - What win percentage = 0 handicap? (50%?)
   - What win percentage = +1 handicap?
   - What win percentage = -1 handicap?
   - Linear mapping or tiered?

2. **Handicap Ranges:**
   - Confirm 3v3 standard range: -2, -1, 0, 1, 2
   - Confirm 5v5 standard range: Same? Different?
   - Confirm reduced range for both: -1, 0, 1

3. **Edge Cases:**
   - Minimum games before calculating handicap? (Return 0 if < 10 games?)
   - How to handle exactly 200 games vs fewer?
   - Round up or round down on .5?

---

## Current Status

- ✅ Random handicap code removed
- ✅ Placeholder returns 0
- ✅ TODO with implementation steps added
- ⏳ Need to add `handicap_level` to database/types/UI first
- ⏳ Need to clarify 5v5 win percentage mapping
- ⏳ Need to implement and test calculation logic
