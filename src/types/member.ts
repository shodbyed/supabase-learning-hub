/**
 * @fileoverview Member and User-related type definitions
 * Centralized types for member profiles, user roles, and authentication
 */

/**
 * User roles available in the system
 */
export type UserRole = 'player' | 'league_operator' | 'developer';

/**
 * Member interface representing a user's profile data stored in Supabase
 * This maps to the 'members' table in the database
 */
export interface Member {
  id: string;
  user_id: string; // References Supabase auth.users.id
  first_name: string;
  last_name: string;
  nickname?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  date_of_birth: string; // ISO date string
  role: UserRole;
  pool_hall_ids: number[]; // Array of associated pool hall IDs
  league_operator_ids: number[]; // Array of league operator IDs user is associated with
  membership_paid_date?: string; // ISO date string when membership was last paid
  bca_member_number?: string; // Official BCA member number, null until assigned
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
