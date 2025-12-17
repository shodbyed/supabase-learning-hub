-- Migration: Allow nullable fields on members table for placeholder players
-- This enables creating "placeholder" players who can be on teams and have games
-- scored without being fully registered users. When the real person registers,
-- they can be connected to their placeholder record.
--
-- Fields that remain NOT NULL: first_name, last_name, city, state (needed for matching)
-- Fields made nullable: phone, email, address, zip_code, date_of_birth

ALTER TABLE members ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE members ALTER COLUMN email DROP NOT NULL;
ALTER TABLE members ALTER COLUMN address DROP NOT NULL;
ALTER TABLE members ALTER COLUMN zip_code DROP NOT NULL;
ALTER TABLE members ALTER COLUMN date_of_birth DROP NOT NULL;

-- Add comment explaining placeholder players
COMMENT ON TABLE members IS 'Player/member records. Includes:
- Registered users (user_id NOT NULL) with full profile information
- Placeholder players (user_id IS NULL) with minimal info (name, city, state only)
- Two special substitute members with fixed UUIDs for anonymous subs in matches

Placeholder players can be on teams and have games scored. When the real person
registers, their user_id is attached to the existing placeholder record.';
