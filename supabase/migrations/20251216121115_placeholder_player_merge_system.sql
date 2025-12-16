-- Migration: Placeholder Player Merge System
-- Purpose: Enable detection, identification, and merging of placeholder players
--          when users register separately from the invite flow
--
-- This migration includes:
-- 1. Extensions for fuzzy name matching (soundex, trigrams)
-- 2. Functions for searching placeholder players
-- 3. merge_requests table for LO-approved merges
-- 4. Performance indexes

-- ============================================================================
-- PART 1: EXTENSIONS FOR FUZZY MATCHING
-- ============================================================================

-- fuzzystrmatch: Provides soundex, metaphone, levenshtein for phonetic matching
-- Examples: soundex('Smith') = soundex('Smythe'), soundex('John') = soundex('Jon')
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- pg_trgm: Provides trigram similarity for typo detection
-- Examples: similarity('Springfield', 'Sprigfield') = 0.6
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- PART 2: FUNCTION - search_placeholder_matches
-- ============================================================================
-- Searches for placeholder players (user_id IS NULL) that might match
-- a registering user based on name, city, and state.
--
-- Uses a scoring system:
--   - Soundex match on first_name: 0-4 points
--   - Soundex match on last_name: 0-4 points
--   - Trigram similarity on city: 0-1 points (scaled to 0-2)
--   - Exact state match: 2 bonus points
--
-- Returns candidates with combined score >= threshold (default 5)

CREATE OR REPLACE FUNCTION search_placeholder_matches(
  p_first_name TEXT,
  p_last_name TEXT,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_limit INT DEFAULT 5,
  p_min_score NUMERIC DEFAULT 5.0
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  nickname TEXT,
  city TEXT,
  state TEXT,
  system_player_number INT,
  first_name_score INT,
  last_name_score INT,
  city_score NUMERIC,
  state_match BOOLEAN,
  total_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.first_name,
    m.last_name,
    m.nickname,
    m.city,
    m.state,
    m.system_player_number,
    -- Soundex scores (0-4, where 4 = exact phonetic match)
    difference(m.first_name, p_first_name) AS first_name_score,
    difference(m.last_name, p_last_name) AS last_name_score,
    -- Trigram similarity on city (0-1, scaled to 0-2 for scoring)
    CASE
      WHEN p_city IS NOT NULL AND m.city IS NOT NULL
      THEN similarity(LOWER(m.city), LOWER(p_city)) * 2
      ELSE 0
    END AS city_score,
    -- State exact match
    CASE
      WHEN p_state IS NOT NULL AND UPPER(m.state) = UPPER(p_state)
      THEN TRUE
      ELSE FALSE
    END AS state_match,
    -- Combined score
    (
      difference(m.first_name, p_first_name) +
      difference(m.last_name, p_last_name) +
      CASE
        WHEN p_city IS NOT NULL AND m.city IS NOT NULL
        THEN similarity(LOWER(m.city), LOWER(p_city)) * 2
        ELSE 0
      END +
      CASE
        WHEN p_state IS NOT NULL AND UPPER(m.state) = UPPER(p_state)
        THEN 2
        ELSE 0
      END
    )::NUMERIC AS total_score
  FROM members m
  WHERE
    -- Only search placeholder players (no linked user account)
    m.user_id IS NULL
    -- Require at least some name similarity to avoid returning everyone
    AND (
      difference(m.first_name, p_first_name) >= 2
      OR difference(m.last_name, p_last_name) >= 2
    )
  HAVING
    -- Filter by minimum combined score
    (
      difference(m.first_name, p_first_name) +
      difference(m.last_name, p_last_name) +
      CASE
        WHEN p_city IS NOT NULL AND m.city IS NOT NULL
        THEN similarity(LOWER(m.city), LOWER(p_city)) * 2
        ELSE 0
      END +
      CASE
        WHEN p_state IS NOT NULL AND UPPER(m.state) = UPPER(p_state)
        THEN 2
        ELSE 0
      END
    ) >= p_min_score
  ORDER BY total_score DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION search_placeholder_matches TO authenticated;
GRANT EXECUTE ON FUNCTION search_placeholder_matches TO anon;

-- ============================================================================
-- PART 3: FUNCTION - lookup_placeholder_by_system_number
-- ============================================================================
-- Direct lookup when user knows their system player number
-- Used when fuzzy search fails but user has their number from captain/LO

CREATE OR REPLACE FUNCTION lookup_placeholder_by_system_number(
  p_system_number INT
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  nickname TEXT,
  city TEXT,
  state TEXT,
  system_player_number INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.first_name,
    m.last_name,
    m.nickname,
    m.city,
    m.state,
    m.system_player_number
  FROM members m
  WHERE
    m.user_id IS NULL  -- Only placeholder players
    AND m.system_player_number = p_system_number;
END;
$$;

GRANT EXECUTE ON FUNCTION lookup_placeholder_by_system_number TO authenticated;
GRANT EXECUTE ON FUNCTION lookup_placeholder_by_system_number TO anon;

-- ============================================================================
-- PART 4: TABLE - merge_requests
-- ============================================================================
-- Stores requests to merge a placeholder player with a registered user.
-- Only league operators can approve/reject these requests.
--
-- Flow:
-- 1. User/Captain identifies PP match during registration or later
-- 2. Creates merge_request linking registered_member_id to placeholder_member_id
-- 3. LO reviews request, sees both records' data
-- 4. LO approves → merge executed, request marked 'approved'
-- 5. Or LO rejects → request marked 'rejected' with reason

CREATE TYPE merge_request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS merge_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The placeholder player (user_id IS NULL) to be merged FROM
  placeholder_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- The registered user's member record to merge INTO
  registered_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Who requested this merge
  requested_by_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Role of requester at time of request (for context)
  requester_role TEXT NOT NULL CHECK (requester_role IN ('player', 'captain', 'league_operator')),

  -- Current status
  status merge_request_status NOT NULL DEFAULT 'pending',

  -- Optional context from requester
  request_notes TEXT,

  -- LO who processed the request (if processed)
  processed_by_member_id UUID REFERENCES members(id) ON DELETE SET NULL,

  -- LO's notes (especially useful for rejections)
  processor_notes TEXT,

  -- Team context (helps LO verify the merge)
  -- Can be NULL if PP isn't on a team yet
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Organization context (which org's LO should handle this)
  -- Derived from the PP's team → season → league → organization
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_merge_requests_status ON merge_requests(status);
CREATE INDEX idx_merge_requests_organization ON merge_requests(organization_id);
CREATE INDEX idx_merge_requests_placeholder ON merge_requests(placeholder_member_id);
CREATE INDEX idx_merge_requests_registered ON merge_requests(registered_member_id);
CREATE INDEX idx_merge_requests_pending_by_org ON merge_requests(organization_id, status)
  WHERE status = 'pending';

-- Prevent duplicate pending requests for same placeholder
CREATE UNIQUE INDEX idx_merge_requests_unique_pending
  ON merge_requests(placeholder_member_id)
  WHERE status = 'pending';

-- NOTE: RLS policies for merge_requests are documented in RLS_ANALYSIS.md
-- They will be implemented later when RLS is enabled across the application.

-- ============================================================================
-- PART 5: PERFORMANCE INDEXES FOR FUZZY MATCHING
-- ============================================================================

-- Trigram index on city for faster similarity searches
CREATE INDEX IF NOT EXISTS idx_members_city_trgm
  ON members USING GIN (city gin_trgm_ops);

-- Functional index on soundex of names for faster phonetic lookups
CREATE INDEX IF NOT EXISTS idx_members_first_name_soundex
  ON members (soundex(first_name));

CREATE INDEX IF NOT EXISTS idx_members_last_name_soundex
  ON members (soundex(last_name));

-- Index on system_player_number for direct lookups (placeholders only)
CREATE INDEX IF NOT EXISTS idx_members_system_player_number
  ON members (system_player_number)
  WHERE user_id IS NULL;

-- ============================================================================
-- PART 6: HELPER FUNCTION - Update timestamp trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_merge_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER merge_requests_updated_at
  BEFORE UPDATE ON merge_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_merge_request_timestamp();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE merge_requests IS
'Requests to merge placeholder players with registered users.
Created by users/captains, approved/rejected by league operators.';

COMMENT ON FUNCTION search_placeholder_matches IS
'Fuzzy search for placeholder players matching a registering user.
Uses soundex for phonetic name matching and trigrams for city typos.
Returns top candidates sorted by match score.';

COMMENT ON FUNCTION lookup_placeholder_by_system_number IS
'Direct lookup of a placeholder player by their system number.
Used when user knows their number (given by captain/LO).';
