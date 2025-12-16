# Placeholder Players Feature Branch

## Overview

This branch implements **Placeholder Players (PP)** - member records that represent real people who haven't registered yet. League operators and captains can add these players to teams, track their stats, wins, and match history without requiring a registered user account.

## Core Concept

- **Placeholder Player**: A member record with `user_id = NULL`
- Players can be on teams, play matches, accumulate stats - all without being registered
- Only league operators can remove placeholder players from teams
- When clicking a PP's name, the menu shows "Unregistered" badge and "Register Player" option

## Registration Methods

### 1. Device Handoff
Captain hands their device to the player for in-person registration:
1. Captain clicks "Register Player" → opens `RegisterPlayerModal`
2. Player enters email + password (twice) on captain's device
3. `supabase.auth.signUp()` creates auth account (does NOT log anyone in)
4. New `user_id` is immediately written to the placeholder's member record
5. Player confirms email later on their own device

### 2. Link / QR Code
Player registers remotely via shared link or QR scan:
1. Link format: `/register?claim={memberId}`
2. `Register.tsx` detects the `claim` parameter
3. Shows "Claiming profile for: {name}" banner
4. On registration, links `user_id` to placeholder member record
5. OAuth and "Already have account?" links are hidden in claim mode

## Key Files

### Components
| File | Purpose |
|------|---------|
| `src/components/RegisterPlayerModal.tsx` | Modal with 3 registration options (handoff, link, QR) |
| `src/components/CreatePlaceholderModal.tsx` | Form to create new placeholder players |
| `src/components/PlayerNameLink.tsx` | Shows "Unregistered" badge, "Register Player" menu item |
| `src/components/MemberCombobox.tsx` | Updated with `preventClearPlaceholders` prop |
| `src/login/Register.tsx` | Modified to handle `?claim={memberId}` flow |

### API Layer
| File | Purpose |
|------|---------|
| `src/api/mutations/members.ts` | `createPlaceholderMember()` function |
| `src/api/queries/members.ts` | Member queries (unchanged but relevant) |

### Types
| File | Purpose |
|------|---------|
| `src/types/member.ts` | `isPlaceholderMember()` helper, `PartialMember` type |

### Database
| File | Purpose |
|------|---------|
| `supabase/migrations/20251215165551_allow_nullable_member_fields.sql` | Makes member fields nullable for placeholders |

## Key Functions

### `RegisterPlayerModal.tsx`
- `handleHandoffSubmit()` - Creates auth account, links user_id to member
- `handleCopyLink()` - Copies registration link to clipboard
- `getEnvironment()` - Detects local/staging/production for warnings

### `Register.tsx`
- `useEffect` with `claimId` - Fetches and validates placeholder data
- `handleRegister()` - Modified to link user_id when `claimData?.isValid`

### `src/types/member.ts`
- `isPlaceholderMember(member)` - Returns true if `user_id === null`

## Edge Cases (Deferred to Future Branch)

1. **Already logged in user clicks claim link** - Need to show message or handle merge
2. **Member merge requests** - When registered user wants to claim a placeholder with existing data
3. **Race condition** - Two people try to claim same placeholder simultaneously
4. **UI refresh** - Optimistic update after successful registration

## Database Schema Note

Placeholder players have:
- `user_id = NULL` (key identifier)
- `first_name`, `last_name` required
- `email`, `phone`, etc. can be NULL until claimed

## Testing Notes

- Device handoff works in local dev (tested)
- Link/QR requires staging/production (localhost links don't work on other devices)
- To manually confirm email in local Supabase:
  ```sql
  UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = '{user_id}';
  ```
