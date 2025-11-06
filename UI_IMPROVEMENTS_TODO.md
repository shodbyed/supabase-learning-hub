# UI Improvements TODO

## Immediate Changes

### ✅ GameButtonRow - Add "Confirm" button (DOING NOW)
- Replace "vs" text with a "Confirm" button in the middle
- Button should confirm the winner that's currently selected
- Different colors:
  - **Winner button**: Colored/highlighted (winner selected)
  - **Loser button**: Clear/white (not selected)
  - **NO trophy icon** until both teams confirm
- Only show trophy when `confirmed_by_home && confirmed_by_away`

### 📝 Select Winner Modal - Change button text
- Current: "Confirm" button
- Change to: "Select Winner" or just "Select"
- Make it obvious what the action is doing

## Other UI Changes to Consider

### MatchScoreboard improvements
- Exit button (top left with arrow) - navigates to `/player-dashboard`
- Auto-confirm checkbox moved to top right
- Team names shown instead of generic "Team" label
- Cleaner mobile layout

---

Status: Working on Confirm button first
