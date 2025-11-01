# Hook Migration Tracker

> **Purpose**: Track replacement of old hooks with new TanStack Query versions
> **Status**: ✅ COMPLETED

---

## 📊 Summary

- **Total files to migrate**: 15 files
- **Completed**: 15 ✅
- **In progress**: 0
- **Remaining**: 0

---

## 🔄 useCurrentMember Migration (9 files)

### ✅ Files Migrated:

- [x] `player/ScoreMatch.tsx`
- [x] `player/MatchLineup.tsx`
- [x] `hooks/useMatchLineup.ts`
- [x] `pages/Messages.tsx`
- [x] `pages/AdminReports.tsx`
- [x] `operator/ReportsManagement.tsx`
- [x] `components/messages/MessageSettingsModal.tsx`
- [x] `components/ReportUserModal.tsx`
- [x] `components/PlayerNameLink.tsx`

### Migration Pattern:

**Before:**
```typescript
import { useCurrentMember } from '@/hooks/useCurrentMember';

const { memberId, firstName, loading } = useCurrentMember();
```

**After:**
```typescript
import { useCurrentMember, useMemberId } from '@/api/hooks';

const { data: member, isLoading } = useCurrentMember();
// OR if you only need ID:
const memberId = useMemberId();
```

---

## 👤 useUserProfile Migration (2 files)

### ✅ Files Migrated:

- [x] `pages/Messages.tsx`
- [x] `operator/OrganizationSettings.tsx`

### Migration Pattern:

**Before:**
```typescript
import { useUserProfile } from '@/hooks/useUserProfile';

const { member, loading, error, hasRole, canAccessLeagueOperatorFeatures } = useUserProfile();
```

**After:**
```typescript
import { useUserProfile } from '@/api/hooks';

const { member, loading, error, hasRole, canAccessLeagueOperatorFeatures } = useUserProfile();
// API is the same! Just change import
```

---

## 🏢 useOperatorId Migration (4 files)

### ✅ Files Migrated:

- [x] `operator/TeamManagement.tsx`
- [x] `operator/SeasonCreationWizard.tsx`
- [x] `operator/VenueManagement.tsx`
- [x] `__tests__/integration/SeasonCreationWizard.smoke.test.tsx`

### Migration Pattern:

**Before:**
```typescript
import { useOperatorId } from '@/hooks/useOperatorId';

const { operatorId, loading, error } = useOperatorId();
```

**After:**
```typescript
import { useOperatorId, useOperatorIdValue } from '@/api/hooks';

const { data: operator, isLoading, error } = useOperatorId();
const operatorId = operator?.id;

// OR simpler:
const operatorId = useOperatorIdValue();
```

---

## 📝 Migration Checklist

### For Each File:
1. [ ] Update import statement
2. [ ] Update destructuring (if needed)
3. [ ] Update property access (if needed)
4. [ ] Test component still works
5. [ ] Check for TypeScript errors
6. [ ] Mark as complete in this file

### After All Migrations:
- [x] Run `pnpm run build` to verify no errors
- [ ] Test app manually (critical paths) - User should test
- [ ] Check React Query DevTools shows cached queries - User should verify
- [ ] Delete old hook files:
  - [ ] `hooks/useCurrentMember.ts`
  - [ ] `hooks/useUserProfile.ts`
  - [ ] `hooks/useOperatorId.ts`
- [ ] Update TABLE_OF_CONTENTS.md

---

## 🎯 Migration Order (Recommended)

Start with least complex, work up to more complex:

### Phase 1: Simple Components (Low Risk)
1. `components/PlayerNameLink.tsx` - Simple usage
2. `components/ReportUserModal.tsx` - Simple usage
3. `components/messages/MessageSettingsModal.tsx` - Simple usage

### Phase 2: Pages (Medium Risk)
4. `pages/AdminReports.tsx`
5. `pages/Messages.tsx` - Uses both useCurrentMember AND useUserProfile

### Phase 3: Operator Pages (Medium Risk)
6. `operator/ReportsManagement.tsx`
7. `operator/TeamManagement.tsx`
8. `operator/SeasonCreationWizard.tsx`
9. `operator/VenueManagement.tsx`
10. `operator/OrganizationSettings.tsx`

### Phase 4: Player Pages (Medium-High Risk)
11. `player/MatchLineup.tsx`
12. `player/ScoreMatch.tsx`

### Phase 5: Hooks (Highest Complexity)
13. `hooks/useMatchLineup.ts` - Hook uses another hook

### Phase 6: Tests
14. `__tests__/integration/SeasonCreationWizard.smoke.test.tsx`

---

## ⚠️ Common Issues & Solutions

### Issue: "Cannot read property 'id' of undefined"
**Cause**: Accessing `member.id` before checking if data loaded
**Solution**: Use optional chaining `member?.id` or check `isLoading` first

### Issue: "memberId is null"
**Cause**: Using convenience hook `useMemberId()` which returns null before loaded
**Solution**: Check loading state or use full hook with `isLoading`

### Issue: "Type error on loading"
**Cause**: Old hook used `loading`, new uses `isLoading`
**Solution**: Rename to `isLoading` in destructuring

### Issue: "firstName not found"
**Cause**: Old hook returned top-level `firstName`, new has `member.first_name`
**Solution**: Use `useMemberFirstName()` convenience hook OR access `member?.first_name`

---

*Update this file as you complete migrations*
