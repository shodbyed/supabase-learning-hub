-- Set your member role to 'developer' to bypass RLS restrictions
-- Run this in Supabase Studio SQL Editor

-- Update your member to have 'developer' role
UPDATE public.members
SET role = 'developer'
WHERE user_id = auth.uid();

-- Verify the update
SELECT id, first_name, last_name, role, user_id
FROM public.members
WHERE user_id = auth.uid();
