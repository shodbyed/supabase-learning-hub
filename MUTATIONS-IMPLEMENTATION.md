# Mutations Implementation Summary

> **Created**: 2025-11-01
> **Status**: Phase 1 Complete - Infrastructure Set Up
> **Branch**: `app-restructure`

---

## 🎯 Goal

Implement TanStack Query mutations for write operations, providing:
- Automatic cache invalidation on success
- Built-in loading and error states
- Consistent error handling patterns
- Foundation for optimistic updates

---

## ✅ Phase 1: Infrastructure Complete

### Created Files

**Mutation Functions** (`api/mutations/`)
- `leagues.ts` - League write operations
  - `updateLeagueDayOfWeek()` - Update league schedule day
- `reports.ts` - User report operations
  - `createUserReport()` - Submit new report
  - `updateReportStatus()` - Update report investigation status
- `messages.ts` - Messaging write operations
  - `sendMessage()` - Send message in conversation
  - `updateLastRead()` - Mark messages as read
  - `blockUser()` - Block a user
  - `unblockUser()` - Unblock a user

**Mutation Hooks** (`api/hooks/`)
- `useLeagueMutations.ts`
  - `useUpdateLeagueDayOfWeek()` - With league/season cache invalidation
- `useReportMutations.ts`
  - `useCreateUserReport()` - With reports cache invalidation
  - `useUpdateReportStatus()` - With reports cache invalidation
- `useMessageMutations.ts`
  - `useSendMessage()` - With conversations/messages cache invalidation
  - `useUpdateLastRead()` - With unread count cache invalidation
  - `useBlockUser()` - With conversations cache invalidation
  - `useUnblockUser()` - With conversations cache invalidation

### Components Migrated

1. **SeasonCreationWizard.tsx** ✅ TESTED
   - Migrated `updateLeagueDayOfWeek` to use mutation hook
   - Proper error handling with onSuccess/onError callbacks
   - Automatic cache invalidation for leagues and seasons
   - User verified: "went thru season creation wizard with no issues"

### Mutation Pattern

```typescript
// In mutation function (api/mutations/*)
export async function updateSomething(params: UpdateParams) {
  const { data, error } = await supabase
    .from('table')
    .update(params)
    .eq('id', params.id);

  if (error) {
    throw new Error(`Failed to update: ${error.message}`);
  }

  return data;
}

// In mutation hook (api/hooks/*)
export function useUpdateSomething() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateParams) => updateSomething(params),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.something.all,
      });
    },
  });
}

// In component
function MyComponent() {
  const updateMutation = useUpdateSomething();

  const handleUpdate = () => {
    updateMutation.mutate(
      { id: '123', value: 'new' },
      {
        onSuccess: () => {
          // Component-specific success handling
        },
        onError: (err) => {
          // Component-specific error handling
        },
      }
    );
  };

  return (
    <button onClick={handleUpdate} disabled={updateMutation.isPending}>
      {updateMutation.isPending ? 'Saving...' : 'Save'}
    </button>
  );
}
```

---

## 📋 Next Steps

### Ready to Migrate (Simple Mutations)

These mutations are ready to be converted - they're straightforward single-table updates:

1. **Team Mutations**
   - `updateTeamName()` - Team management
   - `addPlayerToTeam()` - Roster management
   - `removePlayerFromTeam()` - Roster management
   - `updateCaptain()` - Team captain changes

2. **Venue Mutations**
   - `createVenue()` - Venue creation
   - `updateVenue()` - Venue updates
   - `deleteVenue()` - Venue deletion

3. **Member Mutations**
   - `updateMemberProfile()` - Profile updates
   - `updateMemberRole()` - Role changes (operator only)

### Complex Mutations (Defer for Later)

These involve transactions, complex business logic, or multiple tables:

1. **Season Creation** (`createSeason()`)
   - Multi-step transaction (season + weeks + championship dates)
   - Rollback logic required
   - Keep as service function for now

2. **Match Scoring**
   - Real-time updates critical
   - Complex validation rules
   - Multiple table updates

3. **Conversation Creation** (`createOrOpenConversation()`, `createGroupConversation()`)
   - Uses RPC functions
   - Complex participant management
   - Keep as utility functions for now

---

## 🎓 Lessons Learned

1. **Parameter Objects**: Mutations use parameter objects (not individual params) for better TypeScript inference in useMutation
2. **Cache Invalidation**: Always invalidate relevant queries in mutation hooks, not components
3. **Error Messages**: Throw descriptive errors from mutation functions - they're passed to onError callback
4. **Testing**: Test full user flows after migration to ensure cache invalidation works correctly

---

## 📊 Progress

**Mutations Infrastructure**: ✅ Complete
- Folder structure created
- 3 mutation files with 7 functions
- 3 hook files with 7 hooks
- Exported from api/hooks/index.ts
- 1 component migrated and tested

**Next Phase**: Migrate remaining simple mutations (teams, venues, member profile)
