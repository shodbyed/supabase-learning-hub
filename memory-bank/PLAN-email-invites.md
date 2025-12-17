# Email Invites for Placeholder Players - Implementation Plan

> **Status:** Planning
> **Created:** 2025-12-17
> **Branch:** `email-invites`

## Overview

Enable captains/operators to send email invites to placeholder players. The email serves as the linking mechanism between PPs and registered users - no complex fuzzy matching needed.

## Two Scenarios

### Scenario 1: Email NOT in auth.users (New User)
```
Captain enters email for PP "John Smith"
  → Edge Function checks auth.users for email → NOT FOUND
  → Sends invite email: "Join [Team Name] on Rack'em Leagues"
  → Link: /register?claim={token}
  → John clicks link → registers → auto-linked to PP record
```

### Scenario 2: Email IS in auth.users (Existing User)
```
Captain enters email for PP "Jane Doe"
  → Edge Function checks auth.users for email → FOUND
  → Sends different email: "Captain [Name] added you to [Team]"
  → Link: /confirm-join?token={token}
  → Jane clicks link → confirms → PP merged into her existing member record
  → All PP references (games, lineups, etc.) transferred to Jane's member_id
```

---

## Implementation Phases

### Phase 1: Send Test Email
**Goal:** Prove we can send emails from local Supabase Edge Functions

**Tasks:**
1. Sign up for Resend (free tier)
2. Create `/supabase/functions/send-test-email/index.ts`
3. Set RESEND_API_KEY secret locally
4. Run `supabase functions serve`
5. Call function, receive test email

**Verification:** You receive a test email

---

### Phase 2: Send Email with Register Link
**Goal:** Send email containing the existing `/register?claim={memberId}` link

**Tasks:**
1. Modify Edge Function to accept `{ memberId, email, teamName, captainName }`
2. Build email with registration link
3. Send via Resend

**Verification:** Click link in email → goes to registration page with claim param

---

### Phase 3: Check Auth Before Sending
**Goal:** Before sending, detect if email already exists in auth.users

**Tasks:**
1. Query auth.users for email in Edge Function
2. If NOT found → send registration email (Phase 2 flow)
3. If FOUND → return error/alert "This email is already registered"
4. Don't send email to existing users yet (handled in Phase 5+)

**Verification:**
- Email not in auth → email sent
- Email in auth → error returned, no email sent

---

### Phase 4: Invite Tokens Table
**Goal:** Store tokens for tracking invites

**Migration creates:**
```sql
CREATE TABLE invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(64) UNIQUE NOT NULL,
  placeholder_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  invited_by_member_id UUID NOT NULL REFERENCES members(id),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired')),

  -- For existing users (Scenario 2)
  existing_user_id UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  claimed_at TIMESTAMPTZ
);
```

**Tasks:**
1. Create migration
2. Update Edge Function to generate token and insert record
3. Include token in email link

**Verification:**
- Send invite → token appears in invite_tokens table
- Link contains token

---

### Phase 5: Merge System for Existing Auth Users
**Goal:** Handle case where email IS in auth.users

**Tasks:**
1. When auth user found, create token with `existing_user_id` set
2. Send different email: "You've been added to [Team]"
3. Create `/confirm-join?token={token}` page
4. Build schema-aware merge function:
   - Query information_schema for all FK refs to members(id)
   - Exclude `league_operators`
   - Update all PP references to existing member_id
   - Delete PP record
5. User clicks confirm → merge executes

**Verification:**
- Create PP with games/lineups
- Send invite to existing user's email
- User confirms
- All PP data now under existing user's member_id

---

### Phase 6: UI - Captain Invite Flow
**Goal:** UI for captain to enter email and send invite

**Location:** Wherever PP is displayed (team roster, player popover)

**UI Flow:**
1. Captain clicks PP name → popover/modal
2. Shows "Send Invite" button
3. Opens modal with email input
4. Captain enters email, clicks Send
5. Calls Edge Function
6. Shows success/error feedback
7. PP card shows "Invite Sent" indicator

**Verification:** Full flow works from UI

---

### Phase 7: Edge Cases & Polish
**Goal:** Handle edge cases, add indicators

**Tasks:**
- Token expiration handling (7 days? 30 days?)
- Resend invite functionality
- "Invite Pending" indicator on PP cards
- Error handling for all failure modes
- Cancel/revoke invite capability

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Email API | Resend (free tier: 3k/month) |
| Server-side logic | Supabase Edge Functions (Deno/TypeScript) |
| Email domain | invites@rackemleagues.com |
| Token generation | crypto.randomUUID() or similar |

## Files to Create

```
/supabase
  /functions
    /send-test-email
      index.ts          (Phase 1)
    /send-invite
      index.ts          (Phase 2-3, evolves)
    /merge-placeholder
      index.ts          (Phase 5)

/src
  /components
    /player
      InvitePlayerModal.tsx   (Phase 6)
  /pages (or wherever routes live)
    ConfirmJoinPage.tsx       (Phase 5)

/supabase/migrations
  YYYYMMDD_invite_tokens_table.sql  (Phase 4)
```

## Questions for Partner

1. **CI/CD for Edge Functions:** Is GitHub Actions set up to deploy Edge Functions, or just SQL migrations?
2. **Resend Account:** Do we have a Resend account? Need to get API key.
3. **Domain Verification:** Is `rackemleagues.com` verified in Resend for sending?
4. **Staging vs Prod:** How do we manage different Resend API keys for staging/production?

## Success Criteria

- [ ] Captain can send invite to any email
- [ ] New users register via link and are auto-linked to PP
- [ ] Existing users confirm via link and PP data merges to their account
- [ ] All PP game history, lineups, stats transfer correctly
- [ ] Works for any future tables that reference members(id)

---

## Notes

- This replaces the abandoned `pp-manual-merging` branch approach
- No fuzzy matching needed - email is the definitive link
- Schema-aware merge means we don't hardcode table names
- Edge Functions are new to this project - document deployment for team
