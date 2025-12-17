-- Migration: Invite Tokens Table
-- Purpose: Store tokens for email invites to placeholder players.
--          Tracks which PP was invited, by whom, and whether they've claimed it.
--
-- Flow:
--   1. Captain sends invite to PP's email -> token created with status 'pending'
--   2. User clicks link in email -> arrives at /register?claim={memberId}&token={token}
--   3. Upon successful registration -> token status updated to 'claimed'
--
-- Security:
--   - Tokens expire after 7 days by default
--   - Only captains/operators can create invites for their team members
--   - Tokens can only be used once
--
-- NOTE: RLS is disabled for now. See RLS_ANALYSIS.md for planned policies.

-- ============================================================================
-- CREATE TABLE: invite_tokens
-- ============================================================================

CREATE TABLE IF NOT EXISTS invite_tokens (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The token sent in the email link (separate from id for security)
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),

  -- The placeholder player being invited
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Email the invite was sent to
  email TEXT NOT NULL,

  -- Who sent the invite (captain/operator member_id)
  invited_by_member_id UUID NOT NULL REFERENCES members(id),

  -- Team context (which team is inviting them)
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired', 'cancelled')),

  -- If claimed, which auth user claimed it
  claimed_by_user_id UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  claimed_at TIMESTAMPTZ,

  -- Prevent duplicate pending invites for same PP+email combination
  CONSTRAINT unique_pending_invite UNIQUE (member_id, email, status)
    DEFERRABLE INITIALLY DEFERRED
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Fast lookup by token (for registration page)
CREATE INDEX idx_invite_tokens_token ON invite_tokens(token) WHERE status = 'pending';

-- Fast lookup by member_id (for checking existing invites)
CREATE INDEX idx_invite_tokens_member_id ON invite_tokens(member_id);

-- Fast lookup by email (for finding all invites to an email)
CREATE INDEX idx_invite_tokens_email ON invite_tokens(email);

-- Cleanup expired tokens
CREATE INDEX idx_invite_tokens_expires_at ON invite_tokens(expires_at) WHERE status = 'pending';

-- ============================================================================
-- RLS DISABLED FOR NOW
-- ============================================================================
-- RLS policies are documented in RLS_ANALYSIS.md for future implementation

-- ============================================================================
-- FUNCTION: Validate and claim invite token
-- ============================================================================
-- Called during registration to validate token and mark as claimed

CREATE OR REPLACE FUNCTION claim_invite_token(
  p_token UUID,
  p_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  member_id UUID,
  team_id UUID,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite invite_tokens%ROWTYPE;
BEGIN
  -- Find the token
  SELECT * INTO v_invite
  FROM invite_tokens
  WHERE token = p_token
  FOR UPDATE;  -- Lock the row

  -- Token not found
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, 'Invalid or expired invite token'::TEXT;
    RETURN;
  END IF;

  -- Token already claimed
  IF v_invite.status = 'claimed' THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, 'This invite has already been claimed'::TEXT;
    RETURN;
  END IF;

  -- Token expired
  IF v_invite.status = 'expired' OR v_invite.expires_at < now() THEN
    -- Update status if it was not already marked expired
    IF v_invite.status != 'expired' THEN
      UPDATE invite_tokens SET status = 'expired' WHERE id = v_invite.id;
    END IF;
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, 'This invite has expired'::TEXT;
    RETURN;
  END IF;

  -- Token cancelled
  IF v_invite.status = 'cancelled' THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, 'This invite has been cancelled'::TEXT;
    RETURN;
  END IF;

  -- Token is valid - claim it
  UPDATE invite_tokens
  SET
    status = 'claimed',
    claimed_by_user_id = p_user_id,
    claimed_at = now()
  WHERE id = v_invite.id;

  RETURN QUERY SELECT TRUE, v_invite.member_id, v_invite.team_id, NULL::TEXT;
END;
$$;

-- ============================================================================
-- FUNCTION: Get invite details by token (for registration page display)
-- ============================================================================
-- Returns non-sensitive info about the invite for the registration page

CREATE OR REPLACE FUNCTION get_invite_details(p_token UUID)
RETURNS TABLE (
  is_valid BOOLEAN,
  member_id UUID,
  member_first_name TEXT,
  member_last_name TEXT,
  team_name TEXT,
  captain_name TEXT,
  expires_at TIMESTAMPTZ,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite invite_tokens%ROWTYPE;
BEGIN
  -- Find the token
  SELECT * INTO v_invite
  FROM invite_tokens it
  WHERE it.token = p_token;

  -- Token not found
  IF NOT FOUND THEN
    RETURN QUERY SELECT
      FALSE,
      NULL::UUID,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TIMESTAMPTZ,
      'Invalid invite link'::TEXT;
    RETURN;
  END IF;

  -- Check status
  IF v_invite.status = 'claimed' THEN
    RETURN QUERY SELECT
      FALSE,
      NULL::UUID,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TIMESTAMPTZ,
      'This invite has already been used'::TEXT;
    RETURN;
  END IF;

  IF v_invite.status = 'expired' OR v_invite.expires_at < now() THEN
    RETURN QUERY SELECT
      FALSE,
      NULL::UUID,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TIMESTAMPTZ,
      'This invite has expired'::TEXT;
    RETURN;
  END IF;

  IF v_invite.status = 'cancelled' THEN
    RETURN QUERY SELECT
      FALSE,
      NULL::UUID,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TIMESTAMPTZ,
      'This invite has been cancelled'::TEXT;
    RETURN;
  END IF;

  -- Return invite details
  RETURN QUERY
  SELECT
    TRUE,
    m.id,
    m.first_name::TEXT,
    m.last_name::TEXT,
    t.team_name::TEXT,
    (cm.first_name || ' ' || cm.last_name)::TEXT,
    v_invite.expires_at,
    NULL::TEXT
  FROM members m
  JOIN teams t ON t.id = v_invite.team_id
  LEFT JOIN members cm ON cm.id = t.captain_id
  WHERE m.id = v_invite.member_id;
END;
$$;

-- Grant execute to anon for registration page (unauthenticated users)
GRANT EXECUTE ON FUNCTION get_invite_details TO anon;
GRANT EXECUTE ON FUNCTION get_invite_details TO authenticated;

-- claim_invite_token should only be called by service role during registration
-- (Edge Function will handle this)
GRANT EXECUTE ON FUNCTION claim_invite_token TO service_role;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE invite_tokens IS
'Stores email invite tokens for placeholder players.
Captains send invites, users click link to register and claim their PP record.';

COMMENT ON FUNCTION claim_invite_token IS
'Validates and claims an invite token during registration.
Returns the member_id to link to the new user account.
Called by Edge Function with service role.';

COMMENT ON FUNCTION get_invite_details IS
'Returns display information for an invite token.
Used on registration page to show who is inviting the user.
Safe for anonymous access.';
