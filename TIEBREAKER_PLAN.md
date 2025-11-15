# Tiebreaker Flow Implementation Plan

## 🔒 CRITICAL CONSTRAINTS

### Lineup Page
**DO NOT break existing lineup page functionality**
- Normal 3v3 lineup selection MUST continue working exactly as it does now
- Only ADD tiebreaker features, never MODIFY existing flows
- If something can't be reused safely, create separate components/logic
- Test existing lineup flow after each change to ensure nothing breaks

### Scoring Page
**DO NOT break existing scoring page functionality**
- Normal 3v3 scoring MUST continue working exactly as it does now
- Tiebreaker scoring should work IN ADDITION TO original scoring, not interfere with it
- Only ADD tiebreaker features, never MODIFY existing flows
- If something can't be reused safely, create separate components/logic
- Test existing scoring flow after each change to ensure nothing breaks

---

## Tiebreaker Rules

### What is a Tiebreaker?
A tiebreaker is **one more round (3 games) of play** when the main match ends in a tie.

### Lineup Selection Rules
1. **Players**: Only the 3 players from the original locked lineup can play
   - Cannot add new players from the team roster
   - Players can change their position order (1, 2, 3)
   - **Database lineup record should NOT change** (if possible)

2. **Handicaps**:
   - No handicaps recorded
   - No handicaps added to players
   - No threshold lookups needed

3. **Match Updates**:
   - Nothing updates in the match record during lineup selection
   - Updates happen only after games are recorded and verified

### Lineup Page Changes for Tiebreaker
- Show **only the 3 players from the original lineup** (not the whole team roster)
- Allow reordering: Player 1, Player 2, Player 3
- Lock button to confirm position order
- When both teams lock their tiebreaker positions → create 3 games

### Game Creation
When both tiebreaker lineups are locked, create exactly **3 games**:

| Game # | Home Team | Away Team |
|--------|-----------|-----------|
| 1 | Player 1 (breaks) | Player 1 (racks) |
| 2 | Player 2 (racks) | Player 2 (breaks) |
| 3 | Player 3 (breaks) | Player 3 (racks) |

**Breaking pattern**: Home breaks games 1 & 3, Away breaks game 2

### Scoring Page for Tiebreaker
- Navigate to scoring page after both teams lock
- **ONLY show the 3 tiebreaker games** (not the original 18 games)
  - Filter by `is_tiebreaker = true` in `match_games` table
- Same scoring UI as normal match
- **Race to 2**: As soon as one team wins 2 games, match ends
- Verification flow same as normal match
  - Display declares the winner of the match
  - Both teams verify the tiebreaker result

### Tiebreaker Game Recording (Anti-Sandbagging Rule)
**CRITICAL**: Individual tiebreaker games are scored differently than normal games.

**Rule**: The team that wins the tiebreaker gets **ALL 3 games recorded as WINS**, regardless of actual game outcomes.

**Why**: Prevents players from intentionally losing their tiebreaker game to lower handicap.

**Examples**:
- Home wins tiebreaker 2-0 (games 1 & 2, game 3 not played)
  - **Record**: Home player 1 = WIN, Home player 2 = WIN, Home player 3 = WIN
  - **Record**: Away player 1 = LOSS, Away player 2 = LOSS, Away player 3 = LOSS

- Home wins tiebreaker 2-1 (wins games 1 & 3, loses game 2)
  - **Actual**: Home won 2 games, Away won 1 game
  - **Record**: Home player 1 = WIN, Home player 2 = WIN, Home player 3 = WIN
  - **Record**: Away player 1 = LOSS, Away player 2 = LOSS, Away player 3 = LOSS
  - Note: Away player 2 actually won their game, but gets a LOSS on their record

**Implementation**: After tiebreaker verification, update all 3 `match_games` records:
- Set `winner_id` to the winning team's player for that game
- Set `loser_id` to the losing team's player for that game (keep loser recorded for data integrity)
- Regardless of who actually won during play

### Handicap Calculation with Tiebreaker Games
**CRITICAL**: Modify handicap calculation to handle tiebreaker games specially.

**Current Logic**:
- `fetchPlayerGameHistory()` gets last 200 games for a player
- `calculatePlayerHandicap()` counts wins and losses
- Formula: (wins - losses) / weeks_played

**Tiebreaker Game Rules for Handicap**:
- **Player WON tiebreaker game**: Include in the 200 games (counts as a win)
- **Player LOST tiebreaker game**: Exclude entirely from calculation (don't count at all)

**Why**:
- Losing team players shouldn't be penalized for anti-sandbagging rule
- Winning team players benefit from the win (proper reward)
- No incentive to throw a tiebreaker game

**Implementation**: Update `fetchPlayerGameHistory()` in `/src/api/queries/matchGames.ts`:

Need to add filter logic that excludes tiebreaker losses:
```typescript
// Exclude tiebreaker games where player lost
// Keep all non-tiebreaker games
// Keep tiebreaker games where player won
```

This will be done FIRST before implementing any other tiebreaker features.

---

## Current Implementation Status

### ✅ Already Working (Verified)
1. **Tie Detection** - Match detects when both teams hit tie thresholds
2. **Match Result Saved** - `match_result: 'tie'` saved to database
3. **Navigation on Tie** - Both teams navigate to `/match/:matchId/lineup` (not dashboard)
4. **Auto-Navigate Prevention** - Lineup page checks `match_result === 'tie'` and does NOT auto-navigate to scoring

### ❌ To Be Implemented
1. **Tiebreaker UI on Lineup Page**
   - Detect tiebreaker mode (`match_result === 'tie'`)
   - Show banner explaining tiebreaker rules
   - Display only the 3 original lineup players (not full roster)
   - Allow position reordering
   - Lock button for tiebreaker positions

2. **Game Creation for Tiebreaker**
   - Create 3 games (not 18) when both teams lock
   - Set correct player matchups and break/rack assignments
   - Flag games as tiebreaker games somehow

3. **Scoring Page Tiebreaker Mode**
   - Detect tiebreaker mode
   - Show only tiebreaker games (filter out original 18 games)
   - Same scoring mechanics
   - Winner determined by 2/3 games won

4. **Match Completion for Tiebreaker**
   - Update match record with tiebreaker winner
   - Calculate points for tiebreaker win
   - Navigate to dashboard after verification

---

## Database Schema - ANSWERED ✅

### match_games Table
- **Already has** `is_tiebreaker` boolean column
- Use this to filter tiebreaker games from normal games
- Tiebreaker games will have `is_tiebreaker = true`

### match_lineups Table
- **TBD**: How to track tiebreaker player positions?
  - Option A: Add `tiebreaker_position_1_id`, `tiebreaker_position_2_id`, `tiebreaker_position_3_id`
  - Option B: Just reorder the existing `player1_id`, `player2_id`, `player3_id` (but you said don't change lineup record)
  - Option C: Store tiebreaker positions in a separate JSON column or separate table

### matches Table - What to Update After Tiebreaker
When tiebreaker completes and is verified:
1. **status** → `'completed'`
2. **winner_team_id** → ID of team that won tiebreaker
3. **match_result** → `'home_win'` or `'away_win'` (overwrites 'tie')
4. **completed_at** → Current timestamp
5. **results_confirmed_by_home** → Updated with new verifier member ID
6. **results_confirmed_by_away** → Updated with new verifier member ID
7. **home_team_verified_by** → Member ID who verified tiebreaker for home
8. **away_team_verified_by** → Member ID who verified tiebreaker for away

**Note**: Original match data (18 games, original scores) remains in database, just gets overwritten with final tiebreaker winner.

## Questions Still To Answer

### Scoring & Points
1. **Point calculation for tiebreaker wins**
   - Does tiebreaker winner get points?
   - Same point calculation as normal match?
   - Fixed point value for tiebreaker win?
   - Update `home_points_earned` / `away_points_earned`?

2. **What if tiebreaker also ties (1-1-1)?**
   - This shouldn't be possible in race-to-2 format
   - BUT what if all 3 games have no winner (scratches/golden breaks/issues)?
   - Play another tiebreaker? Match remains tied?

### Tiebreaker Lineup Storage
3. **How do we store tiebreaker player positions?**
   - Need to know which player is in position 1, 2, 3 for tiebreaker
   - Options listed above in match_lineups section

### UI/UX Decisions
4. **Lineup page implementation approach**
   - Separate `/match/:matchId/tiebreaker` route?
   - Conditional UI within existing MatchLineup.tsx?
   - Completely separate TiebreakerLineup.tsx component?

5. **Player position selection UX**
   - Dropdown to select which position each player takes?
   - Drag-and-drop reordering?
   - Number buttons next to each player?
   - Simple display of "Player 1: [Name], Player 2: [Name], Player 3: [Name]" with swap buttons?

---

## Implementation Strategy (TBD after questions answered)

### Phase 1: Database Changes
- [ ] Add necessary columns/tables for tiebreaker tracking
- [ ] Create migration files
- [ ] Update TypeScript types

### Phase 2: Lineup Page Tiebreaker UI
- [ ] Detect tiebreaker mode
- [ ] Show tiebreaker banner/instructions
- [ ] Display only lineup players (not full roster)
- [ ] Build position selection UI
- [ ] Lock tiebreaker positions

### Phase 3: Game Creation
- [ ] Detect when both tiebreaker lineups locked
- [ ] Create 3 tiebreaker games with correct matchups
- [ ] Set break/rack assignments
- [ ] Navigate to scoring page

### Phase 4: Scoring Page Tiebreaker Mode
- [ ] Detect tiebreaker mode
- [ ] Filter/show only tiebreaker games
- [ ] Same scoring mechanics
- [ ] Determine winner (2/3 games)
- [ ] Update match result

### Phase 5: Testing
- [ ] Test normal lineup flow still works
- [ ] Test tiebreaker lineup flow
- [ ] Test scoring flow for tiebreaker
- [ ] Test verification and completion
- [ ] Test edge cases (ties, golden breaks, etc.)

---

## Files Likely to Change

### Guaranteed Changes
- `/src/player/MatchLineup.tsx` - Add tiebreaker detection and UI
- `/src/hooks/lineup/useMatchPreparation.ts` - Tiebreaker game creation
- `/src/player/ScoreMatch.tsx` - Tiebreaker mode detection
- `/supabase/migrations/` - New migration for database changes

### Possible Changes
- `/src/types/match.ts` - Add tiebreaker types
- `/src/components/scoring/MatchEndVerification.tsx` - Tiebreaker completion flow
- `/src/api/mutations/` - Tiebreaker-specific mutations
- `/src/utils/gameOrder.ts` - Tiebreaker game ordering

---

## Next Steps

1. **Answer database structure questions** - How to store tiebreaker data?
2. **Answer scoring/points questions** - How points work for tiebreaker?
3. **Answer UI approach question** - Separate route or conditional UI?
4. **Design database schema changes** - Create migration plan
5. **Implement incrementally** - One phase at a time, testing thoroughly
