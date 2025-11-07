# Scoring Page Refactor Plan

## Overview

The scoring page needs to be refactored into reusable components to support multiple match formats:
- **3v3 Regular Match** - 18 games, handicap-based win thresholds, ties possible
- **3v3 Tiebreaker** - 3 games, best of 3, no handicaps, no ties
- **5v5 Match** - 25 games, different win calculation, no ties

## Current State

The existing `ScoreMatch.tsx` (1610 lines) contains:
- All game scoring logic mixed with UI
- Real-time subscription logic inline
- Confirmation flow and modals
- Player/team statistics calculations
- Hard-coded 3-player lineup references
- Hard-coded 18-game logic

## Goals

1. **DRY** - Don't Repeat Yourself
2. **KISS** - Keep It Simple, Stupid
3. **Single Responsibility** - Each component does one thing
4. **Reusability** - Components work across 3v3, tiebreaker, and 5v5

---

## Key Insight: Match Format Determines Game Flow

The match format drives everything:
- **3v3 Regular**: 18 games, 3 players per team, handicap thresholds, ties possible
- **3v3 Tiebreaker**: 3 games, 3 players per team, best of 3, no handicaps, no ties
- **5v5**: 25 games, 5 players per team, different scoring, no ties

**Parent pages pass match format** - components adapt accordingly.

---

## UI Structure Analysis

### Top Section (Scoreboard - Top 1/3 of screen)
**Swipeable between Home/Away teams**

1. **Team Header** - "HOME" or "AWAY" label + Auto-confirm checkbox
2. **Player Stats Table** - Shows handicaps, names, wins/losses for each player
   - Hard-coded 3 rows for players
   - ⚠️ **NEEDS**: Dynamic player count (3 for 3v3, 5 for 5v5)
3. **Match Stats Card** - Shows "To Win", "To Tie", current score, points
   - ⚠️ **NEEDS**: Different logic for tiebreaker (best of 3) and 5v5 (no ties)

### Bottom Section (Game List - Bottom 2/3 of screen)

1. **Games Header** - "Games Complete - X / Y"
   - ⚠️ **NEEDS**: Dynamic total (18 for 3v3, 3 for tiebreaker, 25 for 5v5)
2. **Column Headers** - "Break | vs | Rack"
3. **Scrollable Game List** - Maps through all games
   - ✅ **ALREADY DYNAMIC**: `getAllGames().map()` - just needs different game data
   - Each game shows:
     - Game number
     - Breaker button/name (colored by team)
     - "vs" or "Vacate" button
     - Racker button/name (colored by team)
   - Game states:
     - Unscored: Clickable buttons
     - Pending: Yellow/white backgrounds, no trophy, no edit
     - Confirmed: Green/white backgrounds, trophy on winner, "Vacate" button

---

## Architecture

### Reusable Components

#### 1. Custom Hook: `useMatchScoring`

**Location:** `/src/hooks/useMatchScoring.ts`

**Responsibilities:**
- Fetch match data, lineups, players
- Subscribe to real-time game updates
- Calculate team/player statistics
- Handle game scoring (insert/update)
- Handle confirmation flow
- Handle vacate requests
- Support all match formats (3v3, tiebreaker, 5v5)

**Interface:**
```typescript
interface UseMatchScoringOptions {
  matchId: string;
  matchType: '3v3' | 'tiebreaker' | '5v5';
}

interface UseMatchScoringReturn {
  // Data
  match: Match | null;
  homeLineup: Lineup | null;
  awayLineup: Lineup | null;
  gameResults: Map<number, MatchGame>;
  players: Map<string, Player>;

  // User context
  userTeamId: string | null;
  isHomeTeam: boolean | null;

  // Statistics
  getTeamStats: (teamId: string) => { wins: number; losses: number };
  getPlayerStats: (playerId: string) => { wins: number; losses: number };
  getCompletedGamesCount: () => number;

  // Actions
  scoreGame: (gameNumber: number, winnerTeamId: string, winnerPlayerId: string, options: ScoringOptions) => Promise<void>;
  confirmScore: (gameNumber: number) => Promise<void>;
  denyScore: (gameNumber: number) => Promise<void>;
  vacateWinner: (gameNumber: number) => Promise<void>;

  // State
  loading: boolean;
  error: string | null;
}

interface ScoringOptions {
  breakAndRun?: boolean;
  goldenBreak?: boolean;
}
```

---

#### 2. Component: `ScoreboardCard`

**Location:** `/src/components/scoring/ScoreboardCard.tsx`

**Responsibilities:**
- Display player stats table (dynamic player count)
- Display match stats (to win, to tie, current score)
- Show auto-confirm checkbox
- Support swipe gesture (handled by parent)

**Props:**
```typescript
interface ScoreboardCardProps {
  teamType: 'home' | 'away';
  teamName: string;
  teamHandicap: number;
  players: Array<{
    id: string;
    name: string;
    handicap: number;
    wins: number;
    losses: number;
  }>;
  matchStats: {
    toWin: number;
    toTie: number | null; // null for tiebreaker/5v5
    currentWins: number;
    points: number;
  };
  autoConfirm?: boolean;
  onAutoConfirmChange?: (enabled: boolean) => void;
}
```

**Key Feature:** Uses `players.map()` to dynamically render player rows - works for 3 or 5 players

---

#### 3. Component: `GamesList`

**Location:** `/src/components/scoring/GamesList.tsx`

**Responsibilities:**
- Display scrollable list of all games
- Show game status (unscored, pending, confirmed)
- Handle game click for scoring
- Handle vacate click for editing
- Support any number of games (3, 18, 25)

**Props:**
```typescript
interface GamesListProps {
  games: GameDefinition[]; // From getAllGames() or similar
  gameResults: Map<number, MatchGame>;
  homeLineup: Lineup;
  awayLineup: Lineup;
  getPlayerDisplayName: (playerId: string | null) => string;
  onGameClick: (gameNumber: number, playerId: string, playerName: string, teamId: string) => void;
  onVacateClick: (gameNumber: number, currentWinnerName: string) => void;
  homeTeamId: string;
  awayTeamId: string;
  totalGames: number; // 18 for 3v3, 3 for tiebreaker, 25 for 5v5
}

interface GameDefinition {
  gameNumber: number;
  homePlayerPosition: number; // 1-3 for 3v3, 1-5 for 5v5
  awayPlayerPosition: number;
  homeAction: 'breaks' | 'racks';
  awayAction: 'breaks' | 'racks';
}
```

**Key Feature:** Uses `games.map()` - parent passes different game arrays based on format

---

#### 4. Component: `ScoringModal`

**Location:** `/src/components/scoring/ScoringModal.tsx`

**Responsibilities:**
- Modal for selecting game winner
- Show B&R and Golden Break checkboxes
- Confirm/Cancel buttons

**Props:**
```typescript
interface ScoringModalProps {
  isOpen: boolean;
  gameNumber: number;
  winnerPlayerName: string;
  showBreakAndRun?: boolean; // League setting
  showGoldenBreak?: boolean; // League setting
  onConfirm: (options: { breakAndRun: boolean; goldenBreak: boolean }) => void;
  onCancel: () => void;
}
```

---

#### 5. Component: `ConfirmationModal`

**Location:** `/src/components/scoring/ConfirmationModal.tsx`

**Responsibilities:**
- Modal for confirming opponent's score
- Show game number, winner name, B&R/8BB badges
- Accept/Deny buttons
- Handle vacate request confirmation separately

**Props:**
```typescript
interface ConfirmationModalProps {
  isOpen: boolean;
  gameNumber: number;
  winnerPlayerName: string;
  breakAndRun: boolean;
  goldenBreak: boolean;
  isVacateRequest?: boolean;
  onAccept: () => void;
  onDeny: () => void;
}
```

---

#### 6. Component: `VacateModal`

**Location:** `/src/components/scoring/VacateModal.tsx`

**Responsibilities:**
- Modal for vacating a confirmed game winner
- Show current winner
- Confirm/Cancel buttons

**Props:**
```typescript
interface VacateModalProps {
  isOpen: boolean;
  gameNumber: number;
  currentWinnerName: string;
  onConfirm: () => void;
  onCancel: () => void;
}
```

---

## Match Format Differences

### Game Generation

**3v3 Regular Match:**
```typescript
import { getAllGames } from '@/utils/gameOrder';
const games = getAllGames(); // Returns 18 games
const totalGames = 18;
```

**3v3 Tiebreaker:**
```typescript
import { getTiebreakerGames } from '@/utils/gameOrder';
const games = getTiebreakerGames(); // Returns 3 games (best of 3)
const totalGames = 3;
```

**5v5 Match:**
```typescript
import { get5v5Games } from '@/utils/gameOrder';
const games = get5v5Games(); // Returns 25 games
const totalGames = 25;
```

---

### Win Threshold Calculation

**3v3 Regular Match:**
```typescript
// Uses handicap lookup table
const homeThresholds = await fetchHandicapThresholds(homeTeamHandicap);
// Returns: { games_to_win: 10, games_to_tie: 9, games_to_lose: 8 }
```

**3v3 Tiebreaker:**
```typescript
// Static - best of 3
const matchStats = {
  toWin: 2,
  toTie: null, // No ties in tiebreaker
  currentWins: teamWins,
  points: 0 // No points in tiebreaker
};
```

**5v5 Match:**
```typescript
// Different calculation (TBD - but no ties)
const matchStats = {
  toWin: calculateFiveOnFiveWinThreshold(teamHandicap),
  toTie: null, // No ties in 5v5
  currentWins: teamWins,
  points: calculateFiveOnFivePoints(teamWins, threshold)
};
```

---

## Page Components

### 1. `ScoreMatch.tsx` (3v3 Regular)

**Refactored Structure:**
```typescript
export function ScoreMatch() {
  const { matchId } = useParams();

  // Use custom hook for all data/logic
  const {
    match,
    homeLineup,
    awayLineup,
    gameResults,
    players,
    getTeamStats,
    getPlayerStats,
    getCompletedGamesCount,
    scoreGame,
    confirmScore,
    denyScore,
    vacateWinner,
    loading,
    error
  } = useMatchScoring({ matchId, matchType: '3v3' });

  // UI state
  const [showingHomeTeam, setShowingHomeTeam] = useState(true);
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [scoringGame, setScoringGame] = useState(null);
  const [confirmationGame, setConfirmationGame] = useState(null);
  const [editingGame, setEditingGame] = useState(null);

  // Get games for 3v3
  const games = getAllGames();
  const totalGames = 18;

  // Calculate match stats
  const homeStats = {
    toWin: homeThresholds.games_to_win,
    toTie: homeThresholds.games_to_tie,
    currentWins: getTeamStats(match.home_team_id).wins,
    points: calculatePoints(match.home_team_id, homeThresholds)
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Scoreboard (swipeable) */}
      <div className="h-1/3">
        <ScoreboardCard
          teamType={showingHomeTeam ? 'home' : 'away'}
          teamName={showingHomeTeam ? match.home_team.team_name : match.away_team.team_name}
          teamHandicap={showingHomeTeam ? homeTeamHandicap : 0}
          players={getPlayersForScoreboard(showingHomeTeam ? homeLineup : awayLineup)}
          matchStats={showingHomeTeam ? homeStats : awayStats}
          autoConfirm={autoConfirm}
          onAutoConfirmChange={setAutoConfirm}
        />
      </div>

      {/* Games list */}
      <div className="h-2/3">
        <GamesList
          games={games}
          gameResults={gameResults}
          homeLineup={homeLineup}
          awayLineup={awayLineup}
          getPlayerDisplayName={(id) => players.get(id)?.nickname || 'Unknown'}
          onGameClick={handleGameClick}
          onVacateClick={handleVacateClick}
          homeTeamId={match.home_team_id}
          awayTeamId={match.away_team_id}
          totalGames={totalGames}
        />
      </div>

      {/* Modals */}
      <ScoringModal {...scoringModalProps} />
      <ConfirmationModal {...confirmationModalProps} />
      <VacateModal {...vacateModalProps} />
    </div>
  );
}
```

---

### 2. `ScoreTiebreaker.tsx` (3v3 Tiebreaker)

**Location:** `/src/player/ScoreTiebreaker.tsx`

**Unique Aspects:**
- Only 3 games
- No handicap thresholds (best of 3)
- No "To Tie" display
- No points calculation
- Match ends as soon as one team wins 2 games

**Structure:**
```typescript
export function ScoreTiebreaker() {
  const { matchId } = useParams();

  const {
    match,
    homeLineup,
    awayLineup,
    gameResults,
    players,
    getTeamStats,
    scoreGame,
    confirmScore,
    denyScore,
    vacateWinner,
    loading,
    error
  } = useMatchScoring({ matchId, matchType: 'tiebreaker' });

  // Get tiebreaker games (only 3)
  const games = getTiebreakerGames();
  const totalGames = 3;

  // Static match stats (best of 3)
  const homeStats = {
    toWin: 2,
    toTie: null,
    currentWins: getTeamStats(match.home_team_id).wins,
    points: 0 // No points in tiebreaker
  };

  return (
    // Same structure as ScoreMatch, but with different games/stats
  );
}
```

---

### 3. `Score5v5.tsx` (5v5)

**Location:** `/src/player/Score5v5.tsx`

**Unique Aspects:**
- 25 games
- 5 players per team
- Different win calculation (no ties)
- Different points system

**Structure:**
```typescript
export function Score5v5() {
  const { matchId } = useParams();

  const {
    match,
    homeLineup,
    awayLineup,
    gameResults,
    players,
    getTeamStats,
    scoreGame,
    confirmScore,
    denyScore,
    vacateWinner,
    loading,
    error
  } = useMatchScoring({ matchId, matchType: '5v5' });

  // Get 5v5 games (25 total)
  const games = get5v5Games();
  const totalGames = 25;

  // Calculate 5v5 match stats (no ties)
  const homeStats = {
    toWin: calculate5v5WinThreshold(homeTeamHandicap),
    toTie: null, // No ties in 5v5
    currentWins: getTeamStats(match.home_team_id).wins,
    points: calculate5v5Points(getTeamStats(match.home_team_id).wins)
  };

  return (
    // Same structure, but with 5 players and 25 games
  );
}
```

---

## Game Order Utilities

### Current: `utils/gameOrder.ts`

Currently exports `getAllGames()` for 18 3v3 games.

### Extend:

```typescript
// 3v3 Regular (18 games)
export function getAllGames(): GameDefinition[] {
  // Returns 18 games (existing logic)
}

// 3v3 Tiebreaker (3 games - best of 3)
export function getTiebreakerGames(): GameDefinition[] {
  // Returns 3 games using same 3 players
  // Game 1: P1 breaks vs P1 racks
  // Game 2: P2 breaks vs P2 racks
  // Game 3: P3 breaks vs P3 racks (if needed)
}

// 5v5 (25 games)
export function get5v5Games(): GameDefinition[] {
  // Returns 25 games using 5 players
  // Similar rotation pattern but with 5 positions
}
```

---

## Database Considerations

### `match_lineups` Table

**Current:** Supports 3 players
```sql
player1_id, player1_handicap
player2_id, player2_handicap
player3_id, player3_handicap
```

**For 5v5:** Already discussed in lineup refactor - needs player4/player5 columns

---

## Confirmation Queue Logic

The existing confirmation queue system is complex and works well. It should be:
1. **Moved to `useMatchScoring` hook** - keep it centralized
2. **Kept as-is** - it handles multiple pending confirmations elegantly
3. **Reused across all formats** - works the same for 3, 18, or 25 games

---

## Real-Time Subscription

Current subscription logic is in `useEffect` and handles:
- Game updates (new scores, confirmations)
- Vacate requests
- Auto-confirm logic
- Confirmation queue management

**This should be moved entirely into `useMatchScoring` hook** - parent pages just consume the data.

---

## Testing Checklist

### 3v3 Regular Match
- [ ] Score all 18 games
- [ ] Confirm/deny opponent scores
- [ ] Vacate confirmed games
- [ ] Auto-confirm works
- [ ] Confirmation queue handles multiple pending
- [ ] Real-time updates work
- [ ] Break & Run and Golden Break save correctly
- [ ] Match ends at correct threshold
- [ ] Swipe between home/away scoreboard

### 3v3 Tiebreaker
- [ ] Score 3 games
- [ ] Best of 3 logic works
- [ ] Match ends when team reaches 2 wins
- [ ] No "To Tie" displayed
- [ ] No points calculation

### 5v5 (Future)
- [ ] Score all 25 games
- [ ] 5 players display correctly in scoreboard
- [ ] Win threshold calculated correctly
- [ ] No ties possible
- [ ] Different points system works

---

## Migration Path

### Phase 1: Extract Reusable Components
- [ ] Create `useMatchScoring` hook (extract all data/logic from ScoreMatch.tsx)
- [ ] Create `ScoreboardCard` component (player stats + match stats)
- [ ] Create `GamesList` component (scrollable game list)
- [ ] Create `ScoringModal` component
- [ ] Create `ConfirmationModal` component
- [ ] Create `VacateModal` component

### Phase 2: Refactor Existing 3v3 Scoring
- [ ] Update `ScoreMatch.tsx` to use new components
- [ ] Test all functionality (scoring, confirming, vacating, real-time)
- [ ] Verify no regressions

### Phase 3: Extend Game Order Utilities
- [ ] Add `getTiebreakerGames()` function
- [ ] Add `get5v5Games()` function (when 5v5 ready)

### Phase 4: Create Tiebreaker Scoring
- [ ] Create `ScoreTiebreaker.tsx`
- [ ] Implement best of 3 logic
- [ ] Test tiebreaker flow

### Phase 5: Create 5v5 Scoring (Future)
- [ ] Create `Score5v5.tsx`
- [ ] Implement 5v5 win calculation
- [ ] Handle 5 players in lineup
- [ ] Test 25-game flow

---

## Key Design Decisions

### 1. Hook Handles ALL Logic
**Rationale:** Parent pages are pure UI. Hook manages data, subscriptions, calculations, database operations.

### 2. GamesList is Format-Agnostic
**Rationale:** Uses `.map()` over games array - works for 3, 18, or 25 games automatically.

### 3. ScoreboardCard Uses Dynamic Player Count
**Rationale:** `players.map()` renders however many players are passed - works for 3 or 5.

### 4. Match Stats Calculated in Parent
**Rationale:** Different formats need different calculations. Parent computes, component displays.

### 5. Modals Are Separate Components
**Rationale:** Scoring, confirmation, and vacate are distinct flows with different UI/logic.

---

## Success Criteria

✅ **DRY:** No duplicate logic between 3v3, tiebreaker, and 5v5 scoring pages
✅ **KISS:** Each component has a single, clear purpose
✅ **Single Responsibility:** Components are focused and testable
✅ **Reusability:** Components work across all match formats
✅ **Maintainability:** Easy to add new features or fix bugs
✅ **Type Safety:** Full TypeScript coverage with proper interfaces

---

## Files To Create/Modify

### Created
- `/src/hooks/useMatchScoring.ts` ⏳
- `/src/components/scoring/ScoreboardCard.tsx` ⏳
- `/src/components/scoring/GamesList.tsx` ⏳
- `/src/components/scoring/ScoringModal.tsx` ⏳
- `/src/components/scoring/ConfirmationModal.tsx` ⏳
- `/src/components/scoring/VacateModal.tsx` ⏳
- `/src/player/ScoreTiebreaker.tsx` ⏳
- `/src/player/Score5v5.tsx` ⏳

### Modified
- `/src/player/ScoreMatch.tsx` ⏳ (refactor to use new components)
- `/src/utils/gameOrder.ts` ⏳ (add getTiebreakerGames, get5v5Games)

### Utilities to Create
- `/src/utils/matchThresholds.ts` ⏳ (calculate win thresholds for different formats)

---

## Open Questions

1. **5v5 Win Calculation:** What's the formula for determining games to win in 5v5?
2. **5v5 Points System:** How are points calculated differently than 3v3?
3. **Tiebreaker Game Order:** Do we use same positions (P1 vs P1, P2 vs P2, P3 vs P3) or different?
4. **Auto-Confirm in Tiebreaker:** Should this be available or disabled?
5. **Match End Detection:** Should hook handle navigation to results page automatically?

---

## Estimated Effort

**Phase 1 (Extract Components):** 8-10 hours
- Most complex: `useMatchScoring` hook (moving all subscription logic)
- Moderate: `GamesList` (lots of conditional rendering)
- Simple: Modal components (straightforward UI)

**Phase 2 (Refactor 3v3):** 2-3 hours
- Testing is critical here

**Phase 3 (Game Order Utilities):** 1-2 hours
- Tiebreaker games are simple
- 5v5 requires understanding rotation pattern

**Phase 4 (Tiebreaker Page):** 2-3 hours
- Mostly just wiring up components with different data

**Phase 5 (5v5 Page):** 4-6 hours (when ready)
- Need clarity on win calculation and points system first

**Total:** ~17-24 hours for complete refactor
