# API Hooks Usage Guide

> **Quick reference** for using the new TanStack Query hooks for auth/member data

---

## ✅ Phase 1 Complete: Member/Auth Hooks

The following hooks are **ready to use** and will replace the old versions:

### 1. `useCurrentMember()` - Get Basic Member Info

**Use when**: You need current user's member ID and name

```typescript
import { useCurrentMember } from '@/api/hooks';

function MyComponent() {
  const { data: member, isLoading, error } = useCurrentMember();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!member) return <div>Not logged in</div>;

  return (
    <div>
      <p>Member ID: {member.id}</p>
      <p>Name: {member.first_name} {member.last_name}</p>
    </div>
  );
}
```

**Convenience hooks**:
```typescript
// Just get the ID
const memberId = useMemberId(); // string | null

// Just get the first name
const firstName = useMemberFirstName(); // string
```

**Cache duration**: 30 minutes
**Old hook**: `hooks/useCurrentMember.ts` (still exists, will deprecate)

---

### 2. `useUserProfile()` - Get Full Profile with Roles

**Use when**: You need complete member data or role-based checks

```typescript
import { useUserProfile } from '@/api/hooks';

function ProfilePage() {
  const {
    member,
    loading,
    error,
    hasRole,
    canAccessLeagueOperatorFeatures,
    needsToCompleteApplication,
  } = useUserProfile();

  if (loading) return <div>Loading profile...</div>;

  if (needsToCompleteApplication()) {
    return <Navigate to="/new-player" />;
  }

  return (
    <div>
      <h1>{member?.first_name} {member?.last_name}</h1>
      <p>Role: {member?.role}</p>
      <p>Email: {member?.email}</p>

      {canAccessLeagueOperatorFeatures() && (
        <Link to="/operator">Operator Dashboard</Link>
      )}
    </div>
  );
}
```

**Convenience hooks**:
```typescript
// Check if user is operator
const isOperator = useIsOperator(); // boolean

// Check if user is developer
const isDeveloper = useIsDeveloper(); // boolean

// Get user's role
const role = useMemberRole(); // UserRole | null
```

**Cache duration**: 30 minutes
**Old hook**: `hooks/useUserProfile.ts` (still exists, will deprecate)

---

### 3. `useOperatorId()` - Get Operator ID

**Use when**: You need the operator ID for operator-specific queries

```typescript
import { useOperatorId } from '@/api/hooks';

function OperatorDashboard() {
  const { data: operator, isLoading, error } = useOperatorId();

  if (isLoading) return <div>Loading...</div>;

  if (error) {
    // User is not an operator
    return <Navigate to="/" />;
  }

  return (
    <div>
      <h1>Operator Dashboard</h1>
      <p>Operator ID: {operator.id}</p>
      {/* Fetch leagues for this operator */}
    </div>
  );
}
```

**Convenience hooks**:
```typescript
// Just get the ID
const operatorId = useOperatorIdValue(); // string | null

// Check if current user is operator (returns false while loading)
const isOperator = useIsCurrentUserOperator(); // boolean
```

**Cache duration**: 15 minutes
**Old hook**: `hooks/useOperatorId.ts` (still exists, will deprecate)

---

## 🔄 Migration Pattern

### Before (Old Hook):
```typescript
import { useCurrentMember } from '@/hooks/useCurrentMember';

function MyComponent() {
  const { memberId, firstName, loading } = useCurrentMember();

  if (loading) return <div>Loading...</div>;

  return <div>Welcome, {firstName}!</div>;
}
```

### After (New Hook):
```typescript
import { useCurrentMember } from '@/api/hooks';

function MyComponent() {
  const { data: member, isLoading } = useCurrentMember();

  if (isLoading) return <div>Loading...</div>;

  return <div>Welcome, {member?.first_name}!</div>;
}
```

**Key changes**:
- Import from `@/api/hooks` instead of `@/hooks`
- Data is in `data` property (or destructure: `{ data: member }`)
- Loading state is `isLoading` (standard TanStack Query naming)
- Error is available as `error` property
- Access nested properties with optional chaining: `member?.first_name`

---

## 🎯 Benefits You'll See

### 1. No More Duplicate Fetches
**Before**: Each component using `useCurrentMember` fetched member data
**After**: First component fetches, all others get cached data instantly

### 2. Automatic Background Updates
Member data stays fresh with automatic refetching in background

### 3. See It in DevTools
Open React Query DevTools (floating icon, bottom-left):
- See all active queries
- View cached data
- Monitor refetch behavior
- Debug query state

### 4. Better Performance
- Instant navigation (no loading spinners for cached data)
- Reduced database load
- Smaller bundle size (less manual state management)

---

## 📋 Next Steps

### To Start Using:
1. Import from `@/api/hooks` instead of old location
2. Update destructuring (`data`, `isLoading` instead of custom names)
3. Test that caching works (navigate away and back - no refetch!)

### To Fully Migrate:
- [ ] Update all components using old `useCurrentMember`
- [ ] Update all components using old `useUserProfile`
- [ ] Update all components using old `useOperatorId`
- [ ] Delete old hooks from `/hooks` directory
- [ ] Update imports across the app

---

## 🐛 Troubleshooting

### "Data is undefined"
**Solution**: Use optional chaining `member?.first_name` or check `isLoading` first

### "Still fetching on every mount"
**Solution**: Check that you're using the same query key. Import from `@/api/hooks`, not old location.

### "Can't see data in DevTools"
**Solution**: Make sure React Query DevTools is imported in `main.tsx` (it is!)

### "Need to force refetch"
**Solution**: Use query client to invalidate:
```typescript
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';

const queryClient = useQueryClient();

// Invalidate all member queries
queryClient.invalidateQueries({ queryKey: queryKeys.members.all });

// Invalidate specific member
queryClient.invalidateQueries({ queryKey: queryKeys.members.byUser(userId) });
```

---

## 📚 Learn More

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [CENTRAL-DATABASE-IMPLEMENTATION.md](CENTRAL-DATABASE-IMPLEMENTATION.md) - Full migration plan
- [DATABASE-USAGE-MAP.md](DATABASE-USAGE-MAP.md) - Complete DB usage inventory

---

*Next up: Team & Player queries (Phase 3)*
