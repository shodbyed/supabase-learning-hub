-- Migration: Check Pending Invites Function
-- Purpose: Allow authenticated users to check if they have any pending invite tokens
--          Called on login to notify users of unclaimed invites
--
-- Usage: Call after login to see if user has pending invites
--        If results returned, show notification with link to claim page
--        Expired invites prompt user to contact captain for resend

-- ============================================================================
-- FUNCTION: get_my_pending_invites
-- ============================================================================
-- Returns pending AND expired invites for the authenticated user's email
-- Used on login to notify users they have unclaimed placeholder players
-- Expired invites are included so UI can prompt user to request resend

CREATE OR REPLACE FUNCTION get_my_pending_invites()
RETURNS TABLE (
  token UUID,
  member_id UUID,
  placeholder_first_name TEXT,
  placeholder_last_name TEXT,
  team_name TEXT,
  captain_name TEXT,
  invited_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_expired BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  -- Get the authenticated user's email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  IF v_user_email IS NULL THEN
    -- No authenticated user or no email
    RETURN;
  END IF;

  -- Return pending and expired invites for this email
  -- Expired invites let the UI prompt user to ask captain to resend
  RETURN QUERY
  SELECT
    it.token,
    it.member_id,
    m.first_name::TEXT as placeholder_first_name,
    m.last_name::TEXT as placeholder_last_name,
    t.team_name::TEXT,
    (cm.first_name || ' ' || cm.last_name)::TEXT as captain_name,
    it.created_at as invited_at,
    it.expires_at,
    (it.expires_at <= now()) as is_expired
  FROM invite_tokens it
  JOIN members m ON m.id = it.member_id
  JOIN teams t ON t.id = it.team_id
  LEFT JOIN members cm ON cm.id = it.invited_by_member_id
  WHERE LOWER(it.email) = LOWER(v_user_email)
    AND (
      -- Pending and not expired
      (it.status = 'pending' AND it.expires_at > now())
      OR
      -- Expired (status pending but past expiry, or status = 'expired')
      (it.status IN ('pending', 'expired') AND it.expires_at <= now())
    )
  ORDER BY
    -- Show claimable invites first, then expired
    (it.expires_at <= now()) ASC,
    it.created_at DESC;
END;
$$;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION get_my_pending_invites TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION get_my_pending_invites IS
'Returns pending and expired invite tokens for the authenticated user''s email.
Call on login to check if user has unclaimed placeholder players.
Returns is_expired flag so UI can:
- Show claim button for pending invites
- Show "Ask captain to resend" message for expired invites';
