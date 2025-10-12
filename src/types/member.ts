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
  system_player_number: number; // System-generated player ID (always assigned)
  bca_member_number: string | null; // Official BCA member number (null until assigned)
  membership_paid_date: string | null; // ISO date string when membership was last paid
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Helper function to get display player number
 * Shows BCA number if available, otherwise system player number
 */
export function getPlayerDisplayNumber(member: Member): string {
  if (member.bca_member_number) {
    return `#BCA-${member.bca_member_number}`;
  }
  return `#P-${String(member.system_player_number).padStart(5, '0')}`;
}

/**
 * Helper function to get display name with player number
 * Example: "John Smith #BCA-123456" or "John Smith #P-00042"
 */
export function getPlayerDisplayName(member: Member): string {
  const fullName = `${member.first_name} ${member.last_name}`;
  const playerNumber = getPlayerDisplayNumber(member);
  return `${fullName} ${playerNumber}`;
}

/**
 * Partial member object from database queries (captain/roster lookups)
 * Only includes fields needed for display purposes
 */
export interface PartialMember {
  id: string;
  first_name: string;
  last_name: string;
  system_player_number: number;
  bca_member_number: string | null;
}

/**
 * Format player number for partial member objects from queries
 * Shows BCA number if available, otherwise system player number
 * Example: "#BCA-123456" or "#P-00042"
 */
export function formatPartialMemberNumber(member: PartialMember): string {
  if (member.bca_member_number) {
    return `#BCA-${member.bca_member_number}`;
  }
  return `#P-${String(member.system_player_number).padStart(5, '0')}`;
}
