# Developer Impersonation System - Implementation Plan

## Overview
Implement a global user impersonation system that allows developers to assume the identity of any user in the system. This will enable developers to test features, troubleshoot issues, and assist operators without needing separate test accounts.

## Core Concept
Instead of page-by-page impersonation, modify the `UserContext` so that when a developer impersonates a user, **the entire application** treats them as that user. Every component, query, and feature that uses `useUser()` will receive the impersonated user's ID and data.

## Architecture Changes

### 1. Update UserContext Interface
**File:** `/src/context/UserContext.ts`

Add impersonation fields to the context:
```typescript
export interface UserContextType {
  isLoggedIn: boolean;
  user: User | null; // The actual logged-in user
  loading: boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;

  // New impersonation fields
  impersonatedUser: User | null; // The user being impersonated
  isImpersonating: boolean; // Whether currently impersonating
  startImpersonation: (userId: string) => Promise<void>; // Start impersonating a user
  stopImpersonation: () => void; // Return to real user
  getEffectiveUser: () => User | null; // Returns impersonated user if active, otherwise real user
}
```

### 2. Update UserProvider Logic
**File:** `/src/context/UserProvider.tsx`

Key changes:
- Add state for `impersonatedUser` and `isImpersonating`
- Add `startImpersonation(userId)` function that:
  - Fetches the target user's auth data (if possible) or creates a mock User object
  - Sets `impersonatedUser` state
  - Sets `isImpersonating` to true
  - Stores impersonation in localStorage for persistence across page refreshes
- Add `stopImpersonation()` function that clears impersonation state
- Add `getEffectiveUser()` that returns `impersonatedUser` when impersonating, otherwise `user`
- On mount, check localStorage for active impersonation and restore it

**Important:** Since we can't actually get another user's Supabase auth session, we'll need to construct a mock `User` object with the essential fields:
```typescript
{
  id: impersonatedUserId,
  email: impersonatedUserEmail, // from members table
  // ... other fields we can populate from members table
}
```

### 3. Update useUser Hook
**File:** `/src/context/useUser.ts`

Modify to return the effective user:
```typescript
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  // Return impersonated user if active, otherwise real user
  return {
    ...context,
    user: context.getEffectiveUser(),
  };
};
```

### 4. Create Developer Impersonation Page
**File:** `/src/developer/ImpersonationAdmin.tsx` (new)

Features:
- **Only accessible to developers** (check `canAccessDeveloperFeatures()`)
- Search/dropdown to select any member in the system
- Display member details (name, email, role, organization if operator)
- "Start Impersonation" button
- If already impersonating, show:
  - Current impersonated user info
  - "Stop Impersonation" button to return to real account

Query needed:
```typescript
// Fetch all members for selection
export async function getAllMembers() {
  const { data, error } = await supabase
    .from('members')
    .select('id, first_name, last_name, email, role, system_player_number')
    .order('last_name', 'first_name');

  if (error) throw error;
  return data;
}
```

### 5. Add Global Impersonation Banner
**File:** `/src/components/ImpersonationBanner.tsx` (new)

- Fixed position banner at top of screen (above everything)
- Bright warning colors (yellow/orange background)
- Shows: "⚠️ DEVELOPER MODE: Impersonating [User Name] ([Email]) - [Role]"
- "Stop Impersonation" button
- Only visible when `isImpersonating === true`

Add to main App or layout component so it appears on every page.

### 6. Add Route for Impersonation Admin
**File:** `/src/navigation/NavRoutes.tsx`

Add developer-only route:
```typescript
{
  path: '/developer/impersonation',
  element: <ProtectedRoute allowedRoles={['developer']}><ImpersonationAdmin /></ProtectedRoute>,
}
```

Add to developer navigation menu.

## Data Storage

### localStorage Schema
Store active impersonation to persist across page refreshes:
```typescript
{
  "dev_impersonation": {
    "userId": "uuid-of-impersonated-user",
    "userEmail": "user@example.com",
    "userName": "John Doe",
    "startedAt": "2025-01-15T10:30:00Z"
  }
}
```

Clear this on logout or when stopping impersonation.

## Security Considerations

1. **Role Check:** Only users with `role === 'developer'` can access impersonation features
2. **Visual Indicators:** Always show the impersonation banner when active
3. **No Password Access:** Impersonation doesn't give access to user's password or auth credentials
4. **Audit Trail:** Consider logging impersonation events (who impersonated whom, when)
5. **Clear on Logout:** Always clear impersonation when developer logs out

## Testing Checklist

After implementation, test:
- [ ] Developer can select a user and start impersonation
- [ ] All pages show data for impersonated user (not developer)
- [ ] `useUser()` returns impersonated user throughout the app
- [ ] `useUserProfile()` fetches impersonated user's member record
- [ ] Operator features work when impersonating an operator
- [ ] Player features work when impersonating a player
- [ ] Impersonation persists across page refresh
- [ ] Impersonation banner shows on all pages
- [ ] Stop impersonation returns to developer's real account
- [ ] Non-developers cannot access impersonation admin page
- [ ] Impersonation clears on logout

## Affected Components

All components using `useUser()` will automatically work with impersonation:
- `useUserProfile()` - Will fetch impersonated user's profile
- `useOperatorIdValue()` - Will return impersonated user's operator ID
- All dashboard pages
- All operator pages
- All player pages
- Navigation menus
- Profile displays

## Migration Notes

### Current Implementation to Remove
The current `PlayerManagement.tsx` has page-specific impersonation logic that should be removed:
- `impersonatedOperatorId` state
- `getAllLeagueOperators()` query usage
- Developer impersonation dropdown in UI
- Any logic that switches `operatorId`

These will be replaced by the global system where the UserContext itself provides the impersonated user.

### Files Modified in Current Branch
- `/src/api/queries/operators.ts` - Added `getAllLeagueOperators()` (can keep for admin page)
- `/src/operator/PlayerManagement.tsx` - Has page-specific impersonation (revert these changes)

## Implementation Order

1. Update `UserContext.ts` interface
2. Update `UserProvider.tsx` with impersonation logic
3. Update `useUser.ts` to return effective user
4. Create `ImpersonationBanner.tsx` component
5. Create `ImpersonationAdmin.tsx` page
6. Add route and navigation links
7. Test thoroughly with different user roles
8. Revert page-specific changes from PlayerManagement

## Future Enhancements

- **Impersonation History:** Track recent impersonations for quick re-impersonation
- **Role Filtering:** Filter members list by role in admin page
- **Session Time Limit:** Auto-stop impersonation after X hours
- **Audit Logging:** Log all impersonation events to database
- **Quick Switch:** Dropdown in nav bar to quickly switch between recent impersonations
