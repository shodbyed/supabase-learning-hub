-- Migration: Merge Placeholder Player Function (Schema-Aware)
-- Purpose: Merge a placeholder player (PP) into an existing registered user's member record.
--          DYNAMICALLY finds and updates ALL foreign key references to members table.
--
-- Scenario: Captain sends invite to email that's ALREADY in auth.users.
--           The existing user needs to claim the PP's history (games, stats, etc.)
--
-- Schema-Aware Behavior:
--   - Queries information_schema to find ALL columns with FK to members(id)
--   - Dynamically updates each one (PP id -> target id)
--   - team_players handled specially (transfer rows, not just update)
--   - invite_tokens.member_id preserved (for audit trail)
--
-- Audit Trail:
--   - invite_tokens keeps permanent record: member_id (PP) + claimed_by_user_id (auth user)
--   - If DELETE fails due to FK, we know we missed a table
--
-- After merge:
--   - PP's member record is deleted (all history transferred)
--   - Auth user is now on all teams the PP was on
--   - Auth user has all game history from the PP

-- ============================================================================
-- FUNCTION: merge_placeholder_into_member (Schema-Aware)
-- ============================================================================
-- Merges a placeholder player into an existing registered member.
-- Dynamically finds and updates ALL foreign key references to preserve data.

CREATE OR REPLACE FUNCTION merge_placeholder_into_member(
  p_placeholder_member_id UUID,  -- The PP to merge FROM
  p_target_member_id UUID        -- The registered member to merge INTO
)
RETURNS TABLE (
  success BOOLEAN,
  tables_updated INT,
  total_rows_updated INT,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pp_user_id UUID;
  v_target_user_id UUID;
  v_tables_count INT := 0;
  v_total_rows INT := 0;
  v_row_count INT := 0;
  v_fk_record RECORD;
  v_sql TEXT;
BEGIN
  -- Verify the placeholder is actually a placeholder (no user_id)
  SELECT user_id INTO v_pp_user_id
  FROM members
  WHERE id = p_placeholder_member_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 0, 'Placeholder member not found'::TEXT;
    RETURN;
  END IF;

  IF v_pp_user_id IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, 0, 0, 'Source member is not a placeholder (already has user_id)'::TEXT;
    RETURN;
  END IF;

  -- Verify the target is actually a registered member (has user_id)
  SELECT user_id INTO v_target_user_id
  FROM members
  WHERE id = p_target_member_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 0, 'Target member not found'::TEXT;
    RETURN;
  END IF;

  IF v_target_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 0, 'Target member is not registered (no user_id)'::TEXT;
    RETURN;
  END IF;

  -- Prevent merging into self
  IF p_placeholder_member_id = p_target_member_id THEN
    RETURN QUERY SELECT FALSE, 0, 0, 'Cannot merge member into itself'::TEXT;
    RETURN;
  END IF;

  -- ========================================================================
  -- SPECIAL CASE: team_players (transfer rows, not just update FK)
  -- ========================================================================
  -- team_players needs special handling because we want to:
  -- 1. Transfer PP's team memberships to target (if not already on that team/season)
  -- 2. Delete PP's team_players records

  WITH teams_to_add AS (
    SELECT tp.team_id, tp.season_id, tp.is_captain, tp.individual_wins, tp.individual_losses,
           tp.skill_level, tp.status, tp.joined_at
    FROM team_players tp
    WHERE tp.member_id = p_placeholder_member_id
      AND NOT EXISTS (
        SELECT 1 FROM team_players existing
        WHERE existing.team_id = tp.team_id
          AND existing.season_id = tp.season_id
          AND existing.member_id = p_target_member_id
      )
  )
  INSERT INTO team_players (member_id, team_id, season_id, is_captain, individual_wins,
                           individual_losses, skill_level, status, joined_at)
  SELECT p_target_member_id, team_id, season_id, is_captain, individual_wins,
         individual_losses, skill_level, status, joined_at
  FROM teams_to_add;

  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  v_total_rows := v_total_rows + v_row_count;
  IF v_row_count > 0 THEN
    v_tables_count := v_tables_count + 1;
  END IF;

  -- Delete PP's team_players records (they've been transferred or were duplicates)
  DELETE FROM team_players WHERE member_id = p_placeholder_member_id;

  -- ========================================================================
  -- SCHEMA-AWARE: Find and update ALL foreign keys to members(id)
  -- ========================================================================
  -- Query information_schema to find all columns that reference members.id
  -- Skip: team_players (handled above), invite_tokens.member_id (keep for audit)

  FOR v_fk_record IN
    SELECT
      tc.table_schema,
      tc.table_name,
      kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name = 'members'
      AND ccu.column_name = 'id'
      AND tc.table_schema = 'public'
      -- Skip tables we handle specially or want to preserve
      AND tc.table_name != 'team_players'  -- Handled above with row transfer
      AND NOT (tc.table_name = 'invite_tokens' AND kcu.column_name = 'member_id')  -- Keep for audit
  LOOP
    -- Build dynamic UPDATE statement
    v_sql := format(
      'UPDATE %I.%I SET %I = $1 WHERE %I = $2',
      v_fk_record.table_schema,
      v_fk_record.table_name,
      v_fk_record.column_name,
      v_fk_record.column_name
    );

    -- Execute the update
    EXECUTE v_sql USING p_target_member_id, p_placeholder_member_id;

    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    v_total_rows := v_total_rows + v_row_count;
    IF v_row_count > 0 THEN
      v_tables_count := v_tables_count + 1;
    END IF;

    RAISE NOTICE 'Updated %.%: % rows', v_fk_record.table_name, v_fk_record.column_name, v_row_count;
  END LOOP;

  -- ========================================================================
  -- UPDATE invite_tokens status (but keep member_id for audit)
  -- ========================================================================
  -- Mark any pending invites for this PP as claimed by the target user
  -- The member_id column is preserved as the audit trail
  UPDATE invite_tokens
  SET
    status = 'claimed',
    claimed_by_user_id = v_target_user_id,
    claimed_at = now()
  WHERE member_id = p_placeholder_member_id
    AND status = 'pending';

  -- ========================================================================
  -- DELETE the placeholder member
  -- ========================================================================
  -- All references have been transferred, safe to delete
  -- If this fails, a FK constraint will tell us exactly which table we missed
  DELETE FROM members WHERE id = p_placeholder_member_id;

  RETURN QUERY SELECT TRUE, v_tables_count, v_total_rows, NULL::TEXT;

EXCEPTION
  WHEN foreign_key_violation THEN
    -- If delete fails, we have an FK we didn't handle
    RETURN QUERY SELECT FALSE, v_tables_count, v_total_rows,
      ('FK violation - table still references PP: ' || SQLERRM)::TEXT;
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, v_tables_count, v_total_rows, SQLERRM::TEXT;
END;
$$;

-- Grant execute to service_role only (called by Edge Functions)
GRANT EXECUTE ON FUNCTION merge_placeholder_into_member TO service_role;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION merge_placeholder_into_member IS
'Schema-aware merge of a placeholder player into an existing registered member.

BEHAVIOR:
- Dynamically finds ALL foreign keys to members(id) via information_schema
- Updates each FK column from PP id to target member id
- team_players: transfers rows (with stats) instead of just updating FK
- invite_tokens.member_id: preserved as audit trail (PP -> user mapping)

AUDIT TRAIL:
- invite_tokens keeps: member_id (original PP) + claimed_by_user_id (auth user)
- This allows historical lookup even after PP member record is deleted

SAFETY:
- If DELETE fails due to FK constraint, returns error with table name
- This catches any tables added later that we might miss

Only callable by service_role (Edge Functions).';
