# Placeholder Player Removal Rules - Implementation Plan

> **⚠️ DO NOT RUN `supabase db reset` - user has live test data**

> **Status:** In Progress 🚧
> **Created:** 2025-12-17
> **Branch:** `pp-remove-disinvite`
> **Predecessor:** PLAN-email-invites.md (archived)

---

## 🎯 CURRENT TASK: Redesign PlayerManagement Page

Before implementing PP removal, the PlayerManagement page needs restructuring to support the feature properly. PP removal will happen in the **TeamEditorModal**, not a separate card.

**Goal:** Clean up PlayerManagement page layout so it provides a clear foundation for PP management features.

**Status:** In Progress

### Immediate Task
- [ ] Fix membership paid / membership fee portion of Player Information card

---

## Overview

Allow captains to remove placeholder players (PPs) from teams under safe conditions. Currently captains cannot remove PPs, which is overly restrictive when the PP has no game history.

## The Problem

- Captains add PPs to teams but can't remove them
- If a PP was added by mistake or the person isn't playing, captain is stuck
- Only league operators can currently remove players
- This creates unnecessary friction for simple roster corrections

## Proposed Rules

### Captains CAN Remove a PP IF:
1. PP has **zero games played** (no `match_games` referencing this member)

### Captains CANNOT Remove a PP IF:
1. PP has **any games played** → Only league operator can remove (protecting game history)

### Cleanup Logic After Removal:

**If PP has NO email:**
- Delete the entire member record (orphan PP with no identity anchor)
- Prevents accumulation of abandoned PP records

**If PP HAS email:**
- Keep member record (may be claimed later or added to another team)
- Email serves as identity anchor

---

## Current State

- ✅ `PlaceholderRemovalModal` exists (shows "contact LO" message)
- ✅ `TeamEditorModal` has "Manage" button for captain variant PP rows
- ✅ `PlayerNameLink` opens `InvitePlayerModal` for PPs (registration flow)

---

## Implementation Tasks

### Backend

- [ ] Create `get_pp_game_count(member_id)` RPC function
  - Returns count of games where this member participated
  - Query `match_games` table

- [ ] Create `remove_pp_from_team(member_id, team_id)` RPC function
  - Validates: member is PP (user_id IS NULL)
  - Validates: member has zero games
  - Removes from `team_players`
  - If member has no email: DELETE member record
  - If member has email: keep member record
  - Returns success/error with reason

### Frontend

- [ ] Create `useCanRemovePP(memberId)` hook
  - Calls `get_pp_game_count`
  - Returns `{ canRemove: boolean, gameCount: number, loading: boolean }`

- [ ] Update `PlaceholderRemovalModal`
  - Fetch game count on open
  - If `canRemove`: Show "Remove from Team" button with confirmation
  - If `!canRemove`: Show current "contact league operator" message with game count

- [ ] Create `useRemovePPFromTeam()` mutation hook
  - Calls `remove_pp_from_team` RPC
  - Invalidates team queries on success
  - Toast confirmation

---

## UI Flow

### Captain Opens "Manage" on PP with NO Games:
```
┌─────────────────────────────────────┐
│ Manage: John Smith                  │
│                                     │
│ This player has not played any      │
│ games yet.                          │
│                                     │
│ [Remove from Team]  [Cancel]        │
│                                     │
│ ⚠️ This cannot be undone           │
└─────────────────────────────────────┘
```

### Captain Opens "Manage" on PP with Games:
```
┌─────────────────────────────────────┐
│ Manage: John Smith                  │
│                                     │
│ This player has played 5 games.     │
│                                     │
│ To protect game history, only your  │
│ league operator can remove players  │
│ who have participated in matches.   │
│                                     │
│ [Contact League Operator]  [Close]  │
└─────────────────────────────────────┘
```

---

## Edge Cases

1. **PP is captain** - Cannot remove (must reassign captain first)
2. **PP on multiple teams** - Only removes from THIS team (if no games on this team)
3. **Race condition** - PP plays game while modal open → RPC should re-check

---

## Files to Create/Modify

```
/supabase/migrations
  YYYYMMDD_pp_removal_functions.sql   # New: RPC functions

/src/api/hooks
  useCanRemovePP.ts                   # New: Check if PP can be removed
  useRemovePPFromTeam.ts              # New: Mutation to remove PP

/src/components/modals
  PlaceholderRemovalModal.tsx         # Modify: Add removal flow
```

---

## Success Criteria

- [ ] Captain can remove PP with zero games from their team
- [ ] Captain sees clear message when PP has games (must contact LO)
- [ ] Orphan PPs (no email, no team) are cleaned up automatically
- [ ] PPs with email remain in system for future claiming
- [ ] Game history is never lost

---

## Questions to Resolve

1. Should we show the PP's email status in the modal? (helps captain understand why record is kept/deleted)
2. Should captain be able to add email to PP from this modal? (upgrade to claimable)
3. Should we add a "Cancel Invite" option here too?
