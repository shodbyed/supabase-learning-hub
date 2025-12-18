# RLS Policy Analysis

This document analyzes each table to design RLS policies that won't break existing mutations.

## Analysis Approach

For each table, we need to identify:
1. **SELECT** - Who reads this data?
2. **INSERT** - Who creates new records?
3. **UPDATE** - Who modifies existing records?
4. **DELETE** - Who removes records?
5. **Triggers** - What automatic operations happen?

## Tables to Analyze

### 1. `matches` Table

**Current Usage (from grep):**
- 29 total references to `.from('matches')`
- Used in: operator schedules, player scoring, standings calculations, handicap calculations

**Operations Needed:**
- ✅ **SELECT**: Everyone (view all matches/scores)
- ✅ **INSERT**: Organization staff (create matches when generating schedules)
- ✅ **UPDATE**:
  - Organization staff (modify match details, reschedule)
  - Match participants (update status, scores during gameplay)
- ❌ **DELETE**: Organization owners only? Or never? (TBD)

**Key Files to Check:**
- `/src/api/mutations/matches.ts` - updateMatch() function
- `/src/player/ScoreMatch.tsx` - Player scoring interface
- `/src/operator/ScheduleSetup.tsx` - Operator match creation
- `/src/utils/scheduleGenerator.ts` - Bulk match insertion

**Triggers:**
- `trigger_auto_create_match_lineups` - Creates lineups when match inserted

**RLS Strategy:**
- SELECT: Allow all authenticated users
- INSERT: Allow organization staff for their org's leagues/seasons
- UPDATE: Allow match participants OR organization staff
- DELETE: TBD (maybe restrict to owners only)

---

### 2. `match_games` Table

**Operations Needed:**
- ✅ **SELECT**: Everyone (view scores)
- ✅ **INSERT**: Match participants (create games, especially tiebreakers)
- ✅ **UPDATE**: Match participants (update scores, confirmations)
- ❌ **DELETE**: Probably never? Or organization staff only?

**Key Files to Check:**
- `/src/api/mutations/matches.ts` - createMatchGames(), updateMatchGame()
- `/src/hooks/useMatchScoring.ts` - Scoring mutations

---

### 3. `match_lineups` Table

**Operations Needed:**
- ✅ **SELECT**: Everyone (view lineups)
- ✅ **INSERT**: Auto-created by trigger (needs SECURITY DEFINER)
- ✅ **UPDATE**: Match participants (assign players to games)
- ❌ **DELETE**: Auto-deleted by trigger (needs SECURITY DEFINER)

**Triggers:**
- `trigger_auto_create_match_lineups` - Creates lineups for new matches
- `trigger_auto_delete_match_lineups` - Deletes lineups when match deleted

---

### 4. `teams` Table

**Operations Needed:**
- ✅ **SELECT**: Everyone (view all teams)
- ✅ **INSERT**: Organization staff (create teams in wizards)
- ✅ **UPDATE**:
  - Team captains (update team name, venue)
  - Organization staff (full team management)
- ❌ **DELETE**: Organization staff only

**Key Files to Check:**
- `/src/api/mutations/teams.ts`
- `/src/operator/TeamEditorModal.tsx`
- `/src/operator/TeamManagement.tsx`

---

### 5. `team_players` Table

**Operations Needed:**
- ✅ **SELECT**: Everyone (view rosters)
- ✅ **INSERT**:
  - Team captains (add players to their team)
  - Organization staff (manage any team in their org)
- ✅ **UPDATE**: Same as INSERT
- ✅ **DELETE**: Same as INSERT

**Key Files to Check:**
- `/src/api/mutations/teams.ts`
- `/src/operator/TeamManagement.tsx`

---

### 6. `leagues` Table

**Operations Needed:**
- ✅ **SELECT**: Everyone (view all leagues)
- ✅ **INSERT**: Organization staff
- ✅ **UPDATE**: Organization staff (for their org only)
- ❌ **DELETE**: Organization owners only? Or never?

**Key Files to Check:**
- `/src/api/mutations/leagues.ts`
- `/src/operator/LeagueCreationWizard.tsx`

**Triggers:**
- `trigger_create_league_preferences` - Creates default preferences

---

### 7. `seasons` Table

**Operations Needed:**
- ✅ **SELECT**: Everyone
- ✅ **INSERT**: Organization staff
- ✅ **UPDATE**: Organization staff
- ❌ **DELETE**: Organization owners only?

**Key Files to Check:**
- `/src/api/mutations/seasons.ts`
- `/src/operator/SeasonCreationWizard.tsx`

---

### 8. `organizations` Table

**Operations Needed:**
- ✅ **SELECT**: Everyone (view all organizations)
- ✅ **INSERT**: Who can create orgs? Anyone? Admins only?
- ✅ **UPDATE**: Organization staff (owners can update everything, staff limited?)
- ❌ **DELETE**: Owners only

**Triggers:**
- `trigger_create_org_preferences` - Creates default preferences
- `create_owner_staff_trigger` - Auto-adds creator as owner

---

### 9. `venues` Table

**Operations Needed:**
- ✅ **SELECT**: Everyone
- ✅ **INSERT**: Organization staff (or anyone?)
- ✅ **UPDATE**: Organization staff who use the venue? Venue owners?
- ❌ **DELETE**: ?

---

### 10. `members` Table

**Operations Needed:**
- ✅ **SELECT**: Everyone (view member profiles)
- ✅ **INSERT**: Registration/signup flow (public?)
- ✅ **UPDATE**: User can update their own profile
- ❌ **DELETE**: Never? Or admins only?

---

### 11. `organization_staff` Table

**Operations Needed:**
- ✅ **SELECT**: Everyone (see who's staff where)
- ✅ **INSERT**: Organization owners only
- ✅ **UPDATE**: Probably never (just delete and re-add?)
- ✅ **DELETE**:
  - Organization owners (remove anyone)
  - Self-removal (any staff can remove themselves)

---

### Messaging Tables (conversations, messages, conversation_participants)

**Operations Needed:**
- Complex - need to analyze separately
- Likely: Can only see/modify conversations you're part of

---

### Reporting Tables (user_reports, report_actions, report_updates)

**Operations Needed:**
- Complex - need to analyze separately
- Likely: Players can create reports, admins can review

---

## Next Steps

1. Review each table's mutation files to confirm operations
2. Design RLS policies table-by-table
3. Test each policy independently before applying all
4. Create migration with ONLY the policies we've verified won't break things

---

## Proposed RLS Policies (Not Yet Implemented)

### 12. `merge_requests` Table

**Purpose:** Stores requests to merge placeholder players with registered users.

**Operations Needed:**
- ✅ **SELECT**:
  - Users can view their own requests (requested_by or registered_member)
  - League operators can view all requests for their organization
- ✅ **INSERT**: Any authenticated user can create a merge request
- ✅ **UPDATE**: League operators for their organization only
- ❌ **DELETE**: Probably never (keep audit trail)

**Proposed Policies:**

```sql
-- Anyone authenticated can create a merge request
CREATE POLICY "Users can create merge requests"
  ON merge_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    requested_by_member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Users can view their own requests
CREATE POLICY "Users can view their own merge requests"
  ON merge_requests FOR SELECT
  TO authenticated
  USING (
    requested_by_member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
    OR
    registered_member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- League operators can view all requests for their organization
CREATE POLICY "LOs can view org merge requests"
  ON merge_requests FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT lo.organization_id
      FROM league_operators lo
      JOIN members m ON lo.member_id = m.id
      WHERE m.user_id = auth.uid()
    )
  );

-- League operators can update requests for their organization
CREATE POLICY "LOs can update org merge requests"
  ON merge_requests FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT lo.organization_id
      FROM league_operators lo
      JOIN members m ON lo.member_id = m.id
      WHERE m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT lo.organization_id
      FROM league_operators lo
      JOIN members m ON lo.member_id = m.id
      WHERE m.user_id = auth.uid()
    )
  );
```

**Notes:**
- No DELETE policy - merge requests should be kept for audit purposes
- Status changes (pending → approved/rejected) handled via UPDATE
- organization_id is derived from PP's team context when request is created

---

### 13. `invite_tokens` Table

**Purpose:** Stores email invite tokens for placeholder players. Captains send invites, users click link to register and claim their PP record.

**Operations Needed:**
- ✅ **SELECT**:
  - Team captains can view invites for their teams
  - Organization operators can view invites for teams in their org
- ✅ **INSERT**:
  - Team captains can create invites for their team members
  - Organization operators can create invites for any team in their org
- ✅ **UPDATE**:
  - Team captains can update/cancel invites for their teams
  - Organization operators can update/cancel invites for teams in their org
- ❌ **DELETE**: Never (keep audit trail)

**Proposed Policies:**

```sql
-- Captains and operators can view invites for their teams
CREATE POLICY "Team captains and operators can view team invites"
  ON invite_tokens
  FOR SELECT
  USING (
    -- User is the captain of the team
    EXISTS (
      SELECT 1 FROM teams t
      JOIN members m ON m.id = t.captain_id
      WHERE t.id = invite_tokens.team_id
        AND m.user_id = auth.uid()
    )
    OR
    -- User is an operator of the organization that owns the league
    EXISTS (
      SELECT 1 FROM teams t
      JOIN seasons s ON s.id = t.season_id
      JOIN leagues l ON l.id = s.league_id
      JOIN organization_staff os ON os.organization_id = l.organization_id
      JOIN members m ON m.id = os.member_id
      WHERE t.id = invite_tokens.team_id
        AND m.user_id = auth.uid()
        AND os.position IN ('owner', 'admin')
    )
  );

-- Captains and operators can create invites for their teams
CREATE POLICY "Team captains and operators can create invites"
  ON invite_tokens
  FOR INSERT
  WITH CHECK (
    -- User is the captain of the team
    EXISTS (
      SELECT 1 FROM teams t
      JOIN members m ON m.id = t.captain_id
      WHERE t.id = invite_tokens.team_id
        AND m.user_id = auth.uid()
    )
    OR
    -- User is an operator of the organization
    EXISTS (
      SELECT 1 FROM teams t
      JOIN seasons s ON s.id = t.season_id
      JOIN leagues l ON l.id = s.league_id
      JOIN organization_staff os ON os.organization_id = l.organization_id
      JOIN members m ON m.id = os.member_id
      WHERE t.id = invite_tokens.team_id
        AND m.user_id = auth.uid()
        AND os.position IN ('owner', 'admin')
    )
  );

-- Captains and operators can cancel invites for their teams
CREATE POLICY "Team captains and operators can update invites"
  ON invite_tokens
  FOR UPDATE
  USING (
    -- User is the captain of the team
    EXISTS (
      SELECT 1 FROM teams t
      JOIN members m ON m.id = t.captain_id
      WHERE t.id = invite_tokens.team_id
        AND m.user_id = auth.uid()
    )
    OR
    -- User is an operator of the organization
    EXISTS (
      SELECT 1 FROM teams t
      JOIN seasons s ON s.id = t.season_id
      JOIN leagues l ON l.id = s.league_id
      JOIN organization_staff os ON os.organization_id = l.organization_id
      JOIN members m ON m.id = os.member_id
      WHERE t.id = invite_tokens.team_id
        AND m.user_id = auth.uid()
        AND os.position IN ('owner', 'admin')
    )
  );
```

**Notes:**
- No DELETE policy - invite tokens should be kept for audit purposes
- Token claiming is done via `claim_invite_token()` function with SECURITY DEFINER (service role)
- Token details lookup done via `get_invite_details()` function with SECURITY DEFINER (safe for anon)
- Status changes (pending -> claimed/expired/cancelled) handled via UPDATE or functions
