# Multi-Operator Organizations - Implementation Plan

## Overview

Restructure the league operator system to support multiple operators managing a single organization. This enables:

- **Husband/wife teams** managing the same leagues together
- **Developer support access** - add yourself to customer organizations to help them
- **Proper audit trails** - all changes tracked to individual operators
- **No auth spoofing needed** - everyone uses their own login

## Current vs. Proposed Structure

### Current (One Operator Per Organization)

```
league_operators table:
- id (operator ID)
- member_id (UNIQUE) ← Only one member can be an operator
- organization_name
- payment info, contact info, etc.
```

### Proposed (Multiple Operators Per Organization)

```
organizations table:
- id (organization ID)
- organization_name
- payment info, contact info, etc.
- created_by (member_id of creator)

organization_members table (many-to-many):
- id
- organization_id
- member_id
- role (owner, admin, support_agent)
- permissions (JSON or separate table)
- invited_by (member_id)
- joined_at
```

## Benefits

1. **Multi-person management** - Husband and wife can both manage same leagues
2. **Customer-controlled access** - Organizations control who can access their data (including support staff)
3. **Proper audit trails** - Know who made each change (edpoplet vs customer)
4. **Team collaboration** - Operators can delegate tasks to assistants
5. **No god mode needed** - Everyone logs in with their own account
6. **Scalable** - Organizations can grow their team as needed
7. **Security & Trust** - No developer backdoors; customers grant and revoke access

## Database Changes

### 1. Create `organizations` Table

```sql
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Organization details
  organization_name VARCHAR(255) NOT NULL,
  organization_address VARCHAR(255) NOT NULL,
  organization_city VARCHAR(100) NOT NULL,
  organization_state VARCHAR(2) NOT NULL,
  organization_zip_code VARCHAR(10) NOT NULL,

  -- Contact info (for the organization itself)
  league_email VARCHAR(255) NOT NULL,
  email_visibility VARCHAR(20) NOT NULL DEFAULT 'in_app_only',
  league_phone VARCHAR(20) NOT NULL,
  phone_visibility VARCHAR(20) NOT NULL DEFAULT 'in_app_only',

  -- Payment info (organization-level)
  stripe_customer_id VARCHAR(100) NOT NULL,
  payment_method_id VARCHAR(100) NOT NULL,
  card_last4 VARCHAR(4) NOT NULL,
  card_brand VARCHAR(20) NOT NULL,
  expiry_month INTEGER NOT NULL,
  expiry_year INTEGER NOT NULL,
  billing_zip VARCHAR(10) NOT NULL,
  payment_verified BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  created_by UUID NOT NULL REFERENCES members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Create `organization_members` Table

```sql
CREATE TABLE organization_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Role within organization
  role VARCHAR(20) NOT NULL CHECK (role IN (
    'owner',           -- Original creator, full control
    'admin',           -- Full operational control (can add/remove members except owner)
    'support_agent'    -- Developer/support staff, read/write but can't modify billing
  )),

  -- Metadata
  invited_by UUID REFERENCES members(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: member can only have one role per organization
  UNIQUE(organization_id, member_id)
);

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_member ON organization_members(member_id);
```

### 3. Update Foreign Keys Throughout System

**Tables that currently reference `league_operators.id` need to change to `organizations.id`:**

- `leagues.operator_id` → `leagues.organization_id`
- `venues.operator_id` → `venues.organization_id` (if applicable)
- `preferences.operator_id` → `preferences.organization_id`
- Any other operator-linked tables

### 4. Migration Strategy

**Option A: Clean Migration (Recommended for Development)**

```sql
-- 1. Rename old table
ALTER TABLE league_operators RENAME TO league_operators_old;

-- 2. Create new tables
-- (organizations and organization_members as above)

-- 3. Migrate data
INSERT INTO organizations (
  id, organization_name, organization_address, organization_city,
  organization_state, organization_zip_code, league_email, email_visibility,
  league_phone, phone_visibility, stripe_customer_id, payment_method_id,
  card_last4, card_brand, expiry_month, expiry_year, billing_zip,
  payment_verified, created_by, created_at, updated_at
)
SELECT
  id, organization_name, organization_address, organization_city,
  organization_state, organization_zip_code, league_email, email_visibility,
  league_phone, phone_visibility, stripe_customer_id, payment_method_id,
  card_last4, card_brand, expiry_month, expiry_year, billing_zip,
  payment_verified, member_id, created_at, updated_at
FROM league_operators_old;

-- 4. Create organization memberships (all existing operators become 'owner')
INSERT INTO organization_members (organization_id, member_id, role, joined_at)
SELECT id, member_id, 'owner', created_at
FROM league_operators_old;

-- 5. Update foreign keys in other tables
ALTER TABLE leagues RENAME COLUMN operator_id TO organization_id;
-- Repeat for other tables

-- 6. Verify data migration
-- 7. Drop old table when confident
-- DROP TABLE league_operators_old;
```

**Option B: Gradual Migration (For Production with Existing Data)**

- Keep both systems running temporarily
- Add compatibility layer
- Migrate organizations one at a time
- More complex but safer

## Code Changes Required

### 1. Update Queries (`/src/api/queries/`)

**operators.ts → organizations.ts**

```typescript
// OLD
export async function getOperatorProfileByMemberId(memberId: string);

// NEW
export async function getOrganizationsByMemberId(
  memberId: string
): Promise<Organization[]> {
  // Returns ALL organizations this member belongs to
  const { data, error } = await supabase
    .from('organization_members')
    .select(
      `
      organization_id,
      role,
      organizations (*)
    `
    )
    .eq('member_id', memberId);

  return data.map((om) => om.organizations);
}

export async function getActiveOrganization(
  memberId: string
): Promise<Organization | null> {
  // For now, return first organization (later add "active" selection)
  const orgs = await getOrganizationsByMemberId(memberId);
  return orgs[0] || null;
}
```

**Add new organization member management functions:**

```typescript
export async function addOrganizationMember(
  organizationId: string,
  memberId: string,
  role: 'admin' | 'support_agent',
  invitedBy: string
) {
  // Add member to organization
}

export async function removeOrganizationMember(
  organizationId: string,
  memberId: string
) {
  // Remove member from organization (only if not owner)
}

export async function getOrganizationMembers(organizationId: string) {
  // List all members of an organization
}
```

### 2. Update Hooks (`/src/api/hooks/`)

**useOperatorId.ts → useOrganizationId.ts**

```typescript
// OLD
export function useOperatorIdValue(): string | null {
  const { member } = useCurrentMember();
  const { data } = useQuery({
    queryKey: ['operatorId', member?.id],
    queryFn: () => getOperatorId(member!.id),
    enabled: !!member?.id,
  });
  return data?.id || null;
}

// NEW
export function useOrganizationId(): string | null {
  const { member } = useCurrentMember();
  const { data: org } = useQuery({
    queryKey: ['activeOrganization', member?.id],
    queryFn: () => getActiveOrganization(member!.id),
    enabled: !!member?.id,
  });
  return org?.id || null;
}

// Also add:
export function useOrganizations() {
  // Returns ALL organizations user belongs to
}

export function useOrganizationMembers(organizationId: string) {
  // Returns all members of an organization
}
```

### 3. Update Components

**Most operator components need minimal changes:**

- Replace `useOperatorIdValue()` → `useOrganizationId()`
- UI should mostly work the same

**New components needed:**

```
/src/operator/OrganizationMembers.tsx
- List all members of the organization
- Add new members (send invite)
- Remove members
- Change member roles

/src/operator/OrganizationSwitcher.tsx (future)
- Dropdown to switch between organizations (if member belongs to multiple)
- Shows current active organization
```

### 4. Update RLS Policies

```sql
-- OLD: Operators can only see their own data
CREATE POLICY "Operators manage own leagues" ON leagues
  FOR ALL
  USING (
    operator_id IN (
      SELECT id FROM league_operators
      WHERE member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- NEW: Any organization member can manage organization data
CREATE POLICY "Organization members manage org leagues" ON leagues
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );
```

**Add role-based policies where needed:**

```sql
-- Example: Only owners/admins can modify billing
CREATE POLICY "Only admins modify billing" ON organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

-- Support agents can read but not modify billing
CREATE POLICY "Support agents read billing" ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );
```

## Developer Support Workflow

### Customer-Controlled Support Access

**IMPORTANT:** Only organization owners/admins can grant access to their organization. There is NO developer backdoor.

**Support Access Flow:**

1. **Customer initiates** (one of two ways):

   **Option A: Customer manually invites you**
   - Customer goes to Settings → Team Members
   - Clicks "Invite Member"
   - Enters your email/member ID
   - Selects role: "Support Agent"
   - You receive invitation notification
   - You accept and join their organization

   **Option B: "Request Support" feature**
   - Customer clicks "Request Support" button in app
   - System sends invitation request to designated support staff
   - You receive notification
   - You accept invitation
   - Customer still initiated it, they're still in control

2. **You help them:**
   - Switch to their organization in your org list
   - All actions logged under YOUR member_id
   - Audit trail shows: "edpoplet (support_agent) created League X"

3. **Access removal:**
   - Customer can remove you anytime from Team Members page
   - You can leave voluntarily when done
   - No permanent access, no backdoors

**Key principle:** Customer controls who accesses their data, always.

## UI/UX Changes

### 1. Operator Dashboard

- Add "Organization Members" section
- Show current organization name prominently
- If user belongs to multiple orgs, show org switcher

### 2. Developer Dashboard

- Show organizations you have support_agent access to
- "Leave Organization" button (voluntary exit from support role)
- No ability to add yourself to organizations
- View support request notifications/invitations

### 3. Organization Settings

- New tab: "Team Members"
- List current members with roles
- "Invite Member" button
- Remove member functionality (can't remove owner)

## Migration Checklist

### Phase 1: Database

- [ ] Create `organizations` table
- [ ] Create `organization_members` table
- [ ] Migrate data from `league_operators` to new tables
- [ ] Update foreign keys in dependent tables
- [ ] Update RLS policies
- [ ] Test in local development

### Phase 2: Backend/Queries

- [ ] Rename/update query functions
- [ ] Add organization member management functions
- [ ] Update all queries that referenced `operator_id`
- [ ] Test queries work correctly

### Phase 3: Hooks

- [ ] Update `useOperatorId` → `useOrganizationId`
- [ ] Add `useOrganizations` hook
- [ ] Add `useOrganizationMembers` hook
- [ ] Update all components using old hooks

### Phase 4: UI Components

- [ ] Update operator dashboard
- [ ] Create OrganizationMembers component
- [ ] Update all operator pages
- [ ] Add org switcher (if needed)
- [ ] Create developer support UI

### Phase 5: Testing

- [ ] Test multi-operator scenarios
- [ ] Test developer support workflow
- [ ] Test role permissions
- [ ] Test RLS policies
- [ ] Test edge cases (remove member, change roles, etc.)

### Phase 6: Cleanup

- [ ] Remove old `league_operators` table
- [ ] Remove old hooks/functions
- [ ] Update documentation
- [ ] Update memory-bank files

## Estimated Effort

- **Database Changes**: 2-4 hours
- **Query/Hook Updates**: 4-6 hours
- **Component Updates**: 6-8 hours
- **Testing**: 4-6 hours
- **Total**: **16-24 hours** (2-3 days)

## Implementation Order

**CRITICAL:** These steps must be completed in this exact order to avoid breaking the application.

### Phase 1: Database Schema (FIRST - Nothing works without this)
1. Create new `organizations` table
2. Create new `organization_members` table
3. DO NOT drop or modify `league_operators` yet

### Phase 2: Data Migration (SECOND - Populate new tables)
1. Migrate all data from `league_operators` → `organizations`
2. Create corresponding `organization_members` records (all existing operators become 'owner')
3. Verify data integrity (every league_operator has matching organization + organization_member)

### Phase 3: Update Foreign Keys (THIRD - Point tables to new structure)
1. Add new `organization_id` columns to dependent tables (leagues, venues, preferences)
2. Copy values from old `operator_id` to new `organization_id`
3. Verify all foreign key relationships are intact
4. DO NOT drop old `operator_id` columns yet

### Phase 4: Code Migration (FOURTH - Update application code)
1. Create new query functions (organizations.ts) alongside old ones
2. Create new hooks (useOrganizationId) alongside old ones
3. **Refactor inline queries to use TanStack Query hooks** (fix anti-pattern)
4. Update components ONE BY ONE to use new hooks
5. Test each component after update
6. Keep old code until ALL components migrated

**IMPORTANT: Inline Query Refactoring**

The following components have inline supabase queries that need to be refactored to use TanStack Query hooks:
- `LeagueCreationWizard.tsx` - Replace inline query with `useOrganization(organizationId)` hook
- `OrganizationInfoCard.tsx` - Replace 4 inline updates with mutation hooks
- `OrganizationBasicInfoCard.tsx` - Replace 2 inline updates with mutation hooks
- `ContactInfoCard.tsx` - Replace 2 inline updates with mutation hooks
- `useOperatorProfanityToggle.ts` - Already a hook, refactor to use mutation
- `AnnouncementModal.tsx` - Replace inline query with `useOrganization(organizationId)` hook
- `useAnnouncementTargets.ts` - Replace inline query with `useOrganization(organizationId)` hook
- `announcements.ts` - Add proper query function, use in mutation

This refactoring accomplishes two goals:
1. Removes anti-pattern (no inline queries in components)
2. Makes migration easier (centralized query logic)

### Phase 5: RLS Policy Updates (FIFTH - Security layer)
1. Create new RLS policies for `organizations` and `organization_members`
2. Update policies on dependent tables to check `organization_id` instead of `operator_id`
3. Test access control thoroughly
4. DO NOT drop old policies yet

### Phase 6: UI Features (SIXTH - New functionality)
1. Create Organization Members management UI
2. Create invitation system
3. Create support request feature
4. Test multi-operator workflows

### Phase 7: Verification & Cleanup (LAST - Remove old code)
1. Verify ALL features work with new system
2. Run comprehensive tests
3. Drop old `operator_id` columns from dependent tables
4. Drop old `league_operators` table
5. Remove old query functions and hooks
6. Remove old RLS policies

**DO NOT SKIP STEPS. DO NOT REORDER. Each phase depends on the previous one.**

## Notes on God Mode

The existing "god mode" system remains useful for:
- UI testing and debugging
- Viewing app from different role perspectives
- Frontend development work

However, for actual customer support and data access, use the organization membership system instead. This provides:
- Proper audit trails
- Customer-controlled access
- No security concerns
- Clear accountability
