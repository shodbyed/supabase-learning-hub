# Task List for Jack

## 1. Revamp Navigation Bar
- Review and update the navigation bar design and functionality
- Ensure consistent styling and user experience

## 2. Fix App.tsx Navigation
- Remove or properly implement the commented-out `NavigationWrapper` component in `src/App.tsx`
- Clean up unused imports: `useLocation`, `NavBar`, `OperatorNavBar`
- This is causing TypeScript errors for unused declarations

## 3. Type System Architecture Review
- **Issue**: Over-abstraction with Pick<> types for single-record fetches
- **Context**: Using `Pick<Member, 'id' | 'name' | ...>` for individual member queries adds maintenance overhead without performance benefit
- **Question**: Should we grab full records (`select *`) for single-entity fetches and only use selective fetching for list queries where it matters?
- **Trade-off**: Simplicity vs explicit dependencies. At current scale, simplicity likely wins.
- **Files affected**: Message components (MemberForMessaging), various single-entity hooks
- **Decision needed**: Establish pattern for when to use selective vs full fetching

## 4. InfoButton Responsive Positioning
- **Issue**: InfoButton popups get cut off on small screens
- **Context**: The popup positioning logic in `/src/components/InfoButton.tsx` needs improvement for mobile
- **Problem**: On narrow screens, the popup can extend beyond viewport edges, causing horizontal scrolling or cut-off content
- **Solution needed**:
  - Make popups stay fully within viewport at all screen widths
  - At small widths, consider full-width or anchored-to-edge positioning
  - At larger widths, keep centered positioning
  - Prevent any content cutoff regardless of screen size
- **File**: `/src/components/InfoButton.tsx`

## 5. Add RLS Policies Before Production
- **CRITICAL**: Database currently has NO Row Level Security policies enabled
- **Risk**: Any authenticated user can access/modify any data
- **Tables affected**:
  - `organizations` - No RLS policies
  - `organization_staff` - No RLS policies
  - All other tables need review
- **Action needed**:
  - Add RLS policies to `organizations` table (staff can only see their orgs)
  - Add RLS policies to `organization_staff` table (staff management permissions)
  - Review all existing tables for proper RLS implementation
  - Test RLS policies thoroughly before production deployment
- **Status**: RLS intentionally disabled during development/testing
- **Priority**: MUST be completed before any production deployment

## 6. Remove .env from Git History
- **Issue**: `.env` file was previously committed to git before being added to `.gitignore`
- **Risk**: Secrets remain in git history even after adding to `.gitignore`
- **Action needed**:
  ```bash
  git rm --cached .env
  git commit -m "Remove .env from tracking"
  ```
- **Note**: This removes the file from git without deleting it locally
- **Priority**: Should be done before pushing to any public/shared repository

## 10. PP Manual Merge - Confidence Thresholds Review
- **Context**: `/register-existing` page allows existing players (Placeholder Players) to find their record without a registration link
- **Feature**: Users fill out optional fields (up to 16) and we search for matching PP records
- **Proposed Grading System**:
  - **Grade A (6+ matches)**: Auto-merge - redirect straight to `/register?claim={ppId}`
  - **Grade B (4-5 matches)**: LO Review Required - create pending claim for operator approval
  - **Grade C (<4 matches)**: No Match - tell user to get a registration link from captain/LO
- **Fields being matched** (all optional):
  - League Operator: First Name, Last Name, Player Number
  - Captain: First Name, Last Name, Player Number
  - User's System Info: First Name, Last Name, Player Number, Nickname
  - Team/Location: Team Name, Play Night, City, State
  - Security: Last Opponent First/Last Name OR "Haven't played yet" checkbox
- **Questions for Jack**:
  1. Are 6+/4-5/<4 the right thresholds?
  2. Should some fields be weighted more heavily? (e.g., player number match = 2 points?)
  3. For Grade B (LO Review), should we create a `claim_requests` table or just tell user to contact LO?
  4. If multiple PP candidates match with similar scores, show a list or require more specificity?
- **File**: `/src/login/RegisterExisting.tsx`
- **Edge Function needed**: `search-placeholder-player` for multi-table confidence scoring

## 11. Navbar Invite Indicator
- **Context**: When navbar is implemented, add an invite notification indicator
- **Design**: Similar to messages - icon with badge showing count of pending invites
- **Functionality**:
  - Shows number of pending (unclaimed) invites for the logged-in user
  - Clicking opens dropdown with list of pending invites
  - Each invite shows: Team name, Captain name, "Claim" button
  - Expired invites show "Ask captain to resend" message
- **Backend ready**: `get_my_pending_invites()` function returns pending/expired invites
- **Integration**: When user claims, badge count decrements
- **Related**: Pairs with login modal notification (implemented separately)

---

*Last Updated: 2025-12-17*
