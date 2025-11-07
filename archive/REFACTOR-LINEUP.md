# Lineup Page Refactor Plan

## Overview

The lineup page needs to be refactored into reusable components to support multiple lineup contexts:
- **3v3 Regular Match** - Full handicap calculations, 3 players from 5-person roster
- **3v3 Tiebreaker** - Same 3 players from original match, can reorder, no handicaps matter
- **5v5 Match** - 5 players from 8-person roster, different substitute flow

## Current State

The existing `MatchLineup.tsx` is monolithic and contains:
- Database operations mixed with UI logic
- Handicap calculations inline
- Hard-coded 3-player lineup
- Substitute logic specific to 3v3

## Goals

1. **DRY** - Don't Repeat Yourself
2. **KISS** - Keep It Simple, Stupid
3. **Single Responsibility** - Each component does one thing
4. **Reusability** - Components work across 3v3 and 5v5 contexts

---

## Architecture

### Key Insight: Team Roster Size Determines Everything

The `teams` table has a `roster_size` field:
- `roster_size = 5` → 3v3 format (3 players selected from 5-person roster)
- `roster_size = 8` → 5v5 format (5 players selected from 8-person roster)

**Parent pages only need to pass the team object** - components figure out the rest.

---

## Components

### 1. Custom Hook: `useMatchLineup`

**Location:** `/src/hooks/useMatchLineup.ts`

**Responsibilities:**
- Fetch existing lineups from database
- Save/update lineups
- Lock/unlock lineups
- Real-time synchronization with opponent
- Support both 3v3 and 5v5 formats

**Interface:**
```typescript
interface UseMatchLineupOptions {
  matchId: string;
  teamId: string;
  playerCount: 3 | 5;
}

interface UseMatchLineupReturn {
  lineup: Lineup | null;
  opponentLineup: Lineup | null;
  loading: boolean;
  error: string | null;
  saveLineup: (players: LineupPlayer[]) => Promise<void>;
  lockLineup: () => Promise<void>;
  unlockLineup: () => Promise<void>;
}
```

**Status:** ✅ Created

---

### 2. Component: `MatchInfoCard`

**Location:** `/src/components/lineup/MatchInfoCard.tsx`

**Responsibilities:**
- Display match date
- Display opponent team
- Display home/away status
- Display venue

**Props:**
```typescript
interface MatchInfoCardProps {
  scheduledDate?: string;
  opponent: { id: string; name: string } | null;
  isHomeTeam: boolean;
  venue?: { name: string; city: string; state: string } | null;
}
```

**Status:** ✅ Created

---

### 3. Component: `PlayerRoster`

**Location:** `/src/components/lineup/PlayerRoster.tsx`

**Responsibilities:**
- Display list of available players
- Show player names, nicknames, handicaps
- Optional test mode with handicap overrides

**Important:** Does NOT include substitute in this list. Shows only actual team members.

**Props:**
```typescript
interface PlayerRosterProps {
  players: RosterPlayer[];
  showHandicaps?: boolean;
  testMode?: boolean;
  testHandicaps?: Record<string, number>;
  onHandicapOverride?: (playerId: string, handicap: number) => void;
  disabled?: boolean;
}
```

**Status:** ✅ Created

---

### 4. Component: `TestModeToggle`

**Location:** `/src/components/lineup/TestModeToggle.tsx`

**Responsibilities:**
- Toggle test mode on/off
- Display explanation text
- Disable when lineup is locked

**Props:**
```typescript
interface TestModeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}
```

**Status:** ⏳ Pending

---

### 5. Component: `LineupSelector`

**Location:** `/src/components/lineup/LineupSelector.tsx`

**Responsibilities:**
- Fetch team members from database based on `teamId`
- Determine player count from `team.roster_size` (5 → 3 players, 8 → 5 players)
- Display player selection dropdowns
- Add substitute option to each dropdown (not in available players list)
- Enforce "one position per player" rule
- Enforce "one position per substitute" rule
- Handle substitute selection with callback
- Filter players by `allowedPlayerIds` if provided (tiebreaker mode)
- Display handicaps next to each selected player

**Substitute Behavior:**
- Substitute appears as an option in dropdowns ONLY
- Not shown in the "Available Players" roster
- Uses special IDs: `SUB_HOME_ID` or `SUB_AWAY_ID` based on `isHomeTeam`
- When selected, triggers `onSubstituteSelected` callback for parent to handle handicap flow

**Props:**
```typescript
interface LineupSelectorProps {
  team: {
    id: string;
    roster_size: number; // 5 = 3v3, 8 = 5v5
  };
  isHomeTeam: boolean; // Determines which substitute (home/away)
  allowedPlayerIds?: string[]; // Optional - for tiebreaker restrictions
  showHandicaps?: boolean; // Default true
  onLineupChange: (lineup: LineupPlayer[]) => void;
  onSubstituteSelected?: (position: number) => void;
  locked?: boolean;
  initialLineup?: LineupPlayer[];
  testHandicaps?: Record<string, number>; // From test mode
}

interface LineupPlayer {
  position: number; // 1-indexed (1, 2, 3 for 3v3 or 1-5 for 5v5)
  playerId: string;
  handicap: number;
}
```

**Internal Logic:**
```typescript
// Determine player count from roster size
const playerCount = team.roster_size === 5 ? 3 : 5;

// Determine substitute ID
const substituteId = isHomeTeam ? SUB_HOME_ID : SUB_AWAY_ID;

// Fetch team members
const teamMembers = await fetchTeamPlayers(team.id);

// Filter if tiebreaker mode
const availablePlayers = allowedPlayerIds
  ? teamMembers.filter(p => allowedPlayerIds.includes(p.id))
  : teamMembers;

// Each dropdown shows: availablePlayers + substitute option
```

**Dropdown Behavior:**
- Player can only be in ONE position
- Substitute can only be in ONE position
- Disable already-selected players in other dropdowns

**Status:** ⏳ Pending

---

### 6. Component: `LineupActions`

**Location:** `/src/components/lineup/LineupActions.tsx`

**Responsibilities:**
- Display Lock/Unlock buttons
- Show opponent lock status
- Handle button clicks

**Props:**
```typescript
interface LineupActionsProps {
  locked: boolean;
  opponentLocked: boolean;
  canLock: boolean; // All positions filled
  canUnlock: boolean; // Opponent hasn't locked yet
  onLock: () => void;
  onUnlock: () => void;
  onProceed?: () => void; // Navigate to scoring when both locked
}
```

**Status:** ⏳ Pending

---

## Page Components

### 1. `MatchLineup.tsx` (3v3 Regular)

**Location:** `/src/player/MatchLineup.tsx`

**Uses:**
- `useMatchLineup` hook
- `MatchInfoCard` component
- `TestModeToggle` component
- `PlayerRoster` component
- `LineupSelector` component
- `LineupActions` component

**Unique Responsibilities:**
- Fetch match and team data
- Calculate team handicap (home team only)
- Handle substitute handicap flow:
  - Calculate highest unused handicap
  - Allow manual entry
  - Use higher of the two
- Handle test mode handicap overrides
- Navigate to scoring page when both teams locked

**Substitute Handicap Flow (3v3):**
```typescript
// When substitute is selected at position X:
onSubstituteSelected={(position) => {
  // Calculate highest unused handicap from non-selected players
  const unusedPlayers = teamMembers.filter(p =>
    p.id !== player1Id && p.id !== player2Id && p.id !== player3Id
  );
  const highestUnused = Math.max(...unusedPlayers.map(p => p.handicap));

  // Show modal for manual entry (optional)
  // Use higher of manual entry or highestUnused
  const finalHandicap = Math.max(manualEntry || 0, highestUnused);

  // Update lineup with substitute
  updateLineup(position, SUB_ID, finalHandicap);
}}
```

**Status:** ⏳ Pending Refactor

---

### 2. `TiebreakerLineup.tsx` (3v3 Limited)

**Location:** `/src/player/TiebreakerLineup.tsx`

**Uses:**
- `useMatchLineup` hook
- `MatchInfoCard` component
- `LineupSelector` component (with `allowedPlayerIds`)
- `LineupActions` component

**Unique Responsibilities:**
- Fetch original match lineup
- Restrict player selection to original 3 players
- Allow reordering of positions
- No handicap calculations (handicaps don't matter in tiebreaker)
- Include substitute if substitute played in original match
- Navigate to tiebreaker scoring page

**Player Restriction:**
```typescript
// Get original lineup players
const originalPlayerIds = [
  originalLineup.player1_id,
  originalLineup.player2_id,
  originalLineup.player3_id,
].filter(Boolean);

<LineupSelector
  team={team}
  isHomeTeam={isHomeTeam}
  allowedPlayerIds={originalPlayerIds} // Only these 3 can be selected
  showHandicaps={false} // Handicaps don't matter
  onLineupChange={handleLineupChange}
  locked={lineup?.locked}
/>
```

**Status:** ⏳ Not Created Yet

---

### 3. `FiveOnFiveLineup.tsx` (5v5)

**Location:** `/src/player/FiveOnFiveLineup.tsx`

**Uses:**
- `useMatchLineup` hook
- `MatchInfoCard` component
- `TestModeToggle` component
- `PlayerRoster` component
- `LineupSelector` component
- `LineupActions` component

**Unique Responsibilities:**
- Calculate team handicap (different formula for 5v5)
- Handle substitute flow (different from 3v3):
  - When substitute selected, opponent gets modal to choose which player plays double duty
  - No handicap calculation for substitute (it's just a roster spot)
- Handle test mode handicap overrides
- Navigate to 5v5 scoring page when both teams locked

**Substitute Flow (5v5):**
```typescript
// When substitute is selected:
onSubstituteSelected={(position) => {
  // Lock the lineup with substitute
  lockLineup();

  // Opponent sees modal with 4 remaining players
  // "Choose which player will play in position X"
  // Opponent selects → that player plays twice

  // Final lineup has 5 players but one appears in 2 positions
}}
```

**Status:** ⏳ Not Created Yet

---

## Database Schema Notes

### `teams` Table
```sql
- id (uuid)
- team_name (text)
- roster_size (integer) -- 5 for 3v3, 8 for 5v5
```

### `match_lineups` Table
Currently supports 3 players:
```sql
- player1_id (uuid)
- player1_handicap (numeric)
- player2_id (uuid)
- player2_handicap (numeric)
- player3_id (uuid)
- player3_handicap (numeric)
```

**TODO:** Extend for 5v5 support:
```sql
- player4_id (uuid)
- player4_handicap (numeric)
- player5_id (uuid)
- player5_handicap (numeric)
```

### Substitute Member IDs
```typescript
const SUB_HOME_ID = '00000000-0000-0000-0000-000000000001';
const SUB_AWAY_ID = '00000000-0000-0000-0000-000000000002';
```

These are actual rows in the `members` table with:
- `first_name: "Sub"`
- `last_name: "(Home)"` or `"(Away)"`
- `nickname: "Sub (Home)"` or `"Sub (Away)"`

---

## Handicap Calculation Differences

### 3v3 Regular Match
**Individual Player Handicap:**
```
handicap = (wins - losses) / weeks_played
Range: -2 to +2
```

**Team Handicap:**
```
team_handicap = calculated from standings (set to 0 for now)
```

**Substitute Handicap:**
```
substitute_handicap = MAX(manual_entry, highest_unused_player_handicap)
```

### 5v5 Match
**Individual Player Handicap:**
```
TBD - likely different formula
```

**Team Handicap:**
```
TBD - likely different formula
```

**Substitute:**
```
No handicap - opponent chooses which player plays double duty
```

### Tiebreaker
**No handicaps matter** - it's just win 2 out of 3 games

---

## Test Mode

**Purpose:** Allow manual handicap overrides for testing match scenarios

**Use Cases:**
- Test tie games (set handicaps so both teams need 9 wins)
- Test close matches
- Test blowouts
- Verify threshold calculations

**Implementation:**
- Checkbox toggle in lineup page
- When enabled, shows override dropdowns for each player
- Overridden handicaps are saved to database when lineup is locked
- Only available before lineup is locked

---

## Migration Path

### Phase 1: Complete Reusable Components ✅ IN PROGRESS
- [x] `useMatchLineup` hook
- [x] `MatchInfoCard` component
- [x] `PlayerRoster` component
- [ ] `TestModeToggle` component
- [ ] `LineupSelector` component
- [ ] `LineupActions` component

### Phase 2: Refactor Existing 3v3 Lineup
- [ ] Update `MatchLineup.tsx` to use new components
- [ ] Test lineup creation, locking, real-time sync
- [ ] Test substitute flow
- [ ] Test test mode

### Phase 3: Create Tiebreaker Lineup
- [ ] Create `TiebreakerLineup.tsx`
- [ ] Implement player restriction logic
- [ ] Test tiebreaker lineup creation

### Phase 4: Extend for 5v5
- [ ] Add player4/player5 columns to `match_lineups` table
- [ ] Create `FiveOnFiveLineup.tsx`
- [ ] Implement 5v5 substitute flow with opponent modal
- [ ] Test 5v5 lineup creation

### Phase 5: End of Match Flow
- [ ] Implement match end detection
- [ ] Create tie game modal with tiebreaker navigation
- [ ] Create winner verification flow
- [ ] Navigate back to dashboard

---

## Key Design Decisions

### 1. Substitute Not in Available Players List
**Rationale:** Substitute is not a team member. It's a special option available in dropdowns only.

### 2. Parent Passes Team Object Only
**Rationale:** `roster_size` determines everything. No need to pass player count separately.

### 3. LineupSelector Handles Player Fetching
**Rationale:** Encapsulates all lineup selection logic. Parent just provides team and gets lineup back.

### 4. Different Substitute Flows Per Format
**Rationale:**
- 3v3: Substitute gets calculated handicap
- 5v5: Substitute is just a roster slot, opponent picks who plays double
- Tiebreaker: Substitute only if they played in original match

### 5. One Position Per Player/Substitute
**Rationale:** Prevent double-selection bugs. Enforced in `LineupSelector` by disabling selected options.

---

## Testing Checklist

### 3v3 Regular Match
- [ ] Can select 3 different players
- [ ] Cannot select same player twice
- [ ] Can select substitute in one position
- [ ] Cannot select substitute in multiple positions
- [ ] Substitute handicap calculates correctly
- [ ] Test mode overrides work
- [ ] Lineup saves to database
- [ ] Lock/unlock works
- [ ] Real-time sync with opponent
- [ ] Navigate to scoring when both locked

### Tiebreaker
- [ ] Only original 3 players available
- [ ] Can reorder positions
- [ ] Substitute available if played in original
- [ ] No handicaps shown
- [ ] Lock/unlock works
- [ ] Navigate to tiebreaker scoring

### 5v5 (Future)
- [ ] Can select 5 different players
- [ ] Substitute triggers opponent modal
- [ ] Opponent can choose double-duty player
- [ ] Lineup saves correctly
- [ ] Navigate to 5v5 scoring

---

## Open Questions

1. **5v5 Handicap Formula:** How is individual and team handicap calculated?
2. **5v5 Opponent Modal:** Where does this modal appear? In LineupSelector or parent page?
3. **Database Migration:** When to add player4/player5 columns? Before or after 3v3 refactor?
4. **Tiebreaker Routing:** What's the URL pattern? `/match/:matchId/tiebreaker/lineup`?

---

## Files Modified/Created

### Created
- `/src/hooks/useMatchLineup.ts` ✅
- `/src/components/lineup/MatchInfoCard.tsx` ✅
- `/src/components/lineup/PlayerRoster.tsx` ✅
- `/src/components/lineup/TestModeToggle.tsx` ⏳
- `/src/components/lineup/LineupSelector.tsx` ⏳
- `/src/components/lineup/LineupActions.tsx` ⏳
- `/src/player/TiebreakerLineup.tsx` ⏳
- `/src/player/FiveOnFiveLineup.tsx` ⏳

### Modified
- `/src/player/MatchLineup.tsx` ⏳ (refactor to use new components)

### Database Migrations
- Add `player4_id`, `player4_handicap`, `player5_id`, `player5_handicap` to `match_lineups` table ⏳

---

## Success Criteria

✅ **DRY:** No duplicate logic between 3v3, 5v5, and tiebreaker pages
✅ **KISS:** Each component has a single, clear purpose
✅ **Single Responsibility:** Components are focused and testable
✅ **Reusability:** Components work across all lineup contexts
✅ **Maintainability:** Easy to add new features or fix bugs
✅ **Type Safety:** Full TypeScript coverage with proper interfaces
