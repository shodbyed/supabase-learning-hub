# Features to Salvage from scoring-3x3-phase2 Branch

This document lists the working features from the `scoring-3x3-phase2` branch that should be integrated into main one at a time.

## ✅ Ready to Add (Non-Scoring Related)

### 1. Handicap System - Remove Random Testing Mode
**Files:**
- `src/utils/handicapCalculations.ts`

**Changes:**
- Remove `getRandomHandicap()` function
- Remove `useRandom` parameter from `calculatePlayerHandicap()`
- Remove `useRandom` parameter from `calculatePlayerHandicaps()`
- Remove `useRandom` parameter from `calculateTeamHandicap()`
- Change functions to return `0` instead of random values
- Update comments to reflect "returns 0 until real implementation"
- Update `calculate3v3HandicapDiffs()` to have better documentation about relative handicap lookups

**Why:** Gets rid of confusing random testing mode. Use Test Mode in lineup entry to manually set handicaps instead.

---

### 2. Handicap Level Selection (League Creation)
**Files:**
- `src/types/league.ts` - Add `HandicapLevel` type and add to `League` interface
- `src/data/leagueWizardSteps.tsx` - Add handicap level step
- `src/data/leagueWizardSteps.simple.tsx` - Add handicap level step
- `src/hooks/useLeagueWizard.ts` - Add `handicapLevel` to formData
- `src/api/mutations/leagues.ts` - Add `handicapLevel` to create params
- `src/operator/LeagueCreationWizard.tsx` - Pass `handicapLevel` when creating league
- `database/add_handicap_level_to_leagues.sql` - Database migration

**Changes:**
- Add `handicap_level` field to leagues: 'standard', 'reduced', or 'none'
- Add wizard step asking user to choose handicap level
- Default to 'standard' if not specified

**Why:** Allows leagues to choose how much handicap balancing they want.

---

### 3. Team Handicap Field on Lineups
**Files:**
- `src/types/match.ts` - Add `team_handicap` to `Lineup` interface
- `database/scoring3x3/add_team_handicap_to_lineups.sql` - Database migration

**Changes:**
- Add `team_handicap: number` field to `Lineup` type
- Database column to store team handicap on lineups (for consistency)

**Why:** Both teams need to use the same team handicap value. Storing it ensures consistency.

---

### 4. Venue Cascade Delete Fixes
**Files:**
- `database/fix_venue_cascade_delete.sql`
- `database/triggers/fix_match_venue_trigger.sql`
- `database/triggers/update_match_venues_on_team_insert.sql`
- `database/triggers/update_match_venues_on_team_venue_change.sql`

**Changes:**
- Fix venue foreign key constraints to cascade properly
- Add triggers to update match venues when team venues change

**Why:** Bug fixes for venue management.

---

### 5. Game Order Utility
**Files:**
- `src/utils/gameOrder.ts`

**Changes:**
- New utility file with `getAllGames()` function
- Returns array of 18 games with player positions and actions

**Why:** Centralized game order logic. Not yet used but ready for implementation.

---

## 🔶 Scoring-Related (Add Separately With Care)

### 6. UI Improvements to Scoring Components
**Files:**
- `src/components/scoring/ConfirmationDialog.tsx` - Add `onOpenChange` handler
- `src/components/scoring/GameButtonRow.tsx` - Add "Confirm" button
- `src/components/scoring/MatchScoreboard.tsx` - Add Exit button, better auto-confirm placement, show team names

**Changes:**
- Exit button to return to dashboard
- Confirm button in middle of game row (quick confirm for winner)
- Auto-confirm checkbox moved to header
- Team names shown instead of generic "Team" label

**Why:** Better UX for scoring interface.

---

### 7. Game Creation Logic in MatchLineup
**Files:**
- `src/player/MatchLineup.tsx`

**Code to Add:**
```typescript
// Add imports
import { calculate3v3HandicapDiffs } from '@/utils/handicapCalculations';
import { getAllGames } from '@/utils/gameOrder';

// Add team_handicap to lineup data (line ~538)
const lineupData = {
  // ... existing fields
  team_handicap: teamHandicap,  // ADD THIS LINE
  locked: true,
};

// After setting lineup locked (line ~578), add opponent check:
// Re-check opponent lineup status immediately after locking
if (!match) return;
const opponentTeamId = isHomeTeam ? match.away_team_id : match.home_team_id;
const { data: refreshedOpponentLineup } = await supabase
  .from('match_lineups')
  .select('*')
  .eq('match_id', matchId)
  .eq('team_id', opponentTeamId)
  .maybeSingle();

if (refreshedOpponentLineup) {
  setOpponentLineup(refreshedOpponentLineup);

  // If both lineups locked, create games
  if (refreshedOpponentLineup.locked) {
    await saveMatchThresholds(result.data, refreshedOpponentLineup);
  }
}

// Add saveMatchThresholds function (before handleUnlockLineup):
const saveMatchThresholds = async (myLineup: any, opponentLineup: any) => {
  try {
    const homeLineup = isHomeTeam ? myLineup : opponentLineup;
    const awayLineup = isHomeTeam ? opponentLineup : myLineup;

    // Calculate handicap diffs
    const { homeDiff, awayDiff } = calculate3v3HandicapDiffs(
      homeLineup,
      awayLineup,
      homeLineup.team_handicap
    );

    // Fetch thresholds
    const { data: homeThresholds } = await supabase
      .from('handicap_chart_3vs3')
      .select('*')
      .eq('hcp_diff', homeDiff)
      .single();

    const { data: awayThresholds } = await supabase
      .from('handicap_chart_3vs3')
      .select('*')
      .eq('hcp_diff', awayDiff)
      .single();

    if (!homeThresholds || !awayThresholds) return;

    // Update match with thresholds
    await supabase
      .from('matches')
      .update({
        home_games_to_win: homeThresholds.games_to_win,
        away_games_to_win: awayThresholds.games_to_win,
        home_games_to_tie: homeThresholds.games_to_tie,
        away_games_to_tie: awayThresholds.games_to_tie,
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId);

    // Create 18 empty game records
    const allGames = getAllGames();
    const games = allGames.map(game => ({
      match_id: matchId,
      game_number: game.gameNumber,
      home_player_id: homeLineup[`player${game.homePlayerPosition}_id`],
      away_player_id: awayLineup[`player${game.awayPlayerPosition}_id`],
      home_action: game.homeAction,
      away_action: game.awayAction,
      winner_team_id: null,
      winner_player_id: null,
      break_and_run: false,
      golden_break: false,
      confirmed_by_home: false,
      confirmed_by_away: false,
      is_tiebreaker: false,
    }));

    await supabase.from('match_games').insert(games);
  } catch (err) {
    console.error('Error in saveMatchThresholds:', err);
  }
};
```

**Why:** Creates 18 empty game records when lineups lock. Allows realtime to work with UPDATEs instead of INSERTs.

---

## ❌ DO NOT ADD (Broken)

- End-of-game flow / Match results page (`src/player/MatchResults.tsx`)
- Contest/vacate system on results page (`src/components/scoring/ContestGameModal.tsx`, `src/components/scoring/MatchCompleteModal.tsx`)
- Match finalization logic (`src/api/mutations/matchResults.ts`, `src/api/hooks/useMatchResultMutations.ts`)
- Database schemas for results (`database/add_match_result_statuses.sql`, `database/add_results_confirmation_columns.sql`)
- Polling/realtime changes to MatchLineup (lines 397-430 on phase2 branch)
- Any changes to `src/realtime/useMatchGamesRealtime.ts`
- Any changes to `src/player/ScoreMatch.tsx` related to results navigation
- Documentation file `END_OF_GAME_FLOW.md`

**Why:** These features are broken and need to be rethought/redesigned.

---

## Implementation Order

1. Start with #1-5 (non-scoring related) - can be done together or one at a time
2. Then #6 (UI improvements) - test thoroughly
3. Finally #7 (game creation) - test with both teams locking lineups

All changes should be tested and committed individually.
