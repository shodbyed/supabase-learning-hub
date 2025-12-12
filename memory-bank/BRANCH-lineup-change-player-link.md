# Branch: lineup-change-player-link

**Created:** 2025-12-11
**Status:** In Progress

---

## Main Goal
Lineup change player link functionality (primary focus of this branch)

---

## Completed This Session

### Lineup Change Feature - DONE ✅
- Request/Approve/Deny flow implemented
- Real-time updates working for both teams
- Handicap thresholds recalculate on player swap
- Unplayed games updated with new player
- Per-match handicap caching (prevents mid-match recalculation)

### Migrations Created
- `20251211_enable_realtime.sql` - Real-time for matches, match_lineups, match_games, messages, conversation_participants

---

## Task List

### 1. Action Button Loading States
**Priority:** High
**Status:** ✅ COMPLETE

**Problem:**
When buttons are pressed in the wizard and other places, database calls or calculations take time. The UI gives no feedback that something is happening, making users think nothing occurred or they click multiple times.

**Solution:**
Enhance the existing `Button` component with built-in loading state support:

- Add `loading` prop (boolean) - when true, disables button and shows spinner
- Add `loadingText` prop (optional string) - text to show while loading
- Automatically disable the button when `loading={true}`
- Show a spinner icon inline with the button text

**Answer to your question:** Yes, this CAN be built directly into the Button component. We don't need to go around to each button individually - we enhance the shared component once, then just add `loading={isLoading}` prop wherever needed.

**Usage after implementation:**
```tsx
<Button
  onClick={handleSave}
  loading={isSaving}
  loadingText="Saving..."
>
  Save League
</Button>
```

**Files to Update:**
- [ ] `src/components/ui/button.tsx` - Add loading props and spinner
- [ ] Update wizard buttons to use loading state
- [ ] Update other action buttons as needed

---

### 2. Audit Player Names Missing PlayerNameLink
**Priority:** High
**Status:** ✅ COMPLETE

**Problem:**
Player names are displayed in various places throughout the app but may not be wrapped in the `PlayerNameLink` component, missing out on the interactive popover functionality.

**Solution:**
Find all places where player names are displayed and ensure they use `PlayerNameLink` for consistency.

**Files to Audit:**
- [ ] Lineup displays
- [ ] Match scorecards
- [ ] Team rosters
- [ ] Standings tables
- [ ] Player stats tables
- [ ] Any other player name displays

---

### 3. Add Teammates List to My Teams Page
**Priority:** High
**Status:** ✅ COMPLETE (PlayerRoster already shows teammates, now wrapped with PlayerNameLink)

**Problem:**
On the My Teams page, users can see their teams but cannot see who their teammates are on each team.

**Solution:**
Add a list of teammates to each team card/section on the My Teams page. Each teammate name should use `PlayerNameLink` so users can interact with them (view profile, send message, etc.).

**Files to Update:**
- [ ] Identify the My Teams page component
- [ ] Add teammates query/display
- [ ] Wrap teammate names in `PlayerNameLink`

---

### 4. Lineup Change Feature (Main Goal)
**Priority:** Critical
**Status:** ✅ COMPLETE

**Problem:**
Once lineups are set and games are created, there's no way to fix mistakes. If someone accidentally selects the wrong player, there's currently no mechanism to correct it.

**Solution:**
Allow users to change a player in the lineup via the `PlayerNameLink` popover, with specific conditions.

**Conditions for showing "Change Player" option:**
1. The current user is on the same team as the player being changed (opposing team cannot change another team's lineup)
2. The player has NOT played any games yet (check their match record - if 0-0, they can be swapped)
3. NOT on the globally visible scoreboard (future feature - for now, only applies to team-specific scoring view)

**User Flow:**
1. User views the scoreboard/lineup
2. Clicks on a teammate's name (wrapped in `PlayerNameLink`)
3. Sees "Change Player" option in the popover (only if conditions are met)
4. Selects "Change Player"
5. Modal/dropdown appears with eligible substitute players from the roster
6. User selects replacement player
7. **Request is sent to opposing team for approval** (similar to game verification)
8. Opposing team sees notification/prompt to accept or reject the lineup change
9. If accepted: System updates all unplayed games to swap the players
10. If rejected: Requesting team is notified, no changes made

**Why Opposing Team Approval?**
- Prevents abuse/gaming the system
- Both teams should agree on lineup changes mid-match
- Maintains fairness and transparency

**Technical Considerations:**
- Need to pass context to `PlayerNameLink` via `customActions`:
  - Team ID (to verify same team)
  - Player's game record (to check if 0-0)
  - Whether it's the global scoreboard view
- Need query to get eligible substitutes (players on roster not already in lineup)
- Need mutation to swap players in all unplayed games
- **Existing infrastructure to leverage:**
  - Realtime subscriptions already working for match/lineup/games tables
  - Game verification system pattern can be reused for lineup change approval
  - May need a `lineup_change_requests` table or similar to track pending requests

**Files to Update:**
- [ ] Scoring/lineup display component - add `customActions` to `PlayerNameLink`
- [ ] Create swap player mutation/query
- [ ] Create substitute selection modal/UI

---

### 5. Expand Pool Table Size Options in Venues
**Priority:** Medium
**Status:** Not Started

**Problem:**
Currently venues only support "barbox" and "9 footer (tournament)" table types, but real-world venues have more variety:
- 7-foot (bar box)
- 8-foot tables
- 9-foot (tournament)
- Custom sizes

**Solution:**
Expand the table type options to include:
- 7-foot (Bar Box)
- 8-foot
- 9-foot (Tournament)
- Custom (with optional size input?)

**Files to Update:**
- [ ] Database: Check if table_type is an enum or text field - may need migration
- [ ] Venue form component - update dropdown options
- [ ] Any displays showing table type

**Questions to Consider:**
- Should "Custom" allow free-text input for the size?
- Do we need to store dimensions (e.g., 44"x88") or just a label?

---

### 6. Unify 3v3 and 5v5 Scoreboard Styles
**Priority:** Medium
**Status:** ✅ COMPLETE

**Problem:**
The 3v3 scoreboard on the scoring page is much more complicated and different from the 5v5 scoreboard. The 5v5 style is cleaner and preferred.

**Solution:**
Use the 5v5 scoreboard style as the standard template for both formats:
- Keep the same overall layout/structure as 5v5
- Adapt only the scoring portion for 3v3's different scoring rules
- Maintain visual consistency across both game formats

**Benefits:**
- Consistent UX regardless of game format
- Easier maintenance (one style to update)
- Cleaner, simpler interface

**Files to Investigate:**
- [ ] Identify 3v3 scoreboard component(s)
- [ ] Identify 5v5 scoreboard component(s)
- [ ] Determine what can be shared vs. what needs format-specific logic
- [ ] Refactor 3v3 to match 5v5 style

---

### 7. (Add more tasks as you list them)

---

## Notes

- Focus remains on lineup-change-player-link as the main deliverable
- Button loading states will improve UX across the app including the wizard

