# 🎱 3v3 League Match Scoring Specification

This document outlines the complete specification for implementing a 3v3 league match scoring system.

---

## Implementation Philosophy

**UI-First Approach**: Build the UI components first to understand data requirements, then create database tables based on actual needs. This prevents premature table design and ensures we only build what's necessary.

**Mobile-First Design**: All pages must be designed with mobile-first mentality using shadcn/ui components throughout.

---

## Database Schema Overview

### Existing Tables (Already Created)

1. **teams** - Stores static team information
2. **team_players** - Maps players to teams
3. **season_weeks** - Defines scheduled weeks of the season
4. **matches** - Defines scheduled date, home team, and away team for each match
5. **members** - Stores all player information (NOT including handicap)
6. **handicap_chart_3vs3** - Static lookup table for handicap-based win/tie/lose thresholds

### Handicap Calculation Rules

**Individual Player Handicap**:
- Calculated as: `(wins - losses) / weeks_played`
- Weeks played can be derived as: `total_games / 6` (since a usual week = 6 games)
- Range: +2 to −2

**Team Handicap Total**:
- Sum of three individual player handicaps
- Range: −6 to +6
- **Team handicap from standings**: Set to 0 for now (will be implemented later when standings page is built)

**Handicap Difference (hcp_diff)**:
- Calculated as: `TeamA_Total_HCP - TeamB_Total_HCP`
- Maximum difference: ±12
- **Capping rule**: If absolute difference ≥13, cap at ±12
  - Example: +14 → +12; −13 → −12

### Handicap Chart Lookup Table

Table: `handicap_chart_3vs3`

| Column | Type | Notes |
|--------|------|-------|
| `hcp_diff` | integer | Primary Key. Range −12 to +12 |
| `games_to_win` | integer | Minimum wins for this team to win the match |
| `games_to_tie` | integer / NULL | Wins for this team to tie (NULL if tie impossible) |
| `games_to_lose` | integer | Maximum wins for this team to lose the match |

**Usage**: Each team queries the lookup table based on their own calculated `hcp_diff`.

Example SQL:
```sql
SELECT games_to_win, games_to_tie, games_to_lose
FROM handicap_chart_3vs3
WHERE hcp_diff = :cappedDiff;
```

### Tables to be Created (As Needed)

Design these tables during UI implementation based on actual requirements:

1. **match_lineups** (or similar) - Store selected lineup for each team
2. **match_games** - Store individual game results (18 regular games + up to 3 tiebreaker games)
   - Needs to track: game_number, players, winner, confirmation status from both teams, is_tiebreaker flag

---

## User Flow Overview

A player navigates to their team viewer → clicks on an upcoming match → enters the match scoring flow.

### Three-Page Flow

1. **Page 1: Lineup Entry** (Pre-Match)
2. **Page 2: Scoreboard & Score Keeping** (During Match)
3. **Page 3: Tie Breaker** (If Necessary)

---

## Page 1: Lineup Entry (Pre-Match)

### Display Requirements

1. **Player List**: Show all players on the team with their current individual handicap (h/c)
2. **Lineup Selection**: Three dropdowns to select starting players and their order (P1, P2, P3)
3. **Team Handicap Display**:
   - Show calculated Total h/c (sum of 3 selected players' h/c)
   - Team h/c from standings = 0 (placeholder for future implementation)
4. **Ready Button**: Indicates lineup is complete and shows it to opposing team

### Rules

- Both teams must complete lineup entry before proceeding to Scoreboard
- Once lineup is locked, teams can proceed to Page 2

---

## Page 2: Scoreboard & Score Keeping

This page displays critical information concisely and allows for game scoring.

### A. Scoreboard Display

Must show (in a compact mobile-friendly layout):

**Team Headers** (for both teams):
- Team Name
- Team Total h/c
- Games Won / Games Needed to Win / Games Needed to Tie

**Lineup Details** (for each player on both teams):
- Player Name
- Individual h/c
- Games Won (in this match)

### B. Game Order & Format

**Match Format**: Double round-robin
- Total Games: **18**
- Each player plays each opposing player **twice** (once breaking, once racking)
- Home team (T1) breaks first in initial rotation

**Game Order Table**:

| Game | Home Player (T1) | T1 Action | Away Player (T2) | T2 Action |
|------|------------------|-----------|------------------|-----------|
| 1 | P1 | Breaks | P1 | Racks |
| 2 | P2 | Breaks | P2 | Racks |
| 3 | P3 | Breaks | P3 | Racks |
| 4 | P1 | Racks | P2 | Breaks |
| 5 | P2 | Racks | P3 | Breaks |
| 6 | P3 | Racks | P1 | Breaks |
| 7 | P1 | Breaks | P3 | Racks |
| 8 | P2 | Breaks | P1 | Racks |
| 9 | P3 | Breaks | P2 | Racks |
| 10 | P1 | Racks | P1 | Breaks |
| 11 | P2 | Racks | P2 | Breaks |
| 12 | P3 | Racks | P3 | Breaks |
| 13 | P1 | Racks | P3 | Breaks |
| 14 | P2 | Racks | P1 | Breaks |
| 15 | P3 | Racks | P2 | Breaks |
| 16 | P1 | Breaks | P2 | Racks |
| 17 | P2 | Breaks | P3 | Racks |
| 18 | P3 | Breaks | P1 | Racks |

### C. Score Keeping Mechanism

**Game Display (Unplayed)**:
```
Game X. Rack: <Button>{T1 Player Name}</Button> vs. Break: <Button>{T2 Player Name}</Button>
```

**Scoring Process**:

1. Either team presses the button of the winner
2. **Confirmation Required**: Opposing team receives popup/prompt to confirm the winner
3. **Both teams must agree** for the game to be officially recorded
4. This prevents unilateral score changes (unlike Google Sheets approach)

**Completed Game Display**:
```
<div>{Winner Name (highlighted)}</div>
<button>{Edit/Reverse/Undo}</button>
<div>{Loser Name}</div>
```

**Game Management Rules**:
- Games can be played out of order
- Completed games move to the bottom of the list
- Editing/Reversing/Undoing a game requires **both teams to agree**

### D. Match End Condition

The match ends when:
- A team reaches its `games_to_win` threshold, OR
- All 18 games are played

Results in: **Win**, **Loss**, or **Tie** (based on `games_to_tie`)

---

## Page 3: Tie Breaker (If Necessary)

Only triggered if the 18-game match ends in a Tie.

### Format

- **Best 2 out of 3** games
- Lineup can be changed (teams re-enter lineup, order may differ)
- If a team wins first 2 games, tie-breaker ends immediately

### Breaking Order

| Game | Who Breaks |
|------|------------|
| 1 | Home Team |
| 2 | Away Team |
| 3 | Home Team (if needed) |

### Tie Breaker Handicap Rule (CRITICAL)

**Purpose**: Ensures all three players get a handicap-affecting win and prevents sandbagging.

**Winning Team**:
- ALL three players receive a recorded win ("game_won vs tiebreaker")
- This affects their individual handicap
- Recorded regardless of whether they played or won in the tie-breaker

**Losing Team**:
- NO game (win or loss) is recorded for any player

**Example**:
```
T1P1 vs T2P1 → T1P1 wins
T1P2 vs T2P2 → T2P2 wins
T1P3 vs T2P3 → T2P3 wins

Team 2 wins the match.

Result:
- T2P1, T2P2, T2P3: All get "win vs tiebreaker" recorded
- T1P1, T1P2, T1P3: No game recorded
```

**Note**: There will never be a time when all 3 players on a team have individual wins in the tiebreaker (since 2 in a row ends it), but all 3 players on the winning team always get a recorded win for handicap calculation.

---

## Technical Implementation Decisions

### Real-time Updates
- **CONFIRMED**: Use existing Supabase real-time hook for all scoring operations
- When one team scores/confirms a game, the other team's screen updates automatically
- When lineup is locked, opposing team sees the update in real-time

### Page Structure
- **CONFIRMED**: Separate reusable components approach
  - **Lineup Component**: Reusable for both initial lineup entry AND tiebreaker lineup
  - **Scoring Component**: Reusable for both regular play (18 games) AND tiebreaker play (3 games)
- Routing: Separate routes for clarity
  - `/match/:matchId/lineup` - Initial lineup entry
  - `/match/:matchId/score` - Scoreboard & scoring
  - `/match/:matchId/tiebreaker` - Tiebreaker lineup & scoring

### UI Component Library
- **CONFIRMED**: Always use shadcn/ui components
- **CONFIRMED**: Use Lucide React icons (the "v something" icons you mentioned)

### Match State Tracking
- Track match state in the database for real-time sync between teams
- States: `lineup_entry`, `in_progress`, `completed`, `tiebreaker`
- Exact table structure TBD during implementation (likely add state fields to `matches` table)

### Database Design Approach
1. Build UI components first
2. Identify data requirements during implementation
3. Get expert guidance on table structure (first full-stack project - learning DB design)
4. Create database tables based on actual needs
5. This ensures we only build necessary tables with correct structure

---

## Open Questions / Future Decisions

1. **Match state**: Where and how to track current match state? (during implementation)
2. **Table design**: Exact structure for lineup and game tables (during implementation with expert guidance)
3. **Team handicap from standings**: Implementation deferred until standings page is built

---

## Development Priorities

1. **Phase 1**: Page 1 - Lineup Entry
2. **Phase 2**: Page 2 - Scoreboard & Score Keeping
3. **Phase 3**: Page 3 - Tie Breaker
4. **Phase 4**: Integration & Testing
5. **Future**: Team handicap from standings (after standings page exists)
