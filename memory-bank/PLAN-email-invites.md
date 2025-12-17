# Email Invites for Placeholder Players - Implementation Plan

> **Status:** Backend Complete ✅ | Frontend In Progress 🔄
> **Created:** 2025-12-17
> **Branch:** `pp-manual-merging`

## Overview

Enable captains/operators to send email invites to placeholder players. The email serves as the linking mechanism between PPs and registered users - no complex fuzzy matching needed.

## Two Scenarios

### Scenario 1: Email NOT in auth.users (New User)
```
Captain enters email for PP "John Smith"
  → Edge Function checks auth.users for email → NOT FOUND
  → Sends invite email: "Join [Team Name] on Rack'em Leagues"
  → Link: /register?claim={memberId}&token={token}
  → John clicks link → registers → auto-linked to PP record
```

### Scenario 2: Email IS in auth.users (Existing User)
```
Captain enters email for PP "Jane Doe"
  → Edge Function checks auth.users for email → FOUND
  → Sends different email: "Claim Your Player History on [Team]"
  → Link: /claim-player?claim={memberId}&token={token}
  → Jane clicks link → logs in → PP merged into her existing member record
  → All PP references (games, lineups, etc.) transferred to Jane's member_id
```

---

## Implementation Phases

### Phase 1: Send Test Email ✅ COMPLETE
**Goal:** Prove we can send emails from local Supabase Edge Functions

**Tasks:**
- [x] Sign up for Resend (free tier)
- [x] Create `/supabase/functions/send-test-email/index.ts`
- [x] Set RESEND_API_KEY secret locally
- [x] Run `supabase functions serve`
- [x] Call function, receive test email

**Verification:** ✅ Test email received

---

### Phase 2: Send Email with Register Link ✅ COMPLETE
**Goal:** Send email containing the registration link with claim param

**Tasks:**
- [x] Modify Edge Function to accept `{ memberId, email, teamId, invitedByMemberId, teamName, captainName, baseUrl }`
- [x] Build email with registration link
- [x] Send via Resend

**Verification:** ✅ Click link in email → goes to registration page with claim param

---

### Phase 3: Check Auth Before Sending ✅ COMPLETE
**Goal:** Before sending, detect if email already exists in auth.users

**Tasks:**
- [x] Query auth.users for email in Edge Function
- [x] If NOT found → send registration email (Phase 2 flow)
- [x] If FOUND → send claim email (Phase 5 flow)

**Verification:** ✅ Different email templates sent based on auth status

---

### Phase 4: Invite Tokens Table ✅ COMPLETE
**Goal:** Store tokens for tracking invites

**Migration:** `20251217144653_invite_tokens.sql`

**Schema:**
```sql
CREATE TABLE invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  invited_by_member_id UUID NOT NULL REFERENCES members(id),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired', 'cancelled')),

  -- For audit trail (who claimed this invite)
  claimed_by_user_id UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  claimed_at TIMESTAMPTZ
);
```

**Functions Created:**
- `get_invite_details(p_token)` - Safe lookup for /register page (SECURITY DEFINER, anon access)
- `claim_invite_token(p_token, p_user_id)` - Link PP to user on registration (SECURITY DEFINER)
- `get_my_pending_invites()` - Returns pending/expired invites for authenticated user at login

**Verification:** ✅ Tokens created, tracked, and claimable

---

### Phase 5: Merge System for Existing Auth Users ✅ COMPLETE
**Goal:** Handle case where email IS in auth.users

**Tasks:**
- [x] Create schema-aware `merge_placeholder_into_member()` function
- [x] Dynamically finds ALL FK refs to members(id) via information_schema
- [x] Special handling for team_players (row transfer with stats)
- [x] Preserve invite_tokens.member_id for audit trail
- [x] Create `/supabase/functions/claim-placeholder/index.ts` Edge Function
- [x] **Security fix:** Verify authenticated user's email matches invite email

**Migration:** `20251217152629_merge_placeholder_player.sql`

**Security:**
```typescript
// Verify the authenticated user's email matches the invite email
// Prevents stolen links from being used by unauthorized users
if (userEmail !== inviteEmail) {
  return 403 "Email mismatch"
}
```

**Verification:** ✅ PP data merges into existing user's member record

---

### Phase 6: Login Notification System ✅ COMPLETE (Backend)
**Goal:** Check for pending invites when user logs in

**Migration:** `20251217170000_check_pending_invites.sql`

**Function:** `get_my_pending_invites()`
- Returns pending AND expired invites for authenticated user's email
- Includes `is_expired` boolean flag
- Pending invites → show "Claim" button (direct claim, no email link needed)
- Expired invites → show "Ask captain to resend" message

**Frontend Needed:** 🔄 See Phase 7

---

### Phase 7: Frontend - Claim Pages & Notifications ✅ COMPLETE
**Goal:** Build UI for claiming invites and notifications

**Tasks:**
- [x] **`/claim-player` page** - For existing users clicking email link
  - Shows PP name, team name, captain name
  - "Claim History" button calls claim-placeholder Edge Function
  - Success → redirect to dashboard with merge stats
  - Error handling for expired/invalid/already-claimed tokens
  - Email mismatch detection (wrong account logged in)
  - **File:** `src/login/ClaimPlayer.tsx`

- [x] **Login notification modal**
  - Call `get_my_pending_invites()` after login via Dashboard
  - Display modal for pending invites
  - "Claim" button navigates to /claim-player with token
  - "Expired" state shows "Ask captain to resend" message
  - Button text: "Join [Team Name]" with captain name context
  - Dismissible (session state tracks dismissal)
  - **Files:** `src/components/modals/PendingInvitesModal.tsx`, `src/api/hooks/usePendingInvites.ts`

- [ ] **Invite status indicator on PP cards**
  - "Invite Sent" badge for PPs with pending invites
  - "Invite Expired" badge for expired invites

---

### Phase 8: Frontend - Captain Invite Flow 🔄 TODO
**Goal:** UI for captain to enter email and send invite

**Location:** Wherever PP is displayed (team roster, player popover)

**Two Options:**
1. **"Send Email Invite"** - Full flow via Edge Function
   - Captain enters email
   - Creates token + sends email
   - PP gets branded email with link

2. **"Create Invite Link"** - Link-only option
   - Captain enters email (for token tracking/security)
   - Creates token WITHOUT sending email
   - Direct insert to `invite_tokens` table
   - Captain can share link manually (QR code, text, etc.)

**UI Components Needed:**
- [ ] `InvitePlayerModal.tsx` - Modal with email input
- [ ] Two buttons: "Send Email" vs "Create Link Only"
- [ ] Success feedback with copyable link (for option 2)
- [ ] Integration with existing PP card/popover UI

---

### Phase 9: Edge Cases & Polish 📋 TODO
**Goal:** Handle edge cases, add polish

**Tasks:**
- [ ] Resend invite functionality (existing UI can reuse same flow)
- [ ] Cancel/revoke invite capability
- [ ] "Invite Pending" indicator shows invite date
- [ ] Handle multiple pending invites gracefully
- [ ] Error handling for all failure modes
- [ ] Email template improvements (better branding)

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Email API | Resend (free tier: 3k/month) |
| Server-side logic | Supabase Edge Functions (Deno/TypeScript) |
| Email domain | invites@rackemleagues.com (TODO: verify domain) |
| Token generation | gen_random_uuid() in PostgreSQL |

## Files Created

```
/supabase
  /functions
    /send-test-email
      index.ts                    ✅ Phase 1
    /send-invite
      index.ts                    ✅ Phase 2-3
    /claim-placeholder
      index.ts                    ✅ Phase 5

/supabase/migrations
  20251217144653_invite_tokens.sql        ✅ Phase 4
  20251217152629_merge_placeholder_player.sql  ✅ Phase 5
  20251217170000_check_pending_invites.sql     ✅ Phase 6
```

## Files Created (Frontend)

```
/src
  /login
    ClaimPlayer.tsx                   ✅ Phase 7 - Claim page for existing users
  /components
    /modals
      PendingInvitesModal.tsx         ✅ Phase 7 - Login notification modal
  /api
    /hooks
      usePendingInvites.ts            ✅ Phase 7 - TanStack Query hook for pending invites

Files to Create:
  /components
    /player
      InvitePlayerModal.tsx           📋 Phase 8
```

## RLS Policies

**Status:** RLS disabled for now (documented in RLS_ANALYSIS.md)

Proposed policies documented in `/RLS_ANALYSIS.md` section 13 for when RLS is enabled:
- Team captains can view/create/update invites for their teams
- Organization operators can manage invites for teams in their org
- No DELETE policy (keep audit trail)

## Success Criteria

- [x] ✅ Captain can send invite to any email
- [x] ✅ New users register via link and are auto-linked to PP
- [x] ✅ Existing users can claim via link and PP data merges to their account
- [x] ✅ All PP game history, lineups, stats transfer correctly
- [x] ✅ Works for any future tables that reference members(id)
- [x] ✅ Security: Email verification prevents stolen link attacks
- [x] ✅ Login notification shows pending/expired invites (modal on Dashboard)
- [x] ✅ Users can claim directly without clicking email link (modal → claim page)
- [ ] 📋 UI for captains to send invites with 2 options (email vs link-only)

---

## Edge Case: PP Cross-Contamination 🔄 DISCUSSION

### The Problem

Two scenarios where PPs can be incorrectly shared:

**Scenario A: Same PP, Multiple Teams (Accidental)**
```
Captain A creates PP "John Smith" → adds to Team A → invites john@example.com
Captain B searches, finds "John Smith" PP → adds to Team B → invites different email
Now two different people might claim the same PP record
```

**Scenario B: Same PP, Same Person, Multiple Teams (Intentional but messy)**
```
Captain A creates PP "John Smith" → invites john@example.com
Captain B (different org) also has John → uses same PP → invites john@example.com
Both invites go to same person, but when claimed, all data merges
User may not want to be on both teams
```

### Current Mitigation (Implemented)

Member search now excludes PPs that are already on any team:
- **File:** `src/api/queries/memberSearch.ts`
- PPs with `user_id IS NULL` AND exist in `team_players` → hidden from search
- Prevents Captain B from accidentally "adopting" Captain A's PP

### Proposed Enhancement: Email-Protected PPs

**Idea:** Store player's email on PP record at creation time, use it as identity anchor.

**Flow:**
```
Captain A creates PP "John Smith" with email john@example.com
  → Email stored on members.email (even though user_id is null)
  → PP is "protected" by that email

Captain B searches, finds "John Smith" PP (if we allow it)
  → Tries to add to their team
  → System prompts: "Enter this player's email to verify"
  → Captain B enters john@example.com → Success (same person confirmed!)
  → Captain B enters wrong@example.com → Denied

When inviting:
  → Email already on record, just click "Send Invite"
  → Same email across teams = confirmed same person = safe to merge all
```

**Benefits:**
1. **PP ownership verification** - Can't adopt PP without knowing player's email
2. **Email becomes identity anchor** - Same email = same person across teams
3. **Simplifies invite flow** - Email already on record
4. **Enables intentional multi-team PPs** - If both captains have correct email, they have the right person

**PPs without email:**
- Can only be on ONE team (current restriction)
- Or: Require email entry when adding to another team

**Questions to resolve:**
- [ ] Should we allow PPs in search if they have email? (with verification prompt)
- [ ] Or keep current "hide assigned PPs" and require email at PP creation?
- [ ] What if PP email is wrong? (Captain entered wrong email initially)

**Schema change needed:**
- `members.email` already exists but may be null for PPs
- Could add `email_verified_by` to track which captain provided the email?

---

## Notes

- This replaces the abandoned fuzzy matching approach
- Email is the definitive link between PP and user
- Schema-aware merge means we don't hardcode table names
- Edge Functions now established in this project
- Direct claim works because authenticated user's email is verified against invite email
- 3 databases (local, staging, production) all need migrations applied
