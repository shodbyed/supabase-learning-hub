-- Add profanity filter columns to members and league_operators tables
-- Members: Personal profanity filter preference (forced ON for users under 18)
-- League Operators: Organization-wide profanity validation for team names and public content

-- Add profanity_filter_enabled to members table
-- Default false - users 18+ have filter OFF by default but can enable it
-- For users under 18, this will be enforced as ON in the application logic
ALTER TABLE members
ADD COLUMN IF NOT EXISTS profanity_filter_enabled BOOLEAN DEFAULT false;

-- Add profanity_filter_enabled to league_operators table
-- Default false - operators must explicitly enable organization-wide profanity validation
-- When enabled, team names and other public content will be rejected if they contain profanity
ALTER TABLE league_operators
ADD COLUMN IF NOT EXISTS profanity_filter_enabled BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN members.profanity_filter_enabled IS
'Personal profanity filter preference for message display. Forced ON for users under 18, optional for adults.';

COMMENT ON COLUMN league_operators.profanity_filter_enabled IS
'Organization-wide profanity validation setting. When enabled, team names and public content containing profanity will be rejected.';
