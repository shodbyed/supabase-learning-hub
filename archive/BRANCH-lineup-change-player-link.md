# Branch: lineup-change-player-link

**Created:** 2025-12-11
**Status:** ✅ COMPLETE - Ready to Merge

---

## Summary

This branch implemented the lineup change (player swap) feature during matches, along with several related improvements.

## Completed Features

### 1. Lineup Change Feature (Main Goal) ✅
- Request/Approve/Deny flow for mid-match player swaps
- Real-time updates working for both teams via Supabase subscriptions
- Handicap thresholds auto-recalculate when player is swapped
- Unplayed games automatically updated with new player
- Per-match handicap caching (prevents mid-match recalculation issues)

### 2. Action Button Loading States ✅
- Enhanced Button component with `isLoading` and `loadingText` props
- Applied throughout wizards and action buttons

### 3. Audit Player Names - PlayerNameLink ✅
- Wrapped player names with `PlayerNameLink` component across the app
- Updated `PlayerRoster` component to use `PlayerNameLink`

### 4. Add Teammates to My Teams Page ✅
- `PlayerRoster` already displayed teammates
- Now wrapped with `PlayerNameLink` for interactive popovers

### 5. Unify 3v3 and 5v5 Scoreboard Styles ✅
- Scoreboards now use consistent styling

## Migrations Created
- `20251211_enable_realtime.sql` - Real-time for matches, match_lineups, match_games, messages, conversation_participants

## Deferred to Future Branch
- Expand Pool Table Size Options → See `BRANCH-venue-table-sizes.md`

