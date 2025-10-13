-- =====================================================
-- LEAGUE OPERATORS TABLE (SIMPLIFIED)
-- =====================================================
-- Purpose: Stores operator business profile and contact information
-- Relationship: One-to-one with members table
-- Created: 2025-01-04
-- Updated: 2025-01-04 (simplified - removed use_profile_* flags)
-- =====================================================

CREATE TABLE league_operators (
  -- ===== PRIMARY KEY =====
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ===== FOREIGN KEYS =====
  -- Links to the member who became an operator
  -- CASCADE: If member deleted, operator profile also deleted
  -- UNIQUE: One member can only have one operator profile
  member_id UUID NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,

  -- ===== ORGANIZATION INFORMATION =====
  organization_name TEXT NOT NULL,

  -- ===== ADDRESS (Administrative Only - Copied from member profile at creation) =====
  -- Address is NOT shown to players
  -- Only visible to: system admins, BCA officials, legal/tax purposes
  -- Snapshot from member profile - stays even if member address changes
  -- Can be updated separately in operator profile settings
  organization_address TEXT NOT NULL,
  organization_city TEXT NOT NULL,
  organization_state TEXT NOT NULL,
  organization_zip_code TEXT NOT NULL,

  -- ===== CONTACT DISCLAIMER =====
  contact_disclaimer_acknowledged BOOLEAN NOT NULL DEFAULT false,

  -- ===== EMAIL (League Contact - Separate from Member Profile) =====
  -- This is the PUBLIC league contact email (with privacy controls)
  -- Pre-filled from member profile in UI, but stored independently
  -- Operator may want different email for league vs personal
  league_email TEXT NOT NULL,
  -- Who can see this email address
  email_visibility TEXT NOT NULL DEFAULT 'in_app_only' CHECK (email_visibility IN (
    'in_app_only',
    'my_organization',
    'my_team_captains',
    'my_teams',
    'anyone'
  )),

  -- ===== PHONE (League Contact - Separate from Member Profile) =====
  -- This is the PUBLIC league contact phone (with privacy controls)
  -- Pre-filled from member profile in UI, but stored independently
  -- Operator may want different phone for league vs personal
  league_phone TEXT NOT NULL,
  -- Who can see this phone number
  phone_visibility TEXT NOT NULL DEFAULT 'in_app_only' CHECK (phone_visibility IN (
    'in_app_only',
    'my_organization',
    'my_team_captains',
    'my_teams',
    'anyone'
  )),

  -- ===== PAYMENT INFORMATION (Required for Operators) =====
  -- All payment fields required - cannot become operator without payment
  -- For testing: use mock payment generator to create realistic IDs
  stripe_customer_id TEXT NOT NULL,      -- Stripe customer ID (e.g., cus_1234567890abcdef)
  payment_method_id TEXT NOT NULL,       -- Stripe payment method ID (e.g., pm_1234567890abcdef)
  card_last4 TEXT NOT NULL,              -- Last 4 digits for display (e.g., "4242")
  card_brand TEXT NOT NULL,              -- Card brand (visa, mastercard, amex, discover, etc.)
  expiry_month INTEGER NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
  expiry_year INTEGER NOT NULL CHECK (expiry_year >= 2025),
  billing_zip TEXT NOT NULL,
  payment_verified BOOLEAN NOT NULL DEFAULT false,

  -- ===== TIMESTAMPS =====
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Primary lookup: get operator profile from member_id
CREATE INDEX idx_league_operators_member_id ON league_operators(member_id);

-- Lookup by organization name (for search/directory)
CREATE INDEX idx_league_operators_org_name ON league_operators(organization_name);

-- Lookup by Stripe customer ID (for payment operations)
CREATE INDEX idx_league_operators_stripe_customer ON league_operators(stripe_customer_id);

-- =====================================================
-- TRIGGER: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_league_operators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER league_operators_updated_at
  BEFORE UPDATE ON league_operators
  FOR EACH ROW
  EXECUTE FUNCTION update_league_operators_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE league_operators IS 'Stores league operator business profiles and contact information';
COMMENT ON COLUMN league_operators.member_id IS 'Foreign key to members table - the user who became an operator';
COMMENT ON COLUMN league_operators.organization_address IS 'Administrative only - not shown to players. Copied from member profile at creation.';
COMMENT ON COLUMN league_operators.league_email IS 'PUBLIC league contact email (privacy controlled by email_visibility)';
COMMENT ON COLUMN league_operators.league_phone IS 'PUBLIC league contact phone (privacy controlled by phone_visibility)';
COMMENT ON COLUMN league_operators.email_visibility IS 'Controls who can see the operator email address';
COMMENT ON COLUMN league_operators.phone_visibility IS 'Controls who can see the operator phone number';
COMMENT ON COLUMN league_operators.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN league_operators.payment_method_id IS 'Stripe payment method ID';
COMMENT ON COLUMN league_operators.payment_verified IS 'Whether payment method has been verified';

-- =====================================================
-- USAGE NOTES
-- =====================================================
-- 1. After INSERT into league_operators, update members.role:
--    UPDATE members SET role = 'league_operator' WHERE id = <member_id>;
--
-- 2. Address is copied from member profile at creation time:
--    - Snapshot taken during operator application
--    - Does NOT update if member profile address changes
--    - Can be updated separately in operator profile settings
--    - Only visible to admins, not to players
--
-- 3. Email/Phone are separate from member profile:
--    - Pre-filled from profile in UI for convenience
--    - Stored independently (operator may want different contact for leagues)
--    - Visibility controls who can see contact info
--
-- 4. Profile Change Reminders:
--    - When member updates phone/email in profile, check if member.role = 'league_operator'
--    - If yes, show reminder: "Update operator profile too?"
--    - Link to operator profile settings
--    - Allow keeping them separate if desired
--
-- 5. Payment Security:
--    - Never log stripe_customer_id or payment_method_id to console
--    - For testing: use mock payment generator (e.g., cus_mock_1234567890abcdef)
--    - In production: use real Stripe IDs from payment processing
--
-- 6. Contact Visibility Levels:
--    - 'in_app_only': Contact info HIDDEN - contact only via in-app messaging (default)
--                     Requires in-app messaging system to be functional
--                     Most private option - actual email/phone never shown
--    - 'my_organization': Contact info visible to others in same organization
--    - 'my_team_captains': Contact info visible to team captains in operator's leagues
--    - 'my_teams': Contact info visible to all players in operator's leagues
--    - 'anyone': Contact info publicly visible (league directory, search, etc.)
