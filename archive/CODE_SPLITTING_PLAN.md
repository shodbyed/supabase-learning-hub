# Code Splitting Implementation Plan

## Goal
Reduce initial JavaScript bundle size from 2.7 MB to ~1.5 MB by lazy-loading operator-only features. Regular players will never download code they can't use.

## Prerequisites
- ✅ User role system already implemented (`useCurrentMember()` returns `role` field)
- ✅ Separate operator routes already exist under `/operator/*` and `/league/*`

## Estimated Time: 45 minutes

---

## Phase 1: Setup Protected Route Component (10 minutes)

### Step 1.1: Create ProtectedRoute Component
Create a new file: `src/components/ProtectedRoute.tsx`

```typescript
/**
 * @fileoverview Protected Route Component
 *
 * Wraps routes that require specific user roles.
 * Redirects unauthorized users to home page.
 */

import { Navigate } from 'react-router-dom';
import { useCurrentMember } from '@/api/hooks/useCurrentMember';
import type { UserRole } from '@/types/member';

interface ProtectedRouteProps {
  /** Role required to access this route */
  requireRole?: UserRole;
  /** Content to render if authorized */
  children: React.ReactNode;
}

/**
 * Protected Route Component
 *
 * Checks user's role before rendering children.
 * Redirects to home if user doesn't have required role.
 *
 * @example
 * <ProtectedRoute requireRole="league_operator">
 *   <OperatorDashboard />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ requireRole, children }: ProtectedRouteProps) {
  const { data: member, isLoading } = useCurrentMember();

  // Show nothing while loading (Suspense will show loading spinner)
  if (isLoading) {
    return null;
  }

  // Check role requirement
  if (requireRole && member?.role !== requireRole && member?.role !== 'developer') {
    // Redirect unauthorized users to home
    return <Navigate to="/" replace />;
  }

  // Authorized - render the protected content
  return <>{children}</>;
}
```

### Step 1.2: Create Loading Spinner Component
Create a new file: `src/components/LoadingSpinner.tsx`

```typescript
/**
 * @fileoverview Loading Spinner Component
 *
 * Full-screen loading spinner shown while lazy-loading route components.
 */

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
```

---

## Phase 2: Convert Operator Routes to Lazy Loading (20 minutes)

### Step 2.1: Update NavRoutes.tsx - Add Imports
At the top of `src/navigation/NavRoutes.tsx`, add:

```typescript
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
```

### Step 2.2: Convert Operator Page Imports to Lazy
Find all operator imports and convert them. Change from this:

```typescript
// OLD - eager loading (loads immediately)
import { OperatorDashboard } from '@/operator/OperatorDashboard';
import { LeagueDetail } from '@/operator/LeagueDetail';
import { SeasonCreationWizard } from '@/operator/SeasonCreationWizard';
// ... etc
```

To this:

```typescript
// NEW - lazy loading (loads on-demand)
const OperatorDashboard = lazy(() => import('@/operator/OperatorDashboard'));
const LeagueDetail = lazy(() => import('@/operator/LeagueDetail'));
const SeasonCreationWizard = lazy(() => import('@/operator/SeasonCreationWizard'));
const SeasonScheduleManager = lazy(() => import('@/operator/SeasonScheduleManager'));
const TeamEditorModal = lazy(() => import('@/operator/TeamEditorModal'));
const CreateLeague = lazy(() => import('@/operator/CreateLeague'));
// ... convert ALL operator imports
```

### Step 2.3: List of Operator Pages to Convert
These are all the operator-only pages that should be lazy-loaded:

**Operator Pages:**
- `OperatorDashboard` - `/operator-dashboard`
- `CreateLeague` - `/create-league`
- `LeagueDetail` - `/league/:leagueId`
- `SeasonCreationWizard` - `/league/:leagueId/create-season`
- `SeasonScheduleManager` - `/league/:leagueId/season/:seasonId/schedule`
- `TeamEditorModal` - Used within league management
- Any other files in `/src/operator/*` folder

**How to find them all:**
1. Open `src/navigation/NavRoutes.tsx`
2. Search for `from '@/operator/` or `from './operator/`
3. Convert each import to lazy format

### Step 2.4: Wrap Operator Routes in Suspense + ProtectedRoute
Find the operator route definitions and wrap them. Change from this:

```typescript
// OLD
<Route path="/operator-dashboard" element={<OperatorDashboard />} />
<Route path="/create-league" element={<CreateLeague />} />
<Route path="/league/:leagueId" element={<LeagueDetail />} />
```

To this:

```typescript
// NEW
<Route
  path="/operator-dashboard"
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <ProtectedRoute requireRole="league_operator">
        <OperatorDashboard />
      </ProtectedRoute>
    </Suspense>
  }
/>

<Route
  path="/create-league"
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <ProtectedRoute requireRole="league_operator">
        <CreateLeague />
      </ProtectedRoute>
    </Suspense>
  }
/>

<Route
  path="/league/:leagueId"
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <ProtectedRoute requireRole="league_operator">
        <LeagueDetail />
      </ProtectedRoute>
    </Suspense>
  }
/>

// ... wrap ALL operator routes the same way
```

**Pro Tip:** Create a helper component to reduce repetition:

```typescript
// At top of NavRoutes.tsx
function OperatorRoute({ element }: { element: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProtectedRoute requireRole="league_operator">
        {element}
      </ProtectedRoute>
    </Suspense>
  );
}

// Then use it:
<Route path="/operator-dashboard" element={<OperatorRoute element={<OperatorDashboard />} />} />
<Route path="/create-league" element={<OperatorRoute element={<CreateLeague />} />} />
```

---

## Phase 3: Optional - Split Scoring Pages (10 minutes)

Scoring pages are also heavy and only used during matches. Consider lazy-loading these too:

```typescript
// Lazy load scoring pages
const ScoreMatch = lazy(() => import('@/player/ScoreMatch'));
const MatchLineup = lazy(() => import('@/player/MatchLineup'));

// Wrap in Suspense (no role check needed - all players use these)
<Route
  path="/match/:matchId/score"
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <ScoreMatch />
    </Suspense>
  }
/>
```

---

## Phase 4: Test Everything (10 minutes)

### Test Checklist

#### As Operator (role: 'league_operator')
- [ ] Can access operator dashboard
- [ ] Can create leagues
- [ ] Can manage teams
- [ ] Can create seasons
- [ ] Can manage schedules
- [ ] See brief loading spinner on first access (1-2 seconds)
- [ ] No loading spinner on subsequent visits (cached)

#### As Regular Player (role: 'player')
- [ ] CANNOT access `/operator-dashboard` (redirects to home)
- [ ] CANNOT access `/create-league` (redirects to home)
- [ ] CANNOT access `/league/:id` pages (redirects to home)
- [ ] CAN access all player features (My Teams, scoring, etc.)
- [ ] Faster initial page load (smaller bundle downloaded)

#### As Developer (role: 'developer')
- [ ] Can access everything (developers bypass all role checks)

### How to Test
1. Start dev server: `pnpm run dev`
2. Login as player account
3. Try navigating to `/operator-dashboard` - should redirect to home
4. Logout and login as operator account
5. Navigate to `/operator-dashboard` - should work, brief loading spinner
6. Navigate around operator pages - should be fast (no more spinners)

---

## Phase 5: Verify Bundle Size Improvement (5 minutes)

### Before Code Splitting
Run build and note the sizes:
```bash
pnpm run build
```

Look for:
```
dist/assets/index-Dx4k38H8.js   2,735.19 kB │ gzip: 590.61 kB
```

### After Code Splitting
Run build again:
```bash
pnpm run build
```

**Expected Results:**
```
dist/assets/index-[hash].js         ~1,500 kB  (main bundle - 45% smaller!)
dist/assets/operator-[hash].js      ~1,000 kB  (operator chunk - only loads for operators)
dist/assets/scoring-[hash].js       ~300 kB    (scoring chunk - if you split scoring pages)
```

**Success Criteria:**
- Main bundle should be under 2,000 kB (ideally ~1,500 kB)
- No build errors
- Warning about chunk sizes should be gone or only for operator chunk

---

## Troubleshooting

### Error: "Element type is invalid"
**Problem:** Forgot to add `default export` to a lazy-loaded component

**Solution:** Check that all operator components export as default:
```typescript
// In operator component file
export default function OperatorDashboard() { ... }
// OR
export { OperatorDashboard as default };
```

### Error: "A component suspended while responding to synchronous input"
**Problem:** Missing `<Suspense>` wrapper

**Solution:** Make sure every `lazy()` component is wrapped in `<Suspense>`

### Users See Loading Spinner Too Long
**Problem:** Bundle is being re-downloaded on every navigation

**Solution:** Check browser cache settings. Vite automatically adds cache headers, but some browser extensions (ad blockers) disable caching.

### Operator Pages Won't Load
**Problem:** Role check is failing

**Solution:**
1. Check that `useCurrentMember()` returns role correctly
2. Verify user has `role: 'league_operator'` in database
3. Check browser console for errors

---

## Rollback Plan

If something breaks, rollback is easy:

1. Remove `lazy()` wrapper - change back to regular import:
   ```typescript
   // Rollback: change from
   const OperatorDashboard = lazy(() => import('@/operator/OperatorDashboard'));

   // Back to
   import { OperatorDashboard } from '@/operator/OperatorDashboard';
   ```

2. Remove `<Suspense>` and `<ProtectedRoute>` wrappers:
   ```typescript
   // Rollback: change from
   <Route path="/..." element={
     <Suspense fallback={<LoadingSpinner />}>
       <ProtectedRoute requireRole="league_operator">
         <Component />
       </ProtectedRoute>
     </Suspense>
   } />

   // Back to
   <Route path="/..." element={<Component />} />
   ```

3. Run build: `pnpm run build`

---

## Expected Outcome

✅ **45% smaller initial bundle** for all users
✅ **Faster page loads** for players (they never download operator code)
✅ **Better security** (unauthorized users can't access operator routes)
✅ **Same experience** for operators (tiny 1-2 second loading spinner first time only)
✅ **Automatic caching** means no loading spinner on repeat visits

---

## Notes

- **First-time loading:** Operators will see a brief (~1-2 seconds) loading spinner the first time they access operator features. This is normal and expected.
- **Caching:** After the first load, the operator code is cached in the browser, so no more loading spinners.
- **Bundle naming:** Vite automatically names the chunks with hashes (e.g., `operator-abc123.js`). This is good for cache busting.
- **Developer role:** Developers bypass all role checks, so they can access everything without restrictions.

---

*Last Updated: 2025-11-23*
