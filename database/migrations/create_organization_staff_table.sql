/**
 * Migration Step 2: Create organization_staff table
 *
 * Purpose: Many-to-many relationship between members and organizations
 * Enables: Multiple staff managing one organization, one person can manage multiple organizations
 *
 * Position Permissions:
 *
 * OWNER (position = 'owner'):
 * - Full control of organization
 * - Can view/edit payment info (credit card, billing)
 * - Can add/remove admins
 * - All operational access (leagues, teams, schedules, venues, etc.)
 * - Cannot be removed
 * - Cannot delete leagues (leagues are permanent records)
 *
 * ADMIN (position = 'admin'):
 * - Operational access only
 * - Can manage leagues, teams, schedules, venues, players
 * - CANNOT view/edit payment info
 * - CANNOT add/remove other staff
 * - CAN remove themselves from staff
 * - Cannot delete leagues (leagues are permanent records)
 *
 * LEAGUE_REP (position = 'league_rep'):
 * - Future role - permissions TBD
 *
 * Simplified Flow:
 * - Owner directly adds members as staff (no invitation system)
 * - Added members become 'admin' by default
 * - Owner can remove any admin, admins can remove themselves
 * - Owner cannot be removed
 *
 * Note: RLS policies will be added later after testing
 */

-- Drop existing table if it exists (clean slate)
DROP TABLE IF EXISTS organization_staff CASCADE;

-- Create organization_staff table
CREATE TABLE organization_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Relationships
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Position within organization (renamed from 'role' to avoid confusion with members.role)
  position VARCHAR(20) NOT NULL CHECK (position IN (
    'owner',       -- Original creator, can add/remove staff
    'admin',       -- Staff member with full operational access
    'league_rep'   -- Future: League representative role
  )),

  -- Tracking
  added_by UUID REFERENCES members(id) ON DELETE SET NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(organization_id, member_id) -- Member can only have one position per organization
);

-- Add indexes for common queries
CREATE INDEX idx_org_staff_org ON organization_staff(organization_id);
CREATE INDEX idx_org_staff_member ON organization_staff(member_id);
CREATE INDEX idx_org_staff_position ON organization_staff(position);

-- Add comments for documentation
COMMENT ON TABLE organization_staff IS 'Many-to-many relationship between members and organizations with position-based access';
COMMENT ON COLUMN organization_staff.position IS 'owner (creator, can add/remove staff), admin (operations), league_rep (future use)';
COMMENT ON COLUMN organization_staff.added_by IS 'Member who added this person to the organization';

-- Grant permissions (RLS disabled for now to allow testing)
GRANT ALL ON organization_staff TO authenticated;
GRANT SELECT ON organization_staff TO anon;

-- Function: Automatically create owner when organization is created
CREATE OR REPLACE FUNCTION create_owner_staff()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new organization is created, automatically add the creator as owner
  INSERT INTO organization_staff (organization_id, member_id, position, added_by)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create owner staff on organization creation
DROP TRIGGER IF EXISTS create_owner_staff_trigger ON organizations;
CREATE TRIGGER create_owner_staff_trigger
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_owner_staff();

COMMENT ON FUNCTION create_owner_staff IS 'Automatically creates owner staff record when organization is created';
