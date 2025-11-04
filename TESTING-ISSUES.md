# Testing Issues - TanStack Migration

> **Created**: 2025-11-04
> **Purpose**: Track issues discovered during testing after TanStack Query migration
> **Status**: Active Testing

---

## 🐛 UI/UX Issues

### 1. Login Screen - Mobile Layout
**Priority**: Medium
**Component**: `/src/login/Login.tsx`
**Issue**: Login card appears too narrow on mobile screens. "Register" and "Forgot Password" links are scrunched together and hard to tap.

**Expected Behavior**: Card should be wider on mobile, with better spacing between action links

**Notes**:
- Works fine on desktop
- Need to adjust mobile-specific styling
- Consider increasing card width or using full-width on mobile
- Ensure links have proper touch targets (min 44x44px)

---

### 2. Reports Management - RLS Policy Error
**Priority**: High
**Component**: `/src/operator/ReportsManagement.tsx`, `/src/utils/reportingQueries.ts`
**Issue**: When viewing reports on `/operator-reports` page, getting RLS policy error:
```
Error: new row violates row-level security policy for table "report_updates"
PATCH http://localhost:54321/rest/v1/user_reports 403 (Forbidden)
```

**Root Cause**: The `report_updates` table has RLS enabled but no policy allowing inserts from database triggers when `user_reports.status` is updated.

**Fix Required**: Database RLS policy needs to be added (NOT a code fix):
```sql
-- Allow authenticated users to insert report updates (for triggers)
CREATE POLICY "Allow authenticated users to create report updates"
ON report_updates
FOR INSERT
TO authenticated
WITH CHECK (true);
```

**Temporary Workaround for Testing**:
```sql
ALTER TABLE report_updates DISABLE ROW LEVEL SECURITY;
```

**Notes**:
- This is a database configuration issue, not application code
- The trigger that creates `report_updates` records is being blocked by RLS
- Need to add appropriate RLS policies or disable RLS for this table
- Affects any report status changes on operator reports page

---

### 3. Reports Badge Count - Incorrect Count
**Priority**: Medium
**Component**: Navigation bar reports badge, `/src/operator/ReportsManagement.tsx`
**Issue**: The reports flag/badge in the navigation bar showing pending report count is not updating correctly. After taking action on a report and it disappearing from the list, the badge count doesn't decrement accordingly.

**Example**: Badge shows "5" but only 4 reports appear in the actual list.

**Expected Behavior**: Badge count should match the number of reports displayed in the reports list. Should update immediately when reports are actioned.

**Notes**:
- Badge count likely comes from a separate query that's not being invalidated
- May need to invalidate the badge count query when reports are updated/actioned
- This is in an area that will need work in the future
- Not urgent - deferred for later when working on reports system

---

### 4. Announcement Initiation Page - Text Box Hidden on Scroll
**Priority**: Medium
**Component**: Announcement initiation page (likely `/src/operator/AnnouncementInitiation.tsx` or similar)
**Issue**: When an operator has multiple leagues, the league list becomes long and the text box for writing the announcement gets hidden at the bottom of the scroll area. User has to scroll down to see the text input.

**Expected Behavior**:
- The league selection list should have its own scrollable area with a fixed/max height
- The text box for writing announcements should always be visible on screen
- Layout should be: League list (scrollable) → Text box (always visible) → Send button

**Suggested Fix**:
```tsx
// League list with max height and scroll
<div className="max-h-[400px] overflow-y-auto">
  {/* League checkboxes */}
</div>

// Text box always visible below
<div className="mt-4">
  <Textarea ... />
</div>
```

**Notes**:
- Affects operators managing multiple leagues
- Makes UX difficult when selecting recipients and composing message
- Should test with 5+ leagues to verify fix works

---

### 5. Messages Page - Back/Exit Button at Bottom Gets Lost
**Priority**: Low
**Component**: Messages page/component
**Issue**: The back or exit button is located at the bottom of the messages view. With long message threads, users have to scroll to the bottom to find the exit button, which makes it easy to miss or forget about.

**Expected Behavior**:
- Back/Exit button should be at the top of the page (likely in a header area)
- Should be immediately visible without scrolling
- Common pattern: Back button in top-left corner or top of page header

**Suggested Fix**:
- Move back/exit button to top of messages component
- Consider using a sticky header with the button
- Alternative: Use both top and bottom buttons for convenience

**Notes**:
- Low priority but improves UX
- Affects user navigation and ability to exit message view
- More noticeable with longer message threads

---

## ✅ Verified Working
- (Items will be added as testing progresses)

---

## 📝 Notes
- Testing started: 2025-11-04
- Focus: TanStack Query migration functionality
- ScoreMatch component refactoring complete (1,976 → 421 lines, -79%)
