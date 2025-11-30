/**
 * Migration Step 1: Create organizations table
 *
 * Purpose: Support multiple operators managing a single organization
 * Key Change: Separates organization details from staff membership
 * - organizations: Stores org info (name, address, payment, etc.)
 * - organization_staff: Links members to organizations with roles (created in step 2)
 *
 * Note: RLS policies will be added later after testing
 */

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Organization details
  organization_name VARCHAR(255) NOT NULL,
  organization_address VARCHAR(255) NOT NULL,
  organization_city VARCHAR(100) NOT NULL,
  organization_state VARCHAR(2) NOT NULL,
  organization_zip_code VARCHAR(10) NOT NULL,

  -- Contact info (for the organization itself)
  league_email VARCHAR(255) NOT NULL,
  email_visibility VARCHAR(20) NOT NULL DEFAULT 'my_teams'
    CHECK (email_visibility IN ('public', 'my_organization', 'my_teams')),
  league_phone VARCHAR(20) NOT NULL,
  phone_visibility VARCHAR(20) NOT NULL DEFAULT 'my_teams'
    CHECK (phone_visibility IN ('public', 'my_organization', 'my_teams')),

  -- Payment info (organization-level)
  stripe_customer_id VARCHAR(100) NOT NULL,
  payment_method_id VARCHAR(100) NOT NULL,
  card_last4 VARCHAR(4) NOT NULL,
  card_brand VARCHAR(20) NOT NULL,
  expiry_month INTEGER NOT NULL,
  expiry_year INTEGER NOT NULL,
  billing_zip VARCHAR(10) NOT NULL,
  payment_verified BOOLEAN NOT NULL DEFAULT false,

  -- Profanity filter setting (organization-level)
  profanity_filter_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Metadata
  created_by UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_organizations_created_by ON organizations(created_by);
CREATE INDEX idx_organizations_name ON organizations(organization_name);

-- Add comments for documentation
COMMENT ON TABLE organizations IS 'Organization details for league operators. Supports multiple staff managing same organization.';
COMMENT ON COLUMN organizations.created_by IS 'Member who originally created this organization (becomes owner in organization_staff)';
COMMENT ON COLUMN organizations.profanity_filter_enabled IS 'Whether to enforce profanity validation for team names and organization content';

-- Grant permissions (RLS disabled for now to allow testing)
GRANT ALL ON organizations TO authenticated;
GRANT SELECT ON organizations TO anon;
