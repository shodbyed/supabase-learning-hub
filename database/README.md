# Database Setup

## Initial Setup

To set up the database tables in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the SQL script: `members.sql`

## Members Table

The `members.sql` script creates:
- User role enum: `player`, `league_operator`, `developer`
- `members` table with all user information and associations
- Row Level Security (RLS) policies to ensure users can only access their own records
- Indexes for better performance

## Table Structure

### members
- `id` - Primary key (UUID)
- `user_id` - Foreign key to auth.users (unique)
- `first_name`, `last_name` - User names
- `nickname` - Optional nickname
- `phone` - Phone number
- `email` - Email address
- `address`, `city`, `state`, `zip_code` - Address information
- `date_of_birth` - Date of birth
- `role` - User role (player, league_operator, developer)
- `pool_hall_ids` - JSON array of associated pool hall IDs
- `league_operator_ids` - JSON array of associated league operator IDs
- `created_at`, `updated_at` - Timestamps

## Notes

- Auto-approval: If a user record exists, they are automatically approved in the system
- No application status tracking needed - existence of record indicates completion
- JSON arrays allow multiple pool hall and league operator associations