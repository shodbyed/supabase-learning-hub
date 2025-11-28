# Multi-Operator Migration Test Plan

## Goal

Migrate from `league_operators` to `organizations` + `organization_members` **WITHOUT changing any UX**. Everything must work exactly the same before and after.

## Database Changes Summary

### Before (Current)
```
league_operators (one operator per org)
  ├── id (operator_id)
  └── member_id (UNIQUE)

leagues.operator_id → league_operators.id
venues.created_by_operator_id → league_operators.id
preferences.operator_id → league_operators.id (via operator_blackout_preferences)
```

### After (New Structure)
```
organizations (org details)
  ├── id (organization_id)
  └── created_by (member_id)

organization_members (many-to-many)
  ├── organization_id
  ├── member_id
  └── role (owner/admin/support_agent)

leagues.organization_id → organizations.id
venues.created_by_operator_id → organizations.id
preferences.operator_id → organizations.id
```

### Compatibility Layer During Migration
Both `operator_id` and `organization_id` columns exist simultaneously. Application code gradually switches from old to new.

---

## All Database Queries That Touch operator_id or league_operators

### 1. **operators.ts** - Core operator queries

| Function | Query | Where Used | Test Scenario |
|----------|-------|------------|---------------|
| `getOperatorProfileByMemberId(memberId)` | `SELECT * FROM league_operators WHERE member_id = ?` | Hook: `useOperatorProfile`<br/>Component: Operator Dashboard | Login as operator → Dashboard loads profile |
| `getAllLeagueOperators()` | `SELECT * FROM league_operators JOIN members` | God Mode dropdown | Open god mode → See all operators |

**Expected behavior:** Returns same data structure before/after

**New function (parallel):**
```typescript
getOrganizationByMemberId(memberId) → {
  // Same fields as LeagueOperator
  // Queries: organizations JOIN organization_members
}
```

---

### 2. **members.ts** - Member-to-operator lookup

| Function | Query | Where Used | Test Scenario |
|----------|-------|------------|---------------|
| `getOperatorId(memberId)` | `SELECT id FROM league_operators WHERE member_id = ?` | Hook: `useOperatorIdValue`<br/>Used in: All operator pages | Any operator page → Gets operator ID |
| `getOperatorIdByUserId(userId)` | Calls `getOperatorId` after member lookup | Less common variant | - |
| `isOperator(memberId)` | `SELECT id FROM league_operators WHERE member_id = ?` | Role checking | Check if user is operator |

**Expected behavior:** Returns same operator ID (which equals organization ID after migration)

**New function (parallel):**
```typescript
getOrganizationId(memberId) → {
  // Returns organization_id from organization_members
  // WHERE member_id = ? AND role IN ('owner', 'admin')
}
```

---

### 3. **leagues.ts** - League queries filtered by operator

| Function | Query | Where Used | Test Scenario |
|----------|-------|------------|---------------|
| `getLeaguesByOperator(operatorId)` | `SELECT * FROM leagues WHERE operator_id = ?` | Hook: `useLeaguesByOperator`<br/>Component: ActiveLeagues | Dashboard → Shows operator's leagues |
| `getLeagueCount(operatorId)` | `SELECT COUNT(*) FROM leagues WHERE operator_id = ?` | Dashboard stats | Dashboard → League count card |
| `getLeaguesWithProgress(operatorId)` | Calls `getLeaguesByOperator` + progress calc | ActiveLeagues progress bars | Dashboard → See league progress |
| `getOperatorProfanityFilter(leagueId)` | `SELECT profanity_filter_enabled FROM league_operators WHERE id = (SELECT operator_id FROM leagues WHERE id = ?)` | Team name validation | Create/edit team name → Validates profanity |

**Expected behavior:** Returns same leagues, same counts, same profanity setting

**Migration strategy:** Change `operator_id` to `organization_id` in WHERE clauses

---

### 4. **venues.ts** - Venue queries filtered by operator

| Function | Query | Where Used | Test Scenario |
|----------|-------|------------|---------------|
| `getVenuesByOperator(operatorId)` | `SELECT * FROM venues WHERE created_by_operator_id = ? AND is_active = true` | Hook: `useVenuesByOperator`<br/>Component: Venue management | Venues page → Shows operator's venues |

**Expected behavior:** Returns same venues

**Migration strategy:** Change `created_by_operator_id` to filter by organization_id

---

### 5. **seasons.ts** - Championship preferences by operator

| Function | Query | Where Used | Test Scenario |
|----------|-------|------------|---------------|
| `getChampionshipPreferences(operatorId)` | `SELECT * FROM operator_blackout_preferences WHERE operator_id = ?` | Season Creation Wizard | Create season → Shows saved championship dates |

**Expected behavior:** Returns same preferences

**Migration strategy:** Change `operator_id` to `organization_id` in preferences table

---

### 6. **operatorStats.ts** - Dashboard statistics

| Function | Query | Where Used | Test Scenario |
|----------|-------|------------|---------------|
| `getOperatorStats(operatorId)` | `CALL get_operator_stats(operator_id)` | Hook: `useOperatorStats`<br/>Component: OperatorDashboard | Dashboard → Shows all stats cards |

**Expected behavior:** Returns same counts

**Migration strategy:** Update Postgres function `get_operator_stats` to use `organization_id` instead of `operator_id`

**Postgres function location:** `/database/get_operator_stats_function.sql`

---

### 7. **Component Inline Queries** - Direct supabase calls in components

| Location | Query | Purpose | Test Scenario |
|----------|-------|---------|---------------|
| `LeagueCreationWizard.tsx:107` | `SELECT * FROM league_operators WHERE id = ?` | Get operator for new league creation | Create new league → Prefills org info |
| `OrganizationInfoCard.tsx` (4 updates) | `UPDATE league_operators SET ...` | Update org contact/payment info | Edit organization info → Saves changes |
| `OrganizationBasicInfoCard.tsx` (2 updates) | `UPDATE league_operators SET ...` | Update org name/address | Edit org name → Saves changes |
| `ContactInfoCard.tsx` (2 updates) | `UPDATE league_operators SET ...` | Update contact info | Edit contact info → Saves changes |
| `useOperatorProfanityToggle.ts` | `UPDATE league_operators SET profanity_filter_enabled = ?` | Toggle profanity filter | Toggle filter in settings → Saves preference |
| `AnnouncementModal.tsx` | `SELECT * FROM league_operators WHERE id = ?` | Get org info for announcement | Send league-wide message → Shows org name |
| `useAnnouncementTargets.ts` | `SELECT * FROM league_operators WHERE id = ?` | Get org for target calculation | - |
| `announcements.ts mutation` | `SELECT * FROM league_operators WHERE id = ?` | Get org for announcement creation | - |

**Expected behavior:** All updates work, all reads return same data

**Migration strategy:** Change table from `league_operators` to `organizations`, keep same column names

---

## Test Scenarios (End-to-End)

### Scenario 1: Operator Dashboard Load
**Before Migration:**
1. Login as operator
2. Dashboard loads → calls `getOperatorId(memberId)` → gets `operator_id`
3. Dashboard loads stats → calls `getOperatorStats(operator_id)`
4. Dashboard shows leagues → calls `getLeaguesWithProgress(operator_id)`

**After Migration:**
1. Login as operator
2. Dashboard loads → calls `getOrganizationId(memberId)` → gets `organization_id`
3. Dashboard loads stats → calls `getOperatorStats(organization_id)` (same ID value!)
4. Dashboard shows leagues → calls `getLeaguesWithProgress(organization_id)`

**Expected:** Exact same UI, same data, same behavior

---

### Scenario 2: Create New League
**Before:**
1. Click "Create League"
2. Wizard loads → queries `league_operators` by `operator_id`
3. Creates league → sets `leagues.operator_id = <operator_id>`

**After:**
1. Click "Create League"
2. Wizard loads → queries `organizations` by `organization_id`
3. Creates league → sets `leagues.organization_id = <organization_id>`

**Expected:** League created, assigned to correct org

---

### Scenario 3: Edit Organization Info
**Before:**
1. Go to Settings → Organization
2. Edit organization name
3. Saves → `UPDATE league_operators SET organization_name = ? WHERE id = ?`

**After:**
1. Go to Settings → Organization
2. Edit organization name
3. Saves → `UPDATE organizations SET organization_name = ? WHERE id = ?`

**Expected:** Name updates successfully

---

### Scenario 4: Create Team (Profanity Check)
**Before:**
1. Create team with name "BadWord United"
2. App queries `league_operators.profanity_filter_enabled` via league
3. If enabled, validates team name

**After:**
1. Create team with name "BadWord United"
2. App queries `organizations.profanity_filter_enabled` via league
3. If enabled, validates team name

**Expected:** Same validation behavior

---

### Scenario 5: View Venues
**Before:**
1. Go to Venues page
2. Calls `getVenuesByOperator(operator_id)`
3. Shows list filtered by `created_by_operator_id`

**After:**
1. Go to Venues page
2. Calls `getVenuesByOperator(organization_id)`
3. Shows list filtered by `created_by_operator_id` (now points to organization)

**Expected:** Same venue list

---

### Scenario 6: Create Season with Championship Dates
**Before:**
1. Create season → Season wizard loads
2. Queries `operator_blackout_preferences` by `operator_id`
3. Shows saved BCA/APA championship dates

**After:**
1. Create season → Season wizard loads
2. Queries `operator_blackout_preferences` by `organization_id`
3. Shows saved BCA/APA championship dates

**Expected:** Same championship preferences shown

---

### Scenario 7: God Mode (Developer Impersonation)
**Before:**
1. Open god mode dropdown
2. Calls `getAllLeagueOperators()`
3. Lists all `league_operators` with member names

**After:**
1. Open god mode dropdown
2. Calls `getAllOrganizations()`
3. Lists all `organizations` with owner member names

**Expected:** Same list of organizations/operators

---

## Migration Verification Queries

Run these SQL queries before and after migration to verify data integrity:

### Query 1: Count leagues per operator
```sql
-- BEFORE
SELECT lo.organization_name, COUNT(l.id) as league_count
FROM league_operators lo
LEFT JOIN leagues l ON l.operator_id = lo.id
GROUP BY lo.id, lo.organization_name
ORDER BY lo.organization_name;

-- AFTER
SELECT o.organization_name, COUNT(l.id) as league_count
FROM organizations o
LEFT JOIN leagues l ON l.organization_id = o.id
GROUP BY o.id, o.organization_name
ORDER BY o.organization_name;
```

**Expected:** Identical results

### Query 2: Count venues per operator
```sql
-- BEFORE
SELECT lo.organization_name, COUNT(v.id) as venue_count
FROM league_operators lo
LEFT JOIN venues v ON v.created_by_operator_id = lo.id AND v.is_active = true
GROUP BY lo.id, lo.organization_name
ORDER BY lo.organization_name;

-- AFTER
SELECT o.organization_name, COUNT(v.id) as venue_count
FROM organizations o
LEFT JOIN venues v ON v.created_by_operator_id = o.id AND v.is_active = true
GROUP BY o.id, o.organization_name
ORDER BY o.organization_name;
```

**Expected:** Identical results

### Query 3: Verify every operator has organization membership
```sql
-- After migration, verify every organization has an owner
SELECT o.id, o.organization_name, om.member_id, om.role
FROM organizations o
LEFT JOIN organization_members om ON om.organization_id = o.id AND om.role = 'owner'
WHERE om.member_id IS NULL;
```

**Expected:** Zero rows (every org must have an owner)

### Query 4: Verify member_id consistency
```sql
-- Verify the member_id that was in league_operators matches the owner in organization_members
SELECT
  lo.id as old_operator_id,
  lo.member_id as old_member_id,
  o.id as new_org_id,
  o.created_by as new_created_by,
  om.member_id as new_owner_member_id
FROM league_operators_old lo
JOIN organizations o ON o.id = lo.id
JOIN organization_members om ON om.organization_id = o.id AND om.role = 'owner'
WHERE lo.member_id != om.member_id OR lo.member_id != o.created_by;
```

**Expected:** Zero rows (member_id should match across all tables)

---

## Automated Test Suite (Recommended)

Create a test file: `/src/__tests__/migration/operator-to-organization.test.ts`

```typescript
describe('Operator → Organization Migration', () => {

  describe('Data Integrity', () => {
    it('should return same operator ID before/after', async () => {
      const memberId = 'test-member-id';

      // Before: getOperatorId
      const oldResult = await getOperatorId(memberId);

      // After: getOrganizationId
      const newResult = await getOrganizationId(memberId);

      expect(newResult.id).toBe(oldResult.id);
    });

    it('should return same leagues list', async () => {
      const operatorId = 'test-operator-id';

      const oldLeagues = await getLeaguesByOperator(operatorId);
      const newLeagues = await getLeaguesByOrganization(operatorId);

      expect(newLeagues).toEqual(oldLeagues);
    });

    it('should return same venue list', async () => {
      const operatorId = 'test-operator-id';

      const oldVenues = await getVenuesByOperator(operatorId);
      const newVenues = await getVenuesByOrganization(operatorId);

      expect(newVenues).toEqual(oldVenues);
    });
  });

  describe('Profile Updates', () => {
    it('should update organization name successfully', async () => {
      const orgId = 'test-org-id';
      const newName = 'Updated Org Name';

      await updateOrganizationName(orgId, newName);

      const org = await getOrganizationById(orgId);
      expect(org.organization_name).toBe(newName);
    });
  });

  describe('Operator Stats', () => {
    it('should return same stats before/after', async () => {
      const operatorId = 'test-operator-id';

      const stats = await getOperatorStats(operatorId);

      expect(stats).toHaveProperty('leagues');
      expect(stats).toHaveProperty('teams');
      expect(stats).toHaveProperty('players');
      expect(stats).toHaveProperty('venues');
      expect(stats.leagues).toBeGreaterThanOrEqual(0);
    });
  });
});
```

---

## Manual Test Checklist

Execute these tests in your local development environment:

### Phase 1: Before Migration (Baseline)
- [ ] Login as operator → Dashboard loads with stats
- [ ] Note league count: __________
- [ ] Note team count: __________
- [ ] Note player count: __________
- [ ] Note venue count: __________
- [ ] Create new league → Success
- [ ] Edit organization name → Success
- [ ] Edit contact info → Success
- [ ] Create venue → Success
- [ ] Create team with profanity filter ON → Validates correctly
- [ ] Toggle profanity filter OFF → Saves
- [ ] Create season → Championship dates show correctly

### Phase 2: Run Migration Scripts
- [ ] Run Phase 1: Create new tables
- [ ] Run Phase 2: Migrate data
- [ ] Run Phase 3: Add organization_id columns
- [ ] Verify data with SQL queries above

### Phase 3: Code Migration (Gradual)
- [ ] Update query functions (create new alongside old)
- [ ] Update hooks (create new alongside old)
- [ ] Update components one-by-one
- [ ] Test each component after update

### Phase 4: After Migration (Verification)
- [ ] Login as operator → Dashboard loads with stats
- [ ] Verify league count matches baseline: __________
- [ ] Verify team count matches baseline: __________
- [ ] Verify player count matches baseline: __________
- [ ] Verify venue count matches baseline: __________
- [ ] Create new league → Success
- [ ] Edit organization name → Success
- [ ] Edit contact info → Success
- [ ] Create venue → Success
- [ ] Create team with profanity filter ON → Validates correctly
- [ ] Toggle profanity filter OFF → Saves
- [ ] Create season → Championship dates show correctly

### Phase 5: Cleanup
- [ ] All tests pass
- [ ] Drop old `operator_id` columns
- [ ] Drop old `league_operators` table
- [ ] Remove old query functions
- [ ] Remove old hooks

---

## Files That Need Updates

### Query Files (7 files)
- [x] `/src/api/queries/operators.ts` - Create `organizations.ts` alongside
- [x] `/src/api/queries/members.ts` - Add `getOrganizationId()`
- [x] `/src/api/queries/leagues.ts` - Update to use `organization_id`
- [x] `/src/api/queries/venues.ts` - Update to use `organization_id`
- [x] `/src/api/queries/seasons.ts` - Update preferences queries
- [x] `/src/api/queries/operatorStats.ts` - Update RPC function
- [x] `/database/get_operator_stats_function.sql` - Rewrite function

### Hook Files (1 file)
- [x] `/src/api/hooks/useOperatorId.ts` - Create `useOrganizationId()` alongside

### Component Files (8 files with inline queries)
- [x] `/src/operator/LeagueCreationWizard.tsx`
- [x] `/src/components/operator/OrganizationInfoCard.tsx`
- [x] `/src/components/operator/OrganizationBasicInfoCard.tsx`
- [x] `/src/components/operator/ContactInfoCard.tsx`
- [x] `/src/hooks/useOperatorProfanityToggle.ts`
- [x] `/src/components/messages/AnnouncementModal.tsx`
- [x] `/src/components/messages/announcements/useAnnouncementTargets.ts`
- [x] `/src/api/mutations/announcements.ts`

### Database Files
- [x] Create migration: `organizations` table
- [x] Create migration: `organization_members` table
- [x] Create migration: Data migration script
- [x] Create migration: Add `organization_id` columns
- [x] Update: `get_operator_stats` function
- [x] Update: All RLS policies

---

## Success Criteria

✅ **All manual tests pass with identical results before/after**
✅ **All SQL verification queries return identical results**
✅ **No console errors in browser**
✅ **No database errors in Supabase logs**
✅ **Automated test suite passes 100%**
✅ **User cannot tell anything changed**

---

## Rollback Plan

If migration fails or causes issues:

1. **Immediate rollback:** Restore `league_operators_old` table
2. **Revert code:** Switch components back to old hooks/queries
3. **Drop new tables:** Remove `organizations` and `organization_members`
4. **Restore RLS policies:** Revert to original policies
5. **Clear caches:** Clear browser cache and restart dev server

Keep `league_operators_old` table until migration is verified successful in production.
