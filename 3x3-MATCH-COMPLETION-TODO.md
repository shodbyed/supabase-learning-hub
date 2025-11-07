# 3v3 Match Completion & Tiebreaker TODO

> **Created**: 2025-11-07
> **Status**: Not Started
> **Priority**: High - Critical MVP Feature
> **Context**: Pages 1 & 2 are built (Lineup + Scoring). Need to complete match end flow and tiebreaker.

---

## 🎯 Phase 1: Match End Detection & Verification Flow

### 1.1 Detect When All Games Are Played
**Goal**: Generic detection that works for 18, 25, or 3 games

**Requirements**:
- Count total confirmed games in `match_games` table
- Compare against expected total (18 for 3v3, 25 for 5v5, 3 for tiebreaker)
- Trigger when `confirmed_games_count === total_games`

**Implementation**:
- Add to `ScoreMatch.tsx` (or `useMatchScoring` hook if refactored)
- Listen for game confirmations via real-time subscription
- When count reaches total, trigger match completion flow

**Questions**:
- Where to store `total_games`? (matches table? calculate from format?)
- Should we check every game confirmation or poll periodically?

---

### 1.2 Score Verification Modal
**Goal**: Both teams verify final scores before match is officially complete

**UI Flow**:
1. When all games played → Show "Match Complete - Verify Scores" modal
2. Display final score summary:
   - Home Team: X wins
   - Away Team: Y wins
   - Match result: Win/Tie + threshold info
3. Show player stats for both teams (games won per player)
4. Two buttons:
   - **"Scores Look Good"** - Confirm verification
   - **"Need to Edit"** - Dismiss modal, return to scoring page

**Verification Requirements**:
- **BOTH teams must verify** before proceeding
- Track verification status per team in database
- Real-time sync: when one team verifies, other team sees it
- Can't proceed until both verified

**Database Changes Needed**:
```sql
-- Add to matches table (or create match_verification table)
ALTER TABLE matches ADD COLUMN home_team_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE matches ADD COLUMN away_team_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE matches ADD COLUMN match_status TEXT; -- 'in_progress', 'awaiting_verification', 'verified', 'completed'
```

**Edit Flow**:
- If either team clicks "Need to Edit":
  - Dismiss modal
  - Return to scoring page
  - Teams can use existing "Vacate" button to fix incorrect games
  - Modal reappears when all games still confirmed

---

### 1.3 Determine Match Outcome
**Goal**: Calculate if match is a Win or Tie

**Logic**:
```typescript
// Get win thresholds from handicap_chart_3vs3
const homeThresholds = getThresholdsForTeam(homeTeamHandicap);
const awayThresholds = getThresholdsForTeam(awayTeamHandicap);

// Count wins
const homeWins = countTeamWins(homeTeamId);
const awayWins = countTeamWins(awayTeamId);

// Determine outcome
if (homeWins >= homeThresholds.games_to_win) {
  return { result: 'home_win', winner: homeTeamId };
} else if (awayWins >= awayThresholds.games_to_win) {
  return { result: 'away_win', winner: awayTeamId };
} else if (homeWins === homeThresholds.games_to_tie && awayWins === awayThresholds.games_to_tie) {
  return { result: 'tie', winner: null };
} else {
  // Edge case: shouldn't happen if thresholds are correct
  console.error('Unexpected match state');
}
```

**Generic Implementation**:
- Works for any game count (18/25/3)
- Works for formats with or without ties
  - If `games_to_tie` is NULL (5v5, tiebreaker), only check for wins
  - If `games_to_tie` exists (3v3), check for tie scenario

---

### 1.4 Post-Verification Actions
**Goal**: Determine what happens after both teams verify

**Flow**:
```typescript
if (bothTeamsVerified) {
  const outcome = determineMatchOutcome();

  if (outcome.result === 'tie') {
    // Navigate to tiebreaker
    navigate(`/match/${matchId}/tiebreaker`);
  } else {
    // Navigate to match results/summary page
    updateMatchStatus('completed', outcome.winner);
    navigate(`/match/${matchId}/results`);
  }
}
```

**Database Updates Needed**:
```sql
-- Update matches table
UPDATE matches
SET
  match_status = 'completed',
  winner_team_id = :winnerId,
  completed_at = NOW()
WHERE id = :matchId;
```

**Questions**:
- Do we need a separate "Match Results" page or just navigate back to schedule?
- Should we show confetti/celebration animation for winner?
- Do we update player handicaps immediately or in a background job?

---

## 🎯 Phase 2: Tiebreaker Flow

### 2.1 Tiebreaker Lineup Page
**Goal**: Allow teams to re-enter lineup using same 3 players from original match

**Route**: `/match/:matchId/tiebreaker`

**UI Requirements**:
- Show match info (teams, date, etc.)
- Display original lineup (read-only reference)
- Three dropdowns to select player order (P1, P2, P3)
- **Restriction**: Can only select from original 3 players (including substitute if one played)
- Lock/Ready button when lineup complete
- Wait for both teams to lock before proceeding

**Key Differences from Regular Lineup**:
- ❌ No handicap calculations (handicaps don't matter in tiebreaker)
- ❌ No "games to win/tie" display
- ✅ Can reorder same players
- ✅ Same lock/unlock flow as regular lineup

**Database**:
- Reuse `match_lineups` table
- Add `is_tiebreaker` flag OR create separate `tiebreaker_lineups` table
- Store which match this tiebreaker belongs to

```sql
-- Option 1: Reuse table with flag
ALTER TABLE match_lineups ADD COLUMN is_tiebreaker BOOLEAN DEFAULT FALSE;

-- Option 2: New table (cleaner)
CREATE TABLE tiebreaker_lineups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) NOT NULL,
  team_id UUID REFERENCES teams(id) NOT NULL,
  player1_id UUID REFERENCES members(id) NOT NULL,
  player2_id UUID REFERENCES members(id) NOT NULL,
  player3_id UUID REFERENCES members(id) NOT NULL,
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2.2 Tiebreaker Scoring Page
**Goal**: Score best 2 out of 3 games

**Route**: `/match/:matchId/tiebreaker/score`

**Game Format**:
| Game | Home Player | Home Action | Away Player | Away Action |
|------|-------------|-------------|-------------|-------------|
| 1    | P1          | Breaks      | P1          | Racks       |
| 2    | P1          | Racks       | P1          | Breaks      |
| 3    | P1          | Breaks      | P1          | Racks       |

*Note: Always same player positions (P1 vs P1), breaking alternates by team*

**Breaking Order**:
- Game 1: Home team breaks
- Game 2: Away team breaks
- Game 3: Home team breaks (if needed)

**Scoring Rules**:
- Same confirmation flow as regular match
- Match ends immediately when one team wins 2 games
- No need to play all 3 games

**Early Termination**:
```typescript
// After each game confirmation
const homeWins = countTiebreakerWins(homeTeamId);
const awayWins = countTiebreakerWins(awayTeamId);

if (homeWins === 2 || awayWins === 2) {
  // Trigger tiebreaker completion
  showTiebreakerVerificationModal();
}
```

**Database**:
- Reuse `match_games` table
- Add `is_tiebreaker` flag to distinguish from regular games
- Game numbers: 1, 2, 3 (reset from main match)

```sql
ALTER TABLE match_games ADD COLUMN is_tiebreaker BOOLEAN DEFAULT FALSE;
```

---

### 2.3 Tiebreaker Special Handicap Rule
**Goal**: Record wins for ALL 3 players on winning team, nothing for losing team

**Critical Rule** (from original spec):
- **Winning Team**: ALL three players get a recorded win (affects handicap)
- **Losing Team**: NO games recorded (no wins, no losses)

**Why**: Prevents sandbagging by ensuring all players benefit from team win

**Implementation**:
```typescript
function recordTiebreakerOutcome(winningTeamId: string, losingTeamId: string) {
  const winningLineup = getTiebreakerLineup(winningTeamId);

  // Record "tiebreaker_win" for all 3 winning players
  const winningPlayers = [
    winningLineup.player1_id,
    winningLineup.player2_id,
    winningLineup.player3_id
  ];

  for (const playerId of winningPlayers) {
    // Insert special "tiebreaker win" record
    // This affects handicap calculation: (wins - losses) / weeks_played
    await supabase.from('player_game_results').insert({
      player_id: playerId,
      match_id: matchId,
      result: 'tiebreaker_win',
      counts_for_handicap: true
    });
  }

  // Losing team: DO NOTHING
  // No records created for losing players
}
```

**Database Schema Needed**:
```sql
-- Option 1: New table for tiebreaker results
CREATE TABLE player_tiebreaker_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) NOT NULL,
  player_id UUID REFERENCES members(id) NOT NULL,
  result TEXT CHECK (result = 'win'), -- Only wins recorded
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Option 2: Add to existing player stats tracking
-- (depends on how you're currently tracking player wins/losses)
```

**Questions**:
- How are player wins/losses currently tracked?
- Is there a `player_stats` table or calculated from `match_games`?
- Need to ensure tiebreaker wins count in handicap formula

---

### 2.4 Tiebreaker Completion Flow
**Goal**: Handle end of tiebreaker same as regular match

**Flow**:
1. When team reaches 2 wins → Trigger verification modal
2. Both teams verify scores
3. Record special handicap results (all 3 winning players get win)
4. Update match status to 'completed'
5. Navigate to results page

**Reuse Phase 1 Components**:
- Same verification modal
- Same "both teams must verify" logic
- Navigate to same results page

---

## 📋 Implementation Checklist

### Phase 1: Match End Detection
- [ ] Add `match_status`, `home_team_verified`, `away_team_verified` to `matches` table
- [ ] Create generic "count confirmed games" function
- [ ] Add real-time listener for game confirmations
- [ ] Detect when all games are played
- [ ] Create Score Verification Modal component
- [ ] Implement verification tracking (both teams must verify)
- [ ] Create generic `determineMatchOutcome()` function (handles 18/25/3 games, with/without ties)
- [ ] Implement post-verification navigation logic (tie → tiebreaker, win → results)
- [ ] Create Match Results page (or reuse existing page)
- [ ] Test with 18-game match (win scenario)
- [ ] Test with 18-game match (tie scenario)

### Phase 2: Tiebreaker
- [ ] Decide: Reuse `match_lineups` table or create `tiebreaker_lineups`?
- [ ] Add `is_tiebreaker` flag to tables
- [ ] Create `/match/:matchId/tiebreaker` route
- [ ] Create Tiebreaker Lineup page
  - [ ] Fetch original lineup
  - [ ] Restrict player selection to original 3 players
  - [ ] Lock/unlock mechanism
  - [ ] Real-time sync between teams
- [ ] Create `/match/:matchId/tiebreaker/score` route
- [ ] Create tiebreaker game order (best 2 of 3, alternating breaks)
- [ ] Implement early termination (stop at 2 wins)
- [ ] Create special handicap recording logic (3 wins for winning team)
- [ ] Implement tiebreaker verification flow
- [ ] Test tiebreaker full flow (tie match → lineup → score → completion)

---

## 🧪 Testing Scenarios

### Match End Detection
1. **Regular Win** - Home team reaches win threshold → Verification modal → Navigate to results
2. **Regular Tie** - Both teams reach tie threshold → Verification modal → Navigate to tiebreaker
3. **Edit During Verification** - Team clicks "Need to Edit" → Can vacate games → Modal reappears
4. **One Team Verifies** - First team verifies → Other team sees status → Must also verify
5. **5v5 Match (no tie)** - 25 games, winner determined, no tie option

### Tiebreaker Flow
1. **Tiebreaker 2-0** - Team wins first 2 games → Ends early → Verification → All 3 players get win
2. **Tiebreaker 2-1** - Goes to game 3 → Winner determined → Verification → All 3 players get win
3. **Lineup Restriction** - Can only select original 3 players → Substitute included if played
4. **Reorder Players** - Select same players in different positions → Works correctly
5. **Handicap Recording** - Verify all 3 winning players get handicap win, losing team gets nothing

---

## 🤔 Open Questions

1. **Match Results Page**:
   - Create new page or navigate back to schedule?
   - Show player stats, final score, match summary?
   - Celebration animation for winner?

2. **Handicap Updates**:
   - Update player handicaps immediately or background job?
   - Recalculate after every match or nightly batch?

3. **Database Design**:
   - Reuse tables with flags or create tiebreaker-specific tables?
   - Where to track player wins/losses for handicap calculation?

4. **Error Handling**:
   - What if verification times out (teams never verify)?
   - What if one team abandons the match?
   - Auto-verify after X hours?

5. **Navigation**:
   - Can users navigate away during verification?
   - Save verification state and restore if they return?

---

## 🎯 Success Criteria

✅ Generic match end detection works for 18, 25, and 3 games
✅ Both teams can verify scores before proceeding
✅ Teams can edit scores during verification
✅ Correctly determines Win vs Tie
✅ Win scenario navigates to results
✅ Tie scenario navigates to tiebreaker
✅ Tiebreaker lineup restricted to original 3 players
✅ Tiebreaker scoring ends at 2 wins
✅ Special handicap rule: 3 wins for winning team, 0 for losing team
✅ All flows use real-time sync between teams
✅ Mobile-friendly UI throughout

---

## 📚 Related Files

**Existing**:
- `/src/player/MatchLineup.tsx` - Page 1 (Lineup Entry)
- `/src/player/ScoreMatch.tsx` - Page 2 (Scoring)
- `/src/utils/gameOrder.ts` - Game order algorithm
- `database/match_lineups` table
- `database/match_games` table
- `database/handicap_chart_3vs3` table

**To Create**:
- `/src/player/TiebreakerLineup.tsx` - Tiebreaker lineup entry
- `/src/player/TiebreakerScore.tsx` - Tiebreaker scoring (or reuse ScoreMatch with flag?)
- `/src/player/MatchResults.tsx` - Match results/summary page
- `/src/components/match/ScoreVerificationModal.tsx` - Verification modal component
- Database migrations for new columns/tables

**Reference**:
- `/docs/3x3SCORING-PLAN.md` - Full specification (archive when complete)
- `/docs/BCA_HANDICAP_SYSTEM.md` - Handicap calculation rules
